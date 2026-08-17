# Phase 3 Implementation Tasks

## Services & Core Logic
- `[x]` Create `FoodVarietyTaxonomy.ts` to hold taxonomy arrays for scoring.
- `[x]` Create `ScoringService.ts` for Nutrition Score and Diet Quality Score.
- `[x]` Create `HealthRuleEngine.ts` to evaluate user constraints against logged foods.
- `[x]` Create `RecommendationEngine.ts` for meal and swap suggestions.

## Database
- `[x]` Create Supabase migration for `health_conditions`, `health_rules`, and `user_health_conditions`.

## API Integration
- `[x]` Create API route `/api/scores/route.ts` to serve calculated scores.

## UI Integration
- `[x]` Integrate live scoring data into Dashboard (`/dashboard`).
- `[x]` Integrate `HealthRuleEngine` checks into Diary (`/diary`) to display non-blocking warnings.

## Testing & Verification
- `[x]` Add unit tests for `ScoringService`.
- `[x]` Verify health warnings in the UI.
