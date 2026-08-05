// Central registry of the authentication routes the MemoNest backend exposes
// under the /api prefix. A route is marked "available" once it actually exists
// on the server. `refresh` stays disabled because the backend intentionally
// has no refresh-token endpoint (JWTs are stateless).
//
// Live backend contract (note-taking-backend/backend):
//   POST /api/auth/register        -> { success, message, data: { user, token } }
//   POST /api/auth/login           -> { success, message, data: { user, token } }
//   POST /api/auth/logout          -> { success, message }
//   GET  /api/auth/me              -> { success, message, data: AuthUser }
//   POST /api/auth/forgot-password -> { success, message }
//   POST /api/auth/reset-password  -> { success, message }

export const AUTH_ENDPOINTS = {
  register: { path: "/auth/register", method: "POST" },
  login: { path: "/auth/login", method: "POST" },
  logout: { path: "/auth/logout", method: "POST" },
  me: { path: "/auth/me", method: "GET" },
  refresh: { path: "/auth/refresh", method: "POST" },
  forgotPassword: { path: "/auth/forgot-password", method: "POST" },
  resetPassword: { path: "/auth/reset-password", method: "POST" },
} as const;

export type AuthEndpoint = keyof typeof AUTH_ENDPOINTS;

export const AUTH_ENDPOINT_AVAILABILITY: Record<AuthEndpoint, boolean> = {
  register: true,
  login: true,
  logout: true,
  me: true,
  refresh: false,
  forgotPassword: true,
  resetPassword: true,
};

// The backend now serves a real login flow, so the notes dashboard is
// protected and stored sessions are revalidated against GET /api/auth/me.
export const ROUTE_PROTECTION_ENABLED = true;
export const SESSION_VALIDATION_ENABLED = true;
