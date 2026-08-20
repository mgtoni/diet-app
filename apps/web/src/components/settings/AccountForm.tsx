'use client';
import React, { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AccountForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.profile?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isNameDirty = name !== (initialData?.profile?.name || '');
  const isEmailDirty = email !== (initialData?.email || '');
  const isDirty = isNameDirty || isEmailDirty;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;
    
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      // 1. Update Profile (Name)
      if (isNameDirty) {
        const resProfile = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        const dataProfile = await resProfile.json();
        if (!dataProfile.success) throw new Error(dataProfile.error || 'Failed to update name');
      }

      // 2. Update Account (Email)
      if (isEmailDirty) {
        const resAccount = await fetch('/api/user/account', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const dataAccount = await resAccount.json();
        if (!dataAccount.success) throw new Error(dataAccount.error || 'Failed to update account credentials');
        setMessage('Account updated successfully. Please check your inbox to confirm the new email address.');
      } else {
        setMessage('Account updated successfully.');
      }
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsResetting(true);
    setMessage('');
    setError('');
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(initialData?.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (resetError) throw resetError;
      
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="font-headline-sm text-primary mb-6">Account Information</h2>
      
      {message && <div className="p-4 mb-6 bg-mint-bg text-primary rounded-xl border border-mint-surface font-label-md">{message}</div>}
      {error && <div className="p-4 mb-6 bg-salmon-bg text-salmon-accent rounded-xl border border-salmon-surface font-label-md">{error}</div>}
      
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-on-surface-variant font-label-md mb-2">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
            placeholder="Your Name"
          />
        </div>
        
        <div>
          <label className="block text-on-surface-variant font-label-md mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
          />
          <p className="text-caption text-on-surface-variant mt-2">
            Changing your email requires verifying the link sent to both your old and new inbox.
          </p>
        </div>

        <div className="pt-6 flex gap-4">
          <button
            type="submit"
            disabled={isLoading || isResetting || !isDirty}
            className={`font-bold py-3 px-8 rounded-full shadow-md transition-all flex items-center gap-2 ${isDirty ? 'bg-primary text-on-primary hover:bg-primary/90 active:scale-95' : 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed'}`}
          >
            {isLoading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
            {isDirty ? 'Save Changes' : 'No Changes to Save'}
          </button>
        </div>
      </form>

      <div className="pt-8 mt-8 border-t border-outline-variant/30">
        <h3 className="font-title-md text-primary mb-2">Password Management</h3>
        <p className="text-on-surface-variant font-body-md mb-4">
          Need to change your password? We will send a secure reset link to your email address.
        </p>
        <button
          onClick={handlePasswordReset}
          disabled={isLoading || isResetting}
          className="border border-outline-variant text-on-surface-variant font-bold py-3 px-6 rounded-full hover:bg-surface-variant/50 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
        >
          {isResetting && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
          Send Password Reset Link
        </button>
      </div>
    </div>
  );
}
