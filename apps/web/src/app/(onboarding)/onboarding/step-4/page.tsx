'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { supabase } from '@/utils/supabase/client';

export default function OnboardingDietPage() {
  const router = useRouter();
  const { state, updateState, canProceedFromStep } = useOnboarding();

  const handleFinish = async () => {
    if (canProceedFromStep(4)) {
      try {
        const { data, error } = await supabase
          .from('onboarding_state')
          .insert([
            {
              goal: state.goal,
              biological_sex: state.biologicalSex,
              age: state.age,
              height_cm: state.heightCm,
              weight_kg: state.weightKg,
              activity_level: state.activityLevel,
              exercise_frequency: state.exerciseFrequency,
              dietary_preferences: state.dietaryPreferences,
              health_conditions: state.healthConditions,
              allergies: state.allergies,
              weight_unit: state.weightUnit || 'kg',
              height_unit: state.heightUnit || 'cm',
              energy_unit: 'kcal',
              step_completed: 4,
              is_completed: true,
              started_at: state.startedAt || new Date().toISOString(),
              completed_at: new Date().toISOString()
            }
          ]);
          
        if (error) {
           console.error('Error saving onboarding state to Supabase:', error);
           alert(`Failed to save onboarding state to Supabase. This may be due to missing Auth session. Error: ${error.message}`);
           return;
        }
        
        console.log('Wizard Completed! Data saved:', data);
        router.push('/dashboard');
      } catch (err) {
        console.error('Exception during save', err);
      }
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step-3');
  };

  const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Pescatarian', 'Halal'];
  const ALLERGY_OPTIONS = ['Dairy', 'Gluten', 'Nuts', 'Soy', 'Eggs', 'Shellfish'];
  const HEALTH_OPTIONS = ['Diabetes', 'Hypertension', 'Coeliac', 'PCOS', 'IBS', 'Pregnant'];

  const toggleArrayItem = (key: 'dietaryPreferences' | 'allergies' | 'healthConditions', value: string) => {
    const current = state[key] || [];
    if (current.includes(value)) {
      updateState({ [key]: current.filter(item => item !== value) });
    } else {
      updateState({ [key]: [...current, value] });
    }
  };

  const renderCheckboxes = (
    title: string,
    key: 'dietaryPreferences' | 'allergies' | 'healthConditions',
    options: string[]
  ) => (
    <div className="mb-6">
      <h2 className="text-label-lg font-bold text-on-surface mb-3">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <label
            key={option}
            className={`
              flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
              ${
                (state[key] || []).includes(option)
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-surface-container-low border-surface-variant text-on-surface hover:border-primary/50'
              }
            `}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={(state[key] || []).includes(option)}
              onChange={() => toggleArrayItem(key, option)}
            />
            <span className="text-body-md font-medium">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="font-headline-lg text-on-surface mb-3 md:text-display-lg">
          Diet & Restrictions
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto">
          Select any dietary preferences, allergies, or health conditions we should be aware of.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {renderCheckboxes('Dietary Preferences', 'dietaryPreferences', DIETARY_OPTIONS)}
        {renderCheckboxes('Allergies', 'allergies', ALLERGY_OPTIONS)}
        {renderCheckboxes('Health Conditions', 'healthConditions', HEALTH_OPTIONS)}
      </div>

      {/* Fixed Footer Controls */}
      <footer className="fixed bottom-0 left-0 w-full p-6 md:px-container-padding md:py-8 border-t border-surface-variant/50 z-50 bg-surface">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-on-surface-variant text-label-md hover:text-primary transition-all px-4 py-2 rounded-xl"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
          
          <button
            onClick={handleFinish}
            disabled={!canProceedFromStep(4)}
            className={`bg-primary text-white text-label-md px-10 py-4 rounded-full tactile-button flex items-center gap-2 shadow-lg transition-all ${
              canProceedFromStep(4)
                ? 'hover:bg-primary-container hover:scale-105'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Finish
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </footer>
    </>
  );
}
