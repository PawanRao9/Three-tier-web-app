"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

/**
 * ProtectedRoute component
 * Wraps pages that require authentication
 * Redirects to /login if user is not authenticated
 * Optionally checks for specific roles
 */
export default function ProtectedRoute({
  children,
  allowedRoles = ["admin", "user"],
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-900">403 - Forbidden</h1>
        <p className="mt-2 text-gray-600">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
