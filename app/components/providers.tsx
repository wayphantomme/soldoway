"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { PropsWithChildren, useMemo } from "react";
import { ClusterProvider } from "./cluster-context";
import { WalletProvider as KitWalletProvider } from "../lib/wallet/context";
import { SolanaClientProvider } from "../lib/solana-client-context";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

export function Providers({ children }: PropsWithChildren) {
  const network = clusterApiUrl("devnet");
  const wallets = useMemo(() => [], []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
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
    </ThemeProvider>
  );
}
