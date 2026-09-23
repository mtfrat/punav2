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
  "/case-studies/starpress-reviews-to-revenue",
  "/case-studies/viralyt-youtube-intelligence",
  "/case-studies/videome-ai-motion-recipes",
  "/case-studies/autopost-b2b-content-studio",
  "/case-studies/inbound-lead-routing-hubspot",
  "/case-studies/ai-linkedin-copilot-hitl",
  "/case-studies/edtech-web3-platform",
  "/case-studies/b2b-gtm-automation",
  "/es/casos/starpress-resenas-a-ingresos",
  "/es/casos/viralyt-inteligencia-youtube",
  "/es/casos/videome-recetas-video-ia",
  "/es/casos/autopost-estudio-contenido-b2b",
  "/es/casos/enrutamiento-leads-hubspot",
  "/es/casos/copiloto-linkedin-ia-hitl",
  "/es/casos/plataforma-edtech-web3",
  "/es/casos/automatizacion-gtm-b2b",
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
