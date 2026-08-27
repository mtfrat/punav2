declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent =
  | "cta_view"
  | "cta_click"
  | "cal_open"
  | "cal_booked"
  | "case_study_view"
  | "industry_view"
  | "service_view"
  | "project_brief_start"
  | "project_brief_submit"
  | "chat_open"
  | "chat_qualified"
  | "language_switch";

export function trackEvent(event: AnalyticsEvent, properties: Record<string, string | number | boolean | undefined> = {}) {
  if (typeof window === "undefined" || window.location.pathname === "/ops" || window.location.pathname.startsWith("/ops/")) return;
  const payload = { page: window.location.pathname, ...properties };
  window.gtag?.("event", event, payload);
  window.clarity?.("event", event);
}
