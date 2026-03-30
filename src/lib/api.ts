type ApiRequestOptions = {
  baseUrl?: string;
  method?: string;
  token?: string | null;
  body?: unknown;
  query?: Record<string, string | number | null | undefined>;
};

export class ApiError extends Error {
  status: number;
  detail: string;
  payload: unknown;

  constructor(message: string, status: number, detail: string, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.payload = payload;
  }
}

function sanitizeDetail(detail: string): string {
  const trimmed = detail.trim();
  if (!trimmed) {
    return "Unexpected server error.";
  }
  if (trimmed.includes("Traceback") || trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    return "Unexpected server error. The request failed before the app could format a safe response.";
  }
  if (trimmed.length > 600) {
    return `${trimmed.slice(0, 600)}...`;
  }
  return trimmed;
}

function buildQuery(query?: ApiRequestOptions["query"]): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }
    params.set(key, String(value));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function buildUrl(path: string, baseUrl = "", query?: ApiRequestOptions["query"]): string {
  const queryString = buildQuery(query);
  if (!baseUrl.trim()) {
    return `${path}${queryString}`;
  }

  const resolved = new URL(path, `${baseUrl.replace(/\/+$/, "")}/`);
  resolved.search = queryString.startsWith("?") ? queryString.slice(1) : queryString;
  return resolved.toString();
}

export async function apiRequest<T>(
  path: string,
  { baseUrl = "", method = "GET", token, body, query }: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path, baseUrl, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail =
      typeof payload === "string"
        ? sanitizeDetail(payload)
        : typeof payload === "object" && payload !== null && "detail" in payload
          ? sanitizeDetail(String((payload as { detail: unknown }).detail))
          : response.statusText;
    throw new ApiError(detail, response.status, detail, payload);
  }

  return payload as T;
}
