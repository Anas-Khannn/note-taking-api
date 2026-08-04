"use client";

import { type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface AuthSubmitButtonProps {
  pending: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AuthSubmitButton({
  pending,
  icon,
  children,
  className,
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      size="lg"
      loading={pending}
      disabled={pending}
      aria-busy={pending}
      leftIcon={pending ? undefined : icon}
      className={cn("w-full", className)}
    >
      {children}
    </Button>
  );
}
