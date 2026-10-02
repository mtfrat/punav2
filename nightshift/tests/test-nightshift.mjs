/**
 * Unit & Integration Tests for Nightshift AI
 */

import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { BudgetGuard } from "../core/budget-guard.mjs";
import { LLMClient } from "../core/llm-client.mjs";
import { SocialAgent } from "../agents/social-agent.mjs";
import { ScoutAgent } from "../agents/scout-agent.mjs";
import { DemoBuilderAgent } from "../agents/demo-builder-agent.mjs";
import { TechAuditAgent } from "../agents/tech-audit-agent.mjs";
import { MorningBriefAgent } from "../agents/morning-brief-agent.mjs";

console.log("🧪 Iniciando tests unitarios de Nightshift AI...\n");

// 1. Budget Guard Tests
console.log("1. Probando BudgetGuard...");
const guard = new BudgetGuard({ maxDailySpendUsd: 1.0, maxTokensPerAgent: 2000 });
assert.equal(guard.maxDailySpendUsd, 1.0);
assert.equal(guard.totalSpentUsd, 0);

const usage = guard.recordUsage("TestAgent", "gemini-2.5-flash", 1000, 1000);
assert(usage.costThisCall > 0, "Cost should be greater than 0");
assert(guard.totalSpentUsd > 0, "Total spent should be tracked");
assert.equal(guard.tokenUsage.totalTokens, 2000);

// Test spend limit enforcement
assert.throws(() => {
  // Simulate massive token count that blows past $1.00 USD
  guard.recordUsage("RunawayAgent", "default", 10_000_000, 10_000_000);
}, /Daily spend limit breached/);
console.log("✔ BudgetGuard valida límites y previene sobrecostos correctamente.\n");

// 2. Configuration files check
console.log("2. Verificando configs de empresas...");
const punaConfigRaw = await readFile(resolve("nightshift/config/puna-tech.json"), "utf-8");
const punaConfig = JSON.parse(punaConfigRaw);
assert.equal(punaConfig.company.id, "puna-tech");
assert(punaConfig.agents.social.pillars.length >= 3);
assert.equal(punaConfig.agents.social.targetPlatformFormat, "art-reels");

const templateConfigRaw = await readFile(resolve("nightshift/config/template.example.json"), "utf-8");
const templateConfig = JSON.parse(templateConfigRaw);
assert(templateConfig.company.id.length > 0);
assert(templateConfig.agents.social.pillars.length >= 3);
assert(templateConfig.agents.scout.targetMarkets.length > 0);
console.log("✔ Configuraciones de Puna Tech y Template válidas.\n");

// 3. Agent dry-run execution
console.log("3. Ejecutando agentes en modo Dry-Run...");
const testGuard = new BudgetGuard(punaConfig.budget);
const llmClient = new LLMClient({ budgetGuard: testGuard, dryRun: true });

// Social Agent
const socialAgent = new SocialAgent({ llmClient, config: punaConfig });
const socialRes = await socialAgent.run();
assert.equal(socialRes.status, "success");
assert(socialRes.output.posts.length >= 1);
assert(socialRes.output.posts[0].hook.length > 0);

for (const post of socialRes.output.posts) {
  assert(post.pillar_id || post.pillar, "Post must have pillar or pillar_id");
  assert(["static", "carousel", "reel", "text"].includes(post.format), `Invalid format: ${post.format}`);
  assert.equal(post.ops_handoff?.ready_to_queue, false, "ops_handoff.ready_to_queue must be false");
  if (post.target_autopost_payload) {
    assert.equal(post.target_autopost_payload.ready_to_queue, false, "target_autopost_payload.ready_to_queue must be false");
  }
  if (post.art_mold_suggestion) {
    assert(
      ["marker-note", "paper-photo", "bolder-poster", "notebook-carousel", "dark-tech", "polaroid"].includes(post.art_mold_suggestion),
      `Invalid art mold suggestion: ${post.art_mold_suggestion}`
    );
  }
  if (post.format === "reel") {
    assert(Array.isArray(post.reel_scene_hints), "Reel must have reel_scene_hints");
    assert.equal(post.reel_scene_hints.length, 5, "Reel storyboard must have 5 scenes / beats");
  }
}

// Scout Agent
const scoutAgent = new ScoutAgent({ llmClient, config: punaConfig });
const scoutRes = await scoutAgent.run();
assert.equal(scoutRes.status, "success");
assert(scoutRes.output.prospects.length >= 1);
assert(scoutRes.output.niche_monetization_opportunity.concept_name.length > 0);

// Demo Builder Agent (Showcase & Personalizer)
const demoAgent = new DemoBuilderAgent({ llmClient, config: punaConfig });
const demoRes = await demoAgent.run({ prospects: scoutRes.output.prospects });
assert.equal(demoRes.status, "success");
assert(demoRes.output.demo_title.length > 0);
assert(demoRes.output.target_file_path.includes("demo-roi"));
assert(demoRes.output.primary_demo_url.includes("/demos/roi"));

// Tech Audit Agent
const auditAgent = new TechAuditAgent({ llmClient, config: punaConfig });
const auditRes = await auditAgent.run();
assert.equal(auditRes.status, "success");
assert(auditRes.output.actionable_refactors.length >= 1);

// Inbound & Reply Sentry Agent
const { InboundSentryAgent } = await import("../agents/inbound-sentry-agent.mjs");
const inboundAgent = new InboundSentryAgent({ llmClient, config: punaConfig });
const inboundRes = await inboundAgent.run({
  testEmails: [
    { from: "carlos@transporte-sur.com", subject: "Re: Simulador ROI", snippet: "Nos interesa mucho coordinar una demo para la flota." },
    { from: "laura@agenciacreativa.com", subject: "Re: Portales B2B", snippet: "Tienen experiencia integrando con APIs de Shopify y React?" },
    { from: "baja@empresa.com", subject: "Re: Consulta", snippet: "Por favor desuscribir este correo de la lista." },
  ],
});
assert.equal(inboundRes.status, "success");
assert.equal(inboundRes.output.new_replies_count, 3);
assert.equal(inboundRes.output.high_priority_count, 1);
assert.equal(inboundRes.output.replies[0].intent, "INTERESTED");
assert.equal(inboundRes.output.replies[1].intent, "QUESTION");
assert.equal(inboundRes.output.replies[2].intent, "UNSUBSCRIBE");

// Outbound Mailer Core Test
const { sendOutboundEmail, formatEmailHtml } = await import("../core/mailer.mjs");
const mailRes = await sendOutboundEmail({
  to: "prospecto@ejemplo.com",
  subject: "Optimización operativa para Ejemplo",
  text: "Hola, detectamos un cuello de botella en su empresa.\n\nQueremos presentarles nuestro simulador.",
  demoUrl: "https://www.puna-tech.com/es/demos/roi?company=Ejemplo",
  dryRun: true,
});
assert.equal(mailRes.success, true);
assert.equal(mailRes.simulated, true);
assert(mailRes.messageId.startsWith("sim-"));

const htmlOutput = formatEmailHtml({
  subject: "Test Subject",
  text: "Primer párrafo de prueba.\n\nSegundo párrafo con [Link a Puna](https://www.puna-tech.com).",
  demoUrl: "https://www.puna-tech.com/es/demos/roi?company=Test",
});
assert(htmlOutput.includes("PUNA TECH"));
assert(htmlOutput.includes("Ver Simulación de ROI Personalizada"));
assert(htmlOutput.includes("baja"));

// Morning Brief Agent (aggregating all agents including Inbound)
const briefAgent = new MorningBriefAgent({ config: punaConfig, budgetGuard: testGuard });
const briefRes = await briefAgent.generateBrief({
  results: [socialRes, scoutRes, demoRes, auditRes, inboundRes],
  executionTimeMs: 1500,
});
assert.equal(briefRes.status, "success");
assert(briefRes.decisionsCount >= 5);

const generatedMd = await readFile(briefRes.filePath, "utf-8");
assert(generatedMd.includes("Morning Executive Brief"));
assert(generatedMd.includes("Decisiones Clave para Tomar Hoy"));
assert(generatedMd.includes("Social Studio / Art (borradores)"));
assert(generatedMd.includes("Inbound & Reply Sentry"));
assert(generatedMd.includes("Control de Presupuesto y Consumo"));

console.log(`✔ Flota completa probada (Social, Scout, Demo, QA, Inbound y Mailer).`);
console.log(`📄 Reporte generado en: ${briefRes.filePath}\n`);
console.log("🎉 TODOS LOS TESTS DE NIGHTSHIFT AI PASARON EXITOSAMENTE.");
