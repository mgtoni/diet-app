'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AIInsightCard } from '@/components/AIInsightCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [premiumToggle, setPremiumToggle] = useState<boolean | null>(null);

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

  const todayStr = new Date().toISOString().split('T')[0];

  const handleDateChange = (offset: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    const newDateStr = d.toISOString().split('T')[0];
    if (newDateStr > todayStr) return; // prevent going into future
    setDate(newDateStr);
  };

  const isToday = date === todayStr;

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const { nutritionScore, dietQualityScore, calorieTarget, caloriesConsumed, macros, isPremium, profileSummary, aiInsights } = data;
  const remaining = calorieTarget - caloriesConsumed;
  const progress = Math.min((caloriesConsumed / calorieTarget) * 100, 100);
  
  const displayPremium = premiumToggle !== null ? premiumToggle : isPremium;

  return (
    <div className="min-h-screen bg-transparent text-gray-900 p-6 pb-24 font-sans selection:bg-emerald-500/30">
      <header className="mb-8 pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
            AI Coach
          </h1>
          <p className="text-gray-600 text-sm mt-1">Your daily nutrition overview</p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
          <div className="flex items-center gap-2 bg-white/50 rounded-2xl p-1 border border-gray-200 shadow-sm text-sm">
             <span className="text-gray-600 font-medium pl-2">View as:</span>
             <button onClick={() => setPremiumToggle(false)} className={`px-3 py-1 rounded-full transition-colors ${displayPremium === false ? 'bg-gray-800 text-white shadow-sm' : 'hover:bg-gray-200 text-gray-700'}`}>Free</button>
             <button onClick={() => setPremiumToggle(true)} className={`px-3 py-1 rounded-full transition-colors ${displayPremium === true ? 'bg-emerald-500 text-white shadow-sm' : 'hover:bg-gray-200 text-gray-700'}`}>Premium</button>
          </div>
          <div className="flex items-center gap-4 bg-white/50 rounded-2xl p-1 border border-gray-200 shadow-sm">
            <button onClick={() => handleDateChange(-1)} className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="font-semibold w-24 text-center text-sm md:text-base text-gray-900">
              {isToday ? 'Today' : date}
            </span>
            <button 
              onClick={() => handleDateChange(1)} 
              disabled={isToday}
              className={`p-2 transition-colors ${isToday ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </header>

      <div className={`transition-opacity duration-300 ${isRefetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Metabolic Profile */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h2 className="text-gray-900 font-bold text-lg mb-1">Your Metabolic Profile</h2>
            <p className="text-gray-500 text-sm">Targets are customized based on these settings.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full capitalize border border-emerald-200">
              Goal: {profileSummary?.goal?.replace(/_/g, ' ')}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full capitalize border border-blue-200">
              Activity: {profileSummary?.activityLevel?.replace(/_/g, ' ')}
            </span>
            {profileSummary?.pregnancyStatus !== 'none' && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full capitalize">
                {profileSummary?.pregnancyStatus}
              </span>
            )}
            {profileSummary?.dietaryPreferences?.map((pref: string) => (
              <span key={pref} className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full capitalize">
                {pref}
              </span>
            ))}
          </div>
        </div>


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

      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-gray-200 shadow-sm mb-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-gray-600 font-medium mb-1">Calories Remaining</h2>
            <div className="text-4xl font-bold text-gray-900">{remaining} <span className="text-lg text-gray-500 font-normal">kcal</span></div>
          </div>
          <div className="text-right">
            <div className="text-emerald-600 font-medium">{caloriesConsumed} eaten</div>
            <div className="text-gray-500 text-sm">{calorieTarget} goal</div>
          </div>
        </div>
        <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <MacroCard name="Protein" color="bg-blue-500" data={macros.protein} />
          <MacroCard name="Fat" color="bg-orange-500" data={macros.fat} />
          <MacroCard name="Carbs" color="bg-purple-500" data={macros.carbs} />
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="h-full">
          <AIInsightCard 
            title="Daily AI Insight" 
            content={aiInsights?.daily} 
            isPremium={displayPremium} 
            type="daily" 
            href="/ai-coach"
          />
        </div>
        <div className="h-full">
          <AIInsightCard 
            title="Weekly AI Review" 
            content={aiInsights?.weekly || "Your weekly review will be available on Sunday. Keep logging your meals!"} 
            isPremium={displayPremium} 
            type="weekly" 
            href="/ai-coach"
          />
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
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 md:pb-6 pb-12 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-teal-400/50 transition-all duration-500 flex flex-col md:flex-row gap-6 h-full">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-teal-500/10 blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
        
        {/* Desktop Help Button */}
        <button 
          onClick={() => setShowInfo(true)}
          className="hidden md:flex absolute top-4 right-4 w-6 h-6 rounded-full bg-white border border-gray-300 items-center justify-center text-xs text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-all z-10"
          title="Learn more"
        >
          ?
        </button>

        {/* Left Side: Score */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-6 flex flex-col justify-center relative">
          <h2 className="text-gray-600 font-medium mb-2">Diet Quality (7-Day)</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-gray-900">{score}</span>
            <span className="text-gray-500 font-medium">/ 100</span>
          </div>
          <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
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
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#111827', fontSize: '12px', padding: '4px 8px' }}
                  itemStyle={{ color: '#34d399' }}
                  labelStyle={{ display: 'none' }}
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
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
          className="md:hidden absolute bottom-0 left-0 right-0 bg-white/40 border-t border-gray-200 py-2 text-xs text-gray-600 font-medium hover:bg-white/60 transition-colors flex items-center justify-center gap-1 z-10"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Learn More
        </button>
      </div>

      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowInfo(false)}>
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Diet Quality (7-Day)</h3>
            <div className="text-gray-600 text-sm leading-relaxed space-y-3">
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
          <path className="text-gray-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className={`${color.replace('bg-', 'text-')} transition-all duration-1000 ease-out`} strokeWidth="3" strokeDasharray={`${percent}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
          {data.consumed}g
        </div>
      </div>
      <span className="text-gray-600 text-sm">{name}</span>
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
      <div className={`bg-white/60 backdrop-blur-md rounded-3xl p-6 md:pb-6 pb-12 border border-gray-200 shadow-sm relative overflow-hidden group ${hoverBorderClass} transition-all duration-500 flex flex-col h-full`}>
        <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full blur-2xl transition-all ${bubbleClass}`}></div>
        
        {/* Desktop Help Button */}
        <button 
          onClick={() => setShowInfo(true)}
          className="hidden md:flex absolute top-4 right-4 w-6 h-6 rounded-full bg-white border border-gray-300 items-center justify-center text-xs text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-all z-10"
          aria-label="Learn more about this score"
          title="Learn more"
        >
          ?
        </button>

        <h2 className="text-gray-600 font-medium mb-2">{title}</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-gray-900">{score}</span>
          <span className="text-gray-500 font-medium">/ 100</span>
        </div>
        <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${barGradientClass}`} style={{ width: `${score}%` }}></div>
        </div>

        {/* Mobile Learn More Bar */}
        <button 
          onClick={() => setShowInfo(true)}
          className="md:hidden absolute bottom-0 left-0 right-0 bg-white/40 border-t border-gray-200 py-2 text-xs text-gray-600 font-medium hover:bg-white/60 transition-colors flex items-center justify-center gap-1 z-10"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Learn More
        </button>
      </div>

      {/* Overlay */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowInfo(false)}>
          <div 
            className="bg-white border border-gray-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <div className="text-gray-600 text-sm leading-relaxed space-y-3">
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
