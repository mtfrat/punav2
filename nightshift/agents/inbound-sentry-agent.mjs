/**
 * Inbound & Reply Sentry Agent
 * Monitors incoming email responses via IMAP (at $0 USD SaaS cost),
 * classifies reply intent (INTERESTED, QUESTION, UNSUBSCRIBE, OTHER),
 * and prepares tailored draft replies for the Executive Morning Brief.
 */

import tls from "node:tls";

export class InboundSentryAgent {
  constructor({ llmClient, config }) {
    this.llmClient = llmClient;
    this.config = config;
  }

  getImapConfig() {
    const sentryConfig = this.config.agents?.inboundSentry || {};
    const host = process.env.IMAP_HOST || sentryConfig.imapHost || "";
    const port = Number(process.env.IMAP_PORT || sentryConfig.imapPort) || 993;
    const user = process.env.IMAP_USER || sentryConfig.imapUser || "";
    const pass = process.env.IMAP_PASS || sentryConfig.imapPass || "";
    const tlsEnabled = process.env.IMAP_TLS !== "false";

    const isConfigured = Boolean(host && user && pass);

    return { host, port, user, pass, tlsEnabled, isConfigured };
  }

  /**
   * Resilient, timeout-guarded native IMAP unseen email fetcher
   */
  async fetchUnseenEmails(imapConfig, timeoutMs = 6000) {
    if (!imapConfig.isConfigured) {
      return { ok: true, unconfigured: true, emails: [] };
    }

    return new Promise((resolve) => {
      let resolved = false;
      const emails = [];
      let buffer = "";
      let step = 0; // 0: init, 1: logged in, 2: selected inbox, 3: searched, 4: fetched

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try {
            socket.destroy();
          } catch {}
          resolve({ ok: false, error: "IMAP_CONNECTION_TIMEOUT", emails: [] });
        }
      }, timeoutMs);

      const finish = (result) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          try {
            socket.end();
          } catch {}
          resolve(result);
        }
      };

      const socket = tls.connect(
        {
          host: imapConfig.host,
          port: imapConfig.port,
          servername: imapConfig.host,
          rejectUnauthorized: false,
        },
        () => {
          // Connected, awaiting IMAP banner
        }
      );

      socket.on("error", (err) => {
        finish({ ok: false, error: err.message, emails: [] });
      });

      socket.on("data", (chunk) => {
        buffer += chunk.toString("utf-8");

        // Step 0: Initial greeting -> LOGIN
        if (step === 0 && buffer.includes("* OK")) {
          step = 1;
          buffer = "";
          // Escape quotes in password and user
          const safeUser = imapConfig.user.replace(/"/g, '\\"');
          const safePass = imapConfig.pass.replace(/"/g, '\\"');
          socket.write(`A1 LOGIN "${safeUser}" "${safePass}"\r\n`);
          return;
        }

        // Step 1: LOGIN response -> SELECT INBOX
        if (step === 1) {
          if (buffer.includes("A1 OK")) {
            step = 2;
            buffer = "";
            socket.write(`A2 SELECT "INBOX"\r\n`);
          } else if (buffer.includes("A1 NO") || buffer.includes("A1 BAD")) {
            finish({ ok: false, error: "IMAP_AUTH_FAILED", emails: [] });
          }
          return;
        }

        // Step 2: SELECT INBOX response -> SEARCH UNSEEN
        if (step === 2 && buffer.includes("A2 OK")) {
          step = 3;
          buffer = "";
          socket.write(`A3 SEARCH UNSEEN\r\n`);
          return;
        }

        // Step 3: SEARCH response -> parse message numbers
        if (step === 3 && buffer.includes("A3 OK")) {
          const searchLine = buffer.match(/\* SEARCH\s*(.*)/i);
          const rawIds = searchLine && searchLine[1] ? searchLine[1].trim() : "";
          const msgIds = rawIds ? rawIds.split(/\s+/).filter(Boolean) : [];

          if (msgIds.length === 0) {
            // No unseen emails
            socket.write(`A4 LOGOUT\r\n`);
            finish({ ok: true, emails: [] });
            return;
          }

          // Fetch up to the 5 most recent unread messages
          step = 4;
          buffer = "";
          const targetIds = msgIds.slice(-5).join(",");
          socket.write(`A4 FETCH ${targetIds} (BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)] BODY.PEEK[TEXT]<0.1000>)\r\n`);
          return;
        }

        // Step 4: FETCH response -> parse emails
        if (step === 4 && buffer.includes("A4 OK")) {
          const fetchChunks = buffer.split(/\* \d+ FETCH/);
          for (const chunk of fetchChunks) {
            if (!chunk.trim()) continue;
            const fromMatch = chunk.match(/From:\s*([^\r\n]+)/i);
            const subjectMatch = chunk.match(/Subject:\s*([^\r\n]+)/i);
            const dateMatch = chunk.match(/Date:\s*([^\r\n]+)/i);
            
            // Extract body text preview
            const bodyMatch = chunk.match(/BODY\[TEXT\](?:<\d+>)?\s*\{?\d*\}?\r?\n([\s\S]*?)(?=\r?\n\)\r?\n|\r?\nA4)/i);
            const rawBody = bodyMatch ? bodyMatch[1].trim() : "";

            if (fromMatch || subjectMatch) {
              emails.push({
                from: fromMatch ? fromMatch[1].trim() : "desconocido@remitente.com",
                subject: subjectMatch ? subjectMatch[1].trim() : "(Sin asunto)",
                date: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
                snippet: rawBody.slice(0, 300).replace(/\s+/g, " ") || "(Sin vista previa)",
              });
            }
          }

          socket.write(`A5 LOGOUT\r\n`);
          finish({ ok: true, emails });
        }
      });
    });
  }

  /**
   * Deterministic heuristic classifier (fast, offline, $0 cost)
   */
  classifyIntentHeuristic({ from, subject, snippet }) {
    const text = `${subject} ${snippet}`.toLowerCase();

    // 1. Unsubscribe (use strict word boundaries so words like 'trabajan' don't trigger 'baja')
    if (
      /\b(baja|remover|desuscribir|desuscribirme|unsubscribe|borrar|eliminarme|cancelar)\b/i.test(text) ||
      /no me contacten|dejen de mandar|sacame de la lista|no me escriban/i.test(text)
    ) {
      return {
        intent: "UNSUBSCRIBE",
        confidence: 0.98,
        action: "Dar de baja de la lista de prospección",
        suggestedReply: {
          to: from,
          subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
          body: `Hola,\n\nConfirmamos que tu correo fue removido inmediatamente de nuestras listas de contacto. Disculpa las molestias.\n\nSaludos,\nEquipo Puna Tech`,
        },
      };
    }

    // 2. High Interest
    if (
      /interesa|demo|reuni[oó]n|llamada|charlemos|cu[aá]ndo pod[eé]s|agendemos|cal\.com|precio|costo|presupuesto|me gustaría ver/i.test(text)
    ) {
      return {
        intent: "INTERESTED",
        confidence: 0.92,
        action: "Coordinar llamada / demo técnica de 15 minutos",
        suggestedReply: {
          to: from,
          subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
          body: `Hola,\n\nExcelente. Con gusto te mostramos una demo personalizada de cómo resolver este cuello de botella y el simulador de ROI.\n\nPodés elegir el horario que mejor te quede directamente acá:\n👉 https://cal.com/punatech\n\n¿Tenés algún horario preferido esta semana?\n\nSaludos,\nEquipo de Ingeniería — Puna Tech`,
        },
      };
    }

    // 3. Technical Question
    if (
      /qu[eé] tecnolog|c[oó]mo se integra|tienen experiencia|trabajan con|cu[aá]nto tardan|stack|python|supabase|react|\?/i.test(text)
    ) {
      return {
        intent: "QUESTION",
        confidence: 0.85,
        action: "Responder duda técnica y validar encaje operativo",
        suggestedReply: {
          to: from,
          subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
          body: `Hola,\n\nGracias por tu consulta. En Puna Tech desarrollamos sobre arquitecturas modernas (React 19, Supabase, Node serverless y modelos LLM con BudgetGuard).\n\nNos adaptamos a las APIs existentes de tu empresa para que la transición sea fluida sin interrumpir las operaciones del día a día.\n\n¿Te parece coordinar 10 minutos para ver tu caso puntual? 👉 https://cal.com/punatech\n\nSaludos,\nEquipo de Ingeniería — Puna Tech`,
        },
      };
    }

    // 4. Other
    return {
      intent: "OTHER",
      confidence: 0.7,
      action: "Revisión manual en bandeja de entrada",
      suggestedReply: null,
    };
  }

  /**
   * Refines classification via LLM if available and not dry-run
   */
  async classifyWithLLM(email) {
    const prompt = `Actúa como el clasificador de respuestas entrantes de Puna Tech (fábrica de software y pipelines de IA).
Analiza el siguiente correo recibido:
Remitente: ${email.from}
Asunto: ${email.subject}
Texto: ${email.snippet}

Devuelve ÚNICAMENTE un JSON válido con esta estructura:
{
  "intent": "INTERESTED" | "QUESTION" | "UNSUBSCRIBE" | "OTHER",
  "confidence": 0.95,
  "action": "Acción recomendada concreta en 1 frase",
  "suggestedReply": {
    "to": "${email.from}",
    "subject": "Re: ${email.subject.replace(/["']/g, "")}",
    "body": "Texto claro, empático y directo de respuesta en español, invitando a cal.com/punatech si aplica."
  }
}`;

    try {
      const parsed = await this.llmClient.generateJSON({
        agentName: "InboundSentryAgent",
        prompt,
        maxTokens: 500,
        temperature: 0.2,
      });
      if (parsed?.intent) return parsed;
    } catch (err) {
      console.warn(`[InboundSentry] Fallback a heurística: ${err.message}`);
    }

    return this.classifyIntentHeuristic(email);
  }

  async run(options = {}) {
    const imapConfig = this.getImapConfig();
    let unreadEmails = [];

    // 1. Fetch from IMAP or simulated test emails
    if (options.testEmails?.length) {
      unreadEmails = options.testEmails;
    } else if (imapConfig.isConfigured) {
      console.log(`[InboundSentry] Conectando a IMAP ${imapConfig.host}:${imapConfig.port}...`);
      const fetchRes = await this.fetchUnseenEmails(imapConfig);
      unreadEmails = fetchRes.emails || [];
    }

    // 2. Classify each incoming reply
    const processedReplies = [];
    for (const email of unreadEmails) {
      const classification = this.llmClient.dryRun
        ? this.classifyIntentHeuristic(email)
        : await this.classifyWithLLM(email);

      processedReplies.push({
        from: email.from,
        subject: email.subject,
        date: email.date || new Date().toISOString(),
        snippet: email.snippet,
        intent: classification.intent,
        confidence: classification.confidence,
        action_required: classification.action,
        suggested_draft_reply: classification.suggestedReply,
      });
    }

    const highPriorityCount = processedReplies.filter((r) => r.intent === "INTERESTED").length;

    let summary = "";
    if (processedReplies.length > 0) {
      summary = `Detectadas ${processedReplies.length} respuestas entrantes (${highPriorityCount} con alto interés para agendar demo).`;
    } else if (imapConfig.isConfigured) {
      summary = "Bandeja de entrada IMAP monitoreada: 0 mensajes no leídos.";
    } else {
      summary = "Sentry en espera: Credenciales IMAP no configuradas en .env.local (inbox monitoreado: 0 respuestas entrantes).";
    }

    return {
      agent: "Inbound & Reply Sentry",
      status: "success",
      output: {
        status: imapConfig.isConfigured ? "active" : "idle",
        inbox_monitored: imapConfig.user || "no_configurado",
        new_replies_count: processedReplies.length,
        high_priority_count: highPriorityCount,
        replies: processedReplies,
        summary,
      },
    };
  }
}
