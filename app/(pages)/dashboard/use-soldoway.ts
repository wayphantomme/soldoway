import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Buffer } from 'buffer';
import idl from '../../anchor/vault.json';

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
  const wallet = useAnchorWallet();
  const [tasks, setTasks] = useState<TaskAccount[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const program = useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, { 
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
    return new Program(idl as any, provider);
  }, [connection, wallet]);

  const fetchTasks = useCallback(async () => {
    if (!program) return;
    setLoading(true);
    try {
      const accounts = await program.account.task.all();
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

  const fetchUserProfile = useCallback(async () => {
    if (!program || !wallet?.publicKey) return;
    try {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), wallet.publicKey.toBuffer()],
        program.programId
      );
      const profile = await program.account.userProfile.fetch(profilePda);
      setUserProfile(profile as any);
    } catch (err) {
      setUserProfile(null);
    }
  }, [program, wallet?.publicKey]);

  useEffect(() => {
    if (program) {
      fetchTasks();
      fetchUserProfile();
    }
  }, [program, fetchTasks, fetchUserProfile]);

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
    createTask,
    updateTaskProgress,
    refreshTasks: fetchTasks,
    initializeUser
  };
};
