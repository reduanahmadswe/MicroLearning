'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function ClearAuthPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    // Clear everything
    logout();

    // Force clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    // Redirect to home after 1 second
    setTimeout(() => {
      router.replace('/home');
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-gradient">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-foreground">Clearing authentication...</h2>
        <p className="text-muted-foreground mt-2">You will be redirected to login page.</p>
      </div>
    </div>
  );
}
