/**
 * Tech Audit & Code Review Agent
 * Runs repository checks, validates SEO and workflow definitions, and suggests code improvements.
 */

import { execSync } from "node:child_process";

export class TechAuditAgent {
  constructor({ llmClient, config }) {
    this.llmClient = llmClient;
    this.config = config;
  }

  async run() {
    const { company, agents } = this.config;
    const auditConfig = agents?.techAudit;

    if (!auditConfig || auditConfig.enabled === false) {
      return { status: "skipped", message: "Tech Audit agent disabled in configuration." };
    }

    const checkResults = [];

    // Run configured deterministic checks
    for (const cmd of (auditConfig.runCommands || [])) {
      try {
        const stdout = execSync(cmd, { stdio: "pipe", timeout: 25000 }).toString();
        checkResults.push({
          command: cmd,
          passed: true,
          output: stdout.trim().split("\n").slice(-3).join(" | "),
        });
      } catch (err) {
        checkResults.push({
          command: cmd,
          passed: false,
          output: (err.stdout?.toString() || err.stderr?.toString() || err.message).slice(0, 200),
        });
      }
    }

    const systemPrompt = `Eres el Tech Lead & Auditor de Código de "${company.name}".
Tu función nocturna es evaluar los resultados de las comprobaciones técnicas y redactar propuestas de mejora concretas, limpias y accionables.`;

    const userPrompt = `Resultados de las verificaciones ejecutadas:
${JSON.stringify(checkResults, null, 2)}

Genera un informe estructurado en JSON con:
{
  "audit_verdict": "HEALTHY" | "ATTENTION_REQUIRED" | "CRITICAL",
  "passed_checks_count": number,
  "failed_checks_count": number,
  "key_findings": ["Hallazgo 1", "Hallazgo 2"],
  "actionable_refactors": [
    {
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "area": "SEO" | "TypeSafety" | "Performance" | "Workflows",
      "proposal": "Qué optimizar y por qué",
      "suggested_pr_title": "Título para Pull Request"
    }
  ]
}`;

    const mockGenerator = () => {
      const allPassed = checkResults.every((c) => c.passed !== false);
      return {
        audit_verdict: allPassed ? "HEALTHY" : "ATTENTION_REQUIRED",
        passed_checks_count: checkResults.filter((c) => c.passed).length,
        failed_checks_count: checkResults.filter((c) => !c.passed).length,
        key_findings: [
          "Verificaciones de SEO y workflows de n8n ejecutadas correctamente sin regresiones.",
          "Estructura bilingüe y metadatos canónicos validados.",
          "Se detecta oportunidad para prerenderizar sitemaps dinámicos y cachear respuestas de Supabase."
        ],
        actionable_refactors: [
          {
            priority: "LOW",
            area: "Performance",
            proposal: "Optimizar imports de lucide-react y tipografías para reducir 12kb del bundle inicial.",
            suggested_pr_title: "perf(bundle): tree-shake icon imports and optimize font preload"
          },
          {
            priority: "MEDIUM",
            area: "SEO",
            proposal: "Añadir schema markup `SoftwareApplication` para la sección de servicios B2B.",
            suggested_pr_title: "seo(schema): enrich SoftwareApplication json-ld for services"
          }
        ]
      };
    };

    const response = await this.llmClient.generate({
      agentName: "TechAuditAgent",
      systemPrompt,
      userPrompt,
      mockGenerator,
      jsonMode: true,
    });

    return {
      status: "success",
      agent: "Code & Tech Quality Auditor",
      checkResults,
      output: response.data || mockGenerator(),
      isSimulated: response.isSimulated,
    };
  }
}
