"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  children: ReactNode;
  variant?: "default" | "ghost" | "danger";
}

export function IconButton({
  "aria-label": ariaLabel,
  children,
  variant = "ghost",
  disabled,
  className = "",
  ...props
}: IconButtonProps) {
  const variantStyles = {
    default: "text-gray-700 hover:bg-gray-100",
    ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    danger: "text-red-500 hover:bg-red-50 hover:text-red-700",
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={`inline-flex items-center justify-center w-11 h-11 rounded-lg transition-colors ${variantStyles[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
