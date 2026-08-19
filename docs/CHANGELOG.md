# Project Changelog & Milestones

This document tracks all major features, architectural decisions, and milestones achieved across chat sessions.
**AI Agents MUST review this file at the start of a session** to understand the current state of the platform.

## August 17, 2026 - Phase 3 (Scoring & Rules) Completion
**Status:** Completed

- **ScoringService:** Implemented Nutrition Score and Diet Quality Score calculators, fully unit tested.
- **HealthRuleEngine:** Implemented rule-based condition checks with a supporting Supabase migration (`health_rules`).
- **RecommendationEngine:** Implemented swap and meal suggestion logic.
- **UI Integration:** Integrated live mock scores into `/dashboard` and non-blocking health warnings into the `/diary` UI.

## August 5, 2026 - Global Food Data Ingestion Pipeline
**Status:** Completed & Deployed

- **Architecture Rules Applied:** Implemented strict guidelines from `SKILL.md` for handling external food databases.
- **The Quality Waterfall:** 
  - Refactored `@diet-app/core/FoodService.ts` to implement a strict fallback sequence:
    1. Local Supabase Cache
    2. Regional Meilisearch Government Indices (`en-US`, `en-GB`, etc.)
    3. Open Food Facts API (Fallback)
  - Implemented a **Macro Math Filter** that discards any food item if `(protein*4 + carbs*4 + fat*9)` deviates by more than 15% from the stated calories to ensure scientific data integrity.
- **API Routing:** 
  - Updated `apps/web/src/app/api/foods/search/route.ts` to automatically detect the device locale via the `Accept-Language` header and route searches to the correct regional Meilisearch index.
- **Automated Database Sync:** 
  - Built a Next.js POST API route at `api/webhooks/supabase/route.ts`.
  - Created a native PostgreSQL trigger using `pg_net` directly on the Supabase `foods` table.
  - *Result:* Anytime a new, valid item is fetched from Open Food Facts and inserted into Supabase, the trigger automatically fires an HTTP POST request to Vercel, syncing the record into Meilisearch for ultra-fast subsequent lookups.

## August 19, 2026 - AI Coach Integration & Dashboard Enhancements
**Status:** Completed

- **AI Abstraction Layer:** Implemented AIProvider interface and AICoachService for agnostic LLM integration.
- **Mock AI Provider:** Added MockAIProvider for testing daily and weekly insights without API keys.
- **Dashboard UI:** Expanded dashboard to show Metabolic Profile (goal, activity level, dietary preferences). Added Daily and Weekly AI Insight cards.
- **Premium Hooks:** Implemented UI blurring and upsell calls-to-action on AI insights for free-tier users.
- **Schema Updates:** Added ctivity_level and pregnancy_status to profiles, and created i_insights table for caching AI outputs.
- **Dynamic Scoring:** Updated ScoringService to conditionally override Diet Quality Score penalties based on user's dietary preferences (e.g. Keto, Vegan).
