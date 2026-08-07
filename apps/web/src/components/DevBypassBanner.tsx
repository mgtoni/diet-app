'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DevBypassBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if cookie exists
    const hasBypass = document.cookie.includes('dev_user_id=');
    if (!hasBypass && process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  const enableBypass = async () => {
    try {
      const res = await fetch('/api/auth/dev-bypass');
      if (res.ok) {
        setIsVisible(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-orange-500 text-white p-3 text-center flex justify-center items-center gap-4 z-[100] relative">
      <span>Dev Mode: No user session found.</span>
      <button 
        onClick={enableBypass}
        className="bg-white text-orange-600 px-4 py-1 rounded font-bold hover:bg-gray-100 transition-colors"
      >
        Enable Dev Session Bypass
      </button>
    </div>
  );
}
