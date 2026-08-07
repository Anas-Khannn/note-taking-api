import type { AuthUser } from "@/types/auth";

export function getUserInitials(user: AuthUser): string {
  const name = user.name.trim();
  if (!name) {
    return user.email.slice(0, 1).toUpperCase() || "?";
  }
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
