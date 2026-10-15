import type { Locale } from "./chrome";

/** Home hero offer. The 2-minute demo is `#flujo`. The diagnosis opens the 15-minute calendar. */
export const heroCopy: Record<Locale, {
  subtitle: string;
  primary: string;
  secondary: string;
  micro: string;
  captionBefore: string;
  captionEm: string;
  badge: string;
}> = {
  en: {
    subtitle: "An invoice, an order, or a collection: how it runs by hand today, and how it sits in the system.",
    primary: "15-min diagnosis",
    secondary: "Watch a 2-min demo",
    micro: "The call is 15 minutes. The demo is the flow on this page.",
    captionBefore: "By hand, ",
    captionEm: "then in the system.",
    badge: "Puna Tech · Buenos Aires",
  },
  es: {
    subtitle: "Una factura, un pedido o una cobranza: cómo se hace hoy a mano y cómo queda en el sistema.",
    primary: "Diagnóstico de 15 min",
    secondary: "Ver una demo de 2 min",
    micro: "La llamada son 15 minutos. La demo es el flujo de esta página.",
    captionBefore: "A mano, ",
    captionEm: "después en el sistema.",
    badge: "Puna Tech · Buenos Aires",
  },
};
