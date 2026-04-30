"use client";

import { useState, useRef, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ellipsify } from "../lib/explorer";
import { Copy, ExternalLink, LogOut, Key } from "lucide-react";

export function WalletButton() {
  const { ready, authenticated, user, login, logout, exportWallet } = usePrivy();
  
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fallback to first wallet if embedded isn't explicitly tagged
  const address = user?.wallet?.address || user?.linkedAccounts?.find((acc) => acc.type === 'wallet')?.address;

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!ready) {
    return (
      <div className="relative" ref={ref}>
        <div className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={login}
          className="cursor-pointer rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-gray-900 active:scale-95"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => (isOpen ? close() : open())}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:shadow"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
        </span>
        <span className="font-mono">{address ? ellipsify(address, 4) : "Privy"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5">
          {/* Avatar and Address Section */}
          <div className="mb-2 flex items-center gap-3 border-b border-slate-100 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 font-bold text-white shadow-inner">
              {address ? address.substring(0, 2) : "PR"}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {address ? ellipsify(address, 4) : "Wallet"}
              </p>
              <p className="text-xs text-slate-500">Connected via Privy</p>
            </div>
          </div>

          {/* List Items */}
          <div className="flex flex-col gap-1 p-1">
            {address && (
              <button
                onClick={handleCopy}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                <Copy className="h-4 w-4 text-slate-400" />
                {copied ? "Address Copied!" : "Copy Address"}
              </button>
            )}
            
            {address && (
              <a
                href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                onClick={close}
              >
                <ExternalLink className="h-4 w-4 text-slate-400" />
                View on Explorer
              </a>
            )}

            <button
              onClick={() => {
                exportWallet();
                close();
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              <Key className="h-4 w-4 text-slate-400" />
              Export Wallet
            </button>

            <div className="my-1 h-px w-full bg-slate-100" />

            <button
              onClick={() => {
                logout();
                close();
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 active:bg-red-100"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
