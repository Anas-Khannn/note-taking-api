// Cross-module signal that tells the auth context the stored session changed
// (login, logout, or session expiry). Listening to a custom event keeps the
// auth state in sync across the app without a page reload, in the same way
// the browser's "storage" event does for other tabs.
export const AUTH_CHANGE_EVENT = "memonest:auth-change";

export function notifyAuthChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}
