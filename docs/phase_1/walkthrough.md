# Phase 1: Architecture and Infrastructure Walkthrough

I have successfully completed the initial scaffolding for Phase 1 of the AI Nutrition Platform.

## 🏗️ Monorepo Structure

We established an `npm workspaces` monorepo configuration containing both the applications and the shared core logic:

- `apps/web`: Next.js web application initialized with Tailwind CSS, TypeScript, and ESLint.
- `apps/mobile`: React Native application initialized with Expo (blank-typescript template).
- `packages/core`: Contains the domain models and deterministic `NutritionEngine`.
- `packages/db`: A stub for shared database logic.

## 📊 Database Architecture

I initialized a local Supabase configuration and created the first major SQL migration file containing the core database schema. The schema is fully compliant with the specification:

- `profiles`, `goals`, `health_conditions`, `dietary_preferences`, `allergies`, and `onboarding_state` tables are created with `organisation_id` and `team_id` columns to support future B2B features.
- Row Level Security (RLS) is fully enabled for all user tables, ensuring strict multi-tenant isolation. 

> [!WARNING]
> While `npx supabase start` was attempted, Docker Desktop is not installed on this system. You will need to install Docker Desktop to run the local Supabase environment.

## 🧮 Core Domain Logic

The `NutritionEngine` has been scaffolded in `packages/core/src/nutritionEngine.ts`. It includes:
- **BMR Calculation** using the Mifflin-St Jeor formula based on biological sex.
- **TDEE Modifiers** based on the 4 activity levels.
- **Calorie Targets** calculated dynamically based on the user's primary goal (e.g., losing weight fast decreases target by 35% of BMR), applying minimum safety floors (1500 kcal for men, 1200 kcal for women).
- **Macro Distribution** percentages tailored to the chosen goal (weight loss, weight gain, muscle building).

## 🌍 Environments & CI/CD

- Created `.env.example` to define required environment variables for Supabase and AI Keys.
- Set up a GitHub Actions workflow stub (`.github/workflows/ci.yml`) to typecheck the `core` package and build the Next.js `web` application on Pull Requests to `main`.

---

The foundation is now ready. We are prepared to proceed with Phase 2 (Food Data and Diary) or finalize the frontend UI for the onboarding wizard in Phase 1!
