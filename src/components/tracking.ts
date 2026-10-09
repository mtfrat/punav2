declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

export const GA_MEASUREMENT_ID = "G-JVV1Y4Y85Y";

export type AnalyticsEvent =
  | "cta_view"
  | "cta_primary_view"
  | "cta_click"
  | "cal_open"
  | "cal_booked"
  | "case_study_view"
  | "audience_view"
  | "service_view"
  | "use_case_view"
  | "project_brief_start"
  | "project_brief_submit"
  | "generate_lead"
  | "chat_open"
  | "chat_qualified"
  | "language_switch";

type QueuedEvent = {
  event: AnalyticsEvent;
  payload: Record<string, string | number | boolean | undefined>;
};

const queuedEvents: QueuedEvent[] = [];
let gaConfigured = false;

function installQueues() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
  }
  if (typeof window.clarity !== "function") {
    const clarity = function clarity(this: Window["clarity"]) {
      const stub = clarity as NonNullable<Window["clarity"]>;
      stub.q = stub.q || [];
      stub.q.push(arguments);
    };
    window.clarity = clarity as Window["clarity"];
  }
}

/** Queue GA config before the gtag.js library loads, then flush events captured earlier. */
export function activateAnalytics() {
  installQueues();
  if (gaConfigured || typeof window.gtag !== "function") return;
  gaConfigured = true;
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
  for (const item of queuedEvents) window.gtag("event", item.event, item.payload);
  queuedEvents.length = 0;
}

export function trackEvent(event: AnalyticsEvent, properties: Record<string, string | number | boolean | undefined> = {}) {
  if (typeof window === "undefined" || window.location.pathname === "/ops" || window.location.pathname.startsWith("/ops/")) return;
  const payload = { page: window.location.pathname, ...properties };
  installQueues();
  if (!gaConfigured) queuedEvents.push({ event, payload });
  else window.gtag?.("event", event, payload);
  window.clarity?.("event", event);
}

installQueues();
