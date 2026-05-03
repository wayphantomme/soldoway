use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("9NfuXefRC4hPrHu5EcA1DPn7hJUUcNh53mN8fbpqejas");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>, referrer: Pubkey) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        let owner = ctx.accounts.owner.key();

        let final_referrer = if owner == referrer {
            crate::ID
        } else {
            referrer
        };

        user_profile.owner = owner;
        user_profile.referrer = final_referrer;
        user_profile.total_earned = 0;
        user_profile.referrals_count = 0;
        user_profile.bump = ctx.bumps.user_profile;

        Ok(())
    }

    pub fn create_task(
        ctx: Context<CreateTask>, 
        title: String, 
        company_name: String,
        category: String,
        description: String,
        percentage_fee: u64, 
        total_budget: u64
    ) -> Result<()> {
        let task = &mut ctx.accounts.task;
        task.creator = ctx.accounts.creator.key();
        task.title = title;
        task.company_name = company_name;
        task.category = category;
        task.description = description;
        task.percentage_fee = percentage_fee;
        task.total_budget = total_budget;
        task.meetings_logged = 0;
        task.payouts_distributed = 0;
        task.bump = ctx.bumps.task;

        if let Some(profile_acc) = &ctx.accounts.user_profile {
            task.referrer = profile_acc.referrer;
        } else {
            task.referrer = crate::ID;
        }

        // Lock total_budget native SOL into the task PDA escrow
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: ctx.accounts.task.to_account_info(),
            },
        );
        transfer(cpi_context, total_budget)?;

        Ok(())
    }

    pub fn validate_meeting(ctx: Context<ValidateMeeting>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        
        let payout_amount = (task.total_budget as u128)
            .checked_mul(task.percentage_fee as u128)
            .ok_or(SoldowayError::MathOverflow)?
            .checked_div(10000)
            .ok_or(SoldowayError::MathOverflow)? as u64;

        require!(
            task.payouts_distributed + payout_amount <= task.total_budget,
            SoldowayError::InsufficientBudget
        );
        
        task.meetings_logged += 1;
        task.payouts_distributed += payout_amount;
        
        // Direct native SOL payout to the partner
        task.sub_lamports(payout_amount)?;
        ctx.accounts.partner.add_lamports(payout_amount)?;

        Ok(())
    }

    pub fn close_task(_ctx: Context<CloseTask>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 32 + 8 + 8 + 1, 
        seeds = [b"user", owner.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String, company_name: String, category: String, description: String)]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 32 + (4 + 100) + (4 + 100) + (4 + 50) + (4 + 512) + 8 + 8 + 8 + 8 + 1, 
        seeds = [b"task", creator.key().as_ref(), title.as_bytes()],
        bump
    )]
    pub task: Account<'info, Task>,

    #[account(
        seeds = [b"user", creator.key().as_ref()],
        bump
    )]
    pub user_profile: Option<Account<'info, UserProfile>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ValidateMeeting<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    /// CHECK: The sales partner receiving the SOL payout
    #[account(mut)]
    pub partner: AccountInfo<'info>,

    #[account(
        mut,
        has_one = creator,
        seeds = [b"task", creator.key().as_ref(), task.title.as_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,
    
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct CloseTask<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        mut,
        close = creator,
        has_one = creator,
        seeds = [b"task", creator.key().as_ref(), task.title.as_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,
}

#[account]
pub struct Task {
    pub creator: Pubkey,
    pub referrer: Pubkey,
    pub title: String,
    pub company_name: String,
    pub category: String,
    pub description: String,
    pub percentage_fee: u64,
    pub total_budget: u64,
    pub meetings_logged: u64,
    pub payouts_distributed: u64,
    pub bump: u8,
}

#[account]
pub struct UserProfile {
    pub owner: Pubkey,
    pub referrer: Pubkey,
    pub total_earned: u64,
    pub referrals_count: u64,
    pub bump: u8,
}

#[error_code]
pub enum SoldowayError {
    #[msg("The task budget has been exhausted.")]
    InsufficientBudget,
    #[msg("Arithmetic overflow occurred.")]
    MathOverflow,
}

pub mod tests;
