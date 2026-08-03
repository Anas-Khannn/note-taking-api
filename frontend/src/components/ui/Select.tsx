import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, invalid, className, ...rest }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-11 w-full appearance-none rounded-memo-md border-none bg-input-bg py-2 pl-4 pr-10 text-sm font-medium text-ink",
            "transition-shadow focus:outline-none focus:ring-2 focus:ring-brand",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            invalid && "ring-2 ring-error focus:ring-error",
            className
          )}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          strokeWidth={1.8}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
      </div>
    );
  }
);
Select.displayName = "Select";
