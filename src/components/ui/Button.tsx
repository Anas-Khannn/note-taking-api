import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-brand-on hover:bg-brand-hover focus-visible:ring-brand",
  ghost:
    "bg-transparent text-ink-secondary hover:bg-border-subtle/70 focus-visible:ring-brand",
  danger:
    "bg-error text-white hover:bg-error-hover focus-visible:ring-error",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      disabled,
      className,
      children,
      type = "button",
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-memo-md font-semibold transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...rest}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          leftIcon
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
