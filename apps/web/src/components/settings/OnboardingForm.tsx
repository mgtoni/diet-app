'use client';
import React, { useState } from 'react';

const GOALS = [
  { id: 'lose_weight', label: 'Lose weight' },
  { id: 'gain_weight', label: 'Gain weight' },
  { id: 'build_muscle', label: 'Build muscle' },
  { id: 'eat_healthier', label: 'Eat healthier' },
  { id: 'manage_condition', label: 'Manage a health condition' },
  { id: 'maintain', label: 'Maintain current weight' }
];

const PACES = [
  { id: 'slow', label: 'Slow (0.25kg/week)' },
  { id: 'moderate', label: 'Moderate (0.5kg/week)' },
  { id: 'fast', label: 'Fast (0.75kg/week)' }
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary' },
  { id: 'light', label: 'Lightly Active' },
  { id: 'moderate', label: 'Moderately Active' },
  { id: 'very_active', label: 'Very Active' }
];

const DIETARY_PREFS = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 'High Protein', 'Low Carb', 'Halal', 'Kosher', 'Intermittent Fasting'];
const HEALTH_CONDS = ['Coeliac Disease', 'Gluten Intolerance', 'Lactose Intolerance', 'IBS', 'Low FODMAP', 'Diabetes', 'Hypertension', 'High Cholesterol', 'Kidney Disease', 'Gout'];
const ALLERGENS = ['Nuts', 'Peanuts', 'Shellfish', 'Fish', 'Eggs', 'Soya', 'Dairy', 'Gluten', 'Sesame', 'Sulphites'];

export default function OnboardingForm({ initialData }: { initialData: any }) {
  const [goal, setGoal] = useState(initialData?.goal?.goal_type || 'maintain');
  const [pace, setPace] = useState(initialData?.goal?.pace || 'moderate');
  const [targetWeight, setTargetWeight] = useState(initialData?.goal?.target_weight_kg?.toString() || '');
  const [activity, setActivity] = useState(initialData?.profile?.activity_level || 'sedentary');
  
  const [prefs, setPrefs] = useState<string[]>(initialData?.preferences?.map((p: any) => p.preference_name) || []);
  const [conditions, setConditions] = useState<string[]>(initialData?.healthConditions || []);
  const [allergies, setAllergies] = useState<string[]>(initialData?.allergies || []);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggleArrayItem = (arr: string[], setArr: any, item: string) => {
    if (arr.includes(item)) setArr(arr.filter(i => i !== item));
    else setArr([...arr, item]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      // 1. Update Profile (Activity)
      if (activity !== initialData?.profile?.activity_level) {
        const resProfile = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activity_level: activity })
        });
        const dataProfile = await resProfile.json();
        if (!dataProfile.success) throw new Error(dataProfile.error || 'Failed to update activity level');
      }

      // 2. Update Goal
      const currentGoal = initialData?.goal;
      if (
        goal !== currentGoal?.goal_type ||
        pace !== currentGoal?.pace ||
        (targetWeight ? Number(targetWeight) !== currentGoal?.target_weight_kg : currentGoal?.target_weight_kg !== null)
      ) {
        const resGoal = await fetch('/api/user/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            goal_type: goal, 
            pace: ['lose_weight', 'gain_weight'].includes(goal) ? pace : null,
            target_weight_kg: targetWeight ? Number(targetWeight) : null
          })
        });
        const dataGoal = await resGoal.json();
        if (!dataGoal.success) throw new Error(dataGoal.error || 'Failed to update goal');
      }

      // 3. Update Preferences, Conditions, Allergies
      const resPrefs = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dietary_preferences: prefs,
          health_conditions: conditions,
          allergies: allergies
        })
      });
      const dataPrefs = await resPrefs.json();
      if (!dataPrefs.success) throw new Error(dataPrefs.error || 'Failed to update preferences');

      setMessage('Nutrition profile updated successfully.');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const showPace = ['lose_weight', 'gain_weight'].includes(goal);

  return (
    <div className="max-w-2xl pb-10">
      <h2 className="font-headline-sm text-primary mb-6">Nutrition Profile</h2>
      
      {message && <div className="p-4 mb-6 bg-mint-bg text-primary rounded-xl border border-mint-surface font-label-md">{message}</div>}
      {error && <div className="p-4 mb-6 bg-salmon-bg text-salmon-accent rounded-xl border border-salmon-surface font-label-md">{error}</div>}
      
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Goal */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/50 shadow-sm space-y-4">
          <h3 className="font-title-md text-primary">Primary Goal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOALS.map(g => (
              <button
                type="button"
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`p-3 rounded-xl border text-left transition-all ${goal === g.id ? 'border-primary bg-primary-container text-on-primary-container font-bold' : 'border-outline-variant text-on-surface hover:bg-surface-variant/30'}`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {showPace && (
            <div className="pt-4 border-t border-outline-variant/30 mt-4 space-y-4">
              <div>
                <label className="block text-on-surface-variant font-label-md mb-2">Target Weight (kg) - Optional</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full sm:w-1/2 bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                  placeholder="e.g. 70"
                />
              </div>
              <div>
                <label className="block text-on-surface-variant font-label-md mb-2">Pace</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PACES.map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPace(p.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${pace === p.id ? 'border-primary bg-primary-container text-on-primary-container font-bold' : 'border-outline-variant text-on-surface hover:bg-surface-variant/30'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Level */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/50 shadow-sm space-y-4">
          <h3 className="font-title-md text-primary">Activity Level</h3>
          <p className="text-caption text-on-surface-variant">Used to estimate your daily calorie burn.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACTIVITY_LEVELS.map(a => (
              <button
                type="button"
                key={a.id}
                onClick={() => setActivity(a.id)}
                className={`p-3 rounded-xl border text-left transition-all ${activity === a.id ? 'border-primary bg-primary-container text-on-primary-container font-bold' : 'border-outline-variant text-on-surface hover:bg-surface-variant/30'}`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/50 shadow-sm space-y-4">
          <h3 className="font-title-md text-primary">Dietary Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {DIETARY_PREFS.map(p => (
              <button
                type="button"
                key={p}
                onClick={() => toggleArrayItem(prefs, setPrefs, p)}
                className={`px-4 py-2 rounded-full border transition-all font-label-md ${prefs.includes(p) ? 'border-primary bg-primary text-on-primary shadow-sm' : 'border-outline-variant text-on-surface hover:bg-surface-variant'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Health Conditions */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/50 shadow-sm space-y-4">
          <h3 className="font-title-md text-primary">Health Conditions</h3>
          <div className="flex flex-wrap gap-2">
            {HEALTH_CONDS.map(c => (
              <button
                type="button"
                key={c}
                onClick={() => toggleArrayItem(conditions, setConditions, c)}
                className={`px-4 py-2 rounded-full border transition-all font-label-md ${conditions.includes(c) ? 'border-salmon-accent bg-salmon-bg text-salmon-accent font-bold shadow-sm' : 'border-outline-variant text-on-surface hover:bg-surface-variant'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/50 shadow-sm space-y-4">
          <h3 className="font-title-md text-primary">Allergies</h3>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map(a => (
              <button
                type="button"
                key={a}
                onClick={() => toggleArrayItem(allergies, setAllergies, a)}
                className={`px-4 py-2 rounded-full border transition-all font-label-md ${allergies.includes(a) ? 'border-salmon-accent bg-salmon-accent text-on-primary shadow-sm' : 'border-outline-variant text-on-surface hover:bg-surface-variant'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-on-primary font-bold py-3 px-8 rounded-full shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
            {isLoading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
