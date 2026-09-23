import { readFileSync } from "node:fs";
import { resolve } from "node:path";

let token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  try {
    const raw = readFileSync(resolve(process.cwd(), "nightshift", "config", "puna-tech.json"), "utf-8");
    const cfg = JSON.parse(raw);
    token = cfg.agents?.morningBrief?.telegramBotToken;
  } catch {}
}

if (!token) {
  console.error("❌ Error: TELEGRAM_BOT_TOKEN no encontrado.");
  process.exit(1);
}

const webhookUrl = process.argv[2] || "https://www.puna-tech.com/api/telegram-webhook";

console.log(`Configurando webhook de Telegram...`);
console.log(`URL destino: ${webhookUrl}`);

async function setup() {
  const url = `https://api.telegram.org/bot${token}/setWebhook`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: true,
    }),
  });

  const json = await res.json();
  if (json.ok) {
    console.log("✔ Webhook configurado con éxito en Telegram:", json);
  } else {
    console.error("✖ Error configurando webhook:", json);
  }

  // Get current info
  const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const info = await infoRes.json();
  console.log("ℹ Información actual del Webhook:", info);
}

setup().catch(console.error);
