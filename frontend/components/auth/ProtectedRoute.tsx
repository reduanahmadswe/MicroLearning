"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getDashboardPath } from "@/lib/navigation";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireInstructor?: boolean;
  requireStudent?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireInstructor = false,
  requireStudent = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Check role-specific access
    if (requireAdmin && user?.role !== "admin") {
      router.push(getDashboardPath(user?.role));
      return;
    }

    if (requireInstructor && user?.role !== "instructor" && user?.role !== "admin") {
      router.push(getDashboardPath(user?.role));
      return;
    }

    if (requireStudent && (user?.role === "admin" || user?.role === "instructor")) {
      router.push(getDashboardPath(user?.role));
      return;
    }
  }, [isAuthenticated, user, requireAdmin, requireInstructor, requireStudent, router]);

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading for role checks
  if (requireAdmin && user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireInstructor && user?.role !== "instructor" && user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireStudent && (user?.role === "admin" || user?.role === "instructor")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
