'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OnboardingState, OnboardingService } from '@diet-app/core/src/onboarding';

interface OnboardingContextProps {
  state: Partial<OnboardingState>;
  updateState: (updates: Partial<OnboardingState>) => void;
  canProceedFromStep: (step: number) => boolean;
}

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<Partial<OnboardingState>>({});

  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const canProceedFromStep = (step: number) => {
    return OnboardingService.canProceedFromStep(step, state);
  };

  return (
    <OnboardingContext.Provider value={{ state, updateState, canProceedFromStep }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
