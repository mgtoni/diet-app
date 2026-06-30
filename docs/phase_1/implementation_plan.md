# Phase 1 Implementation Plan: Architecture and Infrastructure

This document outlines the architecture and implementation strategy for Phase 1 of the AI Nutrition Platform, based on the requirements in `GEMINI.md`. 

## User Review Required

> [!IMPORTANT]
> Please review the proposed monorepo structure and database schema. Once approved, I will proceed with scaffolding the project.

## Open Questions

> [!WARNING]
> 1. **CI/CD Provider:** The specification mentions Dev, Staging, and Prod CI/CD environments. Should we plan for GitHub Actions for CI and Vercel for the Next.js frontend deployment?
> 2. **Shared UI Library:** The web app will use Tailwind CSS. Should we use a specific component library (like shadcn/ui) for the Next.js app to speed up development while maintaining high aesthetics?
> 3. **Package Manager:** The system has npm v8 installed. Are you comfortable using standard npm workspaces for the monorepo, or would you prefer upgrading/using pnpm or bun?

## Proposed Changes

### Monorepo Structure

We will use npm workspaces to create a unified monorepo for the web and mobile applications, sharing core logic and database schemas.

```text
/
├── apps/
│   ├── web/               # Next.js web application (React, TS, Tailwind)
│   └── mobile/            # React Native mobile application (Expo)
├── packages/
│   ├── core/              # Shared logic (NutritionEngine, types, domain models, health rules)
│   ├── db/                # Supabase local configuration, SQL migrations, RLS policies
│   ├── config/            # Shared ESLint, TypeScript, and Tailwind configurations
│   └── ui/                # (Optional) Shared UI components and design tokens
├── package.json           # Root workspace configuration
└── supabase/              # Supabase CLI configuration and local development environment
```

---

### 1. Project Scaffolding
- Initialize the root `package.json` with npm workspaces.
- Scaffold `apps/web` using `npx create-next-app@latest`.
- Scaffold `apps/mobile` using `npx create-expo-app@latest`.
- Scaffold `packages/core` and `packages/db` with basic TypeScript configurations.

### 2. Supabase & Database Architecture
- Initialize Supabase locally using `npx supabase init`.
- Create the initial SQL migration files in `supabase/migrations/` covering the core tables requested in the specification, including:
  - **Auth & Profiles:** `profiles`, `goals`, `health_conditions`, `dietary_preferences`, `allergies`, `onboarding_state`.
  - **Food & Recipes:** `foods`, `food_names`, `food_nutrients`, `nutrients`, `recipes`, etc.
  - **Diary & Tracking:** `diary_entries`, `diary_items`, `weight_logs`, `body_measurements`.
  - **Nutrition & AI:** `nutrition_targets`, `nutrition_scores`, AI summary tables, `ai_prompt_templates`.
  - **System:** `feature_flags`, `audit_logs`, `settings`, `analytics_events`.
- Apply strict Row Level Security (RLS) policies to ensure multi-tenant readiness (using `organisation_id` and `team_id` where applicable).

### 3. Core Domain Logic (`packages/core`)
- Implement the `NutritionEngine` with pure deterministic calculations:
  - BMR (Mifflin-St Jeor)
  - TDEE with activity multipliers
  - Calorie and macro target calculators based on user goals
- Define TypeScript interfaces for shared domain models.

### 4. Authentication & Onboarding
- Configure Supabase Auth in the Next.js app.
- Build the multi-step Onboarding Wizard state machine.

### 5. Environments & CI/CD
- Define environment variables for Development, Staging, and Production (`.env.local`, `.env.staging`, `.env.production`).
- Setup CI/CD workflow stubs (e.g., GitHub Actions) to run tests and type checks.

## Verification Plan

### Automated Tests
- Run `npm run typecheck` across all workspaces.
- Write and run unit tests (using Vitest) for the deterministic `NutritionEngine` to verify TDEE, BMR, and macro calculations match the specification exactly.

### Manual Verification
- Verify that `npx supabase start` successfully brings up the local database with all migrations applied.
- Run `npm run dev` to verify the Next.js app and Expo app start successfully.
- Verify the Onboarding wizard flow works end-to-end and writes to the local Supabase instance.
