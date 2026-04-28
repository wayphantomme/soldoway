"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { DollarSign, Clock, Users, X, Link as LinkIcon, Mail, FileText, Filter, Brain, Coins, BarChart3, Image as ImageIcon, Briefcase, Zap, ShieldCheck, CheckCircle2, ChevronDown, Send } from "lucide-react";

// Mock Data
const earningStats = {
  claimable: "$1,250.00",
  pending: "8",
  kickback: "+$142.50"
};

const tasks = [
  {
    id: 1,
    company: "Nexus AI",
    title: "AI Agent Infrastructure",
    category: "AI",
    payout: 15,
    payoutDisplay: "$15 USDC",
    bountyAvailable: 850,
    bountyTotal: 1000,
    target: "NFT Project Founders (Integration)",
    date: "2026-04-26",
  },
  {
    id: 2,
    company: "Liquifi Core",
    title: "Liquidity API",
    category: "CEX/DEX",
    payout: 25,
    payoutDisplay: "$25 USDC",
    bountyAvailable: 2500,
    bountyTotal: 5000,
    target: "DEX Treasury Leads",
    date: "2026-04-28",
  },
  {
    id: 3,
    company: "BridgeCorp",
    title: "Cross-chain Bridge",
    category: "DeFi",
    payout: 20,
    payoutDisplay: "$20 USDC",
    bountyAvailable: 400,
    bountyTotal: 1200,
    target: "DeFi Protocol Gov Leads",
    date: "2026-04-27",
  },
  {
    id: 4,
    company: "OmniVerse",
    title: "NFT Floor Analytics",
    category: "NFT",
    payout: 10,
    payoutDisplay: "$10 USDC",
    bountyAvailable: 200,
    bountyTotal: 500,
    target: "NFT Project Founders / Product Leads",
    date: "2026-04-25",
  }
];

const categories = ["All", "AI", "DeFi", "CEX/DEX", "NFT"];

const getCategoryIcon = (cat: string) => {
  switch (cat) {
    case "AI": return <Brain className="w-5 h-5" />;
    case "DeFi": return <Coins className="w-5 h-5" />;
    case "CEX/DEX": return <BarChart3 className="w-5 h-5" />;
    case "NFT": return <ImageIcon className="w-5 h-5" />;
    default: return <Briefcase className="w-5 h-5" />;
  }
};

function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function SalesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Highest Payout");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const filteredTasks = tasks.filter(t => selectedCategory === "All" || t.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "Highest Payout") return b.payout - a.payout;
      if (sortBy === "Newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });

  return (
    <div className="space-y-12 pb-20">
      
      {/* 1. Earning Summary (Top Section) */}
      <section>
        <FadeIn>
          <h1 className="text-2xl font-bold tracking-tight mb-6">Partner Workspace</h1>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <FadeIn delay={0.05}>
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm flex flex-col justify-between h-full group hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold text-slate-500">Balance Ready to Claim</h3>
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign className="w-4 h-4" /></div>
              </div>
              <p className="text-3xl font-bold font-mono tracking-tight text-slate-900">{earningStats.claimable}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-green-600">
                <ShieldCheck className="w-3.5 h-3.5" /> Available for instant withdrawal
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm flex flex-col justify-between h-full group hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold text-slate-500">Meetings Pending</h3>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-4 h-4" /></div>
              </div>
              <p className="text-3xl font-bold tracking-tight text-slate-900">{earningStats.pending} <span className="text-lg text-slate-400 font-medium tracking-normal">Logs In Review</span></p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm flex flex-col justify-between h-full group hover:border-slate-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold text-slate-500">Network Kickback</h3>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users className="w-4 h-4" /></div>
              </div>
              <p className="text-3xl font-bold font-mono tracking-tight text-slate-900">{earningStats.kickback}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-500">
                <CheckCircle2 className="w-3.5 h-3.5" /> +2% Bonus mapped on-chain
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2. Filter & Search Bar */}
      <section>
        <FadeIn delay={0.2}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold tracking-tight">Available Tasks (Marketplace)</h2>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Pills */}
              <div className="flex bg-white border border-slate-200 rounded-full p-1 shadow-sm overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all whitespace-nowrap ${
                      selectedCategory === cat 
                        ? 'bg-black text-white shadow-sm' 
                        : 'text-slate-500 hover:text-black hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold text-sm px-4 py-2 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Sort: {sortBy}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-2 overflow-hidden">
                    <button 
                      onClick={() => { setSortBy("Highest Payout"); setIsSortOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      Highest Payout
                    </button>
                    <button 
                      onClick={() => { setSortBy("Newest"); setIsSortOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      Newest
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 3. Task Card Design (Marketplace) */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task, i) => (
              <motion.div 
                key={task.id} 
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col md:flex-row gap-6 md:items-center justify-between"
              >
                {/* Left: Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors text-slate-700">
                    {getCategoryIcon(task.category)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <h3 className="text-lg font-bold tracking-tight text-slate-900">{task.company}</h3>
                       <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                         {task.category}
                       </span>
                    </div>
                    <p className="font-semibold text-slate-700">{task.title}</p>
                    <p className="text-sm font-medium text-slate-500 max-w-md pt-1 leading-snug">
                       Target Persona: <span className="text-slate-700 font-semibold">{task.target}</span>
                    </p>
                  </div>
                </div>

                {/* Middle: Bounty & Payout */}
                <div className="flex flex-col md:items-center gap-3 px-4 md:border-x border-slate-100 py-2">
                  <div className="text-left md:text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Payout Per Meeting</p>
                    <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-200/60 shadow-sm">
                      <span className="font-mono text-lg font-bold tracking-tight">{task.payoutDisplay}</span>
                    </div>
                  </div>
                  
                  <div className="w-full text-left md:text-center">
                     <div className="flex justify-between md:justify-center items-end gap-2 text-xs font-semibold mb-1.5">
                       <span className="text-slate-400">Pool:</span>
                       <span className="text-slate-700">${task.bountyAvailable} <span className="text-slate-300">/ ${task.bountyTotal}</span></span>
                     </div>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(task.bountyAvailable / task.bountyTotal) * 100}%` }}></div>
                     </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row md:flex-col gap-3 shrink-0 items-center md:items-end min-w-[200px]">
                   <button className="flex-1 md:flex-none md:w-full bg-white text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 hover:text-black transition-colors text-center">
                     View Script
                   </button>
                   <button 
                     onClick={() => setSelectedTask(task)}
                     className="flex-1 md:flex-none md:w-full bg-black text-white border border-transparent px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#1a1a1a] transition-colors relative overflow-hidden text-center group/btn"
                   >
                     Submit Meeting Log
                     <div className="absolute inset-0 bg-white/10 -skew-x-12 translate-x-full group-hover/btn:-translate-x-full transition-transform duration-700"></div>
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Submission Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedTask(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
            >
              {/* Header */}
              <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
                    <Zap className="w-3.5 h-3.5 fill-indigo-700" /> Gasless Submission (x402)
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Submit Meeting Log</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">For: {selectedTask.company} • {selectedTask.title}</p>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded-full transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Meeting / Calendar Link</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      type="url" 
                      placeholder="https://cal.com/..." 
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Prospect Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      type="email" 
                      placeholder="founder@startup.com" 
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500 flex justify-between">
                    <span>Short Note</span>
                    <span className="text-slate-300 font-normal">Optional</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FileText className="w-4 h-4 text-slate-400" />
                    </div>
                    <textarea 
                      placeholder="Prospect was interested in integrating the API..." 
                      rows={3}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow resize-none"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <button className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl font-bold hover:bg-[#1a1a1a] transition-all shadow-md active:scale-[0.98]">
                    <Send className="w-4 h-4" />
                    Submit & Request {selectedTask.payoutDisplay}
                  </button>
                  <p className="text-center text-[10px] font-semibold text-slate-400 mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3.5" /> VERIFIED ON SOLANA DEVNET
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
