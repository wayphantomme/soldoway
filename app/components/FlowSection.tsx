'use client';

import React from 'react';
import { Wallet, Activity, TrendingUp, Handshake } from 'lucide-react';

export function FlowSection() {
  return (
    <section className="py-24 bg-white text-slate-900 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">The Soldoway Cycle</h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            A smart escrow engine that secures your capital, generates passive yield, and automates payouts for successful B2B meetings.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-0 lg:gap-4 relative">
          
          {/* Left Side: The Main Chain */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full lg:w-auto relative z-10 py-4 lg:py-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center group w-full md:w-44">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white border border-slate-100 flex items-center justify-center transition-all duration-300 group-hover:shadow-sm group-hover:border-slate-200 shadow-sm">
                <Wallet className="w-8 h-8 md:w-10 md:h-10 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </div>
              <div className="mt-5 text-center">
                <h3 className="text-base md:text-lg font-bold leading-tight">Business Deposit</h3>
                <p className="text-xs text-slate-500 mt-2 px-2 leading-relaxed">Securely lock your campaign budget in a transparent smart contract.</p>
              </div>
            </div>

            {/* Connecting Line between Step 1 & 2 */}
            <div className="hidden md:block w-12 h-px bg-slate-200 shrink-0"></div>
            <div className="block md:hidden w-px h-8 bg-slate-200 shrink-0"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center group w-full md:w-44 relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white border border-slate-100 flex items-center justify-center transition-all duration-300 group-hover:shadow-sm group-hover:border-slate-200 shadow-sm relative z-10">
                <Activity className="w-8 h-8 md:w-10 md:h-10 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </div>
              <div className="mt-5 text-center">
                <h3 className="text-base md:text-lg font-bold leading-tight">DeFi Yield Engine</h3>
                <p className="text-xs text-slate-500 mt-2 px-2 leading-relaxed">Idle funds are automatically routed to DeFi to generate passive yield.</p>
              </div>
            </div>
          </div>

          {/* The Fork Connectors (Desktop) */}
          <div className="hidden lg:block relative w-16 shrink-0 h-auto">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-px bg-slate-200"></div>
            <div className="absolute left-8 top-[25%] bottom-[25%] w-px bg-slate-200"></div>
            <div className="absolute left-8 top-[25%] w-8 h-px bg-slate-200"></div>
            <div className="absolute left-8 bottom-[25%] w-8 h-px bg-slate-200"></div>
            <div className="absolute right-0 top-[25%] -translate-y-[2.5px] w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <div className="absolute right-0 bottom-[25%] -translate-y-[2.5px] w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          </div>

          {/* The Fork Connectors (Mobile/Tablet) */}
          <div className="block lg:hidden w-px h-12 bg-slate-200 my-4 relative shrink-0">
            <div className="absolute bottom-0 -left-[2px] w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          </div>

          {/* Right Side: The Branches */}
          <div className="flex flex-col gap-6 w-full lg:w-[30rem] relative z-10 justify-center">
            
            {/* Branch A: Idle */}
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all duration-300 shadow-sm hover:shadow group flex flex-col justify-center h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <TrendingUp className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-2">Yield (Business)</h4>
              <p className="text-slate-600 font-medium leading-relaxed">Harnessing the Solana DeFi ecosystem to turn marketing wait-time into measurable capital gains.</p>
            </div>

            {/* Branch B: Success */}
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all duration-300 shadow-sm hover:shadow group flex flex-col justify-center h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <Handshake className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <h4 className="text-lg md:text-xl font-bold mb-2">Instant % Payout (Sales)</h4>
              <p className="text-slate-600 font-medium leading-relaxed">Validated meetings trigger an automatic, real-time percentage-based payout to the sales partner.</p>
            </div>
          </div>
        </div>

        {/* Live Yield Counter */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow transition-all shadow-sm group">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Live Yield Counter</span>
              </div>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-md mx-auto md:mx-0">
                Using Soldoway isn't just about finding sales, it is about securing your capital's value against inflation while you wait.
              </p>
            </div>
            <div className="flex-shrink-0 text-center md:text-right bg-slate-50 md:bg-transparent p-5 md:p-0 rounded-xl w-full md:w-auto border border-slate-100 md:border-none">
              <div className="text-4xl md:text-5xl font-bold text-emerald-500 mb-1">
                $245.00
              </div>
              <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-medium">Yield generated this month</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FlowSection;
