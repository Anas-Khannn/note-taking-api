"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { ROUTE_PROTECTION_ENABLED } from "@/lib/auth-config";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Requires an authenticated session; unauthenticated users are redirected. */
  requireAuth?: boolean;
  /** Allows only unauthenticated visitors (login/signup pages). */
  onlyPublic?: boolean;
  /** Safe return path used after a login redirect. */
  redirectTo?: string;
}

function isSafeInternalPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes(":");
}

function LoadingPlaceholder() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page-bg">
      <span
        aria-label="Loading"
        className="size-10 animate-pulse rounded-full bg-skeleton"
      />
    </div>
  );
}

// Route protection is intentionally inactive until the backend ships a real
// login flow (see ROUTE_PROTECTION_ENABLED in lib/auth-config). While off, the
// dashboard remains fully functional for anonymous users and no redirect can
// run. Once enabled, this component redirects based on session state without
// flashing protected content and without redirect loops.
export function AuthGuard({
  children,
  requireAuth = false,
  onlyPublic = false,
  redirectTo,
}: AuthGuardProps) {
  const { isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ROUTE_PROTECTION_ENABLED || isInitializing) return;

    if (requireAuth && !isAuthenticated) {
      router.replace(redirectTo && isSafeInternalPath(redirectTo) ? redirectTo : "/login");
    } else if (onlyPublic && isAuthenticated) {
      router.replace("/");
    }
  }, [
    isAuthenticated,
    isInitializing,
    onlyPublic,
    redirectTo,
    requireAuth,
    router,
  ]);

  if (!ROUTE_PROTECTION_ENABLED) {
    return <>{children}</>;
  }

  if (isInitializing) {
    return <LoadingPlaceholder />;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }
  if (onlyPublic && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
