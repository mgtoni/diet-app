# Phase 1: Frontend Implementation (Onboarding & Dashboard)

We will build out the frontend for Phase 1 using the provided design system from `design_examples`, focusing on the Onboarding Wizard and the initial Dashboard view.

## User Review Required

> [!IMPORTANT]  
> The design relies on a comprehensive, Material You-inspired color palette and specific typographic rules. We will migrate these configurations into Tailwind CSS v4 format (via `@theme` directives in `globals.css`) so they are globally available across the Next.js app.

## Open Questions

> [!NOTE]
> 1. Should we mock the backend authentication/database layer for the UI development phase, or do you want me to wire the forms directly into Supabase immediately?
> 2. The `home_page.html` shows a sidebar for desktop and bottom nav for mobile. I will create a dedicated Layout component for this. Do you want this layout to apply to the entire app, excluding the Onboarding flow?

## Proposed Changes

### Global Configuration & Styling
We will inject the new branding into the Next.js foundation.

#### [MODIFY] apps/web/src/app/layout.tsx
- Inject Google Fonts: `Libre Caslon Text` (Headlines) and `Hanken Grotesk` (Body).
- Inject `Material Symbols Outlined` for icons.

#### [MODIFY] apps/web/src/app/globals.css
- Define the merged color palette from the design examples as Tailwind v4 CSS variables.
- Add specific utility classes defined in the examples (`.tactile-button`, `.smeg-shadow`, `.progress-bar-fill`).

### Shared Components
Create a shared UI library inside `apps/web/src/components/ui/`.

#### [NEW] apps/web/src/components/ui/TactileButton.tsx
- Button component with the custom hover/active micro-interactions and shadow logic.
#### [NEW] apps/web/src/components/ui/ProgressRing.tsx
- SVG-based circular gauge for the Nutrition Score.
#### [NEW] apps/web/src/components/ui/ProgressBar.tsx
- Linear progress bars for macros and onboarding steps.

### Onboarding Flow
Create the multi-step wizard.

#### [NEW] apps/web/src/app/onboarding/layout.tsx
- Clean layout with the top navigation and progress bar shown in `onboarding_goal_selection.html`.
#### [NEW] apps/web/src/app/onboarding/page.tsx
- The Goal Selection view.
#### [NEW] apps/web/src/app/onboarding/[step]/page.tsx
- Dynamic routes for Body Metrics, Activity, Preferences, and Unit settings matching the same aesthetic.

### Dashboard
Create the main application view based on `home_page.html`.

#### [NEW] apps/web/src/app/(app)/layout.tsx
- Standard authenticated layout featuring the Desktop Sidebar and Mobile Bottom Navigation.
#### [NEW] apps/web/src/app/(app)/dashboard/page.tsx
- The responsive grid layout with Nutrition Score, Calories, Macros, and AI Insight cards.

## Verification Plan

### Automated Tests
- Run `npm run typecheck` in the root to ensure strict TypeScript compliance.

### Manual Verification
- Start the development server and verify typography and the color palette apply correctly.
- Step through the UI on both mobile and desktop viewport sizes to ensure the flex/grid layouts respond correctly.
