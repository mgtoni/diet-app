'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { ActivityLevel } from '@diet-app/core/src/nutritionEngine';
import { Select } from '@/components/ui/Select';

export default function OnboardingActivityPage() {
  const router = useRouter();
  const { state, updateState, canProceedFromStep } = useOnboarding();

  const handleContinue = () => {
    if (canProceedFromStep(3)) {
      router.push('/onboarding/step-4');
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step-2');
  };

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="font-headline-lg text-on-surface mb-3 md:text-display-lg">
          Activity Level
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto">
          How much do you move on an average day? This helps us determine your daily energy expenditure.
        </p>
      </div>

      <div className="max-w-md mx-auto flex flex-col gap-6">
        <Select
          label="Daily Activity Level"
          value={state.activityLevel || ''}
          onChange={(e) => updateState({ activityLevel: e.target.value as ActivityLevel })}
          options={[
            { label: 'Sedentary (Desk job, little to no exercise)', value: 'sedentary' },
            { label: 'Lightly Active (Light exercise 1-3 days/week)', value: 'lightly_active' },
            { label: 'Moderately Active (Moderate exercise 3-5 days/week)', value: 'moderately_active' },
            { label: 'Very Active (Heavy exercise 6-7 days/week)', value: 'very_active' },
          ]}
        />
        
        <Select
          label="Exercise Frequency"
          value={state.exerciseFrequency || ''}
          onChange={(e) => updateState({ exerciseFrequency: e.target.value as any })}
          options={[
            { label: 'None', value: 'none' },
            { label: '1-2 days per week', value: '1-2' },
            { label: '3-4 days per week', value: '3-4' },
            { label: '5-7 days per week', value: '5-7' },
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
            onClick={handleContinue}
            disabled={!canProceedFromStep(3)}
            className={`bg-primary text-white text-label-md px-10 py-4 rounded-full tactile-button flex items-center gap-2 shadow-lg transition-all ${
              canProceedFromStep(3)
                ? 'hover:bg-primary-container hover:scale-105'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Continue
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </footer>
    </>
  );
}
