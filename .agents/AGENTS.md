# Vercel Deployment & Tailwind CSS v4

**CRITICAL RULE: Tailwind v4 Native Bindings on Vercel**
This project uses Next.js 16 (with Turbopack) and Tailwind CSS v4. Tailwind v4 relies on native Rust binaries (`@tailwindcss/oxide` and `lightningcss`).
Because development happens on Windows, the `package-lock.json` only tracks Windows binaries. When deploying to Vercel (Linux), `npm ci` will fail with `Cannot find native binding` or `Cannot find module '@tailwindcss/oxide-linux-x64-gnu'` due to a known npm bug with optional dependencies.

**The Fix (Already Implemented):**
Do NOT modify `vercel.json` at the monorepo root to fix this, as Vercel ignores it when the Root Directory is set to `apps/web`.
Instead, we use a prebuild script in `apps/web/package.json`:
```json
"build": "node ./vercel-prebuild.js && next build"
```
The `vercel-prebuild.js` script checks for `process.env.VERCEL` and forcefully installs the required Linux binaries (`npm install --no-save --force @tailwindcss/oxide-linux-x64-gnu lightningcss-linux-x64-gnu`) right before the build starts.

**DO NOT** remove this script, and **DO NOT** attempt to fix native binding errors by creating a root `vercel.json`. If native binding errors occur for other platforms or packages in the future, apply the exact same conditional prebuild script pattern.

# Next.js Workspace Configuration
**CRITICAL RULE: Turbopack and Local Workspace Packages**
When importing local packages (e.g. `@diet-app/core`) into a Next.js app running Turbopack, you will encounter `Unknown module type` build errors because Next.js attempts to resolve the raw `.ts` files inside `node_modules` without passing them through the typescript loader.
**The Fix:** You MUST add the local package to the `transpilePackages` array in `next.config.ts`.
Requirement check: Always verify `transpilePackages` includes any new workspace packages before pushing to GitHub.

# Pre-deployment / Pre-commit Checks
**CRITICAL RULE: Always verify build locally before committing**
Before committing and pushing code to GitHub (which triggers Vercel deployments), you MUST verify that the app builds successfully locally to catch module resolution or monorepo dependency issues.
**The Fix:**
1. **Workspace Dependencies**: Check that any local workspace packages (like `@diet-app/core`) used by an app (like `apps/web`) are explicitly listed in that app's `package.json` `dependencies`. If they are missing, Vercel's isolated build will fail to link them.
2. **Local Build Test**: Run `npm run build` locally inside the relevant app directory (e.g. `cd apps/web` then run with dummy variables like `$env:NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="dummy_key"; npm run build`) to confirm the build succeeds without module resolution errors before making a commit.

# Documentation and Artifacts
**CRITICAL RULE: Save Artifacts in Docs Folder**
All artifacts (e.g. implementation plans, tasks, walkthroughs, setup docs) MUST be explicitly saved in the `docs` folder of the workspace, categorized under the respective phase (e.g. `docs/phase_2`). Do not leave them floating in the default conversation brain directory unless they are temporary scratch files.
