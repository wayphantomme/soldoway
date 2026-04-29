"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * Referral Capture Page
 * Path: soldoway.app/r/[address]
 * 
 * Captures the referrer wallet address from the URL and persists it
 * to localStorage for subsequent on-chain attribution.
 */
export default function ReferralCapturePage() {
  const router = useRouter();
  const params = useParams();
  
  // Extract address securely from params
  const referrer = typeof params?.address === 'string' ? params.address : null;

  useEffect(() => {
    if (referrer) {
      // 1. Identify and persist the referrer bridge
      try {
        localStorage.setItem("soldoway_referrer", referrer);
        
        toast.info("Growth link detected.", {
          description: `Attribution active for partner ${referrer.slice(0, 4)}...${referrer.slice(-4)}`,
        });
      } catch (e) {
        console.error("Storage error:", e);
      }

      // 2. Seamless transition to dashboard
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      // Handle missing params gracefully
      router.push("/");
    }
  }, [referrer, router]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-slate-50 rounded-full blur-3xl scale-150 animate-pulse"></div>
        <Loader2 className="w-10 h-10 animate-spin text-black relative z-10" />
      </div>
      <div className="text-center space-y-2 relative z-10">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Activating Referral Bridge</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">On-chain Attribution Secure</p>
      </div>
    </div>
  );
}
