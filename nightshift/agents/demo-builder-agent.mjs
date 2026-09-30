/**
 * Demo Builder & Dynamic Personalizer Agent
 * Parametrizes live interactive web tools (e.g. /demos/roi) with tailored numbers
 * for each verified B2B prospect discovered by ScoutAgent.
 * Eliminates speculative code in orphan git branches; leverages production routes.
 */

export class DemoBuilderAgent {
  constructor({ llmClient, config }) {
    this.llmClient = llmClient;
    this.config = config;
  }

  async run({ prospects = [] } = {}) {
    const { company, agents } = this.config;
    const builderConfig = agents?.demoBuilder;

    if (!builderConfig || builderConfig.enabled === false) {
      return { status: "skipped", message: "Demo Builder agent disabled in configuration." };
    }

    const baseUrl = company?.website || "https://www.puna-tech.com";

    // Industry heuristics for conservative default calculations
    const getIndustryDefaults = (vertical = "") => {
      const v = vertical.toLowerCase();
      if (v.includes("logística") || v.includes("transporte") || v.includes("distribución")) {
        return { operarios: 18, horas: 14, tarifa: 22 };
      }
      if (v.includes("real estate") || v.includes("inmobiliaria") || v.includes("constructora")) {
        return { operarios: 8, horas: 18, tarifa: 28 };
      }
      if (v.includes("contable") || v.includes("legal") || v.includes("profesional")) {
        return { operarios: 10, horas: 16, tarifa: 32 };
      }
      return { operarios: 6, horas: 12, tarifa: 25 };
    };

    const personalizedDemos = [];

    for (const pr of prospects) {
      const defaults = getIndustryDefaults(pr.vertical || "");
      const params = new URLSearchParams({
        empresa: pr.company_name,
        operarios: String(defaults.operarios),
        horas: String(defaults.horas),
        tarifa: String(defaults.tarifa),
      });

      const demoUrl = `${baseUrl}/es/demos/roi?${params.toString()}`;
      const monthlyHours = Math.round(defaults.operarios * defaults.horas * 4.33);
      const monthlyCost = Math.round(monthlyHours * defaults.tarifa);
      const monthlySavings = Math.round(monthlyCost * 0.65);
      const annualSavings = monthlySavings * 12;

      const demoInfo = {
        company_name: pr.company_name,
        target_role: pr.target_role,
        vertical: pr.vertical,
        demo_route: "/demos/roi",
        full_demo_url: demoUrl,
        projected_monthly_savings_usd: monthlySavings,
        projected_annual_savings_usd: annualSavings,
        estimated_hours_saved_yearly: Math.round(monthlyHours * 0.65 * 12),
        outreach_snippet: `Te preparé una simulación interactiva con los números estimados para ${pr.company_name}: ${demoUrl}`,
      };

      personalizedDemos.push(demoInfo);

      // In-memory enrichment of prospect if object passed
      if (pr.acquisition_strategy) {
        pr.acquisition_strategy.personalized_demo_url = demoUrl;
        pr.acquisition_strategy.projected_savings_usd = annualSavings;
        if (pr.acquisition_strategy.outreach_message) {
          pr.acquisition_strategy.outreach_message.interactive_demo_link = demoUrl;
        }
      }
    }

    const featured = personalizedDemos[0] || {
      company_name: "Prospectos B2B",
      demo_route: "/demos/roi",
      full_demo_url: `${baseUrl}/es/demos/roi`,
      projected_annual_savings_usd: 35000,
    };

    return {
      status: "success",
      agent: "Showcase & Demo Builder",
      output: {
        demo_title: `Simulador de ROI Parametrizado (${personalizedDemos.length} cuentas vinculadas)`,
        primary_demo_url: featured.full_demo_url,
        route: "/es/demos/roi",
        target_file_path: "src/routes/demo-roi.tsx",
        value_proposition: "Permite a los prospectos abrir un enlace interactivo con el nombre de su empresa y estimaciones de horas manuales precargadas, viendo el ROI financiero en tiempo real.",
        personalized_demos: personalizedDemos,
      },
    };
  }
}
