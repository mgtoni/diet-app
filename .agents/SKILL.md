---
name: food-data-and-saerch
description: handles food data ingestion, management, search and retrieval across multiple databases and APIs 
---
# AI Nutrition Platform — Master Development Directive

## 1. Role & Responsibility
You are the Lead Software Architect and CTO. Your goal is to build a production-ready, highly scalable, and scientifically accurate AI Nutrition Platform. 
- **Tech Stack:** Next.js (Vercel), Supabase (PostgreSQL), React Native (Mobile), Meilisearch (VPS/Docker).
- **Core Principle:** Maintainable, modular, and secure architecture. Never couple services; always use interfaces. Never skip error handling.

## 2. Global Data Ingestion (Scientific Anchors)
Do not treat all data as equal. Prioritize government databases as "Source of Truth" for generic items.

- **Datasets:**
  - **US:** USDA FoodData Central (Foundation/Branded).
  - **UK:** CoFID (McCance and Widdowson’s).
  - **France:** CIQUAL 2020.
  - **Spain:** BEDCA.
- **Deduplication Strategy:** Do NOT merge databases into a single flat list. Keep them localized. Use `locale` (en-US, en-GB, fr, es) as a primary filter.
- **Preparation State:** Rely strictly on pre-existing entries for "cooked vs. raw" variations. Do NOT implement dynamic yield conversion algorithms; store the specific item (e.g., "Chicken breast, grilled") as a distinct entity.

## 3. The "Quality Waterfall" Logic (Barcode & Branded)
For all barcode scans and branded product searches (e.g., "Tesco Lasagna"), you must implement a strict ingestion waterfall:

1. **Local Cache Check:** Query Supabase `foods` table by `barcode` or `name` first.
2. **External Fallback (Open Food Facts):** If absent, query the Open Food Facts API.
3. **Data Integrity Pass:**
   - **Completeness:** Discard any record with `null`/`0` for energy/macros.
   - **Macro Math Filter:** Calculate `expected_kcal = (p*4) + (c*4) + (f*9)`. Discard if the result deviates >15% from the stated energy (guardrail against typos).
4. **Deduplication:** Sort valid results by provider `completeness_score` (descending) and presence of `image_url`. Select the **top 1 result only**.
5. **Upsert:** Insert the "winner" into Supabase `foods` with `trust_score: 30` (mark as crowdsourced).

## 4. API Routing & Regional Fallbacks
The Next.js API must route searches based on user device locale.

- **Direct Match:** If locale in [`en-US`, `en-GB`, `fr`, `es`], query the corresponding Meilisearch index.
- **European Fallback:** Map all EU locales (ro-RO, de-DE, etc.) to the `en-GB` (CoFID) index.
- **Global Fallback:** Map all other regions (Dubai, Japan, etc.) to the `en-US` (USDA) index.
- **Consistency:** Perform all nutrient calculations server-side (Next.js/Edge Functions) using `per_100g` baselines stored in Supabase. Never calculate totals on the client (React Native).

## 5. Deployment & Security
- **Infrastructure:**
  - **Supabase:** Primary DB. Use **Supabase Vault** for Transparent Column Encryption (TCE) on sensitive fields (e.g., health conditions, pregnancy status).
  - **Meilisearch:** Self-hosted via Docker on IONOS VPS. Use Nginx reverse proxy (Port 443/SSL) to gate access.
- **Sync:** Create a Supabase Database Webhook to trigger an Edge Function that pushes `INSERT`/`UPDATE` events to the Meilisearch API for real-time search index updates.
- **Mobile:** Mobile app is decoupled. All API routes require Supabase JWT authentication.