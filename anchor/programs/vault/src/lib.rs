use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

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
        payout_per_meeting: u64, 
        total_budget: u64
    ) -> Result<()> {
        let task = &mut ctx.accounts.task;
        task.creator = ctx.accounts.creator.key();
        task.title = title;
        task.company_name = company_name;
        task.category = category;
        task.description = description;
        task.payout_per_meeting = payout_per_meeting;
        task.total_budget = total_budget;
        task.meetings_logged = 0;
        task.payouts_distributed = 0;
        task.total_jitosol_shares = 0; // Will be tracked/updated by frontend
        task.accrued_yield = 0;
        task.bump = ctx.bumps.task;

        if let Some(profile_acc) = &ctx.accounts.user_profile {
            task.referrer = profile_acc.referrer;
        } else {
            task.referrer = crate::ID;
        }

        // CPI to SPL Stake Pool to deposit SOL
        let deposit_ix = spl_stake_pool::instruction::deposit_sol(
            ctx.accounts.stake_pool_program.key,
            ctx.accounts.stake_pool.key,
            ctx.accounts.stake_pool_withdraw_authority.key,
            ctx.accounts.reserve_stake.key,
            ctx.accounts.creator.key,
            &ctx.accounts.vault_jitosol_account.key(),
            ctx.accounts.manager_fee_account.key,
            ctx.accounts.referral_pool_account.key,
            &ctx.accounts.pool_mint.key(),
            ctx.accounts.token_program.key,
            total_budget,
        );

        anchor_lang::solana_program::program::invoke(
            &deposit_ix,
            &[
                ctx.accounts.stake_pool_program.to_account_info(),
                ctx.accounts.stake_pool.to_account_info(),
                ctx.accounts.stake_pool_withdraw_authority.to_account_info(),
                ctx.accounts.reserve_stake.to_account_info(),
                ctx.accounts.creator.to_account_info(),
                ctx.accounts.vault_jitosol_account.to_account_info(),
                ctx.accounts.manager_fee_account.to_account_info(),
                ctx.accounts.referral_pool_account.to_account_info(),
                ctx.accounts.pool_mint.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn update_task(ctx: Context<UpdateTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(
            task.payouts_distributed + task.payout_per_meeting <= task.total_budget,
            SoldowayError::InsufficientBudget
        );
        task.meetings_logged += 1;
        Ok(())
    }

    pub fn withdraw_for_payout(ctx: Context<WithdrawPayout>, jitosol_amount: u64) -> Result<()> {
        let task = &mut ctx.accounts.task;
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_jitosol_account.to_account_info(),
            to: ctx.accounts.partner_jitosol_account.to_account_info(),
            authority: task.to_account_info(),
        };
        
        let title_bytes = task.title.as_bytes();
        let creator_key = task.creator.as_ref();
        let bump = &[task.bump];
        let seeds: &[&[&[u8]]] = &[&[
            b"task",
            creator_key,
            title_bytes,
            bump,
        ]];
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            seeds,
        );
        
        token::transfer(cpi_ctx, jitosol_amount)?;
        
        task.payouts_distributed += task.payout_per_meeting;
        
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
        space = 8 + 32 + 32 + (4 + 100) + (4 + 100) + (4 + 50) + (4 + 512) + 8 + 8 + 8 + 8 + 8 + 8 + 1, 
        seeds = [b"task", creator.key().as_ref(), title.as_bytes()],
        bump
    )]
    pub task: Account<'info, Task>,

    #[account(
        seeds = [b"user", creator.key().as_ref()],
        bump
    )]
    pub user_profile: Option<Account<'info, UserProfile>>,

    /// CHECK: Validated by Stake Pool
    #[account(mut)]
    pub stake_pool: UncheckedAccount<'info>,
    /// CHECK: Validated by Stake Pool
    pub stake_pool_withdraw_authority: UncheckedAccount<'info>,
    /// CHECK: Validated by Stake Pool
    #[account(mut)]
    pub reserve_stake: UncheckedAccount<'info>,
    /// CHECK: Validated by Stake Pool
    #[account(mut)]
    pub manager_fee_account: UncheckedAccount<'info>,
    /// CHECK: Validated by Stake Pool
    #[account(mut)]
    pub referral_pool_account: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub pool_mint: Account<'info, token::Mint>,

    #[account(
        init_if_needed,
        payer = creator,
        associated_token::mint = pool_mint,
        associated_token::authority = task
    )]
    pub vault_jitosol_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    
    /// CHECK: Validated by ID
    pub stake_pool_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct UpdateTask<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        mut,
        has_one = creator,
        seeds = [b"task", creator.key().as_ref(), task.title.as_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct WithdrawPayout<'info> {
    #[account(mut)]
    pub payer: Signer<'info>, // Sales partner or backend relayer triggering the withdrawal

    #[account(
        mut,
        seeds = [b"task", task.creator.as_ref(), task.title.as_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,

    #[account(
        mut,
        associated_token::mint = pool_mint,
        associated_token::authority = task
    )]
    pub vault_jitosol_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = pool_mint,
        associated_token::authority = payer
    )]
    pub partner_jitosol_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub pool_mint: Account<'info, token::Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
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
    pub payout_per_meeting: u64,
    pub total_budget: u64,
    pub meetings_logged: u64,
    pub payouts_distributed: u64,
    pub total_jitosol_shares: u64,
    pub accrued_yield: u64,
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
}
