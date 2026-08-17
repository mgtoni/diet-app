# Phase 3: Scoring, Rules, and Recommendations

With Phase 2 complete (Food Data, Diary UI, and external integrations), we are now ready to tackle Phase 3. The goal of Phase 3 is to transform the app from a simple calorie tracker into a smart, opinionated nutrition platform by implementing deterministic scoring and rule-based insights.

This forms the critical "Layer 2 (Nutrition Engine)" and "Layer 3 (Recommendation Engine)" architecture that the AI Coach will eventually consume in Phase 4.

## Proposed Changes

---

### ScoringService
We will build `@diet-app/core/ScoringService.ts` to calculate two essential metrics:

#### [NEW] `packages/core/src/services/ScoringService.ts`
- **Nutrition Score (0-100):** A daily score available to all users. 
  - Calorie Adherence (50 points)
  - Macro Balance (50 points)
  - Rolling averages (7-day and 30-day calculations).
- **Diet Quality Score (0-100):** A premium score weighting five components.
  - Fibre intake (20 points)
  - Micronutrient coverage (30 points)
  - Food variety (20 points - based on the Food Variety Taxonomy)
  - Processed food ratio (20 points)
  - Macro balance (10 points)

#### [NEW] `packages/core/src/services/FoodVarietyTaxonomy.ts`
- Hardcode the static taxonomy array (Leafy greens, Cruciferous vegetables, Root vegetables, etc.) to evaluate the 7-day rolling variety score.

---

### HealthRuleEngine
We need to handle medical conditions and dietary preferences without hardcoding them into the main service layer.

#### [NEW] `supabase/migrations/[timestamp]_health_rules.sql`
- Create DB tables: `health_conditions`, `health_rules`, and user mappings (`user_health_conditions`).
- Define columns for condition severity, restricted categories, flagged ingredients, preferred/restricted nutrients, and calorie/macro modifiers.

#### [NEW] `packages/core/src/services/HealthRuleEngine.ts`
- Fetches active rules for the user at runtime.
- Evaluates a daily diary entry and returns a list of warnings or target overrides (e.g. "Caffeine inhibits iron absorption").

---

### RecommendationEngine
Rule-based logic to surface insights before AI is even involved.

#### [NEW] `packages/core/src/services/RecommendationEngine.ts`
- Analyzes remaining calories/macros for the day.
- Analyzes recently logged foods and cross-references with the `HealthRuleEngine`.
- Generates structured, deterministic suggestions (e.g., "You are low on protein, here is a high-protein dinner suggestion").

---

### Next.js API & UI Integration

#### [NEW] `apps/web/src/app/api/scores/route.ts`
- Expose the calculated scores to the frontend.

#### [MODIFY] `apps/web/src/app/dashboard/page.tsx`
- Connect the SVG radial score components to the live `ScoringService` data.

#### [MODIFY] `apps/web/src/app/diary/page.tsx`
- Integrate `HealthRuleEngine` checks to display inline, non-intrusive warnings when a flagged food (e.g., Gluten for Coeliac) is logged.

## Open Questions

> [!IMPORTANT]
> **Health Rules DB vs Hardcoded Config:** Do you want to build the `health_rules` database schema and migration immediately, or should we start with a hardcoded config file for a few common conditions (e.g., Coeliac, Vegan, Keto) in this phase to prove out the logic before moving it to the DB?

> [!WARNING]
> **Processed Food Ratio:** Open Food Facts has a `nova_group` score (1-4) to determine the processing level. Since we are using Meilisearch and Open Food Facts, should we strictly rely on the NOVA group classification for the Processed Food Ratio score, or do you have custom heuristics in mind?

> [!TIP]
> **Diet Quality Breakdown:** The Diet Quality Score breakdown is a Premium feature. For this phase, do you want to implement the feature flag logic to hide the breakdown for free users, or just build the UI assuming premium access for now?

## Verification Plan

### Automated Tests
- Add comprehensive Vitest unit tests for `ScoringService.ts` to ensure edge cases (e.g., 0 calories logged, extreme macro imbalances) gracefully return a score of 0 instead of crashing.
- Test `HealthRuleEngine` rule evaluation logic.

### Manual Verification
- Log a highly processed, unbalanced meal in the UI and verify that the Nutrition Score and Diet Quality Score plummet.
- Enable a "Gluten Intolerance" rule for the local user, log "Bread", and verify the inline warning appears in the Diary UI without blocking the log event.
