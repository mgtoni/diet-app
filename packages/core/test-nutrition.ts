import { NutritionEngine, UserMetrics } from './src/nutritionEngine';

const metrics: UserMetrics = {
  weightKg: 80,
  heightCm: 180,
  age: 30,
  sex: 'male',
  activityLevel: 'sedentary',
  goal: 'lose_weight_fast',
};

const targets = NutritionEngine.calculateTargets(metrics);
console.log('Targets for 80kg, 180cm, 30yo, male, sedentary, lose_weight_fast:');
console.log(targets);

const femaleMetrics: UserMetrics = {
  weightKg: 50,
  heightCm: 150,
  age: 25,
  sex: 'female',
  activityLevel: 'moderately_active',
  goal: 'lose_weight_fast',
};

const femaleTargets = NutritionEngine.calculateTargets(femaleMetrics);
console.log('\nTargets for 50kg, 150cm, 25yo, female, moderately_active, lose_weight_fast (checking floor):');
console.log(femaleTargets);
