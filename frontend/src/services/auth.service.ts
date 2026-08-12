import { ApiError, apiRequest } from "@/lib/api";
import { AUTH_ENDPOINTS } from "@/lib/auth-config";
import type {
  AuthSession,
  AuthUser,
  ForgotPasswordInput,
  ForgotPasswordResult,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  ResetPasswordResult,
  UpdateProfileInput,
} from "@/types/auth.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAuthUser(value: unknown): value is AuthUser {
  return (
    isRecord(value) &&
    typeof value.user_id === "string" &&
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
  if (isRecord(candidate) && candidate.requiresVerification === true) {
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
  let candidate = unwrapData(body);
  // The profile endpoint wraps the user in a data.user envelope while the
  // current-user endpoint returns the user directly. Accept both shapes.
  if (isRecord(candidate) && isAuthUser(candidate.user)) {
    candidate = candidate.user;
  }
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
  const body = await apiRequest<unknown>(AUTH_ENDPOINTS.login.path, {
    method: "POST",
    body: JSON.stringify(input),
    auth: false,
  });
  return parseAuthSession(body);
}

export async function registerUser(
  input: RegisterInput
): Promise<RegisterResult> {
  const body = await apiRequest<unknown>(AUTH_ENDPOINTS.register.path, {
    method: "POST",
    body: JSON.stringify(input),
    auth: false,
  });
  return parseRegisterResult(body);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const body = await apiRequest<unknown>(AUTH_ENDPOINTS.me.path);
  return parseUserResponse(body);
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<AuthUser> {
  let body: BodyInit;
  if (input.profileImage instanceof File) {
    const formData = new FormData();
    if (typeof input.name === "string" && input.name.trim().length > 0) {
      formData.set("name", input.name.trim());
    }
    if (input.removeProfileImage) {
      formData.set("removeProfileImage", "true");
    }
    formData.set("profileImage", input.profileImage);
    body = formData;
  } else {
    const payload: Record<string, string | boolean> = {};
    if (typeof input.name === "string" && input.name.trim().length > 0) {
      payload.name = input.name.trim();
    }
    if (input.removeProfileImage) {
      payload.removeProfileImage = true;
    }
    body = JSON.stringify(payload);
  }

  const response = await apiRequest<unknown>(AUTH_ENDPOINTS.profile.path, {
    method: "PATCH",
    body,
  });
  return parseUserResponse(response);
}

export async function logoutUser(): Promise<void> {
  await apiRequest<unknown>(AUTH_ENDPOINTS.logout.path, {
    method: "POST",
  });
}

export async function requestPasswordReset(
  input: ForgotPasswordInput
): Promise<ForgotPasswordResult> {
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
  await apiRequest<unknown>(AUTH_ENDPOINTS.resetPassword.path, {
    method: "POST",
    body: JSON.stringify(input),
    auth: false,
  });
  return { message: "Your password has been reset. You can sign in now." };
}
