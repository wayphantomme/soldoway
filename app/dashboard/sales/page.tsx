"use client";

import { motion } from "framer-motion";
import { Zap, ArrowUpRight, ShieldCheck } from "lucide-react";

const mockTransactions = [
  { id: 1, type: "Gasless", details: "Business A paid Sales B $50 USDC", time: "Just now" },
  { id: 2, type: "Yield", details: "$2.50 earned from Jupiter integration", time: "2m ago" },
  { id: 3, type: "Deposit", details: "Business C deposited $1,000 USDC", time: "15m ago" },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function SalesPage() {
  return (
    <div className="space-y-12 pb-20">
      <section>
        <FadeIn>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Sales Activities</h1>
            <button className="text-sm font-semibold px-5 py-2.5 bg-black text-white rounded-full hover:bg-[#1a1a1a] transition-all shadow-md">
              Log Deposit / Task
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {mockTransactions.map((tx) => (
                <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] flex items-center justify-center border border-slate-200 shrink-0">
                      {tx.type === "Gasless" ? <Zap className="w-4 h-4 stroke-black" /> : tx.type === "Yield" ? <ArrowUpRight className="w-4 h-4 stroke-black" /> : <ShieldCheck className="w-4 h-4 stroke-black" />}
                    </div>
                    <div>
                      <p className="font-mono text-sm tracking-tight font-semibold text-black">
                        {tx.details}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{tx.type} • {tx.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
