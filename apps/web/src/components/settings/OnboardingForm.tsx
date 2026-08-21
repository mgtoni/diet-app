'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  { id: 'lightly_active', label: 'Lightly Active' },
  { id: 'moderately_active', label: 'Moderately Active' },
  { id: 'very_active', label: 'Very Active' }
];

const DIETARY_PREFS = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 'High Protein', 'Low Carb', 'Halal', 'Kosher', 'Intermittent Fasting'];
const HEALTH_CONDS = ['Coeliac Disease', 'Gluten Intolerance', 'Lactose Intolerance', 'IBS', 'Low FODMAP', 'Diabetes', 'Hypertension', 'High Cholesterol', 'Kidney Disease', 'Gout'];
const ALLERGENS = ['Nuts', 'Peanuts', 'Shellfish', 'Fish', 'Eggs', 'Soya', 'Dairy', 'Gluten', 'Sesame', 'Sulphites'];

export default function OnboardingForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  
  const initialGoal = initialData?.goal?.goal_type || 'maintain';
  const initialPace = initialData?.goal?.pace || 'moderate';
  const initialTargetWeight = initialData?.goal?.target_weight_kg?.toString() || '';
  const initialActivity = initialData?.profile?.activity_level || 'sedentary';
  const initialPrefs = initialData?.preferences?.map((p: any) => p.preference_name) || [];
  const initialConditions = initialData?.healthConditions || [];
  const initialAllergies = initialData?.allergies || [];

  const [goal, setGoal] = useState(initialGoal);
  const [pace, setPace] = useState(initialPace);
  const [targetWeight, setTargetWeight] = useState(initialTargetWeight);
  const [activity, setActivity] = useState(initialActivity);
  
  const [prefs, setPrefs] = useState<string[]>(initialPrefs);
  const [conditions, setConditions] = useState<string[]>(initialConditions);
  const [allergies, setAllergies] = useState<string[]>(initialAllergies);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggleArrayItem = (arr: string[], setArr: any, item: string) => {
    setMessage('');
    if (arr.includes(item)) setArr(arr.filter(i => i !== item));
    else setArr([...arr, item]);
  };

  const isArrayEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  };

  const isGoalDirty = goal !== initialGoal || pace !== initialPace || targetWeight !== initialTargetWeight;
  const isActivityDirty = activity !== initialActivity;
  const isPrefsDirty = !isArrayEqual(prefs, initialPrefs) || !isArrayEqual(conditions, initialConditions) || !isArrayEqual(allergies, initialAllergies);
  
  const isDirty = isGoalDirty || isActivityDirty || isPrefsDirty;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;
    
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      // 1. Update Profile (Activity)
      if (isActivityDirty) {
        const resProfile = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activity_level: activity })
        });
        const dataProfile = await resProfile.json();
        if (!dataProfile.success) throw new Error(dataProfile.error || 'Failed to update activity level');
      }

      // 2. Update Goal
      if (isGoalDirty) {
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
      if (isPrefsDirty) {
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
      }

      setMessage('Settings successfully saved! 🎉');
      router.refresh(); // This will refresh the page and update the initialData from the server components!
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
      
      {message && <div className="p-4 mb-6 bg-mint-bg text-primary rounded-xl border border-mint-surface font-label-md flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> {message}</div>}
      {error && <div className="p-4 mb-6 bg-salmon-bg text-salmon-accent rounded-xl border border-salmon-surface font-label-md flex items-center gap-2"><span className="material-symbols-outlined">error</span> {error}</div>}
      
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Goal */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/50 shadow-sm space-y-4">
          <h3 className="font-title-md text-primary">Primary Goal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOALS.map(g => (
              <button
                type="button"
                key={g.id}
                onClick={() => { setGoal(g.id); setMessage(''); }}
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
                  onChange={(e) => { setTargetWeight(e.target.value); setMessage(''); }}
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
                      onClick={() => { setPace(p.id); setMessage(''); }}
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
                onClick={() => { setActivity(a.id); setMessage(''); }}
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
            disabled={isLoading || !isDirty}
            className={`font-bold py-3 px-8 rounded-full shadow-md transition-all flex items-center gap-2 ${isDirty ? 'bg-primary text-on-primary hover:bg-primary/90 active:scale-95' : 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed'}`}
          >
            {isLoading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
            {isDirty ? 'Save Profile' : 'No Changes to Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
