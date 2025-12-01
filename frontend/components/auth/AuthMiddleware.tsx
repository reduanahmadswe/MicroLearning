"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AuthMiddleware({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, token } = useAuthStore();
  const hasRedirected = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-email", "/auth/clear", "/"];

  // Routes that should redirect to dashboard if already authenticated
  const authRoutes = ["/auth/login", "/auth/register"];

  // Wait for store to hydrate
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Reset redirect flag when pathname changes
    hasRedirected.current = false;
  }, [pathname]);

  useEffect(() => {
    // Wait for hydration to complete
    if (!isHydrated) return;
    
    // Prevent multiple redirects
    if (hasRedirected.current) return;

    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    
    // Check both isAuthenticated and token presence
    const hasValidAuth = isAuthenticated && user && token;

    // If user is not fully authenticated and trying to access protected route
    if (!hasValidAuth && !isPublicRoute) {
      hasRedirected.current = true;
      router.replace("/auth/login");
      return;
    }

    // If user is authenticated and trying to access auth routes (login, register)
    if (hasValidAuth && isAuthRoute) {
      hasRedirected.current = true;
      // Redirect admin to admin dashboard, others to regular dashboard
      if (user?.role === 'admin') {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
      return;
    }
  }, [isAuthenticated, pathname, user?.role, token, isHydrated]);

  // Show nothing until hydrated to prevent flash
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
