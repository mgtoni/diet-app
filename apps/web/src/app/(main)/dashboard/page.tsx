'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const { nutritionScore, dietQualityScore, calorieTarget, caloriesConsumed, macros } = data;
  const remaining = calorieTarget - caloriesConsumed;
  const progress = Math.min((caloriesConsumed / calorieTarget) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 pb-24 font-sans selection:bg-emerald-500/30">
      <header className="mb-8 pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
            AI Coach
          </h1>
          <p className="text-gray-400 text-sm mt-1">Your daily nutrition overview</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-gray-900 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          T
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border border-gray-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-500">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <h2 className="text-gray-400 font-medium mb-2">Nutrition Score</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">{nutritionScore}</span>
            <span className="text-gray-500 font-medium">/ 100</span>
          </div>
          <div className="mt-4 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400" style={{ width: `${nutritionScore}%` }}></div>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border border-gray-800 shadow-xl relative overflow-hidden group hover:border-teal-500/50 transition-all duration-500">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-teal-500/10 blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
          <h2 className="text-gray-400 font-medium mb-2">Diet Quality Score</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">{dietQualityScore}</span>
            <span className="text-gray-500 font-medium">/ 100</span>
          </div>
          <div className="mt-4 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-teal-400" style={{ width: `${dietQualityScore}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border border-gray-800 shadow-xl mb-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-gray-400 font-medium mb-1">Calories Remaining</h2>
            <div className="text-4xl font-bold text-white">{remaining} <span className="text-lg text-gray-500 font-normal">kcal</span></div>
          </div>
          <div className="text-right">
            <div className="text-emerald-400 font-medium">{caloriesConsumed} eaten</div>
            <div className="text-gray-500 text-sm">{calorieTarget} goal</div>
          </div>
        </div>
        <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <MacroCard name="Protein" color="bg-blue-500" data={macros.protein} />
          <MacroCard name="Fat" color="bg-orange-500" data={macros.fat} />
          <MacroCard name="Carbs" color="bg-purple-500" data={macros.carbs} />
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/diary" className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-900 font-bold py-4 rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-1 text-center">
          Open Food Diary
        </Link>
      </div>
    </div>
  );
}

function MacroCard({ name, color, data }: { name: string, color: string, data: any }) {
  const percent = Math.min((data.consumed / data.target) * 100, 100);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path className="text-gray-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className={`${color.replace('bg-', 'text-')} transition-all duration-1000 ease-out`} strokeWidth="3" strokeDasharray={`${percent}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-300">
          {data.consumed}g
        </div>
      </div>
      <span className="text-gray-400 text-sm">{name}</span>
    </div>
  );
}
