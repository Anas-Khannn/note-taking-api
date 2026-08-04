import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leadingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, leadingIcon, className, ...rest }, ref) => {
    return (
      <div className="relative w-full">
        {leadingIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-muted"
          >
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-11 w-full rounded-memo-md border-none bg-input-bg px-4 text-base text-ink placeholder:text-ink-muted",
            "transition-shadow focus:outline-none focus:ring-2 focus:ring-brand",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            leadingIcon ? "pl-11" : undefined,
            invalid && "ring-2 ring-error focus:ring-error",
            className
          )}
          {...rest}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
