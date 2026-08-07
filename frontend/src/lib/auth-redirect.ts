// Hard navigation to the sign-in page. Used by the API client when a
// protected request is rejected with 401. A full navigation (instead of the
// router) guarantees every piece of cached app state is discarded before the
// login page renders. Kept in its own module so tests can stub it without
// triggering a real (jsdom) navigation.
export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  window.location.replace("/login?session=expired");
}
