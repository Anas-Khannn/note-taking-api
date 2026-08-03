import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-11 w-full rounded-memo-md border-none bg-input-bg px-4 text-base text-ink placeholder:text-ink-muted",
          "transition-shadow focus:outline-none focus:ring-2 focus:ring-brand",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          invalid && "ring-2 ring-error focus:ring-error",
          className
        )}
        {...rest}
      />
    );
  }
);
Input.displayName = "Input";
