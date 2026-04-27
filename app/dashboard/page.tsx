"use client";

import { motion } from "framer-motion";

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

export default function DashboardPage() {
  return (
    <div className="space-y-12 pb-20">
      
      {/* Overview Stats */}
      <section>
        <FadeIn>
          <h1 className="text-2xl font-bold tracking-tight mb-6">Overview</h1>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FadeIn delay={0.05}>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 mb-1">Total Vault Balance</h3>
              <p className="text-3xl font-bold font-mono tracking-tight">$12,450.00</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 mb-1">Yield Earned</h3>
              <p className="text-3xl font-bold font-mono tracking-tight text-green-600">+$342.50</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 mb-1">Active Staff</h3>
              <p className="text-3xl font-bold font-mono tracking-tight">14</p>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
