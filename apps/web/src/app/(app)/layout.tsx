import React from 'react';
import Link from 'next/link';
import DevBypassBanner from '@/components/DevBypassBanner';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-bg text-on-surface font-body-md overflow-x-hidden flex flex-col">
      <DevBypassBanner />
      {/* Top Navigation Bar */}
      <nav className="bg-cream-bg shadow-sm sticky top-0 z-50 h-16 flex items-center shrink-0">
        <div className="flex justify-between items-center w-full px-container-padding max-w-[1200px] mx-auto">
          <div className="font-headline-md font-bold text-primary">SavorAI</div>
          
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
              settings
            </button>
            <div className="w-8 h-8 rounded-full bg-mint-surface overflow-hidden border border-outline-variant flex items-center justify-center text-primary font-bold">
              U
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-[1200px] mx-auto px-gutter py-gutter lg:flex flex-1 w-full relative">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col h-[calc(100vh-80px)] py-gutter sticky top-20 w-64 bg-mint-surface rounded-r-xl shadow-md shrink-0 z-10 border-r border-outline-variant/30">
          <div className="px-6 mb-8">
            <h2 className="font-headline-md text-primary">Welcome back</h2>
            <p className="text-on-surface-variant text-caption mt-1">Healthy habits start here</p>
          </div>
          
          <nav className="flex-1 px-2 space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 bg-primary-container text-on-primary-container rounded-full px-4 py-2 font-bold transition-transform active:scale-95">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-label-md">Dashboard</span>
            </Link>
            <Link href="/diary" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-surface-variant rounded-full transition-all">
              <span className="material-symbols-outlined">menu_book</span>
              <span className="font-label-md">Diary</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-surface-variant rounded-full transition-all">
              <span className="material-symbols-outlined">restaurant</span>
              <span className="font-label-md">Recipes</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-surface-variant rounded-full transition-all">
              <span className="material-symbols-outlined">smart_toy</span>
              <span className="font-label-md">AI Coach</span>
            </Link>
          </nav>
          
          <div className="px-4 mt-auto space-y-4">
            <Link href="/diary" className="w-full text-center block text-on-secondary-container py-3 rounded-full font-bold transition-all bg-secondary-container shadow-md hover:bg-salmon-accent active:scale-95">
              Log Meal
            </Link>
            <div className="pt-4 border-t border-outline-variant/30 space-y-2">
              <Link href="#" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 font-label-md">
                <span className="material-symbols-outlined">settings</span> Settings
              </Link>
              <Link href="#" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 font-label-md">
                <span className="material-symbols-outlined">help</span> Support
              </Link>
            </div>
          </div>
        </aside>

        {/* Notebook Rings */}
        <div className="hidden lg:flex flex-col justify-evenly relative z-20 w-0 pointer-events-none mt-16 mb-16">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="w-10 h-3 -ml-5 bg-gradient-to-b from-gray-300 via-white to-gray-400 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.3)] border border-gray-400 flex items-center justify-between px-1">
                 <div className="w-1.5 h-2 bg-gray-800 rounded-full shadow-inner opacity-60"></div>
                 <div className="w-1.5 h-2 bg-gray-900 rounded-full shadow-inner opacity-60"></div>
              </div>
            ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 lg:max-w-4xl pb-32 lg:pb-0 bg-[#FDF6E3] lg:rounded-tl-xl shadow-[-4px_0_12px_rgba(0,0,0,0.05)] border-l border-[#eaddc5] overflow-hidden">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface shadow-[0_-4px_20px_rgba(0,0,0,0.15)] lg:hidden h-20 px-4 pb-safe flex justify-around items-center rounded-t-3xl">
        <Link href="/dashboard" className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-2xl p-2 transition-transform active:scale-90 duration-150">
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-md">Home</span>
        </Link>
        <Link href="/diary" className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant/50 transition-colors">
          <span className="material-symbols-outlined">history_edu</span>
          <span className="font-label-md">Diary</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant/50 transition-colors">
          <span className="material-symbols-outlined">psychology</span>
          <span className="font-label-md">Coach</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant/50 transition-colors">
          <span className="material-symbols-outlined">add_box</span>
          <span className="font-label-md">Add</span>
        </Link>
      </nav>
    </div>
  );
}
