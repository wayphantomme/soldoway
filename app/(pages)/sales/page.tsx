"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { DollarSign, Clock, Users, X, Link as LinkIcon, Mail, Filter, Loader2, Building2, ExternalLink, Send, ShieldCheck, CheckCircle2, ChevronDown } from "lucide-react";
import { useSoldoway } from "../dashboard/use-soldoway";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { toast } from "sonner";

// Elegant Monochrome Solana Logo
const SolanaLogo = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 397 311" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zm.2-226.7c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.8 11.2zm267.5 113.3c-2.4-2.4-5.7-3.8-9.2-3.8H6.7c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
  </svg>
);

const categories = ["All", "AI", "DeFi", "SaaS", "Web3"];

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

import dynamic from "next/dynamic";

const SalesPage = () => {
  const { tasks, loading, updateTaskProgress } = useSoldoway();
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Highest Payout");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [issubmitting, setIssubmitting] = useState(false);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch(`/api/campaigns`);
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
  }, []);

  const filteredTasks = dbCampaigns.map(dbCamp => {
    const onchainTask = tasks.find(t => t.title === dbCamp.title && t.creator.toString() === dbCamp.ownerWallet);
    return {
      ...dbCamp,
      publicKey: onchainTask ? onchainTask.publicKey.toString() : dbCamp.campaignPda,
      payoutsDistributed: onchainTask ? (onchainTask.payoutsDistributed.toNumber() / LAMPORTS_PER_SOL) : 0,
      bountyTotal: dbCamp.totalDeposit,
      payoutPerMeeting: dbCamp.payout || 0,
    };
  }).filter(t => {
    if (selectedCategory === "All") return true;
    return t.category === selectedCategory || (!t.category && selectedCategory === "General");
  }).sort((a, b) => {
    if (sortBy === "Highest Payout") return b.payoutPerMeeting - a.payoutPerMeeting;
    return 0;
  });

  const handleLogSubmission = async () => {
    if (!selectedTask) return;
    if (!selectedTask.publicKey.startsWith("PENDING")) {
      setIssubmitting(true);
      try {
        toast.info("Transmitting meeting log...");
        await updateTaskProgress(new PublicKey(selectedTask.publicKey));
        toast.success("Reward unlocked. Check your balance.");
        setSelectedTask(null);
      } catch (err) {
        toast.error("Network error. Try again.");
        console.error(err);
      } finally {
        setIssubmitting(false);
      }
    } else {
      toast.error("This campaign is still syncing with the blockchain.");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 space-y-16">

      {/* Header & Stats Summary */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
          <FadeIn>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Partner Workspace</h1>
            <p className="text-slate-500 font-medium mt-2">Discover and execute high-conversion sales missions.</p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FadeIn delay={0.05}>
            <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-all group">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Balance Ready</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900 tracking-tighter">$0.00</span>
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-md">Available</span>
              </div>
              <p className="mt-4 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Instant withdrawal enabled
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
             <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-all group">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Meetings Logged</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900 tracking-tighter">0</span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Logs</span>
              </div>
              <p className="mt-4 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Synchronized with on-chain data
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm hover:shadow-md transition-all group">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Network Kickback</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900 tracking-tighter">0%</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">Bonus</span>
              </div>
              <p className="mt-4 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Performance-based multipliers
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Filter & Marketplace */}
      <section className="space-y-8">
        <FadeIn delay={0.2}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 text-center md:text-left">Available Marketplace</h2>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
              <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${selectedCategory === cat
                        ? 'bg-white text-black shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Sort: {sortBy}
                  <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />
                </button>
                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-3 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-2 overflow-hidden"
                    >
                      <button
                        onClick={() => { setSortBy("Highest Payout"); setIsSortOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors text-slate-600 hover:text-black"
                      >
                        Highest Payout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Task Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading && (
            <div className="col-span-full py-24 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-slate-200 mx-auto" />
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-6">Refreshing Marketplace...</p>
            </div>
          )}

          {!loading && filteredTasks.length === 0 && (
            <div className="col-span-full text-center py-24 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-sm tracking-tight opacity-60">No available missions in this sector.</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task, i) => {
              const bountyTotal = task.bountyTotal || 0;
              const bountyDistributed = task.payoutsDistributed || 0;
              const bountyAvailable = bountyTotal - bountyDistributed;
              const payout = task.payoutPerMeeting || 0;

              return (
                <motion.div
                  key={task.publicKey.toString()}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between group h-full"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm group-hover:bg-black group-hover:text-white transition-all">
                          {task.title.charAt(0)}
                       </div>
                       <div className="bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-slate-100 group-hover:bg-slate-900 group-hover:text-white group-hover:border-transparent transition-all">
                          {task.category || "General"}
                       </div>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <h3 className="text-xl font-bold tracking-tight text-slate-900">{task.title}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                         <Building2 className="w-3.5 h-3.5" />
                         {task.companyName || "Verified DAO"}
                      </p>
                    </div>

                    <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8 line-clamp-2">
                      {task.description || "The creator has not yet provided a detailed mission brief."}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-8 pt-6 border-t border-slate-50">
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Payout / Log</p>
                          <div className="flex items-center gap-2">
                             <SolanaLogo className="w-4 h-4 text-slate-300" />
                             <span className="text-lg font-black text-slate-900 font-mono">{payout.toFixed(3)}</span>
                             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">SOL</span>
                          </div>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Available Supply</p>
                          <div className="flex items-center gap-2">
                             <span className="text-lg font-black text-slate-900 font-mono">{bountyAvailable.toFixed(2)}</span>
                             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">/ {bountyTotal.toFixed(0)}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button 
                      onClick={() => setSelectedTask(task)}
                      className="flex-1 bg-black text-white px-6 py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-black/5"
                    >
                      <Send className="w-4 h-4" />
                      Submit Meeting Proof
                    </button>
                    <button className="p-4 border border-slate-200 rounded-2xl text-slate-300 hover:text-slate-900 hover:border-slate-400 transition-all group-hover:shadow-sm">
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* Submission Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm shadow-inner"
              onClick={() => setSelectedTask(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-6 md:p-10">
                <div className="flex justify-between items-start mb-8 md:mb-10">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Proof of Work</h3>
                    <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Campaign: {selectedTask.title}</p>
                  </div>
                  <button onClick={() => setSelectedTask(null)} className="p-2 md:p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-6 md:space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Calendar / Meeting URL</label>
                    <div className="relative">
                       <input type="url" placeholder="https://cal.com/..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-10 md:px-12 py-3 md:py-4 focus:outline-none focus:border-slate-300 transition-all font-semibold placeholder:text-slate-300 text-base md:text-sm" />
                       <LinkIcon className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-slate-200" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Prospect Email</label>
                    <div className="relative">
                       <input type="email" placeholder="founder@company.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-10 md:px-12 py-3 md:py-4 focus:outline-none focus:border-slate-300 transition-all font-semibold placeholder:text-slate-300 text-base md:text-sm" />
                       <Mail className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-slate-200" />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      disabled={issubmitting}
                      onClick={handleLogSubmission}
                      className="w-full bg-black text-white px-8 py-5 rounded-3xl font-black text-sm shadow-xl shadow-black/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                    >
                      {issubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                      Finalize & Claim Reward
                    </button>
                    <p className="text-center text-[10px] font-bold text-slate-300 mt-6 uppercase tracking-widest flex items-center justify-center gap-2">
                       <SolanaLogo className="w-3.5 h-3.5 opacity-50" /> Secured by Solana Engine x402
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default dynamic(() => Promise.resolve(SalesPage), { ssr: false });
