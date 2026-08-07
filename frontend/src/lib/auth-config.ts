// Central registry of the authentication routes the MemoNest backend exposes
// under the /api prefix. The backend implements all of the routes below
// (register, login, logout, me, forgot-password, reset-password), so the
// frontend calls them directly. No fake tokens or users are ever produced.
//
// Route protection and /auth/me session revalidation are enabled because the
// backend login flow is operational.

export const AUTH_ENDPOINTS = {
  register: { path: "/auth/register", method: "POST" },
  login: { path: "/auth/login", method: "POST" },
  logout: { path: "/auth/logout", method: "POST" },
  me: { path: "/auth/me", method: "GET" },
  profile: { path: "/auth/profile", method: "PATCH" },
  forgotPassword: { path: "/auth/forgot-password", method: "POST" },
  resetPassword: { path: "/auth/reset-password", method: "POST" },
} as const;

// Authenticated application routes are protected and stored sessions are
// revalidated against GET /api/auth/me on refresh.
export const ROUTE_PROTECTION_ENABLED = true;
export const SESSION_VALIDATION_ENABLED = true;
