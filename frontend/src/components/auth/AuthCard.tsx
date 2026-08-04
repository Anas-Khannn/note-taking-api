import { cn } from "@/lib/cn";

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-memo-lg border border-border-subtle bg-card-surface p-6 shadow-memo-standard sm:p-8 lg:p-10",
        className
      )}
    >
      {children}
    </div>
  );
}
