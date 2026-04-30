'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import page to prevent premature context usage
const DashboardPageContent = dynamic(() => import('./page'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Loading dashboard...</p>
      </div>
    </div>
  ),
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <DashboardPageContent />
    </Suspense>
  );
}
