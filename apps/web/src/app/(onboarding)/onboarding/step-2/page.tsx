'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { BiologicalSex } from '@diet-app/core/src/nutritionEngine';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function OnboardingBodyMetricsPage() {
  const router = useRouter();
  const { state, updateState, canProceedFromStep } = useOnboarding();

  const handleContinue = () => {
    if (canProceedFromStep(2)) {
      router.push('/onboarding/step-3');
    }
  };

  const handleBack = () => {
    router.push('/onboarding');
  };

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="font-headline-lg text-on-surface mb-3 md:text-display-lg">
          Tell us about yourself
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto">
          We use this information to calculate your personalized metabolic profile.
        </p>
      </div>

      <div className="max-w-md mx-auto flex flex-col gap-6">
        <Select
          label="Biological Sex"
          value={state.biologicalSex || ''}
          onChange={(e) => updateState({ biologicalSex: e.target.value as BiologicalSex })}
          options={[
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ]}
        />
        
        <Input
          label="Date of Birth"
          type="date"
          value={state.dateOfBirth || ''}
          onChange={(e) => updateState({ dateOfBirth: e.target.value })}
        />

        <Input
          label="Height (cm)"
          type="number"
          placeholder="e.g. 175"
          value={state.heightCm || ''}
          onChange={(e) => updateState({ heightCm: Number(e.target.value) || undefined })}
        />

        <Input
          label="Weight (kg)"
          type="number"
          placeholder="e.g. 70"
          value={state.weightKg || ''}
          onChange={(e) => updateState({ weightKg: Number(e.target.value) || undefined })}
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
            disabled={!canProceedFromStep(2)}
            className={`bg-primary text-white text-label-md px-10 py-4 rounded-full tactile-button flex items-center gap-2 shadow-lg transition-all ${
              canProceedFromStep(2)
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
