import { data, type ActionFunctionArgs } from "react-router";
import { executeNightshiftDecision, loadDecisionsState } from "../lib/nightshift-executor.server";

const AUTHORIZED_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1503439078";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        reply_markup: replyMarkup,
      }),
    });
  } catch (err) {
    console.error("[TelegramWebhook] sendMessage error:", err);
  }
}

async function answerTelegramCallback(callbackQueryId: string, text: string, showAlert = false) {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
  } catch (err) {
    console.error("[TelegramWebhook] answerCallbackQuery error:", err);
  }
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return data({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Handle Inline Button Callback Queries
  if (body.callback_query) {
    const cq = body.callback_query;
    const chatId = String(cq.message?.chat?.id || cq.from?.id);
    const callbackData = String(cq.data || "");

    // Validate authorized chat
    if (chatId !== String(AUTHORIZED_CHAT_ID)) {
      await answerTelegramCallback(cq.id, "No autorizado.", true);
      return data({ ok: false, error: "Unauthorized" }, { status: 403 });
    }

    if (callbackData.startsWith("approve_all:")) {
      const dateStr = callbackData.split(":")[1] || todayStr;
      const res = await executeNightshiftDecision({
        decisionNumOrAll: "all",
        dateStr,
        actor: {
          email: "telegram-admin@puna-tech.com",
          source: "telegram",
        },
      });

      await answerTelegramCallback(cq.id, "🎉 ¡Todas las decisiones aprobadas y sincronizadas!", false);

      const msg = [
        `🎉 *¡Todas las decisiones del ${dateStr} fueron aprobadas!*`,
        "",
        ...(res.details?.actionSummaries || []),
        "",
        `🔗 Ver en vivo: https://www.puna-tech.com/ops/nightshift?date=${dateStr}`,
      ].join("\n");

      await sendTelegramMessage(chatId, msg);
      return data({ ok: true });
    }

    if (callbackData.startsWith("approve_dec:")) {
      const parts = callbackData.split(":");
      const num = Number(parts[1]);
      const dateStr = parts[2] || todayStr;

      const res = await executeNightshiftDecision({
        decisionNumOrAll: num,
        dateStr,
        actor: {
          email: "telegram-admin@puna-tech.com",
          source: "telegram",
        },
      });

      await answerTelegramCallback(cq.id, `✅ Decisión #${num} aprobada`, false);
      await sendTelegramMessage(chatId, `✅ *Decisión #${num} Aprobada*\n\n${res.message}\n\n🔗 https://www.puna-tech.com/ops/nightshift`);
      return data({ ok: true });
    }

    await answerTelegramCallback(cq.id, "Opción procesada.");
    return data({ ok: true });
  }

  // 2. Handle Text Commands
  if (body.message && body.message.text) {
    const chatId = String(body.message.chat.id);
    const text = body.message.text.trim().toLowerCase();

    if (chatId !== String(AUTHORIZED_CHAT_ID)) {
      return data({ ok: false, error: "Unauthorized" }, { status: 403 });
    }

    if (text === "/aprobar todo" || text === "/aprobar_todo" || text === "/aprobar all" || text === "/ok") {
      const res = await executeNightshiftDecision({
        decisionNumOrAll: "all",
        dateStr: todayStr,
        actor: {
          email: "telegram-admin@puna-tech.com",
          source: "telegram",
        },
      });

      const msg = [
        `🎉 *¡Aprobadas todas las decisiones del turno nocturno!*`,
        "",
        ...(res.details?.actionSummaries || []),
        "",
        `🔗 Panel web: https://www.puna-tech.com/ops/nightshift`,
      ].join("\n");

      await sendTelegramMessage(chatId, msg);
      return data({ ok: true });
    }

    const matchDec = text.match(/\/aprobar\s+(\d+)/);
    if (matchDec) {
      const num = Number(matchDec[1]);
      const res = await executeNightshiftDecision({
        decisionNumOrAll: num,
        dateStr: todayStr,
        actor: {
          email: "telegram-admin@puna-tech.com",
          source: "telegram",
        },
      });

      await sendTelegramMessage(chatId, `✅ *Decisión #${num} Aprobada:*\n\n${res.message}`);
      return data({ ok: true });
    }

    if (text === "/status" || text === "/estado") {
      const states = await loadDecisionsState();
      const todayKeys = Object.keys(states).filter((k) => k.startsWith(todayStr));
      const approved = todayKeys.filter((k) => states[k]?.status === "approved").length;

      const reply = [
        `📊 *Estado de Decisiones de Hoy (${todayStr}):*`,
        `• Total evaluadas: ${todayKeys.length || 5}`,
        `• Aprobadas: ${approved}`,
        "",
        `Para aprobar todo respondé: \`/aprobar todo\``,
        `Para aprobar una individual: \`/aprobar 1\`, \`/aprobar 2\`, etc.`,
        `Panel web: https://www.puna-tech.com/ops/nightshift`,
      ].join("\n");

      await sendTelegramMessage(chatId, reply);
      return data({ ok: true });
    }

    if (text === "/start" || text === "/help" || text === "/ayuda") {
      const helpMsg = [
        `🤖 *Puna Tech Nightshift Bot*`,
        "",
        `Comandos disponibles:`,
        `• \`/aprobar todo\` — Aprueba las 5 decisiones del día en bloque.`,
        `• \`/aprobar 1\` — Aprueba los borradores de redes para Autopost.`,
        `• \`/aprobar 2\` — Importa los prospectos calificados a /ops/prospects.`,
        `• \`/aprobar 3\` — Aprueba la oportunidad de nicho.`,
        `• \`/aprobar 4\` — Aprueba el demo para preview.`,
        `• \`/aprobar 5\` — Aprueba el refactor técnico.`,
        `• \`/status\` — Ver estado de aprobaciones de hoy.`,
        "",
        `También podés usar los botones interactivos del Morning Brief.`,
      ].join("\n");

      await sendTelegramMessage(chatId, helpMsg);
      return data({ ok: true });
    }
  }

  return data({ ok: true });
}
