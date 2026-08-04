"use client";

import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import type { AuthSceneVariant } from "@/components/auth/scene-variant";

interface AuthShellProps {
  scene: AuthSceneVariant;
  children: React.ReactNode;
}

// Shared two-section authentication layout. Desktop: visual panel left, form
// right. Mobile: compact animated header, then the full-width form.
export function AuthShell({ scene, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AuthVisualPanel scene={scene} />

      <main className="flex w-full flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
