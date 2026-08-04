"use client";

import { CircleCheck, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/cn";

interface AuthFeedbackProps {
  tone: "error" | "success";
  title?: string;
  message: string;
}

export function AuthFeedback({ tone, title, message }: AuthFeedbackProps) {
  const isError = tone === "error";
  const Icon = isError ? TriangleAlert : CircleCheck;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-memo-md border p-3.5 text-sm",
        isError
          ? "border-error-container bg-error-container text-error-on-container"
          : "border-status-active-bg bg-status-active-bg text-status-active-text"
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
