'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'auth-callback-failed') {
      setError('Authentication failed. The magic link may have expired.');
    }
  }, []);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });

      if (error) throw error;
      setStatus('sent');
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link.');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white rounded-[24px] p-8 smeg-shadow border border-mint-surface">
        <div className="text-center mb-8">
          <h1 className="font-headline-lg text-ink-text mb-2">Sign in or Create Account</h1>
          <p className="text-body-md text-on-surface-variant">
            {status === 'sent' 
              ? 'Check your inbox for a magic link.' 
              : 'Enter your email to log in or get started with your personalized plan.'}
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-error text-body-sm p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {status === 'sent' ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[40px]">mail</span>
            </div>
            <p className="text-body-lg text-ink-text">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-body-md text-on-surface-variant">
              Click the link in the email to sign in securely. You can close this tab.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="text-primary text-label-md hover:underline"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendMagicLink} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-label-md font-medium text-ink-text mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-surface-variant bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            
            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className={`w-full bg-primary text-white text-label-md px-6 py-4 rounded-full tactile-button flex items-center justify-center gap-2 shadow-lg transition-all ${
                status === 'loading' || !email ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-container hover:scale-[1.02]'
              }`}
            >
              {status === 'loading' ? 'Sending...' : 'Send Magic Link'}
              {status !== 'loading' && <span className="material-symbols-outlined">auto_awesome</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
