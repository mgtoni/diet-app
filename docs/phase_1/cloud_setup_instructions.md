# Cloud Infrastructure Setup Guide

This document outlines how GitHub, Supabase Cloud, and Vercel fit together to form the infrastructure for your AI Nutrition Platform, along with step-by-step instructions for you to set them up.

## How They Fit Together

1. **GitHub (Source of Truth):** This is where your code repository lives. It tracks all changes and acts as the trigger for deployments.
2. **Supabase Cloud (Database & Auth):** This is your managed PostgreSQL database and Authentication layer. Instead of running Docker locally, your app will securely connect to Supabase Cloud over the internet to read/write data and authenticate users.
3. **Vercel (Frontend & Backend):** Vercel connects to your GitHub repository. Every time you push code, Vercel automatically builds and deploys the Next.js app (`apps/web`). Because Next.js uses Route Handlers (Server Actions / API routes), **Vercel acts as your backend server**, securely communicating with Supabase.

---

## 🛑 User Actions Required

Please follow these point-by-point instructions in order.

### Step 1: GitHub Setup
1. Go to [GitHub](https://github.com/) and create a new repository (e.g., `diet-app`). **Do not** initialize it with a README, .gitignore, or license.
2. Copy the repository URL (e.g., `https://github.com/yourusername/diet-app.git`).
3. Provide that URL to me. I will push our local codebase to it.

### Step 2: Supabase Cloud Setup
1. Go to [Supabase](https://supabase.com/) and create a new Project.
2. Wait for the database to finish provisioning (takes about 2 minutes).
3. Go to **Project Settings -> API**.
4. You need to gather three pieces of information to give back to me:
   - **Project URL:** (e.g., `https://xyz.supabase.co`)
   - **Project API Key (anon/public):** (A long string starting with `eyJ...`)
5. Go to **Project Settings -> Database**.
   - Copy the **Connection String (URI)**. It looks like `postgresql://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres`. (You'll need this for Vercel, but you do NOT need to give me the password directly. However, I will need a way to push our schema to it).
6. **(Optional but recommended so I can push the database schema to your cloud):** Go to **Account Settings -> Access Tokens** and generate a new Personal Access Token. Give this token to me along with your project Reference ID (the `xyz` part of your project URL).

### Step 3: Vercel Setup
1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Connect your GitHub account and import the `diet-app` repository you created in Step 1.
3. **CRITICAL:** In the "Configure Project" screen, change the **Root Directory** to `apps/web`.
4. In the **Environment Variables** section, add the following keys and values from Step 2:
   - `NEXT_PUBLIC_SUPABASE_URL`: (Your Supabase Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Your Supabase anon key)
5. Click **Deploy**.

---

## 📋 What You Need To Provide Me

Please reply with the following information so I can complete my side of the configuration and perform local testing:

1. **GitHub Repository URL**
2. **Supabase Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
3. **Supabase Anon Key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. **Supabase Access Token** & **Project Ref ID** (So I can push our local database migrations to your cloud database automatically).

## What I Will Do Once You Provide This

- I will initialize the git repository locally and push all our code to your GitHub repo.
- I will configure my local `.env.local` with your Supabase credentials so I can run the Next.js app on my end and verify it talks to your cloud database.
- I will run `npx supabase link` and `npx supabase db push` to construct the tables we designed in Phase 1 directly on your Supabase Cloud instance.
- I will run automated type checks and Next.js builds locally to ensure everything is strictly correct.
