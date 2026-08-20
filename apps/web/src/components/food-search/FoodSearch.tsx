'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FoodSearchProps {
  onAdd: (food: any, inputQuantity: number, grams: number, servingSizeId?: string) => void;
  onClose: () => void;
  initialFood?: any;
  initialQuantity?: string;
  initialUnit?: string;
  isEditing?: boolean;
  onDelete?: () => void;
}

export default function FoodSearch({ onAdd, onClose, initialFood, initialQuantity, initialUnit, isEditing, onDelete }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedFood, setSelectedFood] = useState<any | null>(initialFood || null);
  const [quantity, setQuantity] = useState<string>(initialQuantity || '100');
  const [unit, setUnit] = useState<string>(initialUnit || 'g'); // 'g', 'oz', 'std_*', or a servingSize.id

  const standardUnits: Record<string, number> = {
    'std_tbsp': 15,
    'std_tsp': 5,
    'std_cup': 240,
    'std_piece': 100,
    'std_slice': 30
  };

  const getMultiplier = () => {
    const qty = parseFloat(quantity) || 0;
    if (unit === 'g') return qty / 100;
    if (unit === 'oz') return (qty * 28.3495) / 100;
    if (standardUnits[unit]) return (qty * standardUnits[unit]) / 100;
    const serving = selectedFood?.servingSizes?.find((s:any)=>s.id === unit);
    if (serving) return (qty * serving.weightG) / 100;
    return 0;
  };

  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-GB';
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(searchQuery)}&locale=${encodeURIComponent(locale)}`);
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
    } else if (standardUnits[unit]) {
      grams = numQuantity * standardUnits[unit];
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
    <div className="fixed inset-0 bg-white/80 backdrop-blur-xl z-50 flex flex-col p-4 animate-in fade-in duration-200">
      <header className="flex items-center gap-4 mb-6 mt-4 max-w-2xl mx-auto w-full">
        <button onClick={selectedFood && !isEditing ? () => setSelectedFood(null) : onClose} className="p-2 text-gray-500 hover:text-gray-900 bg-white rounded-full transition-colors border border-gray-200 shadow-sm">
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
              className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-2xl py-3 pl-4 pr-12 text-gray-900 outline-none shadow-sm transition-colors"
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
          <div className="flex-1 text-lg font-bold text-gray-900 truncate">
            {selectedFood.name}
          </div>
        )}
      </header>

      {!selectedFood ? (
        <div className="flex-1 overflow-y-auto space-y-3 pb-8 max-w-2xl mx-auto w-full">
          {results.length === 0 && !loading && query && (
            <div className="text-center text-gray-500 mt-12">No foods found for &quot;{query}&quot;</div>
          )}
          
          {results.map((food, idx) => (
            <div 
              key={idx} 
              onClick={() => handleSelectFood(food)}
              className="bg-white border border-gray-200 hover:border-emerald-500/50 rounded-2xl p-4 flex justify-between items-center transition-all cursor-pointer group shadow-sm"
            >
              <div>
                <div className="font-medium text-gray-900">{food.name}</div>
                <div className="text-sm text-gray-500">{food.brand || 'Generic'} • {Math.round(food.nutrition.calories)} kcal / 100g</div>
              </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleSelectFood(food); }}
              className="w-10 h-10 rounded-full bg-gray-50 text-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-xl font-bold text-gray-900">{selectedFood.name}</h3>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete
                </button>
              )}
            </div>
            <p className="text-gray-500 mb-8">{selectedFood.brand || 'Generic Food'}</p>
            
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Amount</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 focus:border-emerald-500 rounded-2xl p-4 text-xl text-gray-900 outline-none transition-colors text-center shadow-sm"
                    required
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 focus:border-emerald-500 rounded-2xl p-4 text-xl text-gray-900 outline-none transition-colors appearance-none text-center shadow-sm"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="oz">Ounces (oz)</option>
                    {(() => {
                      const name = selectedFood.name.toLowerCase();
                      const volumeKeywords = ['milk', 'water', 'juice', 'oil', 'sauce', 'syrup', 'honey', 'sugar', 'salt', 'flour', 'rice', 'oats', 'coffee', 'tea', 'soup', 'cream', 'butter', 'yogurt', 'vinegar', 'peanut butter', 'jam', 'jelly'];
                      const pieceKeywords = ['apple', 'banana', 'egg', 'chicken breast', 'avocado', 'tomato', 'potato', 'onion', 'garlic', 'orange', 'lemon', 'lime', 'peach', 'plum', 'pear', 'burger', 'sandwich', 'cookie', 'biscuit', 'muffin', 'roll', 'bun'];
                      const sliceKeywords = ['bread', 'cheese', 'pizza', 'cake', 'pie', 'bacon', 'ham', 'turkey', 'toast', 'salami'];
                      
                      const showVolume = volumeKeywords.some(k => name.includes(k));
                      const showPiece = pieceKeywords.some(k => name.includes(k));
                      const showSlice = sliceKeywords.some(k => name.includes(k));

                      // If no keywords match and no serving sizes exist from API, we might want to fallback to generic, but user wants them constrained.
                      
                      return (
                        <>
                          {showPiece && <option value="std_piece">Piece (~100g)</option>}
                          {showSlice && <option value="std_slice">Slice (~30g)</option>}
                          {showVolume && (
                            <>
                              <option value="std_cup">Cup (~240g)</option>
                              <option value="std_tbsp">Tablespoon (~15g)</option>
                              <option value="std_tsp">Teaspoon (~5g)</option>
                            </>
                          )}
                        </>
                      );
                    })()}
                    {selectedFood.servingSizes?.map((serving: any) => (
                      <option key={serving.id} value={serving.id}>
                        {serving.servingName} ({serving.weightG}g)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="text-sm text-gray-500 mb-2">Estimated Nutrition</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="font-bold text-emerald-600">
                      {Math.round(selectedFood.nutrition.calories * getMultiplier())}
                    </div>
                    <div className="text-xs text-gray-500">kcal</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600">
                      {Math.round(selectedFood.nutrition.protein * getMultiplier() * 10) / 10}
                    </div>
                    <div className="text-xs text-gray-500">Protein</div>
                  </div>
                  <div>
                    <div className="font-bold text-orange-500">
                      {Math.round(selectedFood.nutrition.carbohydrates * getMultiplier() * 10) / 10}
                    </div>
                    <div className="text-xs text-gray-500">Carbs</div>
                  </div>
                  <div>
                    <div className="font-bold text-yellow-600">
                      {Math.round(selectedFood.nutrition.fat * getMultiplier() * 10) / 10}
                    </div>
                    <div className="text-xs text-gray-500">Fat</div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                {isEditing ? 'Update Diary' : 'Add to Diary'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
