const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Opts = { method?: string; body?: unknown; form?: FormData };

/**
 * Thin fetch wrapper. We key off the HTTP status rather than the body's
 * `success` flag because several backend handlers return `success: false`
 * on a 200.
 */
export async function api<T = any>(path: string, { method = "GET", body, form }: Opts = {}): Promise<T> {
  const init: RequestInit = { method, credentials: "include", headers: {} };
  if (form) init.body = form;
  else if (body !== undefined) {
    (init.headers as Record<string, string>)["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  let res: Response;
  try {
    res = await fetch(BASE + path, init);
  } catch {
    throw new ApiError("Can't reach the server. Is the backend running?", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data?.message || `Request failed (${res.status})`, res.status);
  return data as T;
}

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");
