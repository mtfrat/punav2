/**
 * Executive Morning Brief Synthesizer
 * Aggregates all nightshift agents' outcomes into an executive daily briefing with 1-click decisions.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export class MorningBriefAgent {
  constructor({ config, budgetGuard }) {
    this.config = config;
    this.budgetGuard = budgetGuard;
  }

  async generateBrief({ results, executionTimeMs }) {
    const { company, agents } = this.config;
    const briefConfig = agents?.morningBrief || {};
    const dateStr = new Date().toISOString().split("T")[0];
    const budgetSummary = this.budgetGuard.getSummary();

    const socialResult = results.find((r) => r.agent === "Social & Autopost Agent")?.output;
    const scoutResult = results.find((r) => r.agent === "Scout (Leads & Niche Explorer)")?.output;
    const demoResult = results.find((r) => r.agent === "Showcase & Demo Builder")?.output;
    const auditResult = results.find((r) => r.agent === "Code & Tech Quality Auditor")?.output;

    const markdownLines = [
      `# ☀️ Morning Executive Brief — ${company.name}`,
      `**Fecha:** ${dateStr} | **Duración del ciclo:** ${(executionTimeMs / 1000).toFixed(1)}s | **Empresa:** ${company.name} (${company.industry})`,
      "",
      `> [!NOTE]`,
      `> **Estado de la Flota:** Todos los agentes nocturnos completaron su ciclo en modo seguro (*Draft-First*). Ningún mensaje o cambio fue publicado sin tu consentimiento explícito.`,
      "",
      "---",
      "",
      "## ⚡ 1. Decisiones Clave para Tomar Hoy (Tu Checklist Matutino)",
      "",
    ];

    const decisions = [];
    let decisionIndex = 1;

    if (socialResult?.posts?.length) {
      decisions.push({
        num: decisionIndex++,
        text: `**Aprobar lote de ${socialResult.posts.length} posts para Autopost:** Revisar borradores en cola (incluye LinkedIn, X e Instagram).`,
        action: `Ir a /ops/social o Autopost para aprobación en 1 clic.`,
      });
    }

    if (scoutResult?.prospects?.length) {
      decisions.push({
        num: decisionIndex++,
        text: `**Aprobar outreach a ${scoutResult.prospects.length} cuentas B2B calificadas:** Empresas identificadas en ${scoutResult.prospects.map((p) => p.market).join(", ")}.`,
        action: `Revisar y despachar borradores en /ops/prospects.`,
      });
    }

    if (scoutResult?.niche_monetization_opportunity) {
      const opp = scoutResult.niche_monetization_opportunity;
      decisions.push({
        num: decisionIndex++,
        text: `**Evaluar oportunidad de monetización pasiva:** "${opp.concept_name}" (${opp.monetization_type}, competencia ${opp.competition_level}).`,
        action: `¿Aprobar creación del prototipo esta noche? [SÍ / NO]`,
      });
    }

    if (demoResult?.demo_title) {
      decisions.push({
        num: decisionIndex++,
        text: `**Demo interactivo listo para preview:** "${demoResult.demo_title}".`,
        action: `Revisar branch \`${demoResult.branch_suggestion}\` y decidir si se incorpora a la landing de captación.`,
      });
    }

    if (auditResult?.actionable_refactors?.length) {
      const topRefactor = auditResult.actionable_refactors[0];
      decisions.push({
        num: decisionIndex++,
        text: `**Aprobar refactor técnico (${topRefactor.area}):** ${topRefactor.proposal}`,
        action: `Merge del PR sugerido: \`${topRefactor.suggested_pr_title}\`.`,
      });
    }

    for (const d of decisions) {
      markdownLines.push(`- [ ] **Decisión #${d.num}:** ${d.text}`);
      markdownLines.push(`  - *Acción recomendada:* ${d.action}`);
    }

    markdownLines.push("", "---", "", "## 📊 2. Resumen por Agente Nocturno", "");

    // Social Section
    if (socialResult?.posts?.length) {
      markdownLines.push("### 📱 Redes Sociales & Autopost");
      markdownLines.push(`*${socialResult.summary || "Borradores generados"}*`);
      markdownLines.push("");
      for (const p of socialResult.posts) {
        markdownLines.push(`- **[${p.channel.toUpperCase()}]** *"${p.hook}"*`);
        markdownLines.push(`  - **Horario sugerido:** ${p.target_autopost_payload?.scheduled_time_suggestion || "11:00 AM"}`);
      }
      markdownLines.push("");
    }

    // Scout Section
    if (scoutResult) {
      markdownLines.push("### 🎯 Prospección B2B & Nichos");
      markdownLines.push(`*${scoutResult.market_summary}*`);
      markdownLines.push("");
      if (scoutResult.prospects?.length) {
        markdownLines.push("**Cuentas detectadas:**");
        for (const pr of scoutResult.prospects) {
          const verticalBadge = pr.vertical ? ` [${pr.vertical}]` : "";
          const friction = pr.manual_friction_detected || pr.pain_point || "Procesos manuales repetitivos";
          const angle = pr.acquisition_strategy?.entry_angle ? `\n    - *Estrategia:* ${pr.acquisition_strategy.entry_angle}` : "";
          const subject = pr.acquisition_strategy?.outreach_message?.subject ? `\n    - *Asunto sugerido:* "${pr.acquisition_strategy.outreach_message.subject}"` : "";
          markdownLines.push(`- **${pr.company_name}** (${pr.market})${verticalBadge} — *Target:* ${pr.target_role}\n    - *Cuello de botella:* ${friction}${angle}${subject}`);
        }
        markdownLines.push("");
      }
      if (scoutResult.niche_monetization_opportunity) {
        const n = scoutResult.niche_monetization_opportunity;
        markdownLines.push(`**Oportunidad de Monetización Evaluada:**`);
        markdownLines.push(`- **Concepto:** ${n.concept_name}`);
        markdownLines.push(`- **Modelo:** ${n.monetization_type} (Legalidad: ${n.legal_compliance})`);
        markdownLines.push(`- **Siguiente paso:** ${n.recommended_action}`);
        markdownLines.push("");
      }
    }

    // Demo Builder Section
    if (demoResult?.demo_title) {
      markdownLines.push("### 🛠️ Showcase & Prototipo");
      markdownLines.push(`- **Título:** ${demoResult.demo_title}`);
      markdownLines.push(`- **Branch sugerida:** \`${demoResult.branch_suggestion}\``);
      markdownLines.push(`- **Ruta de componente:** \`${demoResult.target_file_path}\``);
      markdownLines.push(`- **Propósito:** ${demoResult.value_proposition}`);
      markdownLines.push("");
    }

    // Tech Audit Section
    if (auditResult) {
      markdownLines.push("### 🔍 Auditoría de Código y SEO");
      markdownLines.push(`- **Veredicto general:** \`${auditResult.audit_verdict}\``);
      markdownLines.push(`- **Checks verificados:** ${auditResult.passed_checks_count} pasaron, ${auditResult.failed_checks_count} observaciones.`);
      if (auditResult.key_findings?.length) {
        markdownLines.push("**Hallazgos principales:**");
        for (const k of auditResult.key_findings) {
          markdownLines.push(`  - ${k}`);
        }
      }
      markdownLines.push("");
    }

    // Budget Section
    markdownLines.push("---", "", "## 💰 3. Control de Presupuesto y Consumo", "");
    markdownLines.push(`- **Gasto total de la corrida nocturna:** **$${budgetSummary.totalSpentUsd.toFixed(4)} USD**`);
    markdownLines.push(`- **Límite diario configurado:** **$${budgetSummary.maxDailySpendUsd.toFixed(2)} USD**`);
    markdownLines.push(`- **Presupuesto restante protegido:** **$${budgetSummary.remainingBudgetUsd.toFixed(4)} USD**`);
    markdownLines.push(`- **Tokens totales procesados:** ${budgetSummary.tokenUsage.totalTokens.toLocaleString()}`);
    markdownLines.push("");

    const markdownOutput = markdownLines.join("\n");

    // Ensure output directory exists
    const outputDir = briefConfig.outputFolder || "reports";
    await mkdir(outputDir, { recursive: true });
    const filePath = join(outputDir, `morning-brief-${dateStr}-${company.id}.md`);
    await writeFile(filePath, markdownOutput, "utf-8");

    // Optional webhook notification (Discord / Slack / n8n)
    if (briefConfig.deliveryWebhookUrl) {
      try {
        await fetch(briefConfig.deliveryWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `☀️ *Morning Brief listo para ${company.name}*\n${decisions.map((d) => `• Decisión #${d.num}: ${d.text}`).join("\n")}\n\nPresupuesto: $${budgetSummary.totalSpentUsd.toFixed(4)} USD`,
          }),
        });
      } catch (err) {
        console.warn(`[MorningBrief] Webhook delivery failed: ${err.message}`);
      }
    }

    // Native Telegram Bot notification
    const tgToken = process.env.TELEGRAM_BOT_TOKEN || briefConfig.telegramBotToken;
    const tgChatId = process.env.TELEGRAM_CHAT_ID || briefConfig.telegramChatId;

    if (tgToken && tgChatId) {
      try {
        const tgMessage = [
          `☀️ *Morning Executive Brief — ${company.name}*`,
          `📅 *Fecha:* ${dateStr} | 💰 *Gasto:* $${budgetSummary.totalSpentUsd.toFixed(4)} USD`,
          "",
          `⚡ *DECISIONES A TOMAR HOY (${decisions.length}):*`,
          ...decisions.map((d) => `▫️ *Decisión #${d.num}:* ${d.text.replace(/\*\*/g, "")}\n   👉 _${d.action}_`),
          "",
          `📱 *Redes:* ${socialResult?.posts?.length || 0} posts en borrador para Autopost.`,
          `🎯 *Leads:* ${scoutResult?.prospects?.length || 0} cuentas B2B (Logística, Inmobiliarias, White-Label).`,
          `🛠️ *Showcase:* ${demoResult?.demo_title || "N/A"}`,
          `🔍 *Auditoría:* ${auditResult?.audit_verdict || "OK"}`,
          "",
          `📄 _Reporte completo guardado en: reports/morning-brief-${dateStr}-${company.id}.md_`
        ].join("\n");

        const inlineKeyboard = [
          [
            { text: `✅ Aprobar TODO (${decisions.length})`, callback_data: `approve_all:${dateStr}` },
          ],
          [
            { text: "📱 #1 Redes", callback_data: `approve_dec:1:${dateStr}` },
            { text: "🎯 #2 Leads", callback_data: `approve_dec:2:${dateStr}` },
          ],
          [
            { text: "💡 #3 Nicho", callback_data: `approve_dec:3:${dateStr}` },
            { text: "🛠️ #4 Demo", callback_data: `approve_dec:4:${dateStr}` },
            { text: "⚡ #5 Refactor", callback_data: `approve_dec:5:${dateStr}` },
          ],
          [
            { text: "🌐 Ver en /ops/nightshift", url: "https://www.puna-tech.com/ops/nightshift" },
          ],
        ];

        const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
        const tgRes = await fetch(tgUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: tgChatId,
            text: tgMessage,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: inlineKeyboard,
            },
          }),
        });
        const tgJson = await tgRes.json();
        if (tgJson.ok) {
          console.log(`[MorningBrief] ✔ Notificación enviada a Telegram exitosamente (chat: ${tgChatId}).`);
        } else {
          console.warn(`[MorningBrief] Telegram error: ${tgJson.description}`);
        }
      } catch (tgErr) {
        console.warn(`[MorningBrief] Telegram notification failed: ${tgErr.message}`);
      }
    }

    return {
      status: "success",
      filePath,
      markdown: markdownOutput,
      decisionsCount: decisions.length,
      budgetSpent: budgetSummary.totalSpentUsd,
    };
  }
}
