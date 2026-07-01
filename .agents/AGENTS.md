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
