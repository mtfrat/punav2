type Usage = Record<string, any> | null | undefined;
export type TelemetryStep = { usage?: Usage; requestId?: string; durationMs?: number };

function nonNegativeNumber(value: string | undefined) {
  if (value == null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function contentPricing() {
  const input = nonNegativeNumber(process.env.CONTENT_MODEL_INPUT_USD_PER_MILLION);
  const cached = nonNegativeNumber(process.env.CONTENT_MODEL_CACHED_INPUT_USD_PER_MILLION);
  const output = nonNegativeNumber(process.env.CONTENT_MODEL_OUTPUT_USD_PER_MILLION);
  const version = process.env.CONTENT_PRICING_VERSION?.trim() || "";
  if (input == null || cached == null || output == null || !version) return null;
  return { currency: "USD", unit: "million_tokens", version, input, cached_input: cached, output };
}

export function contentQualityConfigurationValid() {
  return Boolean(contentPricing());
}

function usageCounts(usage: Usage) {
  const input = Math.max(0, Number(usage?.input_tokens || 0));
  const cached = Math.max(0, Number(usage?.input_tokens_details?.cached_tokens || usage?.input_tokens_details?.cached_input_tokens || 0));
  const output = Math.max(0, Number(usage?.output_tokens || 0));
  return { input, cached: Math.min(cached, input), output };
}

export function buildRunTelemetry(steps: Record<string, TelemetryStep>, startedAt?: string | null, completedAt = new Date().toISOString()) {
  let inputTokens = 0; let cachedInputTokens = 0; let outputTokens = 0;
  const requestTrace: Record<string, string> = {};
  const stageTimings: Record<string, { duration_ms: number }> = {};
  for (const [stage, step] of Object.entries(steps)) {
    const counts = usageCounts(step.usage);
    inputTokens += counts.input; cachedInputTokens += counts.cached; outputTokens += counts.output;
    if (step.requestId) requestTrace[stage] = step.requestId;
    if (Number.isFinite(step.durationMs)) stageTimings[stage] = { duration_ms: Math.max(0, Math.round(step.durationMs || 0)) };
  }
  const pricing = contentPricing();
  const billableInput = Math.max(0, inputTokens - cachedInputTokens);
  const cost = pricing ? ((billableInput * pricing.input) + (cachedInputTokens * pricing.cached_input) + (outputTokens * pricing.output)) / 1_000_000 : null;
  const startMs = startedAt ? Date.parse(startedAt) : Number.NaN;
  const endMs = Date.parse(completedAt);
  return {
    input_tokens: inputTokens,
    cached_input_tokens: cachedInputTokens,
    output_tokens: outputTokens,
    stage_timings: stageTimings,
    request_trace: requestTrace,
    duration_ms: Number.isFinite(startMs) && Number.isFinite(endMs) ? Math.max(0, endMs - startMs) : Object.values(stageTimings).reduce((sum, stage) => sum + stage.duration_ms, 0),
    estimated_cost_usd: cost,
    pricing_snapshot: pricing,
  };
}

export function isRetryableGenerationError(code: string) {
  return ["model_timeout", "model_rate_limited", "model_unavailable", "worker_timeout", "worker_unavailable", "worker_request_failed", "invalid_worker_response", "render_failed"].includes(code);
}
