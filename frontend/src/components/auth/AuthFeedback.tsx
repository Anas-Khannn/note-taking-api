"use client";

import { CircleCheck, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/cn";

interface AuthFeedbackProps {
  tone: "error" | "success" | "info";
  title?: string;
  message: string;
}

const TONE_ICONS = {
  error: TriangleAlert,
  success: CircleCheck,
  info: Info,
} as const;

const TONE_CLASSES = {
  error: "border-error-container bg-error-container text-error-on-container",
  success: "border-status-active-bg bg-status-active-bg text-status-active-text",
  info: "border-border-subtle bg-input-bg text-ink-secondary",
} as const;

export function AuthFeedback({ tone, title, message }: AuthFeedbackProps) {
  const Icon = TONE_ICONS[tone];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-memo-md border p-3.5 text-sm",
        TONE_CLASSES[tone]
      )}
    >
      <Icon
        size={18}
        strokeWidth={1.8}
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      />
      <div>
        {title ? (
          <p className="font-semibold">{title}</p>
        ) : null}
        <p className="leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
