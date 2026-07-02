'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { Select } from '@/components/ui/Select';

import { supabase } from '@/utils/supabase/client';

export default function OnboardingUnitsPage() {
  const router = useRouter();
  const { state, updateState, canProceedFromStep } = useOnboarding();

  const handleFinish = async () => {
    if (canProceedFromStep(5)) {
      try {
        const { data, error } = await supabase
          .from('onboarding_state')
          .insert([
            {
              // Mapping state to snake_case for Supabase
              goal: state.goal,
              biological_sex: state.biologicalSex,
              date_of_birth: state.dateOfBirth,
              height_cm: state.heightCm,
              weight_kg: state.weightKg,
              activity_level: state.activityLevel,
              exercise_frequency: state.exerciseFrequency,
              dietary_preferences: state.dietaryPreferences,
              health_conditions: state.healthConditions,
              allergies: state.allergies,
              weight_unit: state.weightUnit,
              height_unit: state.heightUnit,
              energy_unit: state.energyUnit,
              step_completed: 5,
              is_completed: true,
              started_at: state.startedAt || new Date().toISOString(),
              completed_at: new Date().toISOString()
            }
          ]);
          
        if (error) {
           console.error('Error saving onboarding state to Supabase:', error);
           // Displaying an alert for the user because we likely don't have an auth session yet (RLS will fail)
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
    router.push('/onboarding/step-4');
  };

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="font-headline-lg text-on-surface mb-3 md:text-display-lg">
          Almost done!
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto">
          Choose your preferred units of measurement.
        </p>
      </div>

      <div className="max-w-md mx-auto flex flex-col gap-6">
        <Select
          label="Weight Unit"
          value={state.weightUnit || ''}
          onChange={(e) => updateState({ weightUnit: e.target.value as any })}
          options={[
            { label: 'Kilograms (kg)', value: 'kg' },
            { label: 'Pounds (lbs)', value: 'lbs' },
          ]}
        />
        
        <Select
          label="Height Unit"
          value={state.heightUnit || ''}
          onChange={(e) => updateState({ heightUnit: e.target.value as any })}
          options={[
            { label: 'Centimeters (cm)', value: 'cm' },
            { label: 'Feet & Inches (ft/in)', value: 'ft_in' },
          ]}
        />

        <Select
          label="Energy Unit"
          value={state.energyUnit || ''}
          onChange={(e) => updateState({ energyUnit: e.target.value as any })}
          options={[
            { label: 'Calories (kcal)', value: 'kcal' },
            { label: 'Kilojoules (kJ)', value: 'kJ' },
          ]}
        />
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
            disabled={!canProceedFromStep(5)}
            className={`bg-primary text-white text-label-md px-10 py-4 rounded-full tactile-button flex items-center gap-2 shadow-lg transition-all ${
              canProceedFromStep(5)
                ? 'hover:bg-primary-container hover:scale-105'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Finish Onboarding
            <span className="material-symbols-outlined">check_circle</span>
          </button>
        </div>
      </footer>
    </>
  );
}
