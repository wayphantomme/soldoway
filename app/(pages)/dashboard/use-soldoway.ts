import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useWallets } from '@privy-io/react-auth';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction, VersionedTransaction } from '@solana/web3.js';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Buffer } from 'buffer';
import idl from '@/app/anchor/vault.json';

// Ensure Buffer is available globally for Anchor
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

export interface TaskAccount {
  publicKey: PublicKey;
  creator: PublicKey;
  referrer: PublicKey;
  title: string;
  companyName: string;
  category: string;
  description: string;
  payoutPerMeeting: BN;
  totalBudget: BN;
  meetingsLogged: BN;
  payoutsDistributed: BN;
}

export interface UserProfile {
  owner: PublicKey;
  referrer: PublicKey;
  totalEarned: BN;
  referralsCount: BN;
}

export const useSoldoway = () => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { wallets } = useWallets();
  const [tasks, setTasks] = useState<TaskAccount[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Find the first available Solana wallet connected via Privy
  const privySolanaWallet = useMemo(() => {
    return wallets.find((w) => (w as any).chainType === 'solana' || !w.address.startsWith('0x'));
  }, [wallets]);

  // Bridge Privy Wallet to standard AnchorWallet interface
  const wallet = useMemo(() => {
    if (anchorWallet) return anchorWallet;
    
    if (privySolanaWallet) {
      return {
        publicKey: new PublicKey(privySolanaWallet.address),
        signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
           // Privy solana wallets expose signTransaction
           // Note: We might need to handle provider casting based on Privy's exact version, 
           // but generic await on signTransaction works for their standard integration.
           // @ts-ignore - bypassing strict type checking for Privy's sign method
           return await privySolanaWallet.signTransaction(tx);
        },
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
           const signedTxs = [];
           for (const tx of txs) {
              // @ts-ignore
             signedTxs.push(await privySolanaWallet.signTransaction(tx));
           }
           return signedTxs;
        }
      };
    }
    
    return null;
  }, [anchorWallet, privySolanaWallet]);

  const program = useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet as any, { 
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
    return new Program(idl as any, provider);
  }, [connection, wallet]);

  const fetchTasks = useCallback(async () => {
    if (!program) return;
    setLoading(true);
    try {
      // Use any to bypass casing inconsistency between IDL and Anchor TS versions
      const taskAccount = (program.account as any).task || (program.account as any).Task;
      const accounts = await taskAccount.all();
      setTasks(accounts.map((acc: any) => ({
        publicKey: acc.publicKey,
        ...acc.account,
      })) as TaskAccount[]);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [program]);

  const [referrals, setReferrals] = useState<UserProfile[]>([]);

  const fetchUserProfile = useCallback(async () => {
    if (!program || !wallet?.publicKey) return;
    try {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), wallet.publicKey.toBuffer()],
        program.programId
      );
      const profileAccount = (program.account as any).userProfile || (program.account as any).UserProfile;
      const profile = await profileAccount.fetch(profilePda);
      setUserProfile(profile as any);
    } catch (err) {
      setUserProfile(null);
    }
  }, [program, wallet?.publicKey]);

  const fetchReferrals = useCallback(async () => {
    if (!program || !wallet?.publicKey) return;
    try {
      const profileAccount = (program.account as any).userProfile || (program.account as any).UserProfile;
      const allProfiles = await profileAccount.all();
      const userReferrals = allProfiles
        .filter((p: any) => p.account.referrer.toString() === wallet.publicKey.toString() && p.account.owner.toString() !== wallet.publicKey.toString())
        .map((p: any) => ({
          owner: p.account.owner,
          referrer: p.account.referrer,
          totalEarned: p.account.totalEarned,
          referralsCount: p.account.referralsCount,
        }));
      setReferrals(userReferrals);
    } catch (err) {
      console.error("Error fetching referrals:", err);
    }
  }, [program, wallet?.publicKey]);

  useEffect(() => {
    if (program) {
      fetchTasks();
      fetchUserProfile();
      fetchReferrals();
    }
  }, [program, fetchTasks, fetchUserProfile, fetchReferrals]);

  const initializeUser = async (referrerStr?: string) => {
    if (!program || !wallet?.publicKey) throw new Error("Wallet not connected");
    
    let referrer: PublicKey;
    try {
      referrer = (referrerStr && referrerStr !== wallet.publicKey.toString()) 
        ? new PublicKey(referrerStr) 
        : program.programId; 
    } catch {
      referrer = program.programId;
    }

    try {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .initializeUser(referrer)
        .accounts({
          owner: wallet.publicKey,
          userProfile: profilePda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      await fetchUserProfile();
      return tx;
    } catch (err) {
      console.error("Failed to initialize user:", err);
      throw err;
    }
  };

  const createTask = async (
    title: string, 
    companyName: string, 
    category: string, 
    description: string, 
    payout: string | number, 
    budget: string | number
  ) => {
    if (!program || !wallet?.publicKey) {
      console.error("Program or Wallet not initialized");
      throw new Error("Wallet not connected");
    }

    try {
      const sanitize = (val: string | number) => {
        const str = typeof val === "string" ? val.replace(',', '.') : val.toString();
        const num = parseFloat(str);
        if (isNaN(num)) return 0;
        return Math.round(num); // Ensure it is already in lamports from the caller, or handled here
      };

      // Important: The caller (page.tsx) sends (value * LAMPORTS_PER_SOL), 
      // so we just need to ensure it is an integer here.
      const payoutLamports = new BN(sanitize(payout));
      const budgetLamports = new BN(sanitize(budget));

      const [taskPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("task"), wallet.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), wallet.publicKey.toBuffer()],
        program.programId
      );

      console.log("Sending Transaction with accounts:", {
        creator: wallet.publicKey.toString(),
        task: taskPda.toString(),
        userProfile: profilePda.toString(),
      });

      const tx = await program.methods
        .createTask(
          title, 
          companyName, 
          category, 
          description, 
          payoutLamports, 
          budgetLamports
        )
        .accounts({
          creator: wallet.publicKey,
          task: taskPda,
          userProfile: profilePda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await fetchTasks();
      return tx;
    } catch (err) {
      console.error("Detailed error in createTask:", err);
      throw err;
    }
  };

  const updateTaskProgress = async (taskPda: PublicKey) => {
    if (!program || !wallet?.publicKey) throw new Error("Wallet not connected");
    try {
      // NOTE: For true Gasless/Account Abstraction on Solana via Privy/x402, 
      // you would typically construct the instruction here, serialize it, 
      // and send it to your backend relayer (e.g. `/api/sponsor`) to be signed 
      // as the fee payer before submitting.
      //
      // Below is the standard flow, relying on the Privy Embedded Wallet to sign 
      // and pay if it holds SOL.
      const tx = await program.methods
        .updateTask()
        .accounts({
          creator: wallet.publicKey,
          task: taskPda,
        })
        .rpc();
      await fetchTasks();
      return tx;
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    userProfile,
    referrals,
    createTask,
    updateTaskProgress,
    refreshTasks: fetchTasks,
    refreshReferrals: fetchReferrals,
    initializeUser
  };
};
