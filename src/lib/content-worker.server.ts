import { randomUUID } from "node:crypto";

export interface WorkerErrorBody {
  error: {
    code: string;
    message: string;
    retryable: boolean;
    request_id: string;
  };
}

export interface WorkerHealth {
  status: "ok";
  service: "puna-content-worker";
  version: "1";
}

export interface WorkerCapabilities {
  service: "puna-content-worker";
  version: "1";
  mutations_enabled: boolean;
  capabilities: Array<"text_generation" | "brand_overlay" | "brand_library">;
}

export class ContentWorkerError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
  readonly requestId: string;

  constructor(
    message: string,
    code: string,
    status: number,
    retryable: boolean,
    requestId: string,
  ) {
    super(message);
    this.name = "ContentWorkerError";
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.requestId = requestId;
  }
}

function configuration() {
  if (process.env.VITE_AUTOPOST_WORKER_TOKEN || process.env.NEXT_PUBLIC_AUTOPOST_WORKER_TOKEN) {
    throw new ContentWorkerError(
      "The worker token must never use a public environment prefix.",
      "unsafe_configuration",
      500,
      false,
      randomUUID(),
    );
  }
  const baseUrl = process.env.AUTOPOST_WORKER_URL?.trim();
  const token = process.env.AUTOPOST_WORKER_TOKEN?.trim();
  if (!baseUrl || !token) {
    throw new ContentWorkerError(
      "Content worker is not configured.",
      "worker_not_configured",
      503,
      false,
      randomUUID(),
    );
  }
  const parsed = new URL(baseUrl);
  if (parsed.protocol !== "https:" && parsed.hostname !== "127.0.0.1" && parsed.hostname !== "localhost") {
    throw new ContentWorkerError(
      "Content worker URL must use HTTPS.",
      "unsafe_configuration",
      500,
      false,
      randomUUID(),
    );
  }
  return { baseUrl: parsed, token };
}

export function contentStudioEnabled() {
  return process.env.CONTENT_STUDIO_ENABLED?.trim().toLowerCase() === "true";
}

export async function contentWorkerRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    idempotencyKey?: string;
    timeoutMs?: number;
  } = {},
): Promise<T> {
  const { baseUrl, token } = configuration();
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new ContentWorkerError("Invalid worker path.", "invalid_worker_path", 500, false, randomUUID());
  }
  const requestId = randomUUID();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 10_000);

  try {
    const response = await fetch(new URL(path, baseUrl), {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Request-ID": requestId,
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null) as T | WorkerErrorBody | null;
    if (!response.ok) {
      const workerError = payload && typeof payload === "object" && "error" in payload ? payload.error : null;
      throw new ContentWorkerError(
        workerError?.message || "Content worker request failed.",
        workerError?.code || "worker_request_failed",
        response.status,
        workerError?.retryable ?? response.status >= 500,
        workerError?.request_id || response.headers.get("X-Request-ID") || requestId,
      );
    }
    if (!payload) {
      throw new ContentWorkerError("Content worker returned an empty response.", "invalid_worker_response", 502, true, requestId);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof ContentWorkerError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ContentWorkerError("Content worker timed out.", "worker_timeout", 504, true, requestId);
    }
    throw new ContentWorkerError("Content worker is unavailable.", "worker_unavailable", 503, true, requestId);
  } finally {
    clearTimeout(timeout);
  }
}

export function getContentWorkerHealth() {
  return contentWorkerRequest<WorkerHealth>("/health");
}

export function getContentWorkerCapabilities() {
  return contentWorkerRequest<WorkerCapabilities>("/api/v1/capabilities");
}
