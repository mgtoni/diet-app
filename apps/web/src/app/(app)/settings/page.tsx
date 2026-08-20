import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import AccountForm from '@/components/settings/AccountForm';
import OnboardingForm from '@/components/settings/OnboardingForm';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all required user data
  const [
    { data: profile },
    { data: goal },
    { data: dietaryPrefsData },
    { data: healthCondsData },
    { data: allergiesData }
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('id', user.id).single(),
    supabaseAdmin.from('goals').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
    supabaseAdmin.from('dietary_preferences').select('*').eq('user_id', user.id),
    supabaseAdmin.from('health_conditions').select('condition_name').eq('user_id', user.id),
    supabaseAdmin.from('allergies').select('allergen_name').eq('user_id', user.id)
  ]);

  const userData = {
    email: user.email,
    profile,
    goal,
    preferences: dietaryPrefsData,
    healthConditions: healthCondsData?.map(h => h.condition_name) || [],
    allergies: allergiesData?.map(a => a.allergen_name) || []
  };

  return (
    <div className="w-full h-full lg:rounded-2xl bg-surface flex flex-col">
      <header className="px-6 lg:px-10 py-8 lg:py-10 border-b border-outline-variant/30 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-headline-lg text-primary font-bold">Settings</h1>
          <p className="text-on-surface-variant font-body-md mt-2">
            Manage your account details and nutrition profile.
          </p>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-12 pb-32">
        <AccountForm initialData={userData} />
        <div className="h-px bg-outline-variant/30 w-full max-w-2xl"></div>
        <OnboardingForm initialData={userData} />
      </div>
    </div>
  );
}
