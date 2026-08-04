"use client";

import {
  CircleCheck,
  KeyRound,
  LockKeyhole,
  NotebookPen,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/cn";
import type { AuthSceneVariant } from "@/components/auth/scene-variant";

// Decorative three-dimensional note environment. Purely presentational: the
// whole scene is aria-hidden and never receives keyboard focus. All motion
// animates transform and opacity via CSS keyframes, and the `memo-anim-*`
// classes disable themselves under prefers-reduced-motion.

interface AnimatedNoteSceneProps {
  scene: AuthSceneVariant;
}

const TILT = "--tilt-x" as const;

function tiltStyle(rotation: string) {
  return { [TILT]: rotation } as React.CSSProperties;
}

function NoteCard({
  className,
  rotation,
  title,
  meta,
  lines,
  animation = "memo-anim-float",
  delay,
  children,
}: {
  className?: string;
  rotation: string;
  title?: string;
  meta?: string;
  lines?: boolean;
  animation?: "memo-anim-float" | "memo-anim-float-slow" | "memo-anim-unfold" | "memo-anim-sway";
  delay?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute w-44 rounded-memo-md border border-border-subtle bg-card-surface p-4 shadow-memo-standard",
        animation,
        className
      )}
      style={{ ...tiltStyle(rotation), animationDelay: delay }}
    >
      {lines ? (
        <div className="space-y-1.5" aria-hidden="true">
          <div className="h-2 w-3/4 rounded-full bg-brand/30" />
          <div className="h-2 w-1/2 rounded-full bg-border-subtle" />
          <div className="h-2 w-2/3 rounded-full bg-border-subtle" />
        </div>
      ) : null}
      {title ? (
        <p className="text-sm font-semibold leading-snug text-ink">{title}</p>
      ) : null}
      {meta ? (
        <p className="mt-1 text-xs text-ink-muted">{meta}</p>
      ) : null}
      {children}
    </div>
  );
}

function SyncLine() {
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-status-active-text" />
      <span className="memo-anim-sync block h-px w-16 bg-brand/60" />
      <span className="text-xs font-medium text-status-active-text">
        Synced
      </span>
    </div>
  );
}

function OrbitDots() {
  return (
    <>
      <span
        className="memo-anim-orbit absolute left-1/2 top-1/2 size-2 -ml-1 -mt-1 rounded-full bg-brand/70"
        style={{ ["--orbit-r" as string]: "150px" }}
        aria-hidden="true"
      />
      <span
        className="memo-anim-orbit absolute left-1/2 top-1/2 size-1.5 -ml-0.5 -mt-0.5 rounded-full bg-brand/40"
        style={{ ["--orbit-r" as string]: "150px", animationDelay: "-9s" }}
        aria-hidden="true"
      />
    </>
  );
}

function LoginScene() {
  return (
    <div className="relative h-[380px] w-[440px] max-w-full">
      <div
        className="memo-anim-glow absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-3xl"
        aria-hidden="true"
      />
      <span
        className="absolute left-1/2 top-1/2 size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/10"
        aria-hidden="true"
      />
      <OrbitDots />

      <NoteCard
        className="left-0 top-8"
        rotation="-6deg"
        title="Morning notes"
        meta="Today · 3 items"
      />

      <NoteCard
        className="right-0 top-28"
        rotation="5deg"
        animation="memo-anim-float-slow"
        title="Reading list"
        meta="Updated 2h ago"
        lines
      />

      <NoteCard
        className="bottom-2 left-1/2 w-52 -translate-x-1/2"
        rotation="-2deg"
        title="Project ideas"
        meta="Synced just now"
      >
        <SyncLine />
        <span className="absolute -right-3 -top-3 flex size-9 items-center justify-center rounded-full bg-brand/10 text-brand">
          <ShieldCheck size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </NoteCard>
    </div>
  );
}

function SignupScene() {
  return (
    <div className="relative h-[380px] w-[440px] max-w-full">
      <div
        className="memo-anim-glow absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/12 blur-3xl"
        aria-hidden="true"
      />
      <span
        className="absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/10"
        aria-hidden="true"
      />

      <NoteCard
        className="left-6 top-10"
        rotation="-8deg"
        animation="memo-anim-unfold"
        title="Plans"
        meta="Collecting ideas…"
        lines
      />
      <NoteCard
        className="right-8 top-20"
        rotation="7deg"
        animation="memo-anim-unfold"
        delay="0.12s"
        title="Drafts"
        meta="3 notes"
        lines
      />
      <NoteCard
        className="bottom-4 left-1/2 w-52 -translate-x-1/2"
        rotation="1deg"
        animation="memo-anim-unfold"
        delay="0.26s"
        title="Your workspace"
        meta="Ready to grow"
      >
        <span className="mt-3 flex items-center gap-2 text-xs font-medium text-ink-secondary">
          <Sparkles size={14} strokeWidth={1.8} aria-hidden="true" />
          New note, waiting
        </span>
      </NoteCard>
    </div>
  );
}

function ForgotScene() {
  return (
    <div className="relative h-[380px] w-[440px] max-w-full">
      <div
        className="memo-anim-glow absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/12 blur-3xl"
        aria-hidden="true"
      />

      <NoteCard
        className="left-0 top-16"
        rotation="-5deg"
        title="you@example.com"
        meta="Recovery email"
      />

      <span
        className="absolute left-[42%] top-1/2 h-px w-[16%] -translate-y-1/2 border-t-2 border-dashed border-brand/40"
        aria-hidden="true"
      />

      <div
        className="memo-anim-sway absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={tiltStyle("0deg")}
      >
        <span className="flex size-16 items-center justify-center rounded-2xl border border-brand/20 bg-white text-brand shadow-memo-standard">
          <KeyRound size={28} strokeWidth={1.6} aria-hidden="true" />
        </span>
      </div>

      <NoteCard
        className="right-0 top-24"
        rotation="4deg"
        animation="memo-anim-float-slow"
        title="Secure access"
        meta="Protected"
      >
        <span className="absolute -right-3 -top-3 flex size-9 items-center justify-center rounded-full bg-brand/10 text-brand">
          <LockKeyhole size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </NoteCard>
    </div>
  );
}

function ResetScene() {
  return (
    <div className="relative h-[380px] w-[440px] max-w-full">
      <div
        className="memo-anim-glow absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/12 blur-3xl"
        aria-hidden="true"
      />

      <span
        className="absolute left-1/2 top-10 h-[280px] w-px -translate-x-1/2 bg-gradient-to-b from-brand/5 via-brand/25 to-brand/40"
        aria-hidden="true"
      />

      <div className="absolute left-1/2 top-10 -translate-x-1/2" style={tiltStyle("-3deg")}>
        <span className="flex size-12 items-center justify-center rounded-xl border border-brand/15 bg-white text-brand/50 shadow-memo-subtle">
          <LockKeyhole size={22} strokeWidth={1.6} aria-hidden="true" />
        </span>
      </div>
      <div
        className="memo-anim-float-slow absolute left-1/2 top-[38%] -translate-x-1/2"
        style={tiltStyle("2deg")}
      >
        <span className="flex size-14 items-center justify-center rounded-2xl border border-brand/20 bg-white text-brand shadow-memo-standard">
          <LockKeyhole size={26} strokeWidth={1.6} aria-hidden="true" />
        </span>
      </div>
      <div
        className="memo-anim-float absolute left-1/2 top-[62%] -translate-x-1/2"
        style={tiltStyle("-1deg")}
      >
        <span className="flex size-16 items-center justify-center rounded-2xl border border-brand/25 bg-white text-brand shadow-memo-standard">
          <LockKeyhole size={30} strokeWidth={1.6} aria-hidden="true" />
        </span>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2">
        <NotebookPen size={16} strokeWidth={1.8} className="text-brand/70" aria-hidden="true" />
        <CircleCheck size={18} strokeWidth={1.8} className="text-status-active-text" aria-hidden="true" />
        <span className="text-xs font-medium text-ink-secondary">Secure by design</span>
      </div>
    </div>
  );
}

export function AnimatedNoteScene({ scene }: AnimatedNoteSceneProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none flex select-none items-center justify-center"
    >
      {scene === "login" ? <LoginScene /> : null}
      {scene === "signup" ? <SignupScene /> : null}
      {scene === "forgot" ? <ForgotScene /> : null}
      {scene === "reset" ? <ResetScene /> : null}
    </div>
  );
}
