'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    if (!data) setLoading(true);
    else setIsRefetching(true);

    fetch('/api/dashboard?date=' + date)
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setLoading(false);
        setIsRefetching(false);
      })
      .catch(() => {
        setLoading(false);
        setIsRefetching(false);
      });
  }, [date]);

  const handleDateChange = (offset: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split('T')[0]);
  };

  if (loading && !data) {
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
        
        <div className="flex items-center gap-4 bg-gray-900 rounded-2xl p-1 border border-gray-800">
          <button onClick={() => handleDateChange(-1)} className="p-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-semibold w-24 text-center text-sm md:text-base">
            {date === new Date().toISOString().split('T')[0] ? 'Today' : date}
          </span>
          <button onClick={() => handleDateChange(1)} className="p-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </header>

      <div className={`transition-opacity duration-300 ${isRefetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 h-full">
          <ScoreCard 
            title="Nutrition Score"
            score={nutritionScore}
            barGradientClass="bg-gradient-to-r from-amber-400 to-emerald-400"
            bubbleClass="bg-emerald-500/10 group-hover:bg-emerald-500/20"
            hoverBorderClass="hover:border-emerald-500/50"
            explanation={
              <>
                <p>
                  Your <strong>Nutrition Score</strong> measures how well you are meeting your daily caloric and macronutrient targets.
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong>50%</strong> Calorie Adherence</li>
                  <li><strong>50%</strong> Macro Balance</li>
                </ul>
                <p className="mt-2">
                  A score of 75+ is excellent. If your score is lower, try to adjust your meals to better hit your macro and calorie goals.
                </p>
              </>
            }
          />
        </div>
        <div className="lg:col-span-2 h-full">
          <GroupedDietQualityCard score={dietQualityScore} />
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
    </div>
  );
}

function GroupedDietQualityCard({ score }: { score: number }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    fetch('/api/scores/history?days=14')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          const formatted = res.data.map((d: any) => {
            const dateObj = new Date(d.date);
            return {
              ...d,
              displayDate: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
            };
          });
          setHistory(formatted);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 md:pb-6 pb-12 border border-gray-800 shadow-xl relative overflow-hidden group hover:border-teal-500/50 transition-all duration-500 flex flex-col md:flex-row gap-6 h-full">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-teal-500/10 blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
        
        {/* Desktop Help Button */}
        <button 
          onClick={() => setShowInfo(true)}
          className="hidden md:flex absolute top-4 right-4 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 items-center justify-center text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-all z-10"
          title="Learn more"
        >
          ?
        </button>

        {/* Left Side: Score */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-800/50 pb-6 md:pb-0 md:pr-6 flex flex-col justify-center relative">
          <h2 className="text-gray-400 font-medium mb-2">Diet Quality (7-Day)</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">{score}</span>
            <span className="text-gray-500 font-medium">/ 100</span>
          </div>
          <div className="mt-4 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-teal-400" style={{ width: `${score}%` }}></div>
          </div>
        </div>

        {/* Right Side: Sparkline */}
        <div className="flex-1 h-32 md:h-auto min-h-[120px] flex flex-col justify-center">
          <h3 className="text-xs text-gray-500 uppercase font-semibold mb-2 tracking-wider">Trend</h3>
          {!loading && history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px', padding: '4px 8px' }}
                  itemStyle={{ color: '#34d399' }}
                  labelStyle={{ display: 'none' }}
                  cursor={{ stroke: '#374151', strokeWidth: 1 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="diet_quality_score" 
                  name="Score"
                  stroke="#14b8a6" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4, fill: '#34d399', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-600 text-sm">
              {loading ? 'Loading...' : 'No data yet'}
            </div>
          )}
        </div>

        {/* Mobile Learn More Bar */}
        <button 
          onClick={() => setShowInfo(true)}
          className="md:hidden absolute bottom-0 left-0 right-0 bg-gray-800/40 border-t border-gray-800/50 py-2 text-xs text-gray-400 font-medium hover:bg-gray-800/60 transition-colors flex items-center justify-center gap-1 z-10"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Learn More
        </button>
      </div>

      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowInfo(false)}>
          <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-3">Diet Quality (7-Day)</h3>
            <div className="text-gray-400 text-sm leading-relaxed space-y-3">
              <p>Your <strong>Diet Quality Score</strong> evaluates the overall healthfulness and diversity of your diet, beyond just calories and macros. It is calculated over a rolling 7-day window.</p>
              <p className="mt-2">It factors in:</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>Fiber & Micronutrient intake</li>
                <li>Food variety (eating different kinds of whole foods)</li>
                <li>The ratio of whole foods vs. processed foods</li>
              </ul>
              <p className="mt-2">Focus on eating a variety of minimally processed, nutrient-dense foods to improve this score.</p>
            </div>
            <button onClick={() => setShowInfo(false)} className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold py-3 rounded-xl transition-colors">Got it</button>
          </div>
        </div>
      )}
    </>
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

function ScoreCard({ 
  title, 
  score, 
  barGradientClass, 
  bubbleClass,
  hoverBorderClass,
  explanation 
}: { 
  title: string, 
  score: number, 
  barGradientClass: string,
  bubbleClass: string,
  hoverBorderClass: string,
  explanation: React.ReactNode 
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className={`bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 md:pb-6 pb-12 border border-gray-800 shadow-xl relative overflow-hidden group ${hoverBorderClass} transition-all duration-500 flex flex-col h-full`}>
        <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full blur-2xl transition-all ${bubbleClass}`}></div>
        
        {/* Desktop Help Button */}
        <button 
          onClick={() => setShowInfo(true)}
          className="hidden md:flex absolute top-4 right-4 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 items-center justify-center text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-all z-10"
          aria-label="Learn more about this score"
          title="Learn more"
        >
          ?
        </button>

        <h2 className="text-gray-400 font-medium mb-2">{title}</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-white">{score}</span>
          <span className="text-gray-500 font-medium">/ 100</span>
        </div>
        <div className="mt-4 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full ${barGradientClass}`} style={{ width: `${score}%` }}></div>
        </div>

        {/* Mobile Learn More Bar */}
        <button 
          onClick={() => setShowInfo(true)}
          className="md:hidden absolute bottom-0 left-0 right-0 bg-gray-800/40 border-t border-gray-800/50 py-2 text-xs text-gray-400 font-medium hover:bg-gray-800/60 transition-colors flex items-center justify-center gap-1 z-10"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Learn More
        </button>
      </div>

      {/* Overlay */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowInfo(false)}>
          <div 
            className="bg-gray-950 border border-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <div className="text-gray-400 text-sm leading-relaxed space-y-3">
              {explanation}
            </div>
            <button 
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold py-3 rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
