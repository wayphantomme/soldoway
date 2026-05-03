"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { PropsWithChildren, useMemo, useEffect, useState } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { PrivyProvider } from "@privy-io/react-auth";

export function Providers({ children }: PropsWithChildren) {
  const network = clusterApiUrl("devnet");
  const [mounted, setMounted] = useState(false);
  const [solanaConnectors, setSolanaConnectors] = useState<any>(null);

  useEffect(() => {
    // Dynamically import solana connectors to prevent SSR build errors
    import("@privy-io/react-auth/solana").then((mod) => {
      setSolanaConnectors(mod.toSolanaWalletConnectors());
      setMounted(true);
    }).catch(console.error);
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
              // @ts-ignore - Bypass type error for solanaClusters in this Privy version
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
            <Toaster position="bottom-right" richColors />
            {children}
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
      ) : null}
    </ThemeProvider>
  );
}
