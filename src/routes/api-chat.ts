import { data, type ActionFunctionArgs } from "react-router";
import { buildChatRepairPrompt, buildChatSystemPrompt, chatReplyNeedsRepair } from "../lib/chat-prompt";

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
  const system = buildChatSystemPrompt(locale);
  const complete = async (prompt: string, conversation: Array<{ role: string; content: string }>) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.1, max_tokens: 180, messages: [{ role: "system", content: prompt }, ...conversation] }) });
    if (!response.ok) return null;
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return payload.choices?.[0]?.message?.content?.trim() || null;
  };
  let message = await complete(system, messages);
  if (message && chatReplyNeedsRepair(message, locale)) {
    message = await complete(`${system}\n\n${buildChatRepairPrompt(locale)}`, [...messages, { role: "assistant", content: message }, { role: "user", content: buildChatRepairPrompt(locale) }]);
  }
  if (!message) return data({ error: "Assistant unavailable." }, { status: 502 });
  return data({ message });
}
