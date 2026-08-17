export type FeatureFlag = 
  | 'premium_diet_quality_breakdown'
  | 'premium_voice_logging'
  | 'premium_ai_vision'
  | 'premium_daily_review'
  | 'premium_meal_planning';

export class FeatureFlagService {
  /**
   * Evaluates whether a user has access to a specific premium feature.
   * During development, this is hardcoded to true for all premium features.
   * In production, this will query the user's subscription status from the database.
   */
  async hasAccess(userId: string, feature: FeatureFlag): Promise<boolean> {
    // TODO: Phase X (Monetization) - Implement actual database check for user's tier.
    // Example:
    // const { data } = await supabase.from('subscriptions').select('tier').eq('user_id', userId).single();
    // return data.tier === 'premium';
    
    return true; // All features enabled during development
  }
}

export const featureFlagService = new FeatureFlagService();
