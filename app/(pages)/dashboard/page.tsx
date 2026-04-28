"use client";

import { motion } from "framer-motion";
import { Plus, Zap, Users, Briefcase, Activity, CalendarCheck, TrendingUp, CheckCircle2, Target } from "lucide-react";
import Link from "next/link";

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

const stats = [
  { label: "Total Vault Balance", value: "$9,500.00", icon: Briefcase, isCurrency: true },
  { label: "Yield Earned", value: "+$210.80", icon: TrendingUp, isGreen: true, isCurrency: true },
  { label: "Active Staff / Partners", value: "24", icon: Users },
  { label: "Meetings Scheduled", value: "32", icon: CalendarCheck },
];

const tasks = [
  {
    id: 1,
    title: "AI Infrastructure: Exchange Outreach (CEX/DEX)",
    status: "Active",
    description: "Pitching AI-driven liquidity API to Business Development leads at Tier-1 exchanges. Target: Listing & Technical Integration.",
    target: "BD Managers / CTOs",
    deposit: "$2,500.00",
    yield: "+$52.10",
    logs: 8,
    payouts: "$80.00",
    progress: 60,
  },
  {
    id: 2,
    title: "Liquidity Provision: LP Institutional Outreach",
    status: "Active",
    description: "Connecting with Liquidity Providers to integrate automated yield-bearing vaults. Focus on Capital Efficiency logs.",
    target: "Fund Managers / Treasury Leads",
    deposit: "$5,000.00",
    yield: "+$115.40",
    logs: 15,
    payouts: "$150.00",
    progress: 85,
  },
  {
    id: 3,
    title: "DeFi Protocol Partnership Drive",
    status: "Active",
    description: "Securing meetings with DeFi core contributors for cross-chain API implementation and yield farm collaboration.",
    target: "Ecosystem Leads / Governance Members",
    deposit: "$1,200.00",
    yield: "+$24.80",
    logs: 3,
    payouts: "$30.00",
    progress: 20,
  },
  {
    id: 4,
    title: "AI Agent x NFT Project Synergy",
    status: "Active",
    description: "Partnering with NFT collections to implement autonomous AI agents for community engagement and floor price analysis.",
    target: "Project Founders / Product Leads",
    deposit: "$800.00",
    yield: "+$18.50",
    logs: 6,
    payouts: "$60.00",
    progress: 45,
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-12 pb-20">
      {/* 1. Stats Grid */}
      <section>
        <FadeIn>
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
            <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200">
              Live Data
            </span>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between group">
                <div className="flex items-center justify-between mb-8">
                  <div className={`p-3 rounded-2xl transition-colors ${stat.isGreen ? 'bg-green-50 text-green-600 group-hover:bg-green-100' : 'bg-slate-50 text-slate-600 group-hover:bg-slate-100'}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 mb-1.5">{stat.label}</h3>
                  <p className={`text-3xl font-bold tracking-tight ${stat.isGreen ? 'text-green-600' : 'text-slate-900'} ${stat.isCurrency ? 'font-mono' : ''}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 2 & 3. Task Management List */}
      <section>
        <FadeIn delay={0.4}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 mt-4">
            <h2 className="text-xl font-bold tracking-tight">Active Tasks</h2>
            <button className="group relative inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold shadow-sm hover:bg-gray-800 transition-all hover:shadow-md active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
              {/* UI Detail Tip: Gasless feedback badge as per user request */}
              <div className="absolute -top-3 -right-3 bg-indigo-500 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border-2 border-white shadow-sm flex items-center gap-1">
                <Zap className="w-3 h-3 fill-white" /> Gasless
              </div>
            </button>
          </div>
        </FadeIn>

        <div className="space-y-6">
          {tasks.map((task, i) => (
            <FadeIn key={task.id} delay={0.5 + (i * 0.1)}>
              <div className="bg-white border border-slate-200 rounded-[24px] p-6 sm:p-8 shadow-sm hover:border-slate-300 transition-all hover:shadow-md group">
                <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-12">
                  
                  {/* Left section: Headers & Desc */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Activity className="w-3.5 h-3.5" />
                        {task.status}
                      </div>
                      <h3 className="text-xl font-bold tracking-tight text-slate-900">{task.title}</h3>
                    </div>
                    <p className="text-slate-500 leading-relaxed max-w-xl text-sm md:text-base">
                      {task.description}
                    </p>
                    
                    {/* Add target here for more visual context */}
                    <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium mt-2">
                       <Target className="w-4 h-4 text-slate-400" />
                       Target: {task.target}
                    </div>
                  </div>
                  
                  {/* Right section: Financial & Performance Matrix */}
                  <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-6 lg:border-l border-slate-100 lg:pl-10">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deposit</p>
                      <p className="font-mono text-xl font-bold text-slate-900">{task.deposit}</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accrued Yield</p>
                        <Zap className="w-3 h-3 text-green-500 fill-green-500" />
                      </div>
                      <p className="font-mono text-xl font-bold text-green-600">{task.yield}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Meetings Logged</p>
                      <p className="text-xl font-bold text-slate-900">{task.logs}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payouts</p>
                      <p className="font-mono text-xl font-bold text-slate-900">{task.payouts}</p>
                    </div>
                  </div>
                </div>

                {/* Footer section: Progress Bar */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Meeting Target Progress</span>
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden ring-1 ring-slate-900/5">
                    <div 
                      className="bg-black h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                      style={{ width: `${task.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        
        {/* Footnote indicating tech standard */}
        <FadeIn delay={0.8}>
          <div className="mt-10 flex justify-center items-center text-xs text-slate-400 gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            All active tasks execute on-chain. <strong className="text-slate-600">Gasless Powered by x402</strong>.
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
