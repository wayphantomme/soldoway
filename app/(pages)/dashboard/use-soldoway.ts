import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction, VersionedTransaction, Connection } from '@solana/web3.js';
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
  percentageFee: BN;
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
  const connection = useMemo(() => new Connection("https://api.devnet.solana.com", "confirmed"), []);
  const { user, ready, authenticated, login: connect } = usePrivy();
  const { wallets } = useWallets();

  // Find the first available Solana wallet connected via Privy
  const primaryWallet = useMemo(() => {
    if (!wallets || wallets.length === 0) {
      return null;
    }
    
    // 1. PRIORITIZE SOLFLARE (User's request)
    const solflare = wallets.find(w => w.walletClientType === 'solflare');
    if (solflare) return solflare;

    // 2. Fallback to Phantom
    const phantom = wallets.find(w => w.walletClientType === 'phantom');
    if (phantom) return phantom;

    // 3. Fallback to any Solana-compatible address
    const solanaWallet = wallets.find(w => !w.address.startsWith('0x'));
    if (solanaWallet) return solanaWallet;
    
    return wallets[0];
  }, [wallets]);

  // Effect to log clear instructions if Solflare is missing
  useEffect(() => {
    if (ready && authenticated && wallets?.length > 0) {
      const hasSolflare = wallets.some(w => w.walletClientType === 'solflare');
      if (!hasSolflare) {
        console.warn("[Soldoway] Solflare not found in connected wallets. Please click your wallet extension and ensure it is linked.");
      } else {
        console.log("[Soldoway] Solflare detected and ready!");
      }
    }
  }, [ready, authenticated, wallets]);

  const [tasks, setTasks] = useState<TaskAccount[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingProgram, setIsLoadingProgram] = useState(true);

  // Bridge Privy Wallet to standard AnchorWallet interface
  const wallet = useMemo(() => {
    // 1. Try Privy Primary Wallet
    if (primaryWallet && !primaryWallet.address.startsWith('0x')) {
      try {
        return {
          publicKey: new PublicKey(primaryWallet.address),
          signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
             // @ts-ignore
             return await primaryWallet.signTransaction(tx);
          },
          signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
             const signedTxs = [];
             for (const tx of txs) {
                // @ts-ignore
               signedTxs.push(await primaryWallet.signTransaction(tx));
             }
             return signedTxs;
          }
        };
      } catch (err) {
        console.error("[Soldoway] Failed to bridge Privy wallet:", err);
      }
    }
    
    // 2. FALLBACK: Direct Solflare Extension Check (Bypasses Privy hook lag)
    if (typeof window !== 'undefined' && (window as any).solflare) {
      const solflare = (window as any).solflare;
      // Even if not connected yet, we return the object so we can call .connect() later
      console.log("[Soldoway] Solflare extension detected in window object.");
      return {
        publicKey: solflare.publicKey || new PublicKey("11111111111111111111111111111111"), // Temporary PK if not connected
        signTransaction: async (tx: any) => {
          if (!solflare.isConnected) {
            console.log("[Soldoway] Solflare not connected, requesting connection...");
            await solflare.connect();
          }
          return await solflare.signTransaction(tx);
        },
        signAllTransactions: async (txs: any) => {
          if (!solflare.isConnected) await solflare.connect();
          return await solflare.signAllTransactions(txs);
        },
      };
    }
    
    return null;
  }, [primaryWallet]);

  // Handle loading state in a dedicated effect to avoid rendering side-effects
  useEffect(() => {
    if (wallet && wallet.publicKey) {
      setIsLoadingProgram(false);
    } else if (ready && authenticated) {
      setIsLoadingProgram(true);
    }
  }, [wallet, ready, authenticated]);

  const program = useMemo(() => {
    try {
      if (!wallet || !wallet.publicKey) {
        console.log("[Soldoway] Program initialization deferred: No wallet found.");
        return null;
      }
      
      console.log("[Soldoway] Initializing Program for wallet:", wallet.publicKey.toBase58());
      
      const provider = new AnchorProvider(connection, wallet as any, { 
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      });
      return new Program(idl as any, provider);
    } catch (err) {
      console.error("[Soldoway] CRITICAL: Program initialization failed:", err);
      return null;
    }
  }, [connection, wallet]);

  // Debug logging
  useEffect(() => {
    if (ready) {
      console.log("[Soldoway Debug] Wallets count:", wallets?.length || 0);
      console.log("[Soldoway Debug] Authenticated:", authenticated);
      if (wallets && wallets.length > 0) {
        wallets.forEach((w, i) => {
          console.log(`[Soldoway Debug] Wallet ${i}: ${w.address} | Type: ${w.walletClientType}`);
        });
      }
      console.log("[Soldoway Debug] Primary Wallet found:", !!primaryWallet);
      console.log("[Soldoway Debug] Wallet public key:", wallet?.publicKey?.toBase58());
      console.log("[Soldoway Debug] Program initialized:", !!program);
      
      if (!program) {
        if (!authenticated) console.log("[Soldoway Status] Reason: User not authenticated");
        else if (!wallet) console.log("[Soldoway Status] Reason: Wallet bridge not ready");
        else console.log("[Soldoway Status] Reason: Program object failed to create");
      }
    }
  }, [ready, authenticated, wallets, primaryWallet, wallet, program]);

  const fetchTasks = useCallback(async () => {
    if (!program) return;
    setLoading(true);
    try {
      // Use any to bypass casing inconsistency between IDL and Anchor TS versions
      const taskAccount = (program.account as any).task || (program.account as any).Task;
      const accounts = await taskAccount.all();
      const mappedTasks = accounts.map((acc: any) => {
        try {
          return {
            publicKey: acc.publicKey,
            ...acc.account,
          };
        } catch (e) {
          console.error("Failed to decode task account:", acc.publicKey.toString());
          return null;
        }
      }).filter(Boolean) as TaskAccount[];
      
      setTasks(mappedTasks);
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
    percentageFee: number, 
    budget: string | number
  ) => {
    console.log("[Soldoway] [STEP 1] Starting createTask process...");
    if (!program) {
       console.error("[Soldoway] [ERROR] Program object is null!");
       throw new Error("Program not initialized");
    }
    if (!wallet) {
       console.error("[Soldoway] [ERROR] Wallet object is null!");
       throw new Error("Wallet not connected");
    }

    try {
      console.log("[Soldoway] [STEP 2] Sanity check passed. Wallet PK:", wallet.publicKey.toBase58());
      
      const percentageFeeBps = new BN(Math.round(percentageFee * 100));
      const budgetLamports = new BN(Math.round(budget));

      console.log("[Soldoway] [STEP 3] Deriving PDA for title:", title);
      const [taskPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("task"), wallet.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), wallet.publicKey.toBuffer()],
        program.programId
      );

      console.log(`[Soldoway Debug] Wallet: ${wallet.publicKey.toBase58()} | Program: ${program.programId.toBase58()}`);

      console.log("[Soldoway] Preparing transaction...");
      console.log("[Soldoway] Sending transaction via Anchor RPC...");
      const signature = await program.methods
        .createTask(
          title, 
          companyName, 
          description, 
          percentageFeeBps, 
          budgetLamports
        )
        .accounts({
          creator: wallet.publicKey,
          task: taskPda,
          systemProgram: SystemProgram.programId,
        } as any) // Use as any to bypass strict IDL mapping if names shifted
        .rpc();
      
      console.log("Transaction successful! Signature:", signature);
      await fetchTasks();
      return signature;
    } catch (err: any) {
      console.error("Detailed error in createTask:", err);
      if (err.logs) {
        console.error("Transaction Logs (Crucial for Debugging Devnet Reverts):", err.logs);
      }
      throw err;
    }
  };

  const validateMeeting = async (taskPda: PublicKey, partnerPubKey: string) => {
    if (!program || !wallet?.publicKey) throw new Error("Wallet not connected");
    try {
      const partner = new PublicKey(partnerPubKey);
      
      const signature = await program.methods
        .validateMeeting()
        .accounts({
          creator: wallet.publicKey,
          partner: partner,
          task: taskPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
        
      console.log("Meeting validated! Signature:", signature);
      await connection.confirmTransaction(signature, "confirmed");
      await fetchTasks();
      return signature;
    } catch (err) {
      console.error("Error validating meeting:", err);
      throw err;
    }
  };

  return {
    isReady: !!program && !!wallet && ready && authenticated,
    authenticated,
    ready,
    connect,
    isLoadingProgram,
    tasks,
    loading,
    userProfile,
    referrals,
    createTask,
    validateMeeting,
    fetchTasks,
    refreshTasks: fetchTasks,
    refreshReferrals: fetchReferrals,
    initializeUser,
    wallet,
    error: null // Placeholder for future global error state
  };
};
