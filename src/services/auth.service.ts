import { ApiError, apiRequest } from "@/lib/api";
import {
  AUTH_ENDPOINT_AVAILABILITY,
  AUTH_ENDPOINTS,
  type AuthEndpoint,
} from "@/lib/auth-config";
import type {
  AuthSession,
  AuthUser,
  ForgotPasswordInput,
  ForgotPasswordResult,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  ResetPasswordResult,
} from "@/types/auth";

// The MemoNest backend does not yet expose authentication routes. These typed
// contracts describe exactly what each function will call once the backend
// ships the route. Submitting an unavailable endpoint throws a clear,
// development-friendly error and never fabricates a successful response.
// No fake token or user is ever created.

export class AuthBackendUnavailableError extends Error {
  readonly endpoint: string;
  readonly method: string;

  constructor(endpoint: AuthEndpoint) {
    const { path, method } = AUTH_ENDPOINTS[endpoint];
    super(
      `Authentication is not available yet. The MemoNest backend does not ` +
        `expose ${method} /api${path}. Nothing was submitted.`
    );
    this.name = "AuthBackendUnavailableError";
    this.endpoint = path;
    this.method = method;
  }
}

function assertBackendEndpoint(endpoint: AuthEndpoint): void {
  if (!AUTH_ENDPOINT_AVAILABILITY[endpoint]) {
    throw new AuthBackendUnavailableError(endpoint);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAuthUser(value: unknown): value is AuthUser {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string"
  );
}

// The backend wraps payloads in { success, message, data }. Accept either that
// envelope or a direct payload so the contract stays flexible.
function unwrapData(body: unknown): unknown {
  if (isRecord(body) && "data" in body) {
    return body.data;
  }
  return body;
}

export function parseAuthSession(body: unknown): AuthSession {
  const candidate = unwrapData(body);
  if (
    isRecord(candidate) &&
    typeof candidate.token === "string" &&
    candidate.token.length > 0 &&
    isAuthUser(candidate.user)
  ) {
    return { token: candidate.token, user: candidate.user };
  }
  throw new ApiError(
    "The authentication response from the server was invalid.",
    500,
    "INVALID_AUTH_RESPONSE"
  );
}

export interface RegisterVerificationRequired {
  requiresVerification: true;
  message: string;
}

export type RegisterResult = AuthSession | RegisterVerificationRequired;

export function isRegisterSession(
  result: RegisterResult
): result is AuthSession {
  return "token" in result;
}

function parseRegisterResult(body: unknown): RegisterResult {
  const candidate = unwrapData(body);
  if (
    isRecord(candidate) &&
    candidate.requiresVerification === true
  ) {
    return {
      requiresVerification: true,
      message:
        typeof candidate.message === "string"
          ? candidate.message
          : "Check your email to verify your account.",
    };
  }
  return parseAuthSession(body);
}

function parseUserResponse(body: unknown): AuthUser {
  const candidate = unwrapData(body);
  if (isAuthUser(candidate)) {
    return candidate;
  }
  throw new ApiError(
    "The authentication response from the server was invalid.",
    500,
    "INVALID_AUTH_RESPONSE"
  );
}

export async function loginUser(input: LoginInput): Promise<AuthSession> {
  assertBackendEndpoint("login");
  const body = await apiRequest<unknown>(AUTH_ENDPOINTS.login.path, {
    method: "POST",
    body: JSON.stringify(input),
    auth: false,
  });
  return parseAuthSession(body);
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  assertBackendEndpoint("register");
  const body = await apiRequest<unknown>(AUTH_ENDPOINTS.register.path, {
    method: "POST",
    body: JSON.stringify(input),
    auth: false,
  });
  return parseRegisterResult(body);
}

export async function getCurrentUser(): Promise<AuthUser> {
  assertBackendEndpoint("me");
  const body = await apiRequest<unknown>(AUTH_ENDPOINTS.me.path);
  return parseUserResponse(body);
}

export async function refreshToken(): Promise<AuthSession> {
  assertBackendEndpoint("refresh");
  const body = await apiRequest<unknown>(AUTH_ENDPOINTS.refresh.path, {
    method: "POST",
  });
  return parseAuthSession(body);
}

export async function logoutUser(): Promise<void> {
  assertBackendEndpoint("logout");
  await apiRequest<unknown>(AUTH_ENDPOINTS.logout.path, {
    method: "POST",
  });
}

export async function requestPasswordReset(
  input: ForgotPasswordInput
): Promise<ForgotPasswordResult> {
  assertBackendEndpoint("forgotPassword");
  await apiRequest<unknown>(AUTH_ENDPOINTS.forgotPassword.path, {
    method: "POST",
    body: JSON.stringify(input),
    auth: false,
  });
  // Neutral, account-agnostic success message: it never reveals whether an
  // email exists on the platform.
  return { message: "Check your inbox for password reset instructions." };
}

export async function resetPassword(
  input: ResetPasswordInput
): Promise<ResetPasswordResult> {
  assertBackendEndpoint("resetPassword");
  await apiRequest<unknown>(AUTH_ENDPOINTS.resetPassword.path, {
    method: "POST",
    body: JSON.stringify(input),
    auth: false,
  });
  return { message: "Your password has been reset. You can sign in now." };
}
