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

const templateConfigRaw = await readFile(resolve("nightshift/config/template.example.json"), "utf-8");
const templateConfig = JSON.parse(templateConfigRaw);
assert(templateConfig.company.id.length > 0);
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

// Scout Agent
const scoutAgent = new ScoutAgent({ llmClient, config: punaConfig });
const scoutRes = await scoutAgent.run();
assert.equal(scoutRes.status, "success");
assert(scoutRes.output.prospects.length >= 1);
assert(scoutRes.output.niche_monetization_opportunity.concept_name.length > 0);

// Demo Builder Agent
const demoAgent = new DemoBuilderAgent({ llmClient, config: punaConfig });
const demoRes = await demoAgent.run();
assert.equal(demoRes.status, "success");
assert(demoRes.output.component_code.includes("export function"));

// Tech Audit Agent
const auditAgent = new TechAuditAgent({ llmClient, config: punaConfig });
const auditRes = await auditAgent.run();
assert.equal(auditRes.status, "success");
assert(auditRes.output.actionable_refactors.length >= 1);

// Morning Brief Agent
const briefAgent = new MorningBriefAgent({ config: punaConfig, budgetGuard: testGuard });
const briefRes = await briefAgent.generateBrief({
  results: [socialRes, scoutRes, demoRes, auditRes],
  executionTimeMs: 1500,
});
assert.equal(briefRes.status, "success");
assert(briefRes.decisionsCount >= 4);

const generatedMd = await readFile(briefRes.filePath, "utf-8");
assert(generatedMd.includes("Morning Executive Brief"));
assert(generatedMd.includes("Decisiones Clave para Tomar Hoy"));
assert(generatedMd.includes("Control de Presupuesto y Consumo"));

console.log(`✔ Flota completa probada. Reporte generado en: ${briefRes.filePath}\n`);
console.log("🎉 TODOS LOS TESTS DE NIGHTSHIFT AI PASARON EXITOSAMENTE.");
