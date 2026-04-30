"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { WalletButton } from "../components/wallet-button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#000000] font-sans selection:bg-black selection:text-white">
      {/* App Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight z-50">
              Soldoway
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500">
              <Link href="/dashboard" className="hover:text-black transition-colors">Dashboard</Link>
              <Link href="/sales" className="hover:text-black transition-colors">Sales</Link>
              <Link href="/referral" className="hover:text-black transition-colors">Referral</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4 z-50">
            {mounted && <WalletButton />}
            
            <button 
              className="md:hidden p-2 text-slate-500 hover:text-black hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-b border-slate-100 bg-white overflow-hidden absolute w-full"
            >
              <nav className="flex flex-col px-6 py-4 gap-4 text-base font-semibold text-slate-600">
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-black py-2">Dashboard</Link>
                <Link href="/sales" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-black py-2">Sales</Link>
                <Link href="/referral" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-black py-2">Referral</Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main App Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
