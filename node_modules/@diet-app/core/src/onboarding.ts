import { BiologicalSex, ActivityLevel, PrimaryGoal } from './nutritionEngine';

export interface OnboardingState {
  userId: string;
  stepCompleted: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
  
  // Accumulated data during the wizard
  goal?: PrimaryGoal;
  
  // Metrics
  biologicalSex?: BiologicalSex;
  dateOfBirth?: string;
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  pace?: 'slow' | 'moderate' | 'fast';
  waistCm?: number;
  hipCm?: number;
  bodyFatPct?: number;
  
  // Activity
  activityLevel?: ActivityLevel;
  exerciseFrequency?: 'none' | '1-2' | '3-4' | '5-7';
  exerciseTypes?: string[]; // cardio, strength, hiit, etc.
  
  // Preferences & Restrictions
  dietaryPreferences?: string[]; // vegetarian, vegan, keto, etc.
  healthConditions?: string[]; // none, coeliac, diabetes, etc.
  allergies?: string[]; // nuts, dairy, gluten, etc.
  intermittentFastingWindowStart?: string; // '12:00'
  intermittentFastingWindowEnd?: string; // '20:00'
  
  // Unit Preferences
  weightUnit?: 'kg' | 'lbs';
  heightUnit?: 'cm' | 'ft_in';
  energyUnit?: 'kcal' | 'kJ';
}

export class OnboardingService {
  /**
   * Helper to determine if the user can proceed to the next step based on validation rules
   */
  public static canProceedFromStep(step: number, state: Partial<OnboardingState>): boolean {
    switch(step) {
      case 1: // Goal Selection
        return !!state.goal;
      case 2: // Body Metrics
        return !!state.biologicalSex && !!state.dateOfBirth && !!state.heightCm && !!state.weightKg;
      case 3: // Activity
        return !!state.activityLevel && !!state.exerciseFrequency;
      case 4: // Diet & Conditions
        // Usually these can be empty arrays or 'None'
        return true;
      case 5: // Units
        return !!state.weightUnit && !!state.heightUnit && !!state.energyUnit;
      case 6: // Upsell (Tasteful)
        return true;
      default:
        return false;
    }
  }
}
