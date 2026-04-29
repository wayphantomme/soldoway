"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link as LinkIcon, Loader2, ChevronDown, AlignLeft, Building2, Target } from "lucide-react";

// Elegant Monochrome Solana Logo
const SolanaLogo = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 397 311" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zm.2-226.7c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.8 11.2zm267.5 113.3c-2.4-2.4-5.7-3.8-9.2-3.8H6.7c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
  </svg>
);

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    companyName: string;
    category: string;
    description: string;
    payout: number;
    budget: number;
    link: string;
  }) => Promise<void>;
}

export default function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    category: "AI",
    description: "",
    payout: 0.1,
    budget: 1.0,
    link: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const estimatedMeetings = formData.payout > 0 ? Math.floor(formData.budget / formData.payout) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100"
          >
            <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-10 pb-8 flex items-center justify-between border-b border-slate-100 bg-white">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">New Mission</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Deploying to Solana Devnet</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-300 hover:text-slate-600 border border-slate-100 shadow-sm active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-10 space-y-8 overflow-y-auto">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Campaign Title</label>
                      <input
                        required
                        type="text"
                        placeholder="Growth Sprint..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-black/[0.02] focus:border-slate-400 transition-all text-slate-900 font-bold placeholder:text-slate-300"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                      <div className="relative">
                        <input
                          required
                          type="text"
                          placeholder="Organization..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-black/[0.02] focus:border-slate-400 transition-all text-slate-900 font-bold placeholder:text-slate-300"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        />
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-200" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mission Strategy</label>
                    <div className="relative">
                      <textarea
                        required
                        placeholder="Instructions for your partners..."
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-black/[0.02] focus:border-slate-400 transition-all text-slate-700 font-medium placeholder:text-slate-300 resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                      <AlignLeft className="absolute left-4 top-4 w-4.5 h-4.5 text-slate-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Payout / Meeting</label>
                      <div className="relative">
                        <input
                          required
                          type="number"
                          step="0.001"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-black/[0.02] transition-all text-slate-900 font-mono font-bold"
                          value={formData.payout}
                          onChange={(e) => setFormData({ ...formData, payout: parseFloat(e.target.value) })}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                           <SolanaLogo className="w-4 h-4 text-slate-200" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Total Vault Deposit</label>
                      <div className="relative">
                        <input
                          required
                          type="number"
                          step="0.1"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-black/[0.02] transition-all text-slate-900 font-mono font-bold"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                           <SolanaLogo className="w-4 h-4 text-slate-200" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meeting Capacity</span>
                     <span className="text-sm font-bold text-slate-900">{estimatedMeetings} <span className="text-slate-400">Total</span></span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-10 border-t border-slate-100 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-4 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-800 transition-all hover:bg-slate-50 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="bg-black text-white px-10 py-4 rounded-xl text-sm font-bold shadow-lg shadow-black/5 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 min-w-[200px] flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <SolanaLogo className="w-4 h-4" />
                      Commit to Chain
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
