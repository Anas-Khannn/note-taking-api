import { notifyAuthChanged } from "@/lib/auth-events";
import { redirectToLogin } from "@/lib/auth-redirect";
import {
  clearAuthSession,
  getStoredToken,
} from "@/lib/auth-storage";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>;
  auth?: boolean;
}

interface ApiErrorBody {
  message?: string;
  success?: boolean;
}

function buildUrl(
  path: string,
  query?: RequestOptions["query"]
): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

// Resolves a backend-relative path (e.g. "/uploads/profile/x.jpg") against
// the API origin so avatar images served by the Express static route load
// from the correct host. Absolute URLs are returned unchanged.
export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  return new URL(path, origin.endsWith("/") ? origin : `${origin}/`).toString();
}

async function parseBody<T>(response: Response): Promise<T | undefined> {
  if (response.status === 204) return undefined;
  try {
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { query, auth = true, headers, ...rest } = options;

  const url = buildUrl(path, query);

  const requestHeaders = new Headers(headers);
  // Multipart bodies get their boundary header from the browser; forcing a
  // JSON content type here would corrupt the request.
  if (!requestHeaders.has("Content-Type") && !(rest.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  // Attach a bearer token only when a real token exists. A token is never
  // read during server rendering and is never logged or hardcoded.
  if (auth) {
    const token = getStoredToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, { headers: requestHeaders, ...rest });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Make sure the API is running.",
      0,
      "NETWORK_ERROR"
    );
  }

  const body = await parseBody<ApiErrorBody>(response);

  if (!response.ok) {
    if (response.status === 401 && auth) {
      handleUnauthorized();
    }
    const message =
      body?.message ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return body as T;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong while loading your notes.";
}

// Centralized handling for 401 responses on authenticated requests. Invalid,
// expired, deleted, or tampered tokens are all treated the same: the stored
// session is cleared, the auth context is notified, and the user is taken to
// the sign-in page. Login/register/reset requests opt out (auth: false), so a
// failed sign-in is never mistaken for an expired session.
function handleUnauthorized(): void {
  clearAuthSession();
  notifyAuthChanged();
  redirectToLogin();
}
