"use client";

import { useEffect, useRef } from "react";
import { NotebookPen } from "lucide-react";

import { AnimatedNoteScene } from "@/components/auth/AnimatedNoteScene";
import type { AuthSceneVariant } from "@/components/auth/scene-variant";

// Left branding panel. Fully decorative: aria-hidden, no focusable elements.
// On desktop it becomes a full-height visual section; on mobile it collapses
// into a compact animated header above the form.

const SCENE_MESSAGES: Record<AuthSceneVariant, string> = {
  login: "Organize your thoughts in one calm, private space.",
  signup: "A quiet workspace for your notes, plans, and ideas.",
  forgot: "Secure password recovery, right from your inbox.",
  reset: "Set a strong password and get back to writing.",
};

const MOBILE_TAGLINES: Record<AuthSceneVariant, string> = {
  login: "Welcome back",
  signup: "Create your space",
  forgot: "Recover access",
  reset: "Reset your password",
};

function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-memo-md bg-brand text-brand-on shadow-memo-standard"
      style={{ width: size, height: size }}
    >
      <NotebookPen size={size * 0.55} strokeWidth={2} aria-hidden="true" />
    </span>
  );
}

export function AuthVisualPanel({ scene }: { scene: AuthSceneVariant }) {
  const stageRef = useRef<HTMLDivElement>(null);

  // Subtle pointer-responsive tilt on desktop only, applied directly to the
  // scene so it never triggers React re-renders. Skipped for coarse pointers
  // and reduced-motion users.
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const finePointer = window.matchMedia("(pointer: fine)");
    if (reducedMotion.matches || !finePointer.matches) return;

    let rafId = 0;
    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        node.style.setProperty("--scene-tilt-x", `${(y * -5).toFixed(2)}deg`);
        node.style.setProperty("--scene-tilt-y", `${(x * 5).toFixed(2)}deg`);
      });
    };
    const onLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      node.style.setProperty("--scene-tilt-x", "0deg");
      node.style.setProperty("--scene-tilt-y", "0deg");
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <aside
      aria-hidden="true"
      className="relative overflow-hidden border-b border-border-subtle bg-gradient-to-br from-[#eef1ff] via-[#f7f8ff] to-white lg:flex lg:w-1/2 lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r"
    >
      <div className="memo-dot-grid absolute inset-0 opacity-70" />

      <div
        className="absolute -left-24 -top-24 size-72 rounded-full bg-brand/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-16 size-80 rounded-full bg-blue-200/40 blur-3xl"
        aria-hidden="true"
      />

      {/* Mobile compact header */}
      <div className="relative z-10 flex items-center gap-3.5 px-6 py-7 lg:hidden">
        <BrandMark size={44} />
        <div>
          <p className="text-lg font-bold leading-tight text-ink">
            MemoNest
          </p>
          <p className="text-sm text-ink-secondary">
            {MOBILE_TAGLINES[scene]}
          </p>
        </div>
      </div>

      {/* Desktop visual section */}
      <div className="relative z-10 hidden flex-1 flex-col lg:flex">
        <div className="flex items-center gap-3 px-14 pt-14">
          <BrandMark />
          <p className="text-xl font-bold tracking-tight text-ink">
            MemoNest
          </p>
        </div>

        <div
          ref={stageRef}
          className="flex flex-1 items-center justify-center px-8 py-10"
          style={{
            transform:
              "perspective(1100px) rotateX(var(--scene-tilt-x, 0deg)) rotateY(var(--scene-tilt-y, 0deg))",
            transition: "transform 0.3s ease-out",
          }}
        >
          <AnimatedNoteScene scene={scene} />
        </div>

        <div className="flex items-center gap-3 px-14 pb-14">
          <span className="h-px flex-1 bg-border-subtle" />
          <p className="max-w-xs text-center text-sm leading-relaxed text-ink-secondary">
            {SCENE_MESSAGES[scene]}
          </p>
          <span className="h-px flex-1 bg-border-subtle" />
        </div>
      </div>
    </aside>
  );
}
