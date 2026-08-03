import type { AuthSession, LoginInput, RegisterInput } from "@/types/auth";

// The MemoNest backend does not yet expose authentication routes:
//   POST /api/auth/register
//   POST /api/auth/login
//   POST /api/auth/logout
//   GET  /api/auth/me
// These typed contracts are declared so the frontend can be wired up once the
// backend ships them. No requests are issued to invented URLs, and no fake
// authenticated session is created.

const AUTH_BACKEND_MISSING =
  "Authentication is not available yet: the backend does not expose authentication endpoints.";

// The parameter names below are intentionally unused: the functions are typed
// contracts that throw until the backend auth routes exist.
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * TODO(backend): wire up POST /api/auth/register once the backend implements it.
 */
export async function registerUser(_input: RegisterInput): Promise<AuthSession> {
  throw new Error(AUTH_BACKEND_MISSING);
}

/**
 * TODO(backend): wire up POST /api/auth/login once the backend implements it.
 */
export async function loginUser(_input: LoginInput): Promise<AuthSession> {
  throw new Error(AUTH_BACKEND_MISSING);
}

/**
 * TODO(backend): wire up GET /api/auth/me once the backend implements it.
 */
export async function getCurrentUser(): Promise<AuthSession> {
  throw new Error(AUTH_BACKEND_MISSING);
}

/**
 * TODO(backend): wire up POST /api/auth/logout once the backend implements it.
 */
export async function logoutUser(): Promise<void> {
  throw new Error(AUTH_BACKEND_MISSING);
}
