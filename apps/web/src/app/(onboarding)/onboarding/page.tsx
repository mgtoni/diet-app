'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { TactileButton } from '@/components/ui/TactileButton';
import { useOnboarding } from '@/context/OnboardingContext';
import { PrimaryGoal } from '@diet-app/core/src/nutritionEngine';

const GOALS = [
  {
    id: 'lose_weight',
    title: 'Lose weight',
    description: 'Sustainable fat loss with smart nutritional guidance.',
    iconName: 'monitor_weight',
    iconColorClass: 'bg-primary-fixed text-primary',
    hoverColorClass: 'group-hover:text-primary',
  },
  {
    id: 'gain_weight',
    title: 'Gain weight',
    description: 'Increase mass effectively through calorie-dense whole foods.',
    iconName: 'fitness_center',
    iconColorClass: 'bg-secondary-fixed text-secondary',
    hoverColorClass: 'group-hover:text-secondary',
  },
  {
    id: 'build_muscle',
    title: 'Build muscle',
    description: 'Optimize protein intake and macro ratios for strength.',
    iconName: 'exercise',
    iconColorClass: 'bg-tertiary-fixed text-tertiary',
    hoverColorClass: 'group-hover:text-tertiary',
  },
  {
    id: 'eat_healthier',
    title: 'Eat healthier',
    description: 'Focus on micronutrients, variety, and mindful eating habits.',
    iconName: 'eco',
    iconColorClass: 'bg-primary-fixed-dim text-primary',
    hoverColorClass: 'group-hover:text-primary',
  },
  {
    id: 'manage_health',
    title: 'Manage health',
    description: 'Track specific conditions like diabetes or heart health.',
    iconName: 'medical_services',
    iconColorClass: 'bg-error-container text-error',
    hoverColorClass: 'group-hover:text-error',
  },
  {
    id: 'maintain',
    title: 'Maintain',
    description: 'Keep your current physique while refining your nutrition.',
    iconName: 'balance',
    iconColorClass: 'bg-surface-variant text-on-surface-variant',
    hoverColorClass: 'group-hover:text-on-surface-variant',
  },
];

export default function OnboardingGoalPage() {
  const router = useRouter();
  const { state, updateState } = useOnboarding();
  const selectedGoal = state.goal;
  
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthChecking(false);
      } else {
        // If no session, wait a bit for PKCE exchange or redirect
        const timer = setTimeout(() => {
           setAuthChecking(false);
           // We could redirect to /register here, but for now just let it render or show an error
        }, 2000);
        return () => clearTimeout(timer);
      }
    });

    // Listen for auth state changes (e.g., magic link code exchange completion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setAuthChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-on-surface-variant">Authenticating securely...</p>
      </div>
    );
  }

  const handleContinue = () => {
    if (selectedGoal) {
      router.push('/onboarding/step-2');
    }
  };

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="font-headline-lg text-on-surface mb-3 md:text-display-lg">
          What is your primary goal?
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto">
          We&apos;ll tailor your experience and AI coaching based on your selection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {GOALS.map((goal) => (
          <TactileButton
            key={goal.id}
            title={goal.title}
            description={goal.description}
            iconName={goal.iconName}
            iconColorClass={goal.iconColorClass}
            hoverColorClass={goal.hoverColorClass}
            selected={selectedGoal === goal.id}
            onClick={() => {
              updateState({ goal: goal.id as PrimaryGoal });
              router.push('/onboarding/step-2');
            }}
          />
        ))}
      </div>
    </>
  );
}
