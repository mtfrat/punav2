import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

const marketingRoutes = [
  "/",
  "/es",
  "/services/ai-automation",
  "/services/custom-software",
  "/services/data-integrations",
  "/es/servicios/automatizacion-ia",
  "/es/servicios/software-a-medida",
  "/es/servicios/integraciones-de-datos",
  "/case-studies/edtech-web3-platform",
  "/case-studies/b2b-gtm-automation",
  "/case-studies/autopost-content-infrastructure",
  "/es/casos/plataforma-edtech-web3",
  "/es/casos/automatizacion-gtm-b2b",
  "/es/casos/autopost-infraestructura-contenido",
  "/privacy",
  "/terms",
  "/es/privacidad",
  "/es/terminos",
];

export default {
  appDirectory: "src",
  ssr: true,
  prerender: marketingRoutes,
  presets: [vercelPreset()],
} satisfies Config;
