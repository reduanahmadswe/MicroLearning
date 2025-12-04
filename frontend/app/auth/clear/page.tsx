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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Clearing authentication...</h2>
        <p className="text-gray-600 mt-2">You will be redirected to login page.</p>
      </div>
    </div>
  );
}
