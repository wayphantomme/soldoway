"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { WalletButton } from "../components/wallet-button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#000000] font-sans selection:bg-black selection:text-white">
      {/* App Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Soldoway
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500">
              <Link href="/dashboard" className="hover:text-black transition-colors">Dashboard</Link>
              <Link href="/sales" className="hover:text-black transition-colors">Sales</Link>
              <Link href="/referral" className="hover:text-black transition-colors">Referral</Link>
            </nav>
          </div>
          <div className="flex items-center">
            {mounted && <WalletButton />}
          </div>
        </div>
      </header>

      {/* Main App Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
