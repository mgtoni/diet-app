'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TactileButton } from '@/components/ui/TactileButton';

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
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (selectedGoal) {
      // Navigate to the next step, for example:
      // router.push('/onboarding/body-metrics');
      console.log('Selected Goal:', selectedGoal);
    }
  };

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="font-headline-lg text-on-surface mb-3 md:text-display-lg">
          What is your primary goal?
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto">
          We'll tailor your experience and AI coaching based on your selection.
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
            onClick={() => setSelectedGoal(goal.id)}
          />
        ))}
      </div>

      {/* Fixed Footer Controls */}
      <footer className="fixed bottom-0 left-0 w-full p-6 md:px-container-padding md:py-8 border-t border-surface-variant/50 z-50 bg-surface">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <button className="flex items-center gap-2 text-on-surface-variant text-label-md hover:text-primary transition-all px-4 py-2 rounded-xl">
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
          
          <div className="flex items-center gap-6">
            <p className="hidden md:block text-caption text-on-surface-variant italic">
              Tip: You can change your goal later in settings.
            </p>
            <button
              onClick={handleContinue}
              disabled={!selectedGoal}
              className={`bg-primary text-white text-label-md px-10 py-4 rounded-full tactile-button flex items-center gap-2 shadow-lg transition-all ${
                selectedGoal
                  ? 'hover:bg-primary-container hover:scale-105'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Continue
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
