import { data, type ActionFunctionArgs } from "react-router";

const attempts = new Map<string, { count: number; resetAt: number }>();

function allowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return ["www.puna-tech.com", "puna-tech.com", "localhost", "127.0.0.1"].includes(new URL(origin).hostname); }
  catch { return false; }
}

function hasCapacity(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) { attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 }); return true; }
  current.count += 1;
  return current.count <= 12;
}

export async function action({ request }: ActionFunctionArgs) {
  if (!allowedOrigin(request)) return data({ error: "Invalid origin." }, { status: 403 });
  if (!hasCapacity(request)) return data({ error: "Rate limit exceeded." }, { status: 429 });
  if (Number(request.headers.get("content-length") || 0) > 12_000) return data({ error: "Request too large." }, { status: 413 });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return data({ error: "Assistant unavailable." }, { status: 503 });
  const body = await request.json().catch(() => null) as { locale?: string; messages?: Array<{ role?: string; content?: string }> } | null;
  const locale = body?.locale === "es" ? "es" : "en";
  const messages = Array.isArray(body?.messages) ? body.messages.slice(-8).flatMap((message) => {
    if ((message.role !== "user" && message.role !== "assistant") || typeof message.content !== "string") return [];
    const content = message.content.trim().slice(0, 800);
    return content ? [{ role: message.role, content }] : [];
  }) : [];
  if (!messages.length) return data({ error: "Invalid messages." }, { status: 400 });
  const system = locale === "es"
    ? "Sos el asistente breve de Puna Tech. Ayudá a un líder B2B a describir un cuello de botella operativo y a decidir si corresponde software a medida, automatización con IA o una integración. Hacé como máximo una pregunta por respuesta. No inventes capacidades, precios, plazos, clientes ni métricas. No solicites datos sensibles. Si el caso parece concreto, sugerí agendar una llamada de 15 minutos. Respondé en español claro en menos de 100 palabras."
    : "You are Puna Tech's concise project assistant. Help a B2B leader describe an operational bottleneck and decide whether custom software, AI automation, or systems integration may fit. Ask at most one question per reply. Never invent capabilities, prices, timelines, clients, or metrics. Do not request sensitive data. If the use case is concrete, suggest a 15-minute discovery call. Reply in clear English under 100 words.";
  const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.2, max_tokens: 180, messages: [{ role: "system", content: system }, ...messages] }) });
  if (!response.ok) return data({ error: "Assistant unavailable." }, { status: 502 });
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const message = payload.choices?.[0]?.message?.content?.trim();
  if (!message) return data({ error: "Assistant unavailable." }, { status: 502 });
  return data({ message });
}
