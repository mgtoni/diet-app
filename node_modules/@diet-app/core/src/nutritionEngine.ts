export type BiologicalSex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type PrimaryGoal = 
  | 'lose_weight_slow' 
  | 'lose_weight_moderate' 
  | 'lose_weight_fast'
  | 'maintain'
  | 'gain_weight_slow'
  | 'gain_weight_moderate'
  | 'gain_muscle'
  | 'eat_healthier'
  | 'manage_condition';

export interface UserMetrics {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: BiologicalSex;
  activityLevel: ActivityLevel;
  goal: PrimaryGoal;
}

export interface NutritionTargets {
  calories: number;
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
}

export class NutritionEngine {
  private static readonly ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };

  private static readonly CALORIE_FLOORS: Record<BiologicalSex, number> = {
    male: 1500,
    female: 1200,
  };

  /**
   * Calculate BMR using Mifflin-St Jeor equation.
   */
  public static calculateBMR(weightKg: number, heightCm: number, age: number, sex: BiologicalSex): number {
    const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    return sex === 'male' ? base + 5 : base - 161;
  }

  /**
   * Calculate daily calorie target adjusted for goal and pace.
   */
  public static calculateTargets(metrics: UserMetrics): NutritionTargets {
    const bmr = this.calculateBMR(metrics.weightKg, metrics.heightCm, metrics.age, metrics.sex);
    const tdee = bmr * this.ACTIVITY_MULTIPLIERS[metrics.activityLevel];
    
    let calorieTarget = tdee;
    
    switch (metrics.goal) {
      case 'lose_weight_slow':
        calorieTarget = tdee - (bmr * 0.15);
        break;
      case 'lose_weight_moderate':
        calorieTarget = tdee - (bmr * 0.25);
        break;
      case 'lose_weight_fast':
        calorieTarget = tdee - (bmr * 0.35);
        break;
      case 'gain_weight_slow':
        calorieTarget = tdee + (bmr * 0.10);
        break;
      case 'gain_weight_moderate':
        calorieTarget = tdee + (bmr * 0.20);
        break;
      case 'gain_muscle':
        calorieTarget = tdee + (bmr * 0.15);
        break;
      case 'maintain':
      case 'eat_healthier':
      case 'manage_condition':
        calorieTarget = tdee;
        break;
    }

    // Apply minimum floors
    const floor = this.CALORIE_FLOORS[metrics.sex];
    if (calorieTarget < floor) {
      calorieTarget = floor;
    }

    // Determine macro splits
    let proteinPct = 0.25;
    let fatPct = 0.30;
    let carbsPct = 0.45;

    if (metrics.goal.startsWith('lose_weight')) {
      proteinPct = 0.30;
      fatPct = 0.30;
      carbsPct = 0.40;
    } else if (metrics.goal.startsWith('gain_weight')) {
      proteinPct = 0.25;
      fatPct = 0.25;
      carbsPct = 0.50;
    } else if (metrics.goal === 'gain_muscle') {
      proteinPct = 0.35;
      fatPct = 0.25;
      carbsPct = 0.40;
    }

    // Calculate grams (Protein/Carbs = 4 kcal/g, Fat = 9 kcal/g)
    const proteinGrams = Math.round((calorieTarget * proteinPct) / 4);
    const fatGrams = Math.round((calorieTarget * fatPct) / 9);
    const carbsGrams = Math.round((calorieTarget * carbsPct) / 4);

    return {
      calories: Math.round(calorieTarget),
      proteinGrams,
      fatGrams,
      carbsGrams,
    };
  }
}
