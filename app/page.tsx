"use client";

import { motion } from "framer-motion";
import { Zap, ArrowUpRight, Code, Network, XCircle, CheckCircle2, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import FlowSection from "@/app/components/FlowSection";

const features = [
  { 
    icon: Shield, 
    title: "Low Barrier Entry", 
    desc: "Kickstart your B2B engine with a $100 USDC deposit. Scale outreach programs without the heavy operational overhead or manual bank-to-bank friction." 
  },
  { 
    icon: ArrowUpRight, 
    title: "Yield-Bearing Escrow", 
    desc: "Your capital is a productive asset. While awaiting meeting verification, funds are deployed into Solana's premier DeFi liquidity vaults (Kamino/Solend) to offset your marketing spend." 
  },
  { 
    icon: Code, 
    title: "B2B Connect API", 
    desc: "Seamlessly integrate your CRM with the blockchain. Our API layer ensures real-time meeting validation and automated synchronization between your sales pipeline and partner rewards." 
  },
  { 
    icon: Zap, 
    title: "Zero-Gas Experience", 
    desc: "Powered by Privy, we have eliminated the technical barriers of Web3. Your sales partners join using familiar Email or Google logins; Soldoway manages the blockchain complexity behind the scenes." 
  },
];

const comparisons = [
  { 
    old: { title: "Capital Stagnation", desc: "Marketing budgets sit idle in banks." }, 
    new: { title: "Automated DeFi Yield", desc: "Budget grows automatically in DeFi." } 
  },
  { 
    old: { title: "Manual Overhead", desc: "Payouts are slow, manual, and opaque." }, 
    new: { title: "Instant Smart Payouts", desc: "Payouts are instant and on-chain." } 
  },
  { 
    old: { title: "The \"SOL\" Hurdle", desc: "High friction, wallets, and gas costs." }, 
    new: { title: "Zero-Gas Experience", desc: "No wallets or gas required." } 
  },
  { 
    old: { title: "Opaque Data", desc: "Disconnected B2B networking." }, 
    new: { title: "API-First Transparency", desc: "Real-time, transparent B2B sync." } 
  },
];

function FadeInUp({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
}

import dynamic from "next/dynamic";

const Home = () => {
  const { login, authenticated } = usePrivy();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authenticated) {
      router.push("/dashboard");
    }
  }, [authenticated, router]);

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!authenticated) {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] selection:bg-black selection:text-white pb-10 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight z-50">Soldoway</div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
            <a href="#how-it-works" className="hover:text-black transition-colors">How it Works</a>
            <a href="#efficiency-gap" className="hover:text-black transition-colors">The Efficiency Gap</a>
            <a href="#infrastructure" className="hover:text-black transition-colors">Core Infrastructure</a>
            <a href="#docs" className="hover:text-black transition-colors">Docs</a>
          </nav>
          <div className="flex items-center gap-4 z-50">
            <button 
              onClick={handleGetStarted}
              className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              Launch App
            </button>
            <button 
              className="md:hidden p-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
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
              className="md:hidden border-b border-gray-100 bg-white overflow-hidden absolute w-full"
            >
              <nav className="flex flex-col px-6 py-4 gap-4 text-base font-semibold text-gray-600">
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-black py-2">How it Works</a>
                <a href="#efficiency-gap" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-black py-2">The Efficiency Gap</a>
                <a href="#infrastructure" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-black py-2">Core Infrastructure</a>
                <a href="#docs" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-black py-2">Docs</a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto px-6 mt-20 space-y-32">
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center justify-center max-w-4xl mx-auto pt-16">
          <FadeInUp>
            <h1 className="text-6xl md:text-[5.5rem] font-bold tracking-tighter leading-[1.05] mb-8">
              Scalable Sales. <br /> Programmable Payouts.
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.1}>
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Stop letting your marketing budget sit idle. Build a high-performance B2B sales engine on Solana. Deposit USDC, automate instant payouts for booked meetings, and earn DeFi yield on your capital. <strong className="text-black">100% Gasless.</strong>
            </p>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
              <button 
                onClick={handleGetStarted}
                className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-4 text-base font-semibold transition-all hover:-translate-y-1 w-full sm:w-auto cursor-pointer"
              >
                Get Started with $100
              </button>
              <Link 
                href="#docs"
                className="bg-white text-black border border-gray-300 hover:bg-gray-50 rounded-full px-8 py-4 text-base font-semibold transition-all hover:-translate-y-1 w-full sm:w-auto"
              >
                Read Documentation
              </Link>
            </div>
            <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">
              Powered by Privy Gasless Infrastructure
            </p>
          </FadeInUp>
        </section>

        {/* Flow Section */}
        <section id="how-it-works" className="-mx-6 scroll-mt-24">
          <FlowSection />
        </section>

        {/* The Efficiency Gap */}
        <section id="efficiency-gap" className="max-w-5xl mx-auto scroll-mt-24">
          <FadeInUp>
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">The Opportunity Cost of Modern Sales</h2>
              <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                <strong className="text-black font-semibold block mb-1">Why settle for idle capital?</strong> 
                Traditional sales models treat your marketing budget as a sunk cost, sitting stagnant in business accounts. We see it as a capital-efficiency engine.
              </p>
            </div>
          </FadeInUp>
          <FadeInUp delay={0.1}>
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              {/* Header Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 border-b border-gray-100">
                <div className="p-6 md:p-8 bg-gray-50 flex items-center gap-3">
                  <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs tracking-wider uppercase font-bold">The Traditional Friction</span>
                </div>
                <div className="p-6 md:p-8 bg-emerald-50/30 flex items-center gap-3">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs tracking-wider uppercase font-bold">The Soldoway Advantage</span>
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100 bg-white">
                {comparisons.map((c, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors flex items-start gap-4">
                      <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{c.old.title}</h4>
                        <p className="text-gray-500 text-sm">{c.old.desc}</p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 hover:bg-emerald-50/30 transition-colors flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{c.new.title}</h4>
                        <p className="text-gray-500 text-sm">{c.new.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInUp>
        </section>

        {/* Core Features */}
        <section id="infrastructure" className="max-w-5xl mx-auto scroll-mt-24">
          <FadeInUp>
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Built for Institutional-Grade Scalability</h2>
            </div>
          </FadeInUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <FadeInUp key={i} delay={i * 0.1}>
                <div className="border border-gray-200 bg-white p-8 md:p-10 rounded-2xl h-full flex flex-col items-start transition-all hover:border-gray-300 group">
                  <div className="p-4 bg-gray-50 rounded-xl mb-6 group-hover:bg-gray-100 transition-colors">
                    <f.icon className="w-7 h-7 stroke-black stroke-[1.5px]" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm md:text-base">{f.desc}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </section>

        {/* Technical Spotlight */}
        <section id="api" className="max-w-4xl mx-auto scroll-mt-24">
          <FadeInUp>
            <div className="border border-gray-200 rounded-3xl p-10 md:p-16 text-center bg-gray-50/50">
              <div className="inline-flex items-center gap-2 mb-6 bg-white border border-gray-200 px-4 py-1.5 rounded-full text-sm font-semibold tracking-tight text-gray-500 shadow-sm">
                <Network className="w-4 h-4" /> Privy Infrastructure
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Web3 Power, Web2 Simplicity.</h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                By leveraging <strong className="text-black">Privy&apos;s embedded wallets</strong>, Soldoway abstracts the complexity of blockchain. Users can join using Google or Email and start logging meetings immediately without needing to buy SOL for gas fees.
              </p>
            </div>
          </FadeInUp>
        </section>

        {/* Referral Section */}
        <section className="max-w-4xl mx-auto">
          <FadeInUp>
            <div className="bg-black text-white rounded-[2.5rem] p-12 md:p-20 text-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-30 pointer-events-none"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 flex items-center justify-center rounded-2xl mb-8 border border-white/20">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Grow the Ecosystem. Earn Rewards.</h2>
                <p className="text-white/70 max-w-lg mx-auto text-lg leading-relaxed mb-10">
                  Invite businesses or sales partners to the platform. Earn a 2% kickback on every successful meeting log within your network. Transparent, on-chain, and automated.
                </p>
                <Link 
                  href="/referral"
                  className="bg-white text-black hover:bg-gray-200 rounded-full px-8 py-4 text-base font-semibold transition-all hover:scale-105"
                >
                  Join the Network
                </Link>
              </div>
            </div>
          </FadeInUp>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-32 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center text-sm font-medium text-gray-500">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-black font-semibold mb-1">Soldoway © 2026</p>
            <p>Built on Solana. Seamless Onboarding by Privy.</p>
          </div>
          <div className="flex gap-8">
            <a href="https://x.com/soldoway_sales" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Twitter</a>
            <a href="https://github.com/wayphantomme/soldoway" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
