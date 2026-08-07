'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FoodSearchProps {
  onAdd: (food: any, inputQuantity: number, grams: number, servingSizeId?: string) => void;
  onClose: () => void;
}

export default function FoodSearch({ onAdd, onClose }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<string>('100');
  const [unit, setUnit] = useState<string>('g'); // 'g', 'oz', or a servingSize.id

  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      fetchResults(query);
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    fetchResults(query);
  };

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
    
    // Determine default unit
    let defaultUnit = 'g';
    if (typeof document !== 'undefined' && document.cookie.includes('dev_user_units=imperial')) {
      defaultUnit = 'oz';
    }
    
    // If it's imperial, default quantity is typically 1 or 4 oz, let's use 1 for oz, 100 for g.
    setQuantity(defaultUnit === 'oz' ? '4' : '100');
    setUnit(defaultUnit);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    const numQuantity = parseFloat(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) return;

    let grams = numQuantity;
    let servingSizeId = undefined;

    if (unit === 'oz') {
      grams = numQuantity * 28.3495;
    } else if (unit !== 'g') {
      // It's a serving size ID
      const serving = selectedFood.servingSizes?.find((s: any) => s.id === unit);
      if (serving) {
        grams = numQuantity * serving.weightG;
        servingSizeId = serving.id;
      }
    }

    onAdd(selectedFood, numQuantity, grams, servingSizeId);
  };

  return (
    <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-xl z-50 flex flex-col p-4 animate-in fade-in duration-200">
      <header className="flex items-center gap-4 mb-6 mt-4">
        <button onClick={selectedFood ? () => setSelectedFood(null) : onClose} className="p-2 text-gray-400 hover:text-white bg-gray-900 rounded-full transition-colors border border-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        {!selectedFood ? (
          <form onSubmit={handleSearch} className="flex-1 relative">
            <input 
              autoFocus
              type="text" 
              placeholder="Search for food..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 focus:border-emerald-500 rounded-2xl py-3 pl-4 pr-12 text-white outline-none shadow-inner transition-colors"
            />
            <button type="submit" className="absolute right-3 top-3 text-emerald-500 hover:text-emerald-400">
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              )}
            </button>
          </form>
        ) : (
          <div className="flex-1 text-lg font-bold text-white truncate">
            {selectedFood.name}
          </div>
        )}
      </header>

      {!selectedFood ? (
        <div className="flex-1 overflow-y-auto space-y-3 pb-8">
          {results.length === 0 && !loading && query && (
            <div className="text-center text-gray-500 mt-12">No foods found for &quot;{query}&quot;</div>
          )}
          
          {results.map((food, idx) => (
            <div 
              key={idx} 
              onClick={() => handleSelectFood(food)}
              className="bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-2xl p-4 flex justify-between items-center transition-all cursor-pointer group"
            >
              <div>
                <div className="font-medium text-white">{food.name}</div>
                <div className="text-sm text-gray-500">{food.brand || 'Generic'} • {Math.round(food.nutrition.calories)} kcal / 100g</div>
              </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleSelectFood(food); }}
              className="w-10 h-10 rounded-full bg-gray-800 text-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-emerald-500 hover:text-gray-900 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-1">{selectedFood.name}</h3>
            <p className="text-gray-400 mb-8">{selectedFood.brand || 'Generic Food'}</p>
            
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1 bg-gray-950 border border-gray-800 focus:border-emerald-500 rounded-2xl p-4 text-xl text-white outline-none transition-colors text-center"
                    required
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="flex-1 bg-gray-950 border border-gray-800 focus:border-emerald-500 rounded-2xl p-4 text-xl text-white outline-none transition-colors appearance-none text-center"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="oz">Ounces (oz)</option>
                    {selectedFood.servingSizes?.map((serving: any) => (
                      <option key={serving.id} value={serving.id}>
                        {serving.servingName} ({serving.weightG}g)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="bg-gray-950 rounded-2xl p-4 border border-gray-800">
                <div className="text-sm text-gray-400 mb-2">Estimated Nutrition</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="font-bold text-emerald-400">
                      {Math.round(selectedFood.nutrition.calories * (
                        (unit === 'g' ? parseFloat(quantity) || 0 : 
                         unit === 'oz' ? (parseFloat(quantity) || 0) * 28.3495 : 
                         (selectedFood.servingSizes?.find((s:any)=>s.id === unit)?.weightG || 0) * (parseFloat(quantity) || 0)) / 100
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">kcal</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-400">
                      {Math.round(selectedFood.nutrition.protein * (
                        (unit === 'g' ? parseFloat(quantity) || 0 : 
                         unit === 'oz' ? (parseFloat(quantity) || 0) * 28.3495 : 
                         (selectedFood.servingSizes?.find((s:any)=>s.id === unit)?.weightG || 0) * (parseFloat(quantity) || 0)) / 100
                      ) * 10) / 10}
                    </div>
                    <div className="text-xs text-gray-500">Protein</div>
                  </div>
                  <div>
                    <div className="font-bold text-orange-400">
                      {Math.round(selectedFood.nutrition.carbohydrates * (
                        (unit === 'g' ? parseFloat(quantity) || 0 : 
                         unit === 'oz' ? (parseFloat(quantity) || 0) * 28.3495 : 
                         (selectedFood.servingSizes?.find((s:any)=>s.id === unit)?.weightG || 0) * (parseFloat(quantity) || 0)) / 100
                      ) * 10) / 10}
                    </div>
                    <div className="text-xs text-gray-500">Carbs</div>
                  </div>
                  <div>
                    <div className="font-bold text-yellow-400">
                      {Math.round(selectedFood.nutrition.fat * (
                        (unit === 'g' ? parseFloat(quantity) || 0 : 
                         unit === 'oz' ? (parseFloat(quantity) || 0) * 28.3495 : 
                         (selectedFood.servingSizes?.find((s:any)=>s.id === unit)?.weightG || 0) * (parseFloat(quantity) || 0)) / 100
                      ) * 10) / 10}
                    </div>
                    <div className="text-xs text-gray-500">Fat</div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-500 text-gray-950 font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Add to Diary
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
