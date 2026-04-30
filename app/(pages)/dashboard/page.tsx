"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, Loader2, Building2, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import CreateTaskModal from "./CreateTaskModal";
import { useSoldoway } from "./use-soldoway";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";

// Sleek Monochrome Solana Logo
const SolanaLogo = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 397 311" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zm.2-226.7c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.8 11.2zm267.5 113.3c-2.4-2.4-5.7-3.8-9.2-3.8H6.7c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
  </svg>
);

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tasks, loading, createTask } = useSoldoway();
  const { user } = usePrivy();
  
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Fetch PostgreSQL Data
  useEffect(() => {
    async function fetchCampaigns() {
      if (!user?.wallet?.address) return;
      try {
        const res = await fetch(`/api/campaigns?ownerWallet=${user.wallet.address}`);
        const json = await res.json();
        if (json.success) {
          setDbCampaigns(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch DB campaigns", err);
      } finally {
        setIsLoadingDb(false);
      }
    }
    fetchCampaigns();
  }, [user?.wallet?.address]);

  // Derive dynamic yieldData from dbCampaigns
  const yieldData = useMemo(() => {
    if (!dbCampaigns || dbCampaigns.length === 0) return [];

    // Map to aggregate yields by date
    const dateMap = new Map<string, number>();

    dbCampaigns.forEach((camp) => {
      if (camp.yieldLogs && Array.isArray(camp.yieldLogs)) {
        camp.yieldLogs.forEach((log: any) => {
          const dateObj = new Date(log.loggedAt);
          // Format as short weekday name e.g. "Mon"
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const existing = dateMap.get(dayName) || 0;
          dateMap.set(dayName, existing + log.yieldAmount);
        });
      }
    });

    // Convert map to array for Recharts, ensuring chronological order is maintained
    // Assuming the logs are fetched in ascending order, the map insertion order might be close enough
    // For a robust implementation, sorting by actual dates would be better, but we use days for now.
    const result: {name: string, yield: number}[] = [];
    dateMap.forEach((val, key) => {
      result.push({ name: key, yield: val });
    });
    
    // If no data, return empty to avoid breaking chart
    return result;
  }, [dbCampaigns]);

  // Aggregate stats from live data (Solana + Postgres)
  const stats = useMemo(() => {
    const totalVaultBalance = tasks.reduce((sum, task) => sum + (task.totalBudget.toNumber() / LAMPORTS_PER_SOL), 0);
    const totalMeetings = tasks.reduce((sum, task) => sum + task.meetingsLogged.toNumber(), 0);
    const totalYield = dbCampaigns.reduce((sum, camp) => sum + (camp.currentYield || 0), 0);

    return [
      {
        title: "Vault Balance",
        value: totalVaultBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        unit: "SOL",
        subText: "Locked in smart contracts",
        isCrypto: true
      },
      {
        title: "Total Yield Earned",
        value: totalYield.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
        unit: "JitoSOL",
        subText: "Accruing across all vaults",
        isYield: true
      },
      {
        title: "Meetings Logged",
        value: totalMeetings,
        unit: "Results",
        subText: "Proof-of-work on-chain",
        isCrypto: false
      },
    ];
  }, [tasks, dbCampaigns]);

  const handleCreateTask = async (data: any) => {
    try {
      toast.info("Awaiting wallet signature...");
      // 1. Deploy On-chain
      await createTask(
        data.title, 
        data.companyName,
        data.category,
        data.description,
        data.payout * LAMPORTS_PER_SOL, 
        data.budget * LAMPORTS_PER_SOL
      );
      
      // 2. Save metadata to PostgreSQL
      if (user?.wallet?.address) {
        await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignPda: "PENDING_PDA_" + Date.now(), // Real PDA would be derived or returned
            ownerWallet: user.wallet.address,
            title: data.title,
            companyName: data.companyName,
            category: data.category,
            description: data.description,
            payout: parseFloat(data.payout),
            totalDeposit: parseFloat(data.budget),
          })
        });
      }

      toast.success("Campaign deployed successfully");
      setIsModalOpen(false);
      // Re-fetch campaigns
      if (user?.wallet?.address) {
         fetch(`/api/campaigns?ownerWallet=${user.wallet.address}`)
           .then(res => res.json())
           .then(json => { if (json.success) setDbCampaigns(json.data); });
      }
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">Manage your on-chain sales force and treasury.</p>
        </FadeIn>
        <FadeIn delay={0.1} className="w-full md:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto justify-center bg-black text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-black/5"
          >
            <Plus className="w-5 h-5" />
            Deploy Campaign
          </button>
        </FadeIn>
      </section>

      {/* Overview Cards & Yield Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 flex flex-col gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={stat.title} delay={0.1 + (i * 0.05)}>
              <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-all group h-full">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                  {stat.title}
                  {stat.isYield && <TrendingUp className="w-4 h-4 text-green-500" />}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold tracking-tighter ${stat.isYield ? 'text-green-600' : 'text-slate-900'}`}>{stat.value}</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    {stat.isCrypto && <SolanaLogo className="w-3.5 h-3.5 text-slate-300" />}
                    {stat.unit}
                  </span>
                </div>
                <p className="mt-4 text-xs font-semibold text-slate-400">{stat.subText}</p>
              </div>
            </FadeIn>
          ))}
        </section>

        {/* Yield Tracker Chart */}
        <section className="lg:col-span-2">
           <FadeIn delay={0.2}>
             <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm h-full flex flex-col">
               <div className="flex justify-between items-center mb-8">
                 <div>
                   <h2 className="text-xl font-bold tracking-tight text-slate-900">Yield Growth</h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Aggregated across active vaults</p>
                 </div>
                 <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-green-100 flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                   JitoSOL APY: ~7.4%
                 </div>
               </div>
               
               <div className="flex-1 w-full min-h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={yieldData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}} dx={-10} tickFormatter={(v) => `${v} SOL`} />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       itemStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                     />
                     <Area type="monotone" dataKey="yield" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </FadeIn>
        </section>
      </div>

      {/* Campaign List */}
      <section className="space-y-6">
        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">Active Campaign Inventory</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative group flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-black/[0.02] focus:bg-white transition-all sm:w-48" 
                />
              </div>
              <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 shrink-0">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm overflow-x-auto">
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
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Syncing with Solana & PostgreSQL...</p>
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

                {tasks
                  .filter(task => !user?.wallet?.address || task.creator.toString() === user.wallet.address)
                  .map((task, i) => {
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
