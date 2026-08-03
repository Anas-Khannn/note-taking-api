"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  header?: ReactNode;
  description?: string;
  size?: "md" | "sm";
  showCloseButton?: boolean;
  ariaLabel?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  children,
  title,
  header,
  description,
  size = "md",
  showCloseButton = true,
  ariaLabel,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const initialFocus = dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    initialFocus?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !dialog.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={!header && title ? titleId : undefined}
        aria-label={ariaLabel}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-memo-lg bg-modal-surface shadow-memo-standard",
          size === "md" ? "max-w-[600px]" : "max-w-[400px]"
        )}
      >
        {header ? (
          header
        ) : (
          <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 pb-4 pt-5">
            {title && (
              <h2
                id={titleId}
                className="text-xl font-semibold text-ink"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <IconButton label="Close dialog" icon={X} onClick={onClose} />
            )}
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
