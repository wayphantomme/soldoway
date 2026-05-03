#[cfg(test)]
mod tests {
    use crate::ID as PROGRAM_ID;
    use anchor_lang::{InstructionData, ToAccountMetas};
    use litesvm::LiteSVM;
    use solana_sdk::{
        instruction::Instruction,
        pubkey::Pubkey,
        signature::Keypair,
        signer::Signer,
        system_program,
        transaction::Transaction,
    };

    const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

    fn get_task_pda(creator: &Pubkey, title: &str) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[b"task", creator.as_ref(), title.as_bytes()], &PROGRAM_ID)
    }

    #[test]
    fn test_create_task_and_validate_meeting() {
        let mut svm = LiteSVM::new();
        let program_bytes = include_bytes!("../../../target/deploy/vault.so");
        svm.add_program(PROGRAM_ID, program_bytes);

        // Setup User
        let creator = Keypair::new();
        svm.airdrop(&creator.pubkey(), 10 * LAMPORTS_PER_SOL).unwrap();

        // Create Task
        let title = "Growth Campaign".to_string();
        let (task_pda, _) = get_task_pda(&creator.pubkey(), &title);
        
        let budget = 2 * LAMPORTS_PER_SOL;
        let create_task_ix = Instruction {
            program_id: PROGRAM_ID,
            accounts: crate::accounts::CreateTask {
                creator: creator.pubkey(),
                task: task_pda,
                user_profile: None,
                system_program: system_program::ID,
            }.to_account_metas(None),
            data: crate::instruction::CreateTask {
                title: title.clone(),
                company_name: "TestCo".to_string(),
                category: "AI".to_string(),
                description: "Description".to_string(),
                percentage_fee: 1000, // 10%
                total_budget: budget,
            }.data(),
        };

        let blockhash = svm.latest_blockhash();
        let create_tx = Transaction::new_signed_with_payer(
            &[create_task_ix],
            Some(&creator.pubkey()),
            &[&creator],
            blockhash,
        );

        svm.send_transaction(create_tx).expect("Create task should succeed");

        // Verify task PDA holds the budget
        let task_account = svm.get_account(&task_pda).unwrap();
        assert!(task_account.lamports >= budget);

        // Validate Meeting
        let partner = Keypair::new();
        let validate_ix = Instruction {
            program_id: PROGRAM_ID,
            accounts: crate::accounts::ValidateMeeting {
                creator: creator.pubkey(),
                partner: partner.pubkey(),
                task: task_pda,
                system_program: system_program::ID,
            }.to_account_metas(None),
            data: crate::instruction::ValidateMeeting {}.data(),
        };

        let blockhash = svm.latest_blockhash();
        let validate_tx = Transaction::new_signed_with_payer(
            &[validate_ix],
            Some(&creator.pubkey()),
            &[&creator],
            blockhash,
        );

        svm.send_transaction(validate_tx).expect("Validate meeting should succeed");

        // Verify partner received payout (2 SOL * 10% = 0.2 SOL)
        let partner_account = svm.get_account(&partner.pubkey()).unwrap();
        assert_eq!(partner_account.lamports, (0.2 * LAMPORTS_PER_SOL as f64) as u64);
    }
}
