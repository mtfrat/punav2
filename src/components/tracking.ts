import { planAnalyticsInBrowser } from "../lib/internal-traffic";

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
  | "language_switch"
  | "demo_view"
  | "demo_action"
  | "demo_rubro_view"
  | "demo_rubro_card"
  | "tool_use"
  | "tool_export";

type QueuedEvent = {
  event: AnalyticsEvent;
  payload: Record<string, string | number | boolean | undefined>;
};

const queuedEvents: QueuedEvent[] = [];
let gaConfigured = false;
/** false once activateAnalytics decided this host must not talk to GA4 (anything but www.puna-tech.com). */
let gtagAllowed = true;

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

/**
 * Decides, before any GA4 hit, whether gtag may run, then queues the GA config and flushes events captured earlier.
 * Returns whether gtag.js should be loaded. Off the production host (previews, localhost, the apex) it returns false and
 * gtag('config') is never called, so no page_view or event reaches GA4. On the production host it returns true and the
 * config call carries traffic_type=internal for automated browsers and flagged visitors.
 */
export function activateAnalytics(): boolean {
  installQueues();
  if (gaConfigured) return gtagAllowed;
  if (typeof window.gtag !== "function") return false;
  gaConfigured = true;
  const plan = planAnalyticsInBrowser();
  gtagAllowed = plan.loadGtag;
  if (!gtagAllowed) {
    queuedEvents.length = 0;
    return false;
  }
  window.gtag("js", new Date());
  // traffic_type goes on the config call so it is set before the first page_view (which gtag('config') itself sends)
  // and is inherited by every later event for this measurement ID, including Enhanced Measurement SPA page_views.
  // It only excludes data once the GA4 "Internal Traffic" data filter (traffic_type = internal) is Active.
  if (plan.internal) window.gtag("config", GA_MEASUREMENT_ID, { traffic_type: "internal" });
  else window.gtag("config", GA_MEASUREMENT_ID);
  for (const item of queuedEvents) window.gtag("event", item.event, item.payload);
  queuedEvents.length = 0;
  return true;
}

export function trackEvent(event: AnalyticsEvent, properties: Record<string, string | number | boolean | undefined> = {}) {
  if (typeof window === "undefined" || window.location.pathname === "/ops" || window.location.pathname.startsWith("/ops/")) return;
  const payload = { page: window.location.pathname, ...properties };
  installQueues();
  if (!gaConfigured) queuedEvents.push({ event, payload });
  else if (gtagAllowed) window.gtag?.("event", event, payload);
  window.clarity?.("event", event);
}

installQueues();
