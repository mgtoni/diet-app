# AI NUTRITION PLATFORM — FULL PRODUCT & TECHNICAL SPECIFICATION (FINAL)

## ROLE
You are acting as the CTO, Lead Software Architect, Product Manager, UX Designer, Database Architect and Senior Full Stack Engineer for this project. Your responsibility is NOT simply to generate code. Your responsibility is to design and build a production-ready SaaS-grade AI Nutrition Platform that is scalable, maintainable, secure and commercially viable. Always think like a startup CTO making technical decisions that should still be correct five years from now. Never optimise only for speed of development. Optimise for maintainability, scalability and extensibility. Whenever there are multiple possible implementations, choose the one most appropriate for a production SaaS product. Explain major architectural decisions. Always prefer modular architecture over tightly coupled implementations.

## PRODUCT VISION
Build an AI-powered nutrition platform whose mission is: "Help people make better nutritional decisions through intelligent analysis, personalised coaching and actionable recommendations."

Food logging is NOT the product. Food logging is simply the data collection layer. The AI Coach is the product. The application should feel like having a personal nutritionist available 24/7.

The first public release targets consumers. However, the architecture MUST be designed from day one so it can later support:
- Nutritionists
- Personal trainers
- Clinics
- Corporate wellness
- Teams
- Family accounts

Do NOT implement these business features yet. Only ensure the architecture supports them naturally. This means the database schema, API design, authentication layer and service boundaries must all be multi-tenant ready from day one. Use `organisation_id` and `team_id` foreign key columns in relevant tables even if they are nullable at launch. Design Row Level Security policies so they can be extended to organisation-scoped access without structural changes.

## PRODUCT PHILOSOPHY
Separate deterministic logic from AI. The Nutrition Engine performs calculations. The AI interprets those calculations. Never ask AI to calculate nutrition. Never ask AI to calculate calories. Never ask AI to estimate micronutrients if deterministic data exists. The AI exists only to analyse, explain, coach and recommend.

## PRIMARY USER EXPERIENCE
The application should not feel like a calorie tracker. It should feel like an AI Nutrition Coach. The homepage should be an AI Dashboard. Examples of dashboard components:
- Nutrition Score (simple, prominent)
- Diet Quality Score (secondary, contextual)
- Calories Remaining
- Protein Progress
- Macro Balance
- Micronutrient Summary
- Weight Trend
- Latest AI Insight
- Today's Recommendation
- Meals Logged
- Remaining Goals

The Food Diary is only one section of the application, accessible from the dashboard and the navigation. It is not the home screen.

## ONBOARDING FLOW
Onboarding is the most important sequence in the application. The AI Coach requires a complete user profile to be useful from day one. Onboarding must be completed before the user can access the main application. Design onboarding as a multi-step wizard with clear progress indication and the ability to go back at any step.

**Step 1 — Goal Selection**
Present the user with their primary goal. Options:
- Lose weight
- Gain weight
- Build muscle
- Eat healthier
- Manage a health condition
- Maintain current weight

Only one primary goal may be selected. This drives the default macro split and calorie target calculation.

**Step 2 — Body Metrics Collect:**
- Biological sex (Male / Female) — required for BMR calculation
- Date of birth — required for age-adjusted targets
- Height (cm or ft/in, user selects unit)
- Current weight (kg or lbs, user selects unit)
- Target weight (optional, shown only for weight loss and weight gain goals)
- Weight loss or gain pace (shown only when target weight is set): Slow (0.25kg/week) / Moderate (0.5kg/week) / Fast (0.75kg/week)
- Waist circumference (cm or inches, optional)
- Hip circumference (cm or inches, optional)
- Body fat percentage (optional, manual entry only)

**Step 3 — Activity Level & Exercise**
Explain that this step estimates daily calorie burn from general movement, and dedicated exercise will be captured separately.
Daily Activity Level: Choose the option that best describes a typical day (excluding structured workouts):
- Sedentary — Mostly sitting, desk job, little movement (multiplier: 1.2)
- Lightly Active — Some walking, light daily movement (multiplier: 1.375)
- Moderately Active — Regular walking, physically active job or daily movement (multiplier: 1.55)
- Very Active — Manual labour, very high daily movement (multiplier: 1.725)

Note: This multiplier is applied to BMR to produce TDEE. If the user later integrates a wearable device, this multiplier will be replaced by device-reported TDEE automatically.

Structured Exercise: How many times per week do you typically do dedicated exercise?
- None / rarely
- 1-2 times per week
- 3-4 times per week
- 5-7 times per week

What type of exercise? (multi-select)
- Cardio (running, cycling, swimming)
- Strength training
- HIIT
- Flexibility (yoga, pilates)
- Sports
- Walking
- Other

This data is stored for AI context and coaching, not for TDEE calculation.

**Step 4 — Dietary Preferences and Restrictions**
Present dietary preferences, health conditions and allergies simultaneously. Allow multiple selections.
Dietary preferences (multi-select):
- No restrictions
- Vegetarian
- Vegan
- Keto
- Paleo
- Mediterranean
- High Protein
- Low Carb
- Halal
- Kosher
- Intermittent Fasting (if selected, prompt for eating window: start and end times)

Health conditions (multi-select):
- None
- Coeliac Disease
- Gluten Intolerance
- Lactose Intolerance
- IBS
- Low FODMAP
- Diabetes
- Hypertension
- High Cholesterol
- Kidney Disease
- Gout

Allergies (multi-select):
- Nuts
- Peanuts
- Shellfish
- Fish
- Eggs
- Soya
- Dairy
- Gluten
- Sesame
- Sulphites

**Step 5 — Unit Preferences**
- Weight: kg / lbs
- Height: cm / ft & in
- Energy: kcal / kJ

**Step 6 — Premium Upsell (Tasteful)**
Show a single screen summarising what the AI Coach can do for them based on their stated goal. Do not use aggressive language. Do not use countdown timers or false urgency. Present it as an optional upgrade they can activate at any time. Include a clear "Continue with free plan" option as the primary action.

**Onboarding Completion**
On completion, the Nutrition Engine immediately calculates:
- BMR using Mifflin-St Jeor
- TDEE using the selected activity multiplier
- Calorie target adjusted for goal and pace
- Macro targets using goal-appropriate splits

The user lands on the AI Dashboard, which should immediately feel populated and useful even before any food has been logged.

## BUSINESS MODEL
Design the application around a freemium model with feature flags so tier definitions can be added later without code changes.

**Free Features:**
- Registration and authentication
- Full onboarding
- Barcode scanning
- Food search across all providers
- Manual food logging
- Recipes
- Saved meals
- Daily food diary
- Calories and macronutrients
- Micronutrients
- Charts and history
- Weight tracking
- Nutrition Score (simple — calorie and macro based)
- Diet Quality Score (the number only, no breakdown or recommendations)
- Basic reports
- Nutrition history

**Premium Features (gated via feature flags):**
All AI functionality plus score analysis:
- Full Diet Quality Score breakdown and improvement recommendations
- Meal analysis
- Voice-powered meal logging
- AI vision meal analysis (via camera/photo)
- Daily AI review
- Weekly AI review
- Monthly AI consultation
- AI Coach
- AI Chat
- Goal coaching
- Deficiency analysis
- Healthy food swaps
- Meal recommendations
- Shopping recommendations
- Personalised insights
- AI meal planning
- AI-generated reports
- Recipe import from URL (AI-powered)

Every premium feature must check the feature flag before executing. Locked features should be visible to free users with a tasteful upgrade prompt — never hidden entirely. To drive monetization, the AI should still generate "hooks" for free users. For example: "Your Diet Quality Score dropped today. Upgrade to Premium to see the 3 micronutrients you're missing and get a personalized grocery list."

## TECHNOLOGY STACK
Use as few technologies as possible. The architecture must seamlessly support native Android and iOS app development.
- **Frontend (Web):** Next.js (latest stable), React, TypeScript, Tailwind CSS.
- **Frontend (Mobile):** React Native with Expo (sharing logic/types with Next.js where possible).
- **State Management (Offline-First):** To achieve true offline capability, you need a robust client-side state manager (like React Query or local-first sync engines) that queues diary entries locally and synchronizes with Supabase when connectivity returns.
- **Backend:** Next.js Route Handlers and Server Actions.
- **Database:** PostgreSQL via Supabase.
- **Authentication:** Supabase Auth.
- **Storage:** Supabase Storage (for meal photos, exported reports, etc.).
- **Validation:** Zod.
- **Forms:** React Hook Form.
- **Charts:** Recharts.
- **Deployment:** Vercel.
- **Edge Protection:** Implement Redis (e.g., Upstash) for IP-based and User-ID-based rate limiting at the Next.js Edge to protect your AI provider budget from bot attacks.
- **Testing:** Vitest (unit and integration), Playwright (end-to-end).
- **Search:** Plan to implement Typesense or Meilisearch in Phase 2. The Open Food Facts database has over 3 million products. pg_trgm index size and query latency will degrade rapidly with a dataset this large, especially with mobile users expecting real-time keystroke search.

Use TypeScript everywhere. Avoid unnecessary dependencies. Every dependency added must be justified.

## DEVELOPMENT ENVIRONMENTS & MIGRATIONS
I will probably want a dev version of the app where i test new implementations before rolling out to production.
- **Environments:** Implement isolated Development, Staging, and Production environments.
- **Database Migrations:** Specify a strict migration strategy (e.g., using Prisma for schema management or Supabase local CLI migrations). Do not allow UI-based database changes in production.

## AI ARCHITECTURE
The platform MUST be AI-provider agnostic. Never couple business logic to a specific AI provider. Create an abstraction layer: AIProvider interface.

**AIProvider Interface Methods:**
- `generateStructuredResponse(prompt: AIPrompt): Promise`
- `streamResponse(prompt: AIPrompt): AsyncIterable`
- `generateSummary(context: NutritionContext): Promise`
- `generateRecommendations(context: NutritionContext): Promise<AIRecommendation[]>`
- `generateChatResponse(conversation: AIConversation): Promise`

**Implementations:**
- OpenAIProvider
- AnthropicProvider
- GoogleProvider
- MockProvider (for testing and development)

The application must interact only with AIProvider. Future providers require zero changes to application logic.

**AI Prompt Templates**
All prompts must be stored in the database as versioned templates. This allows prompt improvement without code deployments. Each template includes:
- Template name and purpose
- Version number
- System prompt
- User prompt structure
- Expected JSON output schema
- Provider compatibility flags

Prompts must be retrieved at runtime, not hardcoded. Create a PromptTemplateService that retrieves, renders and caches prompt templates.

**AI Cost Control**
LLM costs will scale linearly with user engagement. If a premium user logs 5 meals a day and asks the AI 10 questions, your OpenAI/Anthropic API costs will eat into your margins. You must heavily rely on the PromptTemplateService to inject only the necessary JSON context to keep token counts low.
Every AI endpoint must enforce rate limits per user tier:
- Free users: AI on-demand requests limited to 5 per day
- Premium users: unlimited on-demand requests
Automated daily, weekly and monthly summaries are generated server-side on a schedule and do not count against user limits.

## FOOD DATA
Support multiple providers in priority order:
1. User-created foods
2. Open Food Facts (primary — includes barcode lookup)
3. UK CoFID (UK nutrient reference data)
4. USDA FoodData Central (fallback for US foods)

Create a FoodDataAdapter interface. Each provider implements this interface. Never tightly couple provider logic to the service layer. The FoodService interacts only with the adapter interface.

Barcode scanning uses Open Food Facts as the primary lookup. If not found, surface a "Add this food manually" flow pre-populated with the barcode number.

Food data must support locale so search results and names display in the user's language. The foods table holds locale-independent data; a separate `food_names` table stores names per locale.

## CORE SYSTEM ARCHITECTURE
Build the application as modular services with clear interfaces. No service may import directly from another service's internal implementation — only from its public interface.

**Services:**
- **AuthService** — registration, login, session, password reset
- **UserService** — profile, preferences, settings
- **OnboardingService** — onboarding wizard state and completion
- **FoodService** — search, barcode, CRUD for custom foods
- **DiaryService** — log entries, copy meals, meal templates, photos
- **NutritionEngine** — all deterministic calculations, no AI
- **ScoringService** — Nutrition Score and Diet Quality Score
- **RecommendationEngine** — rule-based swap and meal suggestions
- **HealthRuleEngine** — condition-aware food warnings and target adjustments
- **AICoachService** — interfaces with AIProvider, assembles context, stores outputs
- **PromptTemplateService** — retrieves and renders versioned prompt templates
- **ReportingService** — generates structured report data for charts and exports
- **NotificationService** — manages and dispatches weekly review notifications
- **FeatureFlagService** — evaluates premium access per user
- **AuditService** — logs important events for security and compliance
- **DataPrivacyService** — handles GDPR requests, account deletion, data export
- **WebhookService** — manages webhook registrations and dispatches events
- **AnalyticsService** — records product events server-side and forwards them to Google Analytics 4
- **IntegrationService** — You need a defined abstraction layer to ingest health data (Apple HealthKit, Google Health Connect, Garmin API) so the system can dynamically adjust daily TDEE based on actual active calories rather than static multipliers.

## APPLICATION LAYERS
- **Layer 1 — Data Collection:** Collect user information, food logs, weight entries, photos. For paid tiers, users can input meals with their voice and let an AI with vision capabilities analyse the meal. Never calculate. Never analyse.
- **Layer 2 — Nutrition Engine:** Pure deterministic calculations only. Inputs in, numbers out. No AI, no rules, no opinions. Calculates: calories, macros, micros, targets, trends, scores, deficiencies.
- **Layer 3 — Recommendation Engine:** Rule-based only. Uses nutrition data to find healthier alternatives, replacements, meal ideas and shopping suggestions. Incorporates seasonal awareness and food variety data. No AI at this layer.
- **Layer 4 — AI Coach:** Consumes structured outputs from Layers 2 and 3. Produces natural language analysis, summaries, coaching, motivation and personalised recommendations. Never performs calculations itself.
- **Layer 5 — Presentation:** Dashboard, Diary, Charts, Reports, Settings, AI Chat. Consumes all lower layers through service interfaces.

## NUTRITION ENGINE — TDEE AND TARGETS
**BMR Formula**
Use Mifflin-St Jeor.
- Male: BMR = (10 x weight_kg) + (6.25 x height_cm) - (5 x age) + 5
- Female: BMR = (10 x weight_kg) + (6.25 x height_cm) - (5 x age) - 161

**TDEE**
TDEE = BMR x activity_multiplier.
Activity multipliers:
- Sedentary: 1.2
- Lightly Active: 1.375
- Moderately Active: 1.55
- Very Active: 1.725
If the IntegrationService connects a wearable, the static multiplier is bypassed and active calories adjust TDEE directly.

**Life-Stage Modifiers**
The Mifflin-St Jeor equation requires specific, trimester-based caloric and micronutrient modifiers. Your deterministic engine needs a LifeStageModifier rule set.

**Calorie Target**
Apply goal adjustment as a percentage of BMR.
Calorie Target = TDEE + (BMR x adjustment_percentage).
Goal adjustments:
- Lose weight — Slow: TDEE - 15% of BMR
- Lose weight — Moderate: TDEE - 25% of BMR
- Lose weight — Fast: TDEE - 35% of BMR
- Maintain: TDEE
- Gain weight — Slow: TDEE + 10% of BMR
- Gain weight — Moderate: TDEE + 20% of BMR
- Gain muscle: TDEE + 15% of BMR
- Eat healthier: TDEE
- Manage a condition: TDEE (condition rules may adjust this)

**Minimum calorie floors:**
Never allow calorie targets to fall below 1,200 kcal/day for females or 1,500 kcal/day for males regardless of goal, pace or BMR. If the calculated target breaches these floors, cap the target at the floor value and surface a clear warning explaining that the selected pace has been adjusted to keep the target safe.

**Macro Targets**
Calculate macro targets based on goal. Expressed as grams derived from calorie target.
- Weight loss: Protein 30%, Fat 30%, Carbohydrate 40%
- Maintain / Eat healthier: Protein 25%, Fat 30%, Carbohydrate 45%
- Weight gain: Protein 25%, Fat 25%, Carbohydrate 50%
- Build muscle: Protein 35%, Fat 25%, Carbohydrate 40%
- Manage a condition: Health Rule Engine overrides

The HealthRuleEngine may override these defaults for specific conditions.

**Manual Override**
Users may override any calculated calorie or macro target at any time via Settings. Manual overrides are stored separately from calculated values so the original calculation is always preserved. The UI must clearly indicate when a manual override is active and provide a one-tap option to revert to the calculated target.

**Nutrient Calculations**
The Nutrition Engine calculates and tracks:
- Calories, Protein, Total fat, Carbohydrates
- Sugar (total and added sugar, where data available)
- Fibre, Salt, Sodium, Saturated fat, Unsaturated fat
- Omega-3, Omega-6
- All vitamins (A, B1, B2, B3, B5, B6, B7, B9, B12, C, D, E, K)
- All minerals (calcium, iron, magnesium, phosphorus, potassium, zinc, selenium, copper, manganese, chromium, iodine)
- Amino acids (where data is available)
- Fatty acids (where data is available)

## NUTRITION SCORING
**Two Scores**
Display both scores simultaneously on the dashboard.

**Score 1 — Nutrition Score**
Scale: 0-100. Colour bands: 0-49 red, 50-74 amber, 75-100 green. Available to all users (free and premium).
Calculation (daily):
1. Calorie Adherence (50 points) — full 50 if within +/-10% of calorie target; scaled reduction beyond.
2. Macro Balance (50 points) — 16.67 per macro, full points if within +/-5 percentage points of target ratio.
Also calculate a 7-day rolling average and a 30-day rolling average.

**Score 2 — Diet Quality Score**
Scale: 0-100. Colour bands: same as above. The number is visible to all users. The breakdown, analysis and improvement recommendations are premium features.
Calculation (daily) — weighted across five components:
1. Fibre intake vs. target (20 points)
2. Micronutrient coverage — percentage of tracked vitamins and minerals meeting RDA (30 points)
3. Food variety — number of distinct whole food categories logged in the past 7 days (20 points)
4. Processed food ratio — proportion of logged foods classified as minimally processed vs. heavily processed (20 points)
5. Macro balance — same calculation as Nutrition Score macro component (10 points)

**Food Variety Taxonomy**
The engine checks for at least one serving from any of the following categories in the past 7 days, scoring 1 point per distinct category, capped at 20: Leafy greens (spinach, kale, lettuce), Cruciferous vegetables (broccoli, cauliflower, cabbage), Root vegetables (carrots, sweet potatoes, beets), Allium vegetables (onions, garlic, leeks), Legumes (lentils, chickpeas, beans), Whole grains (brown rice, quinoa, oats), Fruits — berries (blueberries, strawberries), Fruits — citrus (oranges, lemons, grapefruit), Fruits — other (apples, bananas, mango), Nuts and seeds (almonds, chia seeds, flax), Lean meats (chicken breast, turkey), Red meats (beef, lamb), Fish — oily (salmon, mackerel, sardines), Fish — white (cod, haddock, tilapia), Shellfish (prawns, mussels), Eggs (all egg types), Dairy (milk, yogurt, cheese), Fermented foods (kimchi, sauerkraut, kefir), Herbs and spices (fresh herbs, dried spices).

## USER PROFILES
Support multiple simultaneous conditions and preferences.
Supported dietary profiles: General, Weight Loss, Weight Gain, Bodybuilding, Endurance Athlete, Vegetarian, Vegan, Keto, Paleo, Mediterranean, High Protein, Low Carb, Halal, Kosher, Intermittent Fasting (with configurable eating window start/end times), Pregnancy, Breastfeeding.

## HEALTH RULE ENGINE
Health conditions must NOT be hardcoded. Create a configurable HealthRuleEngine. Rules are stored in the database and loaded at runtime.
Each health condition rule contains:
- Condition identifier and display name
- Severity level (advisory / important / critical)
- Allowed food categories, Restricted food categories
- Flagged ingredients (e.g. gluten, lactose, high-purine foods)
- Preferred nutrients and minimum targets
- Restricted nutrients and maximum targets
- Warning messages (shown inline in the diary when a flagged food is logged)
- Risk messages (shown in AI Coach summaries)
- Calorie target modifier (multiplier or absolute override)
- Macro target overrides

**Micronutrient Bioavailability:**
To truly stand out as an elite "Diet Quality" app, your Health Rule Engine should eventually flag nutrient interactions (e.g., "You logged an iron supplement with coffee; caffeine inhibits iron absorption. Try taking it with a vitamin C source like the orange you logged at lunch."). This bridges the gap between logging and true coaching.
When a food is logged that conflicts with a user's health rules, surface a clear non-intrusive warning in the diary. Never block logging — always warn, never prevent.

## FOOD LOGGING
Support:
- Barcode scanning (Open Food Facts API)
- Text search (name, brand, category) — via Typesense/Meilisearch for typing speed
- Brand search
- Recent foods (last 20 distinct foods logged)
- Favourite foods (user-starred)
- Saved meals (named groups of foods logged together)
- Recipes (with per-serving nutrition)
- Custom foods (user-created)
- Supplements (foods flagged as is_supplement = true; tracked but excluded from Diet Quality Score components that penalise processed foods or boost variety)
- Quick add (calories only, for simple entries)
- Copy previous meal (replicate a past diary entry)
- Meal templates (named reusable meal structures)
- Photo attachment: each diary entry can have one or more photos stored in Supabase Storage, referenced by URL. Photos are passed to AI context when available.
- Voice meal logging (Premium).
- AI vision meal analysis (Premium).

Design a FoodLoggingAdapter abstraction that is ready to accept an AI photo recognition provider in future without changes.
Meals are organised into named slots. Default slots: Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner, Evening Snack. Users may customise slot names.
Maximum three taps to log a recent or favourite food.

## AI COACH
The AI Coach must behave like an experienced, empathetic, evidence-based nutrition coach. Never diagnose medical conditions. Never prescribe or recommend specific medications. Never make absolute health claims. Always explain recommendations in plain language. Always cite what data the recommendation is based on. Use structured JSON outputs from the AI so the presentation layer can render them consistently.

**Context Provided to AI:**
Every AI call receives a structured context payload assembled by AICoachService. The context includes:
- Current meal (if meal analysis) and any attached photos
- Today's full nutrition totals
- Today's Nutrition Score and Diet Quality Score
- 7-day nutrition averages, 30-day nutrition averages
- User's calorie and macro targets, User's goal
- User's health conditions and dietary preferences (including intermittent fasting window if set)
- Current weight and weight trend (last 30 days)
- Body measurements (waist, hip, body fat %) if available
- Exercise frequency and types
- Previous AI recommendations (last 5, to avoid repetition)
- Conversation history (for AI Chat, last 20 messages)

**AI Outputs:**
- Meal analysis (on-demand, premium)
- Daily summary (automated evening, premium)
- Weekly review (automated, premium)
- Monthly consultation (automated, premium)
- Goal progress coaching (on-demand, premium)
- Behaviour pattern analysis (weekly, premium)
- Strengths this week, Areas for improvement
- Food diversity analysis
- Healthy food alternatives, Recipe suggestions, Shopping suggestions
- Motivational coaching
- Deficiency analysis and explanation

## AI AUTOMATION SCHEDULE
- **Immediately After Meal Logging:** No AI. Only Nutrition Engine calculations.
- **Every Evening (Configurable, default 21:00 user local time):** Generate Daily Summary if the user has at least one meal logged and has enabled daily summaries.
- **Every Monday Morning:** Generate Weekly Review for the previous week. Requires at least 3 days of logged data in the past 7 days.
- **First Day of Each Month:** Generate Monthly Consultation for the previous month. Requires at least 14 days of logged data in the past 30 days.
- **On Demand:** Users may request AI analysis at any time subject to their daily request limit (5/day free, unlimited premium).

## RECOMMENDATION ENGINE
Produce recommendations using deterministic rules first. Then pass the rule-based output to the AI Coach for personalisation and explanation.
Deterministic outputs:
- Healthier food swaps (same category, better nutrient profile)
- Higher protein swaps, Lower calorie swaps, Lower sodium swaps, Higher fibre swaps
- Foods high in a specific deficient nutrient
- Meal suggestions based on remaining macro budget
- Weekly meal plan skeleton
- Shopping list from meal plan
- Seasonal preference: the engine prefers in-season foods when suggesting swaps or shopping items, using a seasonality attribute on foods.
The RecommendationEngine uses the food database and nutrient data only — no AI, no external calls.

## NOTIFICATION SYSTEM
At launch, support one notification type:
- Weekly review ready notification — sent when a Weekly Review has been generated. Delivered via in-app notification and optionally email.
Design the NotificationService to be extensible so additional notification types can be added in future without architectural changes. Use a queue-based dispatch model from day one.

## RECIPE IMPORT (Premium)
Users may import a recipe by submitting a URL. The platform uses an AI call to parse the webpage, extract structured data and create a recipe record.

## CACHING STRATEGY
- **Food data:** Aggressively cache at CDN level with long TTL (24h+), invalidated on update.
- **Nutrition aggregates:** Pre-compute daily totals in materialised views or cache in Redis; invalidate on any diary change.
- **Dashboard:** Cache per user with a 5-minute TTL, bust when a diary entry or weight log is added/updated.
- **AI summaries:** Store generated summaries and serve them directly; they are immutable once created.
All cache keys must be user-scoped so RLS is never bypassed.

## INTERNATIONALISATION (i18n)
- Every user has a locale field (e.g., en-GB, en-US, fr-FR).
- UI strings will use a standard i18n library (e.g. next-intl).
- Nutrient reference values (RDA) are selected per locale.
- Food names are stored in a separate `food_names` table (food_id, locale, name).

## ANALYTICS & BUSINESS INTELLIGENCE
Internal Product Analytics (Google Analytics 4). The platform records all significant user actions to a local `analytics_events` table for complete auditability, then forwards them server-side to Google Analytics 4 via the Measurement Protocol.
Analytics Events Table columns: `id`, `user_id`, `organisation_id`, `team_id`, `event_name`, `properties (jsonb)`, `created_at`.

Core Events Tracked from Phase 1:
- `onboarding_step_completed` (step_number, step_name)
- `onboarding_completed` (total_time_seconds, goal_selected)
- `food_logged` (method: barcode/search/quick-add/custom)
- `barcode_scanned` (success: true/false)
- `meal_copied`
- `recipe_created` (ingredients_count)
- `weight_logged` (source: manual/device)
- `dashboard_viewed`
- `premium_feature_viewed` (feature_name)
- `upgrade_prompt_shown` (feature_name)
- `upgrade_clicked` (source_screen)
- `ai_request` (ai_type)
- `report_generated` (report_type)
- `account_deleted`

**Organisation-Level Analytics (Client-Facing)**
All nutrition totals, scores, and tracking tables include `organisation_id` and `team_id`. This enables aggregated dashboards for B2B clients in later phases. Dedicated API endpoints (`GET /api/organisation/dashboard`) will return:
- Total members and active members this week
- Average Nutrition Score and Diet Quality Score trends
- Common nutrient deficiencies across the organisation
- Aggregate macro adherence, Top logged foods
- Engagement metrics (average days logged per week)
These dashboards are a future premium feature; the architecture fully supports them.

## DATABASE SCHEMA
Design a fully normalised PostgreSQL schema. Apply Row Level Security to every table containing user data. Include nullable `organisation_id` and `team_id` columns on all user-data tables.

**Core Tables:**
- `users` (managed by Supabase Auth, extended via profiles)
- `profiles` (name, date of birth, sex, height, weight, waist_cm, hip_cm, body_fat_pct, units, locale, timezone)
- `goals` (type, pace, target weight, calorie override, macro overrides, active flag)
- `health_conditions` (user to condition mapping, severity, diagnosed flag)
- `dietary_preferences` (user to preference mapping, includes intermittent_fasting_window_start and _end)
- `allergies` (user to allergen mapping)
- `onboarding_state` (step completed, completion flag, started at)

**Food Data Tables:**
- `food_sources` (provider name, priority, adapter class, active flag)
- `foods` (source_food_id, brand, source, barcode, is_verified, is_user_created, nova_group, is_supplement, seasonality)
- `food_names` (food_id, locale, name)
- `food_nutrients` (food to nutrient to value per 100g)
- `nutrients` (nutrient name, unit, RDA values by sex, age group, and locale)
- `serving_sizes` (food to serving name to weight in grams)

**Recipe Tables:**
- `recipes` (name, description, servings, is_public, user_id, source_url)
- `recipe_ingredients` (recipe to food to quantity to serving size)
- `recipe_nutrition` (pre-calculated totals per serving)

**Meal Tables:**
- `saved_meals` (user to name to list of foods)
- `saved_meal_items` (saved meal to food to quantity to serving)
- `meal_templates` (user to template name to slot structure)

**Diary Tables:**
- `diary_entries` (user to date to meal slot, photo_urls)
- `diary_items` (diary entry to food to quantity to serving details, nutrition snapshot)

**Tracking Tables:**
- `weight_logs` (user to date to weight in kg to source to source_device_id to notes)
- `body_measurements` (user to date to waist_cm, hip_cm, body_fat_pct, notes)

**Nutrition Calculation Tables:**
- `nutrition_targets` (user to nutrient to daily target to source)
- `daily_nutrition_totals` (user to date to pre-aggregated macro and micro totals)
- `weekly_nutrition_totals` (user to week start date to aggregated totals and averages)
- `monthly_nutrition_totals` (user to month to aggregated totals and averages)
- `nutrition_scores` (user to date to nutrition score to diet quality score to component breakdown)

**Health Rule Tables:**
- `health_rules` (condition identifier to rule configuration JSON)
- `food_warnings` (food to condition to warning message to severity)
- `condition_nutrient_targets` (condition to nutrient to target override)

**Recommendation Tables:**
- `recommendations` (user to type to content to generated at to source)
- `recommendation_history` (user to recommendation to actioned to dismissed to feedback)

**AI Tables:**
- `ai_daily_summaries` (user to date to content JSON to model to prompt version)
- `ai_weekly_summaries` (user to week to content JSON to model to prompt version)
- `ai_monthly_summaries` (user to month to content JSON to model to prompt version)
- `ai_conversations` (user to session to message history JSON to started at)
- `ai_prompt_templates` (name to version to system prompt to user prompt to output schema to active flag)

**Meal Plan Tables:**
- `meal_plans` (id, user_id, name, start_date, end_date, is_active, generated_by)
- `meal_plan_days` (id, meal_plan_id, day_date, day_number)
- `meal_plan_slots` (id, meal_plan_day_id, meal_slot, food_id or recipe_id, serving_size_id, quantity)

**System Tables:**
- `feature_flags` (flag name to description to default value to user overrides)
- `user_feature_flags` (user to flag to enabled to granted at to expires at)
- `audit_logs` (user to action to resource to metadata to ip to timestamp)
- `settings` (user to key to value)
- `notification_preferences` (user to notification type to enabled to channel to preference JSON)
- `webhooks` (id, user_id/organisation_id, url, events array, secret, active)
- `analytics_events` (id, user_id, organisation_id, team_id, event_name, properties, created_at)

## API DESIGN
Design clean REST API endpoints using Next.js Route Handlers. All endpoints require authentication except registration and login. All endpoints validate input server-side using Zod. All endpoints return consistent response envelopes: `{ success: true, data: T }` or `{ success: false, error: { code: string, message: string } }`.

**Authentication:**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/reset-password
- GET /api/auth/session

**Onboarding:**
- GET /api/onboarding/state
- PUT /api/onboarding/state
- POST /api/onboarding/complete

**Profile:**
- GET /api/profile
- PUT /api/profile
- PUT /api/profile/goals
- PUT /api/profile/conditions
- PUT /api/profile/preferences
- PUT /api/profile/targets

**Foods:**
- GET /api/foods/search
- GET /api/foods/barcode/:barcode
- GET /api/foods/:id
- POST /api/foods
- PUT /api/foods/:id
- DELETE /api/foods/:id

**Diary:**
- GET /api/diary/:date
- POST /api/diary/:date/entries
- PUT /api/diary/entries/:id
- DELETE /api/diary/entries/:id
- POST /api/diary/:date/copy-from/:sourceDate
- POST /api/diary/entries/:id/photos

**Recipes:**
- GET /api/recipes
- GET /api/recipes/:id
- POST /api/recipes
- PUT /api/recipes/:id
- DELETE /api/recipes/:id
- POST /api/recipes/import

**Saved Meals:**
- GET /api/saved-meals
- GET /api/saved-meals/:id
- POST /api/saved-meals
- PUT /api/saved-meals/:id
- DELETE /api/saved-meals/:id

**Dashboard:**
- GET /api/dashboard

**Nutrition:**
- GET /api/nutrition/daily/:date
- GET /api/nutrition/weekly/:weekStart
- GET /api/nutrition/monthly/:month
- GET /api/nutrition/scores/:date

**Weight & Measurements:**
- GET /api/weight
- POST /api/weight
- DELETE /api/weight/:id
- GET /api/measurements
- POST /api/measurements
- DELETE /api/measurements/:id

**Goals:**
- GET /api/goals
- PUT /api/goals

**AI Coach (premium-gated):**
- POST /api/ai/meal-analysis
- GET /api/ai/daily-summary/:date
- GET /api/ai/weekly-summary/:weekStart
- GET /api/ai/monthly-summary/:month
- POST /api/ai/chat
- GET /api/ai/recommendations

**Reports:**
- GET /api/reports/weekly
- GET /api/reports/monthly
- GET /api/reports/export

**Settings:**
- GET /api/settings
- PUT /api/settings
- PUT /api/settings/notifications

**Account:**
- DELETE /api/account

**Analytics:**
- POST /api/analytics/event
- GET /api/organisation/dashboard

**Administration (admin role only):**
- GET /api/admin/users
- GET /api/admin/feature-flags
- PUT /api/admin/feature-flags/:flag
- PUT /api/admin/feature-flags/:flag/users/:userId
- GET /api/admin/prompt-templates
- PUT /api/admin/prompt-templates/:id
- POST /api/admin/prompt-templates
- GET /api/admin/audit-logs

## UX PRINCIPLES
- Mobile-first, responsive at all breakpoints
- Offline-capable PWA
- Optimistic UI updates for all diary interactions
- Skeleton loading states on all data-dependent components
- Maximum three taps to log a recent or favourite food
- AI explanations must always be in plain language with no jargon
- Minimal cognitive load
- Premium features visible to free users with tasteful upgrade prompts
- Accessible — WCAG 2.1 AA minimum
- Never use modal dialogs for destructive actions without confirmation
- Empty states must always include a clear call to action

## SECURITY
- Row Level Security enabled on every Supabase table containing user data
- All input validated server-side using Zod
- Sensitive profile data encrypted at rest
- All API endpoints protected by session validation
- Rate limiting applied to all endpoints, stricter limits on AI endpoints
- Audit logging for key events
- OWASP Top 10 mitigations applied
- No sensitive data in client-side localStorage
- HTTPS enforced everywhere
- API keys never exposed to the client

## GDPR AND DATA PRIVACY
The platform is subject to UK GDPR and EU GDPR from launch.

**Account Deletion:**
1. Mark account as pending_deletion immediately
2. Revoke all active sessions
3. Send confirmation email with 30-day reactivation notice
4. After 30 days: hard delete all personal data
5. Log the deletion event in audit logs (anonymised)

**Data Export:**
Users may request a full export at any time via Settings. Format: JSON with human-readable summary.
Data Residency: Configure Supabase to use EU region storage.

**Retention Policy:**
- AI conversation history: retained for 24 months
- Audit logs: retained for 12 months
- Deleted account data: purged after 30-day grace period

Cookie Consent: Implement a compliant cookie consent banner on first visit.

## DEVELOPMENT STRATEGY
Do NOT attempt to build the entire application at once. Work in iterative phases. Never skip a phase. Complete each phase before starting the next.

**Phase 1 — Architecture and Infrastructure**
- Folder structure, database schema, RLS policies, domain models
- Supabase project configuration & strictly local CLI migrations setup
- Configure Dev, Staging, and Prod CI/CD environments
- Authentication, Onboarding wizard, TDEE and macro target calculations
- Core infrastructure: feature flags, audit logging, error handling, analytics
- Next.js + React Native monorepo scaffolding

**Phase 2 — Food Data and Diary**
- FoodDataAdapter implementations, Typesense/Meilisearch implementation, barcode lookup
- Offline-first state management integration (React Query/local-first sync)
- Custom food creation, Nutrition Engine, Food diary
- Saved meals, recipes, meal templates, Dashboard (data only)

**Phase 3 — Scoring, Rules and Recommendations**
- Nutrition Score and Diet Quality Score
- Health Rule Engine (incorporating Micronutrient Bioavailability rules)
- LifeStageModifier rule sets
- IntegrationService for wearable devices
- Charts, reports, meal plan tables

**Phase 4 — AI Layer**
- AIProvider abstraction, PromptTemplateService, AICoachService
- Edge rate limiting implementation via Redis/Upstash
- Meal analysis, daily/weekly/monthly summaries, AI Chat
- Voice meal logging and AI vision logging integrations
- Premium feature gating and generating AI "hooks" for free users
- Recipe import
- Actively beta test the app with one nutritionist to validate the multi-tenant architecture

**Phase 5 — Hardening and Delivery**
- Performance optimisation, PWA configuration
- GDPR compliance, notification system, webhook dispatch
- Security audit, documentation, production deployment

Always produce production-quality code. Always explain architectural decisions inline with the code. Always write clean, maintainable, modular software suitable for long-term commercial growth. Never hardcode values that belong in configuration. Never couple services directly — always use interfaces. Never skip error handling. Never expose internal implementation details through the API.
