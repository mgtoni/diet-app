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

  const handleDateChange = (offset: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 pb-24 font-sans selection:bg-emerald-500/30">
      <header className="mb-6 flex justify-between items-center sticky top-0 bg-gray-950/80 backdrop-blur-md py-4 z-10 border-b border-gray-900">
        <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 hover:bg-gray-800 transition-colors border border-gray-800">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div className="flex items-center gap-4 bg-gray-900 rounded-2xl p-1 border border-gray-800">
          <button onClick={() => handleDateChange(-1)} className="p-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-semibold w-24 text-center">{date === new Date().toISOString().split('T')[0] ? 'Today' : date}</span>
          <button onClick={() => handleDateChange(1)} className="p-2 text-gray-400 hover:text-white transition-colors">
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
              <div key={slot.id} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl overflow-hidden shadow-lg transition-all hover:border-gray-700">
                <div className="p-5 border-b border-gray-800/50 flex justify-between items-center bg-gray-900/30">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="text-xl">{slot.icon}</span> {slot.name}
                  </h3>
                  <span className="text-gray-400 font-medium">{slotCalories} kcal</span>
                </div>
                
                <div className="p-2">
                  {items.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No foods logged yet</div>
                  ) : (
                    <ul className="space-y-1">
                      {items.map((item: any, idx: number) => (
                        <li key={idx} className="flex flex-col p-3 hover:bg-gray-800/50 rounded-2xl transition-colors group">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{item.foodName}</div>
                              <div className="text-xs text-gray-500">
                                {item.servingSizeId ? `${item.quantity} ${item.servingName || 'serving'}` : `${item.quantity}g`}
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div className="font-medium text-emerald-400">{item.nutritionSnapshot?.calories || 0} kcal</div>
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
                  
                  <div className="p-3 mt-2">
                    <button 
                      onClick={() => setShowSearch(slot.id)}
                      className="w-full py-3 rounded-2xl border border-dashed border-gray-700 text-emerald-400 font-medium hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      Add Food
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
    </div>
  );
}
