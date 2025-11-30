"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AuthMiddleware({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/"];

  // Routes that should redirect to dashboard if already authenticated
  const authRoutes = ["/auth/login", "/auth/register"];

  useEffect(() => {
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/auth/login");
      return;
    }

    // If user is authenticated and trying to access auth routes (login, register)
    if (isAuthenticated && isAuthRoute) {
      router.push("/dashboard");
      return;
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}
