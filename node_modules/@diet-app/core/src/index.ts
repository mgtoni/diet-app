export * from './nutritionEngine';
export * from './onboarding';

export { FoodService } from './services/FoodService';
export type { Food, FoodDataAdapter } from './services/FoodTypes';

export { DiaryService } from './services/DiaryService';
export type { DiaryEntry, DiaryItem } from './services/DiaryService';

export { scoringService, ScoringService } from './services/ScoringService';
export type { DailyTargets, ScoreBreakdown, DietQualityBreakdown } from './services/ScoringService';

export { healthRuleEngine, HealthRuleEngine } from './services/HealthRuleEngine';
export type { HealthRule, RuleEvaluationResult, SeverityLevel } from './services/HealthRuleEngine';

export { recommendationEngine, RecommendationEngine } from './services/RecommendationEngine';
export type { SwapSuggestion, MealSuggestion } from './services/RecommendationEngine';

export { featureFlagService, FeatureFlagService } from './services/FeatureFlagService';
export type { FeatureFlag } from './services/FeatureFlagService';

export { aiCoachService, AICoachService } from './services/AICoachService';
export type { AIProvider, NutritionContext, AIRecommendation, AIPrompt } from './services/AIProvider';
