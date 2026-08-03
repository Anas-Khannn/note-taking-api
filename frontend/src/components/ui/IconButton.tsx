import { forwardRef, type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

type IconButtonTone = "neutral" | "danger" | "brand";

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> {
  label: string;
  icon: LucideIcon;
  iconSize?: number;
  tone?: IconButtonTone;
}

const toneClasses: Record<IconButtonTone, string> = {
  neutral: "text-ink-secondary hover:bg-border-subtle/70",
  danger: "text-error hover:bg-error-container",
  brand: "bg-brand text-brand-on hover:bg-brand-hover",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { label, icon: Icon, iconSize = 20, tone = "neutral", className, ...rest },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          toneClasses[tone],
          className
        )}
        {...rest}
      >
        <Icon size={iconSize} strokeWidth={1.8} aria-hidden="true" />
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
