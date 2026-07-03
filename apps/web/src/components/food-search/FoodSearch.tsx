'use client';

import React, { useState } from 'react';

interface FoodSearchProps {
  onAdd: (food: any, quantity: number) => void;
  onClose: () => void;
}

export default function FoodSearch({ onAdd, onClose }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}`);
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

  return (
    <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-xl z-50 flex flex-col p-4 animate-in fade-in duration-200">
      <header className="flex items-center gap-4 mb-6 mt-4">
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-gray-900 rounded-full transition-colors border border-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
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
        <button className="p-3 text-white bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl hover:border-emerald-500 transition-colors border border-gray-800">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto space-y-3 pb-8">
        {results.length === 0 && !loading && query && (
          <div className="text-center text-gray-500 mt-12">No foods found for "{query}"</div>
        )}
        
        {results.map((food, idx) => (
          <div key={idx} className="bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-2xl p-4 flex justify-between items-center transition-all group">
            <div>
              <div className="font-medium text-white">{food.name}</div>
              <div className="text-sm text-gray-500">{food.brand || 'Generic'} • {food.nutrition.calories} kcal / 100g</div>
            </div>
            <button 
              onClick={() => onAdd(food, 100)}
              className="w-10 h-10 rounded-full bg-gray-800 text-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-emerald-500 hover:text-gray-900 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
