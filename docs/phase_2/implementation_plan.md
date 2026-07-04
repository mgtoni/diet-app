# Phase 2: Food Data and Diary Implementation

This phase implements the core food logging loop and the data structures that support it, including the integration with external food databases and the UI for the main application.

## User Review Required

> [!IMPORTANT]
> The database migrations in this phase will create over a dozen tables. Please review the schema plan to ensure it matches your expectations.

## Open Questions

> [!WARNING]
> 1. **Search Engine Setup**: GEMINI.md mentions implementing Typesense or Meilisearch in Phase 2. Should we set up a local instance using Docker for development, or integrate with a hosted Typesense/Meilisearch cloud service? Or should we initially implement a simple Postgres search and migrate to Typesense in a later iteration of Phase 2?
> 2. **Offline-first state management**: The architecture specifies offline-capable state sync. Should we use `React Query` combined with `IndexedDB` (e.g. `idb-keyval` or `localforage`) or adopt a specific local-first sync engine like `PowerSync` or `WatermelonDB`?
> 3. **Barcode Scanning**: For the web app, do you have a preferred library for accessing the device camera and scanning barcodes (e.g., `react-zxing` or `html5-qrcode`)?

## Proposed Changes

### Supabase Migrations
#### [NEW] [20260703000000_food_diary_schema.sql](file:///c:/Users/Toni/Documents/AI%20Projects/Diet%20app/supabase/migrations/20260703000000_food_diary_schema.sql)
- Create `foods`, `food_sources`, `food_names`, `food_nutrients`, `nutrients`, `serving_sizes` tables.
- Create `diary_entries`, `diary_items` tables.
- Create `saved_meals`, `saved_meal_items`, `meal_templates` tables.
- Create `recipes`, `recipe_ingredients`, `recipe_nutrition` tables.
- Create `weight_logs`, `body_measurements` tables.
- Add Row Level Security (RLS) policies for all tables.

### Next.js API Routes (Backend)
#### [NEW] [apps/web/src/app/api/foods/search/route.ts](file:///c:/Users/Toni/Documents/AI%20Projects/Diet%20app/apps/web/src/app/api/foods/search/route.ts)
- Endpoints for food text search.
#### [NEW] [apps/web/src/app/api/foods/barcode/[barcode]/route.ts](file:///c:/Users/Toni/Documents/AI%20Projects/Diet%20app/apps/web/src/app/api/foods/barcode/[barcode]/route.ts)
- Endpoint for barcode lookup via Open Food Facts.
#### [NEW] [apps/web/src/app/api/diary/[date]/route.ts](file:///c:/Users/Toni/Documents/AI%20Projects/Diet%20app/apps/web/src/app/api/diary/[date]/route.ts)
- Endpoints to fetch and update daily diary entries.
#### [NEW] [apps/web/src/app/api/dashboard/route.ts](file:///c:/Users/Toni/Documents/AI%20Projects/Diet%20app/apps/web/src/app/api/dashboard/route.ts)
- Aggregate user metrics and daily nutrition totals.

### Frontend Data Access & Services
#### [NEW] [packages/core/src/services/FoodService.ts](file:///c:/Users/Toni/Documents/AI%20Projects/Diet%20app/packages/core/src/services/FoodService.ts)
- Implement `FoodDataAdapter` interface for Open Food Facts.
#### [NEW] [packages/core/src/services/DiaryService.ts](file:///c:/Users/Toni/Documents/AI%20Projects/Diet%20app/packages/core/src/services/DiaryService.ts)
- Logic for logging items, managing meal slots.

### UI Components & Pages (Frontend)
#### [NEW] [apps/web/src/app/(main)/dashboard/page.tsx](file:///c:/Users/Toni/Documents/AI%20Projects/Diet%20app/apps/web/src/app/(main)/dashboard/page.tsx)
- Dashboard with Nutrition Score, Diet Quality Score, Calorie Progress, Macro Balance.
#### [NEW] [apps/web/src/app/(main)/diary/page.tsx](file:///c:/Users/Toni/Documents/AI%20Projects/Diet%20app/apps/web/src/app/(main)/diary/page.tsx)
- Food diary organized by meal slots (Breakfast, Lunch, Dinner, Snacks).
#### [NEW] [apps/web/src/components/food-search/FoodSearch.tsx](file:///c:/Users/Toni/Documents/AI%20Projects/Diet%20app/apps/web/src/components/food-search/FoodSearch.tsx)
- Search bar, search results, and "quick add" components.
#### [NEW] [apps/web/src/components/food-search/BarcodeScanner.tsx](file:///c:/Users/Toni/Documents/AI%20Projects/Diet%20app/apps/web/src/components/food-search/BarcodeScanner.tsx)
- Barcode scanner modal component.

## Verification Plan

### Automated Tests
- Write Vitest unit tests in `packages/core` for `FoodService` logic (parsing Open Food Facts data).
- Write Vitest tests for calculating daily macro/calorie aggregates for a given diary entry.

### Manual Verification
- Apply Supabase migrations and verify tables and RLS using Supabase studio.
- Navigate to the Dashboard, verify it loads safely.
- Open the Food Diary, search for a food (mocking/calling Open Food Facts), and add it to the diary.
- Verify that adding a food correctly updates the daily macros and calorie goals on the dashboard.
