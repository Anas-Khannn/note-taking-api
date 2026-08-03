import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid, className, ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "min-h-32 w-full resize-y rounded-memo-md border-none bg-input-bg px-4 py-3 text-base text-ink placeholder:text-ink-muted",
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
Textarea.displayName = "Textarea";
