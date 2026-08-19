'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FoodSearch from '@/components/food-search/FoodSearch';

const MEAL_SLOTS = [
  { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
  { id: 'lunch', name: 'Lunch', icon: '☀️' },
  { id: 'dinner', name: 'Dinner', icon: '🌙' },
  { id: 'snacks', name: 'Snacks', icon: '🍎' }
];

export default function DiaryPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [diaryData, setDiaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [showSearch, setShowSearch] = useState<string | null>(null);
  const [showAILog, setShowAILog] = useState<string | null>(null);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchDiaryData = async () => {
    if (!diaryData) setLoading(true);
    else setIsRefetching(true);

    try {
      const res = await fetch(`/api/diary/${date}`);
      const json = await res.json();
      setDiaryData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchDiaryData();
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

  return (
    <div className="min-h-screen bg-transparent text-gray-900 p-6 pb-24 font-sans selection:bg-emerald-500/30">
      <header className="mb-6 relative flex justify-center items-center sticky top-0 bg-white/80 backdrop-blur-md py-4 z-10 border-b border-gray-200 min-h-[72px]">
        <Link href="/dashboard" className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div className="flex items-center gap-4 bg-white rounded-2xl p-1 border border-gray-200 shadow-sm">
          <button onClick={() => handleDateChange(-1)} className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-semibold w-24 text-center">{isToday ? 'Today' : date}</span>
          <button 
            onClick={() => handleDateChange(1)} 
            disabled={isToday}
            className={`p-2 transition-colors ${isToday ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </header>

      {loading && !diaryData ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className={`space-y-6 transition-opacity duration-300 ${isRefetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {MEAL_SLOTS.map(slot => {
            const entry = diaryData?.entries?.find((e: any) => e.mealSlot === slot.id);
            const items = entry?.items || [];
            const slotCalories = items.reduce((sum: number, item: any) => sum + (item.nutritionSnapshot?.calories || 0), 0);

            return (
              <div key={slot.id} className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-3xl overflow-hidden shadow-sm transition-all hover:border-emerald-400/50 mb-6">
                <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white/40">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="text-xl">{slot.icon}</span> {slot.name}
                  </h3>
                  <span className="text-gray-500 font-medium">{slotCalories} kcal</span>
                </div>
                
                <div className="p-2">
                  {items.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">No foods logged yet</div>
                  ) : (
                    <ul className="space-y-1">
                      {items.map((item: any, idx: number) => (
                        <li key={idx} className="flex flex-col p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">{item.foodName}</div>
                              <div className="text-xs text-gray-500">
                                {item.servingSizeId ? `${item.quantity} ${item.servingName || 'serving'}` : `${item.quantity}g`}
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div className="font-medium text-emerald-600">{item.nutritionSnapshot?.calories || 0} kcal</div>
                            </div>
                          </div>
                          {item.warnings && item.warnings.length > 0 && (
                            <div className="mt-2 pl-2 border-l-2 border-amber-500/50 space-y-1">
                              {item.warnings.map((w: any, wIdx: number) => (
                                <div key={wIdx} className="text-xs text-amber-400 flex items-start gap-1">
                                  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                  <span>{w.message}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <div className="p-3 mt-2 flex gap-2">
                    <button 
                      onClick={() => setShowSearch(slot.id)}
                      className="flex-1 py-3 rounded-2xl border border-dashed border-gray-300 text-emerald-600 font-medium hover:bg-emerald-50 hover:border-emerald-400 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      Add Food
                    </button>
                    <button
                      onClick={() => setShowAILog(slot.id)}
                      className="flex-none px-4 py-3 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      AI Log
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showSearch && (
        <FoodSearch 
          onClose={() => setShowSearch(null)} 
          onAdd={async (food, inputQuantity, grams, servingSizeId) => {
            try {
              // Make sure to calculate snapshot per quantity
              const ratio = grams / 100;
              const snapshot = {
                calories: Math.round(food.nutrition.calories * ratio),
                protein: Math.round(food.nutrition.protein * ratio * 10) / 10,
                carbohydrates: Math.round(food.nutrition.carbohydrates * ratio * 10) / 10,
                fat: Math.round(food.nutrition.fat * ratio * 10) / 10,
              };

              const res = await fetch(`/api/diary/${date}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  foodId: food.id,
                  foodName: food.name,
                  mealSlot: showSearch,
                  quantity: inputQuantity,
                  servingSizeId,
                  nutritionSnapshot: snapshot
                })
              });
              
              if (res.ok) {
                setShowSearch(null);
                fetchDiaryData();
              } else {
                console.error('Failed to add food');
              }
            } catch (e) {
              console.error(e);
            }
          }} 
        />
      )}

      {showAILog && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowAILog(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              AI Meal Logging
            </h3>
            <p className="text-sm text-gray-600 mb-4">Describe your meal in natural language. The AI will estimate the ingredients and quantities.</p>
            
            <textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="e.g. I had two scrambled eggs with a slice of whole wheat toast and black coffee"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 h-32 focus:border-emerald-500 outline-none resize-none mb-4"
            />
            
            <button
              disabled={!aiText.trim() || aiLoading}
              onClick={async () => {
                setAiLoading(true);
                try {
                  const res = await fetch(`/api/diary/ai-log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: aiText, date })
                  });
                  const json = await res.json();
                  if (json.success && json.data.length > 0) {
                    // Send parsed items to diary sequentially
                    for (const item of json.data) {
                      await fetch(`/api/diary/${date}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          foodId: null,
                          foodName: item.foodName,
                          mealSlot: showAILog,
                          quantity: item.quantity,
                          servingSizeId: item.servingName || 'serving',
                          nutritionSnapshot: item.nutritionSnapshot
                        })
                      });
                    }
                    setShowAILog(null);
                    setAiText('');
                    fetchDiaryData();
                  } else {
                    alert('Could not parse meal. Please try again.');
                  }
                } catch (e) {
                  console.error(e);
                  alert('Error parsing meal.');
                } finally {
                  setAiLoading(false);
                }
              }}
              className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors flex justify-center items-center gap-2"
            >
              {aiLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Analyzing...
                </>
              ) : (
                'Log Meal'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
