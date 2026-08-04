import type { Metadata } from "next";

import { AuthLayoutShell } from "@/components/auth/AuthLayoutShell";

export const metadata: Metadata = {
  title: {
    default: "Account · MemoNest",
    template: "%s · MemoNest",
  },
  description: "Sign in or create a MemoNest account.",
};

// Shared layout for all authentication pages. It provides the two-section
// visual shell (distinct from the dashboard) so individual pages only render
// their form. Public URL paths stay /login, /signup, /forgot-password and
// /reset-password thanks to the (auth) route group.
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AuthLayoutShell>{children}</AuthLayoutShell>;
}
