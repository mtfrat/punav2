import type { Locale } from "./chrome";

/**
 * Preview copy for `?v=a|b|c` on `/` and `/es`.
 * No client names, result figures, or testimonials. The 2-minute demo is the
 * in-page flow at `#flujo` (invoices, orders, collections). The diagnosis opens
 * the existing 15-minute calendar.
 */
export const heroVariantCopy: Record<Locale, {
  a: HeroSlotCopy;
  b: HeroSlotCopy;
  c: HeroSlotCopy & { kicker: string; italic: string };
}> = {
  en: {
    a: {
      subtitle: "Invoices, WhatsApp orders, and collections that still get typed into a spreadsheet. On the call we see which one should move into the system first.",
      primary: "Book the 15-min diagnosis",
      secondary: "Watch a 2-min demo",
      micro: "Nothing to prepare. If there is no process to automate, we say so on the call.",
      captionBefore: "The spreadsheet, ",
      captionEm: "out of the critical path.",
      badge: "Puna Tech · Buenos Aires",
    },
    b: {
      subtitle: "An invoice, an order, or a collection: how it runs by hand today, and how it sits in the system.",
      primary: "15-min diagnosis",
      secondary: "Watch a 2-min demo",
      micro: "The call is 15 minutes. The demo is the flow on this page.",
      captionBefore: "By hand, ",
      captionEm: "then in the system.",
      badge: "Puna Tech · Buenos Aires",
    },
    c: {
      subtitle: "Further down: handoffs that still get retyped, tools that do not share a record, and operations that need their own system.",
      primary: "Book the 15-min diagnosis",
      secondary: "Watch a 2-min demo",
      micro: "On the tools you already run. If connecting them is enough, we say so.",
      captionBefore: "The diagnosis sits ",
      captionEm: "with the examples.",
      badge: "Puna Tech · Buenos Aires",
      kicker: "The next step",
      italic: "If one of these is yours, we look at it in 15 minutes.",
    },
  },
  es: {
    a: {
      subtitle: "Facturas, pedidos por WhatsApp y cobranzas que hoy se cargan en una planilla. En la llamada vemos cuál conviene pasar al sistema primero.",
      primary: "Pedí el diagnóstico de 15 min",
      secondary: "Ver una demo de 2 min",
      micro: "Sin preparar nada. Si no hay un proceso para automatizar, lo decimos en la llamada.",
      captionBefore: "La planilla, ",
      captionEm: "fuera del camino crítico.",
      badge: "Puna Tech · Buenos Aires",
    },
    b: {
      subtitle: "Una factura, un pedido o una cobranza: cómo se hace hoy a mano y cómo queda en el sistema.",
      primary: "Diagnóstico de 15 min",
      secondary: "Ver una demo de 2 min",
      micro: "La llamada son 15 minutos. La demo es el flujo de esta página.",
      captionBefore: "A mano, ",
      captionEm: "después en el sistema.",
      badge: "Puna Tech · Buenos Aires",
    },
    c: {
      subtitle: "Más abajo están los procesos ya escritos: facturas de proveedores, pedidos por WhatsApp, cobranzas, Mercado Pago, Tienda Nube y Mercado Libre.",
      primary: "Pedí el diagnóstico de 15 min",
      secondary: "Ver una demo de 2 min",
      micro: "Con lo que ya usás. Si alcanza con conectar, lo decimos.",
      captionBefore: "El diagnóstico está ",
      captionEm: "con los ejemplos.",
      badge: "Puna Tech · Buenos Aires",
      kicker: "El siguiente paso",
      italic: "Si uno de estos procesos es el tuyo, lo vemos en 15 minutos.",
    },
  },
};

type HeroSlotCopy = {
  subtitle: string;
  primary: string;
  secondary: string;
  micro: string;
  captionBefore: string;
  captionEm: string;
  badge: string;
};
