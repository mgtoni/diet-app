'use client';

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function InsightsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch 30 days of data for insights
    fetch('/api/scores/history?days=30')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          const formatted = res.data.map((d: any) => {
            const dateObj = new Date(d.date);
            return {
              ...d,
              displayDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              fullDate: dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            };
          });
          setHistory(formatted);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const averageScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.diet_quality_score, 0) / history.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 pb-24 font-sans selection:bg-emerald-500/30">
      <header className="mb-8 pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
            Insights
          </h1>
          <p className="text-gray-400 text-sm mt-1">Deep dive into your nutritional trends</p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-gray-900/80 rounded-3xl p-8 border border-gray-800 text-center text-gray-400">
          Not enough data yet. Keep logging your meals to unlock insights!
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border border-gray-800 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <h2 className="text-gray-400 font-medium mb-1">30-Day Diet Quality Trend</h2>
                <div className="text-sm text-gray-500">Rolling 7-day average score over time</div>
              </div>
              <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 min-w-[150px]">
                <div className="text-sm text-gray-400 font-medium mb-1">30-Day Average</div>
                <div className="text-3xl font-bold text-teal-400">{averageScore} <span className="text-lg text-gray-500 font-normal">/ 100</span></div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#9CA3AF" 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                    minTickGap={20}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    domain={[0, 100]} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="diet_quality_score" 
                    stroke="#14b8a6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    activeDot={{ r: 6, fill: '#34d399', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* More insights cards can go here in the future */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border border-gray-800 shadow-xl opacity-75">
                <h3 className="text-gray-400 font-medium mb-2">Top Contributing Foods</h3>
                <p className="text-sm text-gray-500 mb-4">Coming soon based on your historical logs.</p>
                <div className="h-24 bg-gray-800/50 rounded-xl flex items-center justify-center text-gray-600 text-sm">
                  Premium Feature
                </div>
             </div>
             <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border border-gray-800 shadow-xl opacity-75">
                <h3 className="text-gray-400 font-medium mb-2">Micronutrient Coverage</h3>
                <p className="text-sm text-gray-500 mb-4">Coming soon based on your historical logs.</p>
                <div className="h-24 bg-gray-800/50 rounded-xl flex items-center justify-center text-gray-600 text-sm">
                  Premium Feature
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl shadow-2xl">
        <p className="text-gray-400 text-xs mb-1">{data.fullDate}</p>
        <p className="text-teal-400 font-bold text-lg">
          Score: {data.diet_quality_score}
        </p>
      </div>
    );
  }
  return null;
};
