"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { PropsWithChildren, useMemo, useEffect, useState } from "react";
import { ClusterProvider } from "./cluster-context";
import { WalletProvider as KitWalletProvider } from "../lib/wallet/context";
import { SolanaClientProvider } from "../lib/solana-client-context";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import dynamic from "next/dynamic";
import "@solana/wallet-adapter-react-ui/styles.css";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

const PrivyProvider = dynamic(
  () => import("@privy-io/react-auth").then((mod) => mod.PrivyProvider),
  { ssr: false }
);

export function Providers({ children }: PropsWithChildren) {
  const network = clusterApiUrl("devnet");
  const wallets = useMemo(() => [], []);
  const [mounted, setMounted] = useState(false);
  const solanaConnectors = toSolanaWalletConnectors();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {mounted ? (
        process.env.NEXT_PUBLIC_PRIVY_APP_ID ? (
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
            config={{
              loginMethods: ["email", "wallet", "google", "twitter"],
              appearance: {
                theme: "light",
                accentColor: "#000000",
                logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
                walletList: ["phantom", "solflare"],
                showWalletLoginFirst: true,
              },
              solanaClusters: [{ name: "devnet", rpcUrl: network }],
              embeddedWallets: {
                solana: {
                  createOnLogin: "users-without-wallets",
                },
              },
              externalWallets: {
                solana: {
                  connectors: solanaConnectors,
                },
              },
            }}
          >
            <ConnectionProvider endpoint={network}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <ClusterProvider>
                    <SolanaClientProvider>
                      <KitWalletProvider>{children}</KitWalletProvider>
                    </SolanaClientProvider>
                    <Toaster position="bottom-right" richColors />
                  </ClusterProvider>
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </PrivyProvider>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-red-200">
              <h2 className="text-xl font-bold text-red-600 mb-4">Missing Configuration</h2>
              <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">
                Privy App ID is not configured. The application cannot initialize the authentication provider.
              </p>
              <div className="bg-slate-100 p-4 rounded-xl text-xs font-mono text-slate-800 break-all">
                Add NEXT_PUBLIC_PRIVY_APP_ID=your_id to .env.local
              </div>
            </div>
          </div>
        )
      ) : (
        <>{children}</>
      )}
    </ThemeProvider>
  );
}
