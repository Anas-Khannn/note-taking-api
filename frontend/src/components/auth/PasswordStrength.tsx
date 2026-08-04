"use client";

import { cn } from "@/lib/cn";

interface PasswordStrengthProps {
  password: string;
}

const SEGMENTS = 5;

function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, SEGMENTS);
}

function strengthLabel(score: number): string {
  if (score <= 1) return "Weak";
  if (score <= 2) return "Fair";
  if (score <= 3) return "Good";
  return "Strong";
}

function segmentClass(score: number): string {
  if (score <= 1) return "bg-error";
  if (score <= 3) return "bg-brand";
  return "bg-status-active-text";
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const score = scorePassword(password);
  if (password.length === 0) return null;

  return (
    <div className="mt-1.5">
      <div
        className="flex gap-1"
        role="img"
        aria-label={`Password strength: ${strengthLabel(score)}`}
      >
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full bg-border-subtle transition-colors",
              index < score && segmentClass(score)
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-muted">
        {strengthLabel(score)}
      </p>
    </div>
  );
}
