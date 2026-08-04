"use client";

import { usePathname } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import type { AuthSceneVariant } from "@/components/auth/scene-variant";

function sceneForPath(pathname: string): AuthSceneVariant {
  if (pathname === "/signup") return "signup";
  if (pathname === "/forgot-password") return "forgot";
  if (pathname === "/reset-password") return "reset";
  return "login";
}

export function AuthLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return <AuthShell scene={sceneForPath(pathname)}>{children}</AuthShell>;
}
