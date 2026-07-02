'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) throw error;
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;
      
      // Successfully authenticated
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white rounded-[24px] p-8 smeg-shadow border border-mint-surface">
        <div className="text-center mb-8">
          <h1 className="font-headline-lg text-ink-text mb-2">Create Account</h1>
          <p className="text-body-md text-on-surface-variant">
            {step === 'email' 
              ? 'Enter your email to get started with your personalized plan.' 
              : `We sent a code to ${email}`}
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-error text-body-sm p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
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
              disabled={loading || !email}
              className={`w-full bg-primary text-white text-label-md px-6 py-4 rounded-full tactile-button flex items-center justify-center gap-2 shadow-lg transition-all ${
                loading || !email ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-container hover:scale-[1.02]'
              }`}
            >
              {loading ? 'Sending...' : 'Continue'}
              {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-label-md font-medium text-ink-text mb-2">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                className="w-full px-4 py-3 rounded-xl border border-surface-variant bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-center tracking-[0.5em] text-title-lg"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !otp}
              className={`w-full bg-primary text-white text-label-md px-6 py-4 rounded-full tactile-button flex items-center justify-center gap-2 shadow-lg transition-all ${
                loading || !otp ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-container hover:scale-[1.02]'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-primary text-label-md text-center mt-4 hover:underline"
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
