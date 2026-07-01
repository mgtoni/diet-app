'use client';

import React from 'react';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Nutrition Score Card (6 cols) */}
        <section className="md:col-span-7 bg-white rounded-[24px] p-8 smeg-shadow border border-mint-surface relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="font-headline-md text-ink-text mb-6">Nutrition Score</h3>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <ProgressRing score={82} />
              
              <div className="flex-1 space-y-4">
                <p className="text-body-md text-on-surface-variant">
                  Your balance of micronutrients is excellent today. One more serving of leafy greens would reach perfection.
                </p>
                <div className="flex items-center gap-2 text-status-success font-bold">
                  <span className="material-symbols-outlined">trending_up</span>
                  <span className="text-label-md">+5 points since yesterday</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calories Card (5 cols) */}
        <section className="md:col-span-5 bg-white rounded-[24px] p-8 smeg-shadow border border-mint-surface flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-headline-md text-ink-text">Calories</h3>
              <span className="material-symbols-outlined text-primary-container p-2 bg-mint-surface rounded-full">
                bolt
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-display-lg text-primary">642</div>
              <div className="font-label-md text-on-surface-variant uppercase tracking-wider">
                Remaining
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-caption mb-2 text-on-surface-variant">
              <span>1,558 consumed</span>
              <span>Goal: 2,200</span>
            </div>
            <ProgressBar progress={71} colorClass="bg-secondary-container" />
          </div>
        </section>

        {/* Macros Bento */}
        <section className="md:col-span-4 bg-white rounded-[24px] p-6 smeg-shadow border border-mint-surface space-y-6">
          <h4 className="font-label-md text-ink-text uppercase">Macros Balance</h4>
          <div className="space-y-5">
            {/* Protein */}
            <div>
              <div className="flex justify-between font-label-md text-caption mb-1">
                <span className="text-ink-text">Protein</span>
                <span className="text-on-surface-variant">92g / 120g</span>
              </div>
              <ProgressBar progress={76} colorClass="bg-soft-teal" heightClass="h-4" />
            </div>
            {/* Carbs */}
            <div>
              <div className="flex justify-between font-label-md text-caption mb-1">
                <span className="text-ink-text">Carbs</span>
                <span className="text-on-surface-variant">184g / 250g</span>
              </div>
              <ProgressBar progress={73} colorClass="bg-status-warning" heightClass="h-4" />
            </div>
            {/* Fats */}
            <div>
              <div className="flex justify-between font-label-md text-caption mb-1">
                <span className="text-ink-text">Fats</span>
                <span className="text-on-surface-variant">42g / 70g</span>
              </div>
              <ProgressBar progress={60} colorClass="bg-salmon-accent" heightClass="h-4" />
            </div>
          </div>
        </section>

        {/* AI Insight Card */}
        <section className="md:col-span-8 bg-cream-bg rounded-[24px] p-8 border border-primary/10 relative overflow-hidden flex flex-col md:flex-row gap-6">
          <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[32px]">psychology</span>
          </div>
          <div className="relative z-10 flex-1">
            <div className="font-label-md text-primary mb-2">LATEST AI COACH INSIGHT</div>
            <h4 className="font-headline-md text-ink-text mb-3">Magnesium &amp; Sleep Quality</h4>
            <p className="text-body-md text-on-surface-variant leading-relaxed mb-4">
              I noticed your fiber intake was lower than usual yesterday. Try adding 2 tablespoons of chia seeds to your morning bowl—it'll help maintain your energy levels and support your 82-point nutrition score.
            </p>
            <button className="text-primary font-bold flex items-center gap-2 hover:translate-x-1 transition-transform cursor-pointer">
              Learn More <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
