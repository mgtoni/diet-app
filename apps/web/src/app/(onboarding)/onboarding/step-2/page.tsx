'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { BiologicalSex } from '@diet-app/core/src/nutritionEngine';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function OnboardingBodyMetricsPage() {
  const router = useRouter();
  const { state, updateState, canProceedFromStep } = useOnboarding();
  
  const [system, setSystem] = useState<'metric' | 'imperial'>('metric');
  
  // Local state for imperial inputs to avoid rounding jitter
  const [feet, setFeet] = useState<string>('');
  const [inches, setInches] = useState<string>('');
  const [lbs, setLbs] = useState<string>('');

  useEffect(() => {
    // Populate local imperial state if navigating back
    if (state.heightCm && !feet && !inches) {
      const totalInches = state.heightCm / 2.54;
      setFeet(Math.floor(totalInches / 12).toString());
      setInches(Math.round(totalInches % 12).toString());
    }
    if (state.weightKg && !lbs) {
      setLbs(Math.round(state.weightKg / 0.453592).toString());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImperialHeightChange = (f: string, i: string) => {
    setFeet(f);
    setInches(i);
    const totalInches = (Number(f) || 0) * 12 + (Number(i) || 0);
    if (totalInches > 0) {
      updateState({ heightCm: totalInches * 2.54 });
    } else {
      updateState({ heightCm: undefined });
    }
  };

  const handleImperialWeightChange = (w: string) => {
    setLbs(w);
    if (Number(w) > 0) {
      updateState({ weightKg: Number(w) * 0.453592 });
    } else {
      updateState({ weightKg: undefined });
    }
  };

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
          We use this information to calculate your personalized metabolic profile. You must be 18 or older to use this app.
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
          label="Age"
          type="number"
          placeholder="Must be 18 or older"
          value={state.age || ''}
          onChange={(e) => updateState({ age: Number(e.target.value) || undefined })}
          error={state.age && state.age < 18 ? "You must be 18 or older" : ""}
        />

        <div className="flex gap-4 p-1 bg-surface-container-high rounded-xl">
          <button
            className={`flex-1 py-2 rounded-lg text-label-md transition-all ${system === 'metric' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant'}`}
            onClick={() => setSystem('metric')}
          >
            Metric
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-label-md transition-all ${system === 'imperial' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant'}`}
            onClick={() => setSystem('imperial')}
          >
            Imperial
          </button>
        </div>

        {system === 'metric' ? (
          <>
            <Input
              label="Height (cm)"
              type="number"
              placeholder="e.g. 175"
              value={state.heightCm ? Math.round(state.heightCm) : ''}
              onChange={(e) => updateState({ heightCm: Number(e.target.value) || undefined })}
            />
            <Input
              label="Weight (kg)"
              type="number"
              placeholder="e.g. 70"
              value={state.weightKg ? Math.round(state.weightKg) : ''}
              onChange={(e) => updateState({ weightKg: Number(e.target.value) || undefined })}
            />
          </>
        ) : (
          <>
            <div className="flex gap-4">
              <Input
                label="Feet"
                type="number"
                placeholder="ft"
                className="flex-1"
                value={feet}
                onChange={(e) => handleImperialHeightChange(e.target.value, inches)}
              />
              <Input
                label="Inches"
                type="number"
                placeholder="in"
                className="flex-1"
                value={inches}
                onChange={(e) => handleImperialHeightChange(feet, e.target.value)}
              />
            </div>
            <Input
              label="Weight (lbs)"
              type="number"
              placeholder="e.g. 150"
              value={lbs}
              onChange={(e) => handleImperialWeightChange(e.target.value)}
            />
          </>
        )}
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
