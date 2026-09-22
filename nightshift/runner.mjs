#!/usr/bin/env node
/**
 * Nightshift AI — Master Orchestrator
 * Runs autonomous night-shift agents and compiles the morning executive brief.
 *
 * Usage:
 *   node nightshift/runner.mjs [--company puna-tech] [--dry-run] [--agent all]
 */

import { readFile } from "node:fs/promises";
import { resolve, join } from "node:path";

// Auto-load local environment variables (.env.local or .env)
try {
  process.loadEnvFile(".env.local");
} catch {
  try {
    process.loadEnvFile(".env");
  } catch {}
}
import { BudgetGuard } from "./core/budget-guard.mjs";
import { LLMClient } from "./core/llm-client.mjs";
import { SocialAgent } from "./agents/social-agent.mjs";
import { ScoutAgent } from "./agents/scout-agent.mjs";
import { DemoBuilderAgent } from "./agents/demo-builder-agent.mjs";
import { TechAuditAgent } from "./agents/tech-audit-agent.mjs";
import { MorningBriefAgent } from "./agents/morning-brief-agent.mjs";

// Helper to parse simple CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    company: "puna-tech",
    dryRun: false,
    agent: "all",
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--company" && args[i + 1]) {
      options.company = args[++i];
    } else if (args[i] === "--dry-run") {
      options.dryRun = true;
    } else if (args[i] === "--agent" && args[i + 1]) {
      options.agent = args[++i];
    } else if (args[i] === "--help" || args[i] === "-h") {
      console.log(`
🌙 Nightshift AI Orchestrator
Comandos:
  --company <id>     ID de la empresa (busca en nightshift/config/<id>.json). Default: puna-tech
  --dry-run          Modo simulación sin consumo de tokens ni llamadas de API externas
  --agent <name>     Filtrar agente: all | social | scout | builder | qa | brief
      `);
      process.exit(0);
    }
  }
  return options;
}

async function loadCompanyConfig(companyId) {
  const configPath = resolve(process.cwd(), "nightshift", "config", `${companyId}.json`);
  try {
    const raw = await readFile(configPath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`No se pudo cargar la configuración para la empresa '${companyId}' en: ${configPath}\nDetalle: ${err.message}`);
  }
}

async function main() {
  const startTime = Date.now();
  const options = parseArgs();

  console.log("=================================================");
  console.log(`🌙 INICIANDO TURNO NOCTURNO: Nightshift AI`);
  console.log(`🏢 Empresa: ${options.company}`);
  console.log(`🛡️ Modo Dry-Run: ${options.dryRun ? "ACTIVADO (Sin costo de API)" : "DESACTIVADO (Producción)"}`);
  console.log(`🎯 Agentes a ejecutar: ${options.agent}`);
  console.log("=================================================\n");

  const config = await loadCompanyConfig(options.company);
  const budgetGuard = new BudgetGuard(config.budget);
  const llmClient = new LLMClient({
    budgetGuard,
    dryRun: options.dryRun,
    preferredModel: config.budget?.preferredModel,
  });

  const results = [];

  // 1. Social & Autopost Agent
  if (options.agent === "all" || options.agent === "social") {
    console.log("▶ Ejecutando: Social & Autopost Agent...");
    try {
      const agent = new SocialAgent({ llmClient, config });
      const res = await agent.run();
      results.push(res);
      console.log(`  ✔ Completado: ${res.output?.posts?.length || 0} publicaciones en borrador.`);
    } catch (err) {
      console.error(`  ✖ Error en Social Agent: ${err.message}`);
      results.push({ agent: "Social & Autopost Agent", status: "error", error: err.message });
    }
  }

  // 2. Scout Agent (B2B Leads & Niches)
  if (options.agent === "all" || options.agent === "scout") {
    console.log("▶ Ejecutando: Scout (Leads & Niche Explorer)...");
    try {
      const agent = new ScoutAgent({ llmClient, config });
      const res = await agent.run();
      results.push(res);
      console.log(`  ✔ Completado: ${res.output?.prospects?.length || 0} prospectos B2B y 1 oportunidad de nicho evaluada.`);
    } catch (err) {
      console.error(`  ✖ Error en Scout Agent: ${err.message}`);
      results.push({ agent: "Scout (Leads & Niche Explorer)", status: "error", error: err.message });
    }
  }

  // 3. Demo Builder Agent
  if (options.agent === "all" || options.agent === "builder") {
    console.log("▶ Ejecutando: Showcase & Demo Builder...");
    try {
      const agent = new DemoBuilderAgent({ llmClient, config });
      const res = await agent.run();
      results.push(res);
      console.log(`  ✔ Completado: Prototipo diseñado -> "${res.output?.demo_title || "Demo"}"`);
    } catch (err) {
      console.error(`  ✖ Error en Demo Builder: ${err.message}`);
      results.push({ agent: "Showcase & Demo Builder", status: "error", error: err.message });
    }
  }

  // 4. Tech Audit Agent
  if (options.agent === "all" || options.agent === "qa") {
    console.log("▶ Ejecutando: Code & Tech Quality Auditor...");
    try {
      const agent = new TechAuditAgent({ llmClient, config });
      const res = await agent.run();
      results.push(res);
      console.log(`  ✔ Completado: Veredicto técnico: [${res.output?.audit_verdict || "OK"}]`);
    } catch (err) {
      console.error(`  ✖ Error en Tech Audit: ${err.message}`);
      results.push({ agent: "Code & Tech Quality Auditor", status: "error", error: err.message });
    }
  }

  // 5. Morning Brief Synthesizer
  if (options.agent === "all" || options.agent === "brief") {
    console.log("\n▶ Sintetizando: Executive Morning Brief...");
    const briefAgent = new MorningBriefAgent({ config, budgetGuard });
    const briefRes = await briefAgent.generateBrief({
      results,
      executionTimeMs: Date.now() - startTime,
    });

    console.log("-------------------------------------------------");
    console.log(`📄 Reporte generado con éxito en:`);
    console.log(`   file:///${resolve(briefRes.filePath).replace(/\\/g, "/")}`);
    console.log(`⚡ Decisiones listas para hoy: ${briefRes.decisionsCount}`);
    console.log(`💰 Consumo nocturno: $${briefRes.budgetSpent.toFixed(4)} USD`);
    console.log("-------------------------------------------------");
  }

  console.log(`\n🎉 Turno nocturno finalizado en ${((Date.now() - startTime) / 1000).toFixed(2)}s.`);
}

main().catch((err) => {
  console.error("\n❌ Error fatal en Nightshift Orchestrator:", err);
  process.exit(1);
});
