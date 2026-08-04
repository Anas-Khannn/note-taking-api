import { getStoredToken } from "@/lib/auth-storage";

const API_BASE_URL =
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
  if (!requestHeaders.has("Content-Type")) {
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
