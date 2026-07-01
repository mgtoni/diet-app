import React from 'react';
import Link from 'next/link';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-bg text-on-surface font-body-md overflow-x-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-cream-bg shadow-sm sticky top-0 z-50 h-16 flex items-center shrink-0">
        <div className="flex justify-between items-center w-full px-container-padding max-w-[1200px] mx-auto">
          <div className="font-headline-md font-bold text-primary">SavorAI</div>
          
          <div className="hidden md:flex gap-8 items-center">
            <Link href="/dashboard" className="text-primary border-b-2 border-primary pb-1 font-label-md hover:text-primary transition-colors active:scale-95 duration-200">
              Dashboard
            </Link>
            <Link href="#" className="text-on-surface-variant font-label-md hover:text-primary transition-colors active:scale-95 duration-200">
              Diary
            </Link>
            <Link href="#" className="text-on-surface-variant font-label-md hover:text-primary transition-colors active:scale-95 duration-200">
              Recipes
            </Link>
            <Link href="#" className="text-on-surface-variant font-label-md hover:text-primary transition-colors active:scale-95 duration-200">
              AI Coach
            </Link>
          </div>
          
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

      <div className="max-w-[1200px] mx-auto px-gutter py-gutter lg:flex lg:gap-gutter flex-1 w-full">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col h-[calc(100vh-80px)] py-gutter sticky top-20 w-64 bg-mint-surface rounded-r-xl shadow-md shrink-0">
          <div className="px-6 mb-8">
            <h2 className="font-headline-md text-primary">Welcome back</h2>
            <p className="text-on-surface-variant text-caption mt-1">Healthy habits start here</p>
          </div>
          
          <nav className="flex-1 px-2 space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 bg-primary-container text-on-primary-container rounded-full px-4 py-2 font-bold transition-transform active:scale-95">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-label-md">Dashboard</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-surface-variant rounded-full transition-all">
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
            <button className="w-full text-on-secondary-container py-3 rounded-full font-bold transition-all bg-secondary-container shadow-md hover:bg-salmon-accent active:scale-95">
              Log Meal
            </button>
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

        {/* Main Content Area */}
        <main className="flex-1 lg:max-w-4xl pb-32 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface shadow-[0_-4px_20px_rgba(0,0,0,0.15)] lg:hidden h-20 px-4 pb-safe flex justify-around items-center rounded-t-3xl">
        <Link href="/dashboard" className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-2xl p-2 transition-transform active:scale-90 duration-150">
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-md">Home</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant/50 transition-colors">
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
