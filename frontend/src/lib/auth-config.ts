// Central registry of the authentication routes the MemoNest backend is
// expected to ship under the /api prefix. Each entry is disabled until the
// route actually exists on the server. Flipping an entry to `true` activates
// the real request path in the auth service and the dependent behavior.
//
// Current backend status (note-taking-backend/backend):
//   Only /api/note/* routes exist. None of the auth routes below are
//   implemented, so every value is false. No fake tokens, users, or
//   successful responses are ever produced while they stay false.
//
// Contract the backend must implement for the frontend to go live:
//   POST /api/auth/register        -> { success, message, data: { user, token } }
//                                     or { success, message, data: { requiresVerification, message } }
//   POST /api/auth/login           -> { success, message, data: { user, token } }
//   POST /api/auth/logout          -> { success, message }
//   GET  /api/auth/me              -> { success, message, data: AuthUser }
//   POST /api/auth/refresh         -> { success, message, data: { user, token } }
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
  register: false,
  login: false,
  logout: false,
  me: false,
  refresh: false,
  forgotPassword: false,
  resetPassword: false,
};

// Route protection and /auth/me session revalidation only switch on once a
// real backend login flow exists. Keeping them off today preserves the
// working notes dashboard for anonymous users.
export const ROUTE_PROTECTION_ENABLED = false;
export const SESSION_VALIDATION_ENABLED = false;
