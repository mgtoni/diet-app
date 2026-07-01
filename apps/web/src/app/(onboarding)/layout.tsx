import React from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col font-body-md bg-background text-on-surface">
      {/* Top Navigation / Progress */}
      <header className="fixed top-0 left-0 w-full z-50 px-container-padding h-20 flex items-center justify-between bg-surface">
        <div className="flex items-center gap-2">
          <span className="font-headline-lg text-primary tracking-tight font-bold">
            SavorAI
          </span>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1 w-64">
          <div className="flex justify-between w-full mb-1">
            <span className="text-label-md text-on-surface-variant">
              Onboarding Progress
            </span>
            <span className="text-label-md text-primary font-bold">Step 1 of 5</span>
          </div>
          <ProgressBar progress={20} />
        </div>
        <button className="text-on-surface-variant text-label-md hover:text-primary transition-colors">
          Exit
        </button>
      </header>

      {/* Mobile Progress Bar */}
      <div className="md:hidden fixed top-20 left-0 w-full px-container-padding py-2 z-40 bg-surface">
        <ProgressBar progress={20} />
      </div>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-32 px-container-padding max-w-[1200px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
