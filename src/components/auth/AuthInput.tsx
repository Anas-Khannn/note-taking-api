"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";
import type { LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/Input";

interface AuthInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  hint?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    { id, label, icon: Icon, error, hint, type = "text", ...rest },
    ref
  ) => {
    const describedBy = [
      error ? `${id}-error` : null,
      hint && !error ? `${id}-hint` : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <Input
          id={id}
          ref={ref}
          type={type}
          invalid={Boolean(error)}
          leadingIcon={<Icon size={18} strokeWidth={1.8} />}
          aria-describedby={describedBy}
          className="h-12"
          {...rest}
        />
        {error ? (
          <p id={`${id}-error`} className="text-xs text-error">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-xs text-ink-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";
