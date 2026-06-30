# Phase 1 Execution Checklist

- `[/]` 1. Project Scaffolding
  - `[x]` Initialize root `package.json` with workspaces
  - `[x]` Scaffold `apps/web` (Next.js)
  - `[x]` Scaffold `apps/mobile` (React Native Expo)
  - `[x]` Scaffold `packages/core` and `packages/db`
- `[/]` 2. Supabase & Database Architecture
  - `[x]` Initialize Supabase locally
  - `[x]` Create initial SQL migrations for core tables (Profiles, Foods, Diary, etc.)
  - `[x]` Define RLS policies
- `[x]` 3. Core Domain Logic
  - `[x]` Scaffold `NutritionEngine` calculations (BMR, TDEE, Macros)
- `[x]` 4. Authentication & Onboarding
  - `[x]` Setup Supabase auth stubs
  - `[x]` Define Onboarding Wizard state types
- `[x]` 5. Environments & CI/CD
  - `[x]` Define environment variables
  - `[x]` Create CI workflow stubs
