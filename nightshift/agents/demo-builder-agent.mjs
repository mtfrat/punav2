/**
 * Demo Builder Agent
 * Automatically architects and scaffolds small showcase interactive demos/widgets
 * for the company portfolio and lead magnet pages.
 */

export class DemoBuilderAgent {
  constructor({ llmClient, config }) {
    this.llmClient = llmClient;
    this.config = config;
  }

  async run() {
    const { company, agents } = this.config;
    const builderConfig = agents?.demoBuilder;

    if (!builderConfig || builderConfig.enabled === false) {
      return { status: "skipped", message: "Demo Builder agent disabled in configuration." };
    }

    const systemPrompt = `Eres el Arquitecto de Prototipos de Software para "${company.name}".
Tu función nocturna es diseñar y generar código para micro-herramientas interactivas, calculadoras y widgets de portfolio que sirvan como prueba de capacidad técnica ("Showcase") o páginas de captación de leads.
Stack tecnológico: ${builderConfig.techStack}.
Directorio destino: ${builderConfig.outputDirectory}.`;

    const userPrompt = `Diseña una micro-herramienta interactiva para la web basada en los siguientes tipos de demo permitidos:
${builderConfig.demoTypes.join("\n")}

Genera un JSON con la especificación técnica, diseño UI y código fuente de un componente de React listo para ser montado:
{
  "demo_title": "Nombre de la herramienta interactiva",
  "branch_suggestion": "git branch sugerida (ej. demo/roi-calculator)",
  "target_file_path": "Ruta relativa del archivo (ej. src/components/demos/RoiCalculator.tsx)",
  "value_proposition": "Por qué este demo impresiona a clientes potenciales o genera tráfico",
  "component_code": "Código React completo y tipeado en TypeScript con Tailwind CSS",
  "integration_instructions": "Paso simple para renderizarlo en la web"
}`;

    const mockGenerator = () => ({
      demo_title: "Calculadora Interactiva de Ahorro Operativo (ROI Simulator)",
      branch_suggestion: "demo/roi-calculator",
      target_file_path: "src/components/demos/RoiCalculator.tsx",
      value_proposition: "Permite a directores de agencias y startups ingresar su volumen de horas manuales y ver instantáneamente el ahorro financiero estimado con automatización y software a medida.",
      component_code: `import React, { useState, useId } from "react";

export interface RoiCalculatorProps {
  companyName?: string;
  defaultHourlyRate?: number;
}

export function RoiCalculator({ companyName = "Puna Tech", defaultHourlyRate = 35 }: RoiCalculatorProps) {
  const teamSizeId = useId();
  const hoursPerWeekId = useId();
  const hourlyRateId = useId();

  const [teamSize, setTeamSize] = useState(6);
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [hourlyRate, setHourlyRate] = useState(defaultHourlyRate);

  // 65% standard operational savings via streamlined workflows
  const monthlyManualCost = teamSize * hoursPerWeek * hourlyRate * 4;
  const monthlySavings = Math.round(monthlyManualCost * 0.65);
  const annualSavings = monthlySavings * 12;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm max-w-xl mx-auto my-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          Simulador de Ahorro con Automatización
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Estima el retorno de inversión al sistematizar tareas repetitivas con {companyName}.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1 font-medium">
            <label htmlFor={teamSizeId}>Personas en el equipo operativo</label>
            <span className="text-primary font-bold">{teamSize}</span>
          </div>
          <input
            id={teamSizeId}
            type="range"
            min={1}
            max={50}
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
            className="w-full cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1 font-medium">
            <label htmlFor={hoursPerWeekId}>Horas manuales por persona / semana</label>
            <span className="text-primary font-bold">{hoursPerWeek}h</span>
          </div>
          <input
            id={hoursPerWeekId}
            type="range"
            min={2}
            max={25}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            className="w-full cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1 font-medium">
            <label htmlFor={hourlyRateId}>Costo promedio por hora (USD)</label>
            <span className="text-primary font-bold">\${hourlyRate}/h</span>
          </div>
          <input
            id={hourlyRateId}
            type="range"
            min={15}
            max={120}
            step={5}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="w-full cursor-pointer accent-primary"
          />
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-primary/10 p-4 border border-primary/20 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Ahorro anual estimado
          </span>
          <div className="text-3xl font-extrabold text-foreground mt-0.5">
            \${annualSavings.toLocaleString()} USD
          </div>
        </div>
        <a
          href="/#contact"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Agendar demo
        </a>
      </div>
    </div>
  );
}`,
      integration_instructions: "Montar el componente en una nueva ruta '/demos/roi-calculator' o incrustarlo en la landing de servicios para agencias."
    });

    const response = await this.llmClient.generate({
      agentName: "DemoBuilderAgent",
      systemPrompt,
      userPrompt,
      mockGenerator,
      jsonMode: true,
    });

    return {
      status: "success",
      agent: "Showcase & Demo Builder",
      output: response.data || mockGenerator(),
      isSimulated: response.isSimulated,
    };
  }
}
