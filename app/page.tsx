"use client";

import { motion } from "framer-motion";
import { Zap, ArrowUpRight, Code, Network, XCircle, CheckCircle2, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

const features = [
  { 
    icon: Shield, 
    title: "Low Barrier Entry", 
    desc: "Kickstart your prospecting engine with as little as a $100 USDC deposit. Scale your B2B outreach without the heavy overhead." 
  },
  { 
    icon: ArrowUpRight, 
    title: "Yield-Bearing Escrow", 
    desc: "Your budget works for you. While waiting for meetings to be logged, your funds are deployed into Solana's top DeFi vaults (Kamino/Solend)." 
  },
  { 
    icon: Code, 
    title: "B2B Connect API", 
    desc: "Bridge the gap between Web3 and your CRM. Our API allows for seamless meeting validation and automated partner synchronization." 
  },
  { 
    icon: Zap, 
    title: "Zero-Gas Experience", 
    desc: "Powered by Privy, we remove the \"SOL hurdle.\" Sales partners simply sign in with Email or Google, and Soldoway handles the transaction costs behind the scenes." 
  },
];

const comparisons = [
  { old: "Capital sits in banks earning 0% APY.", new: "Idle deposits earn DeFi Yield automatically." },
  { old: "Manual, slow, and opaque sales payouts.", new: "Instant $10 Payouts per verified meeting log." },
  { old: "High friction: Users need SOL for gas fees.", new: "Zero Friction: No browser extension or initial SOL required." },
  { old: "Disconnected B2B networking.", new: "API-First integration for seamless B2B collab." },
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

export default function Home() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (authenticated) {
      router.push("/dashboard");
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] selection:bg-black selection:text-white pb-10 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">Soldoway</div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-black transition-colors">How it Works</a>
            <a href="#api" className="hover:text-black transition-colors">API</a>
            <a href="#docs" className="hover:text-black transition-colors">Docs</a>
          </nav>
          <div className="flex items-center">
            <button 
              onClick={handleGetStarted}
              className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              Launch App
            </button>
          </div>
        </div>
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

        {/* The Efficiency Gap */}
        <section id="how-it-works" className="max-w-5xl mx-auto scroll-mt-24">
          <FadeInUp>
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">The Efficiency Gap</h2>
              <p className="text-gray-500">Why the traditional model is broken, and how Soldoway fixes it.</p>
            </div>
          </FadeInUp>
          <FadeInUp delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-200 rounded-3xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-gray-200 shadow-sm">
              <div className="p-10 md:p-12 bg-gray-50/50">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs tracking-wider uppercase">The Old Way</span>
                </h3>
                <ul className="space-y-6">
                  {comparisons.map((c, i) => (
                    <li key={i} className="flex items-start gap-4 text-gray-500">
                      <XCircle className="w-6 h-6 text-gray-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{c.old}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-10 md:p-12 bg-white">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <span className="bg-black text-white px-3 py-1 rounded-full text-xs tracking-wider uppercase">The Soldoway Way</span>
                </h3>
                <ul className="space-y-6">
                  {comparisons.map((c, i) => (
                    <li key={i} className="flex items-start gap-4 text-black font-medium">
                      <CheckCircle2 className="w-6 h-6 text-black shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{c.new}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeInUp>
        </section>

        {/* Core Features */}
        <section id="features" className="max-w-5xl mx-auto scroll-mt-24">
          <FadeInUp>
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Core Infrastructure</h2>
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
