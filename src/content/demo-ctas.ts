/**
 * Demo call-to-action shown above the fold area and at the end of pages that already bring organic traffic.
 * Kept in its own file (not inside use-cases.ts / tools.ts / catalog.ts) so content PRs do not conflict with it.
 * Every claim here is already on the linked demo pages: demos run in the browser, use fictional data, send nothing.
 */

export interface DemoCta {
  eyebrow: string;
  title: string;
  body: string;
  label: string;
  href: string;
  second?: { label: string; href: string };
}

export const DEMO_CTAS: Record<string, DemoCta> = {
  // Tool: no deadline-specific demo exists, so it points at the law-firm demo hub (inquiry triage + fee reminders).
  "/es/herramientas/plazos-procesales": {
    eyebrow: "Demos para estudios jurídicos",
    title: "Probá cómo se ordena el trabajo de un estudio jurídico",
    body: "Ya sabés el plazo. Estas demos muestran lo que sigue en el día a día: consultas ordenadas por prioridad y avisos de honorarios que se preparan y vos aprobás. Datos ficticios, corren en el navegador y no mandan nada a nadie. Todavía no tenemos una demo propia de plazos: si la necesitás, la armamos a medida.",
    label: "Probar las demos para estudios jurídicos",
    href: "/es/demos/para/estudios-juridicos",
  },
  // Use case: the accounting demo closest to ARCA invoices is the client-invoices reader (CUIT, CAE, duplicates).
  "/es/automatizaciones/facturacion-electronica-arca": {
    eyebrow: "Demo para estudios contables",
    title: "Probá una demo con facturas, CUIT y CAE",
    body: "Esta demo no emite comprobantes: lee las facturas de compra que suben tus clientes y controla CUIT, CAE, duplicados y percepciones antes de cargar la planilla del estudio. Datos ficticios, corre en el navegador y no manda nada a nadie.",
    label: "Probar la demo de facturas",
    href: "/es/demos/facturas-de-clientes",
    second: { label: "Ver demos para estudios contables", href: "/es/demos/para/estudios-contables" },
  },
  // Service: the store dashboard is the multi-screen "system" demo (sales, stock, cash); the hub covers the rest.
  "/es/servicios/software-a-medida": {
    eyebrow: "Probalo antes de la llamada",
    title: "Mirá cómo se ve un sistema a medida",
    body: "El panel de gestión para comercio junta ventas, stock y caja en una sola pantalla, con reposición sugerida y cierre de caja. Corre en el navegador con datos ficticios y no es un cliente nuestro: es un ejemplo de cómo se ve un primer módulo.",
    label: "Probar el panel de gestión",
    href: "/es/demos/panel-comercio",
    second: { label: "Ver todas las demos", href: "/es/demos" },
  },
};

export function demoCtaFor(path: string): DemoCta | undefined {
  return DEMO_CTAS[path.replace(/\/+$/, "")];
}
