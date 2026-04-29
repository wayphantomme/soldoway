"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * Referral Capture Page
 * Path: soldoway.app/r/[referrer_address]
 */
export default function ReferralCapturePage() {
  const router = useRouter();
  const params = useParams();
  const referrer = params.address as string;

  useEffect(() => {
    if (referrer) {
      // 1. Persist referrer in localStorage for attribution later
      localStorage.setItem("soldoway_referrer", referrer);
      
      // 2. Notify user with a premium feedback
      toast.info("Growth link detected. Attribution active.", {
        description: `Your missions will be attributed to partner ${referrer.slice(0, 4)}...${referrer.slice(-4)}`,
      });

      // 3. Redirect back to main dashboard or landing
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [referrer, router]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-slate-100 rounded-full blur-2xl scale-150 animate-pulse"></div>
        <Loader2 className="w-12 h-12 animate-spin text-black relative z-10" />
      </div>
      <div className="text-center space-y-2 relative z-10">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Activating Attribution...</h2>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em] animate-pulse">Secure Bridge x402 Initializing</p>
      </div>
    </div>
  );
}
