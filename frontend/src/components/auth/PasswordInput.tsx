"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> {
  id: string;
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ id, label, icon: Icon = LockKeyhole, error, autoComplete, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={id} className="text-sm font-medium text-ink">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <Input
            id={id}
            ref={ref}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            invalid={Boolean(error)}
            leadingIcon={<Icon size={18} strokeWidth={1.8} />}
            aria-describedby={error ? `${id}-error` : undefined}
            className="h-12 pr-12"
            {...rest}
          />
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((isVisible) => !isVisible)}
            className={cn(
              "absolute inset-y-0 right-1 my-auto flex size-11 items-center justify-center rounded-memo-md",
              "text-ink-muted transition-colors hover:text-ink",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            )}
          >
            {visible ? (
              <EyeOff size={20} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Eye size={20} strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>
        </div>
        {error ? (
          <p id={`${id}-error`} className="text-xs text-error">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
