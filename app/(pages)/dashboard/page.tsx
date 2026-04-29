"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Plus, Search, Filter, MoreVertical, Loader2, Building2 } from "lucide-react";
import CreateTaskModal from "./CreateTaskModal";
import { useSoldoway } from "./use-soldoway";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "sonner";

// Sleek Monochrome Solana Logo
const SolanaLogo = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 397 311" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zm.2-226.7c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.8 11.2zm267.5 113.3c-2.4-2.4-5.7-3.8-9.2-3.8H6.7c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
  </svg>
);

function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tasks, loading, createTask } = useSoldoway();

  // Aggregate stats from live data
  const stats = useMemo(() => {
    const totalVaultBalance = tasks.reduce((sum, task) => sum + (task.totalBudget.toNumber() / LAMPORTS_PER_SOL), 0);
    const totalMeetings = tasks.reduce((sum, task) => sum + task.meetingsLogged.toNumber(), 0);
    const activeCampaigns = tasks.length;

    return [
      {
        title: "Vault Balance",
        value: totalVaultBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        unit: "SOL",
        subText: "Locked in smart contracts",
      },
      {
        title: "Active Campaigns",
        value: activeCampaigns,
        unit: "Missions",
        subText: "Global partner reach",
      },
      {
        title: "Meetings Logged",
        value: totalMeetings,
        unit: "Results",
        subText: "Proof-of-work on-chain",
      },
    ];
  }, [tasks]);

  const handleCreateTask = async (data: any) => {
    try {
      toast.info("Awaiting wallet signature...");
      await createTask(
        data.title, 
        data.companyName,
        data.category,
        data.description,
        data.payout * LAMPORTS_PER_SOL, 
        data.budget * LAMPORTS_PER_SOL
      );
      toast.success("Campaign deployed successfully");
    } catch (err) {
      toast.error("Deployment canceled");
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 space-y-16">
      
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
        <FadeIn>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your on-chain sales force and treasury.</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-black/5"
          >
            <Plus className="w-5 h-5" />
            Deploy Campaign
          </button>
        </FadeIn>
      </section>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <FadeIn key={stat.title} delay={0.1 + (i * 0.05)}>
            <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-all group">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{stat.title}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900 tracking-tighter">{stat.value}</span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  {stat.title === "Vault Balance" && <SolanaLogo className="w-3.5 h-3.5 text-slate-300" />}
                  {stat.unit}
                </span>
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-400">{stat.subText}</p>
            </div>
          </FadeIn>
        ))}
      </section>

      {/* Campaign List */}
      <section className="space-y-6">
        <FadeIn delay={0.3}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Active Campaign Inventory</h2>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter..." 
                  className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-black/[0.02] focus:bg-white transition-all w-48" 
                />
              </div>
              <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-400">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mission Name</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payout</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vault Remaining</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(loading && tasks.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Syncing with Solana...</p>
                      </div>
                    </td>
                  </tr>
                )}
                
                {!loading && tasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-medium">
                      No active campaigns found. Start by deploying your first mission.
                    </td>
                  </tr>
                )}

                {tasks.map((task, i) => {
                  const progress = task.totalBudget.toNumber() > 0 ? (task.payoutsDistributed.toNumber() / task.totalBudget.toNumber()) * 100 : 0;
                  const remaining = (task.totalBudget.toNumber() - task.payoutsDistributed.toNumber()) / LAMPORTS_PER_SOL;
                  const payout = task.payoutPerMeeting.toNumber() / LAMPORTS_PER_SOL;

                  return (
                    <tr key={task.publicKey.toString()} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs">
                            {task.title.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 border-b border-transparent group-hover:border-slate-200 transition-all cursor-pointer">{task.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                              <Building2 className="w-3 h-3" />
                              {task.companyName || "Personal"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <span className="bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-green-100">
                            Live Pool
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 min-w-[180px]">
                        <div className="space-y-2">
                           <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              <span>{task.meetingsLogged.toNumber()} Logs</span>
                              <span>{progress.toFixed(0)}%</span>
                           </div>
                           <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${progress}%` }}
                               className="bg-black h-full rounded-full transition-all duration-1000" 
                             />
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-1.5">
                            <SolanaLogo className="w-3 h-3 text-slate-400" />
                            <span className="font-bold font-mono text-slate-900">{payout.toFixed(3)}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-1.5">
                            <span className="font-bold font-mono text-slate-900">{remaining.toFixed(2)}</span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">SOL</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-500">
                           <MoreVertical className="w-5 h-5" />
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </section>

      {/* Modals */}
      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
