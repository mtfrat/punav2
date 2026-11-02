/**
 * Internal / non-production traffic detection for GA4.
 *
 * GA4 only excludes internal traffic when the hit carries `traffic_type=internal` AND an admin has created and
 * activated the "Internal Traffic" data filter (Admin > Data collection > Data filters). This module only decides
 * whether to send the parameter; see `activateAnalytics` in components/tracking.ts.
 *
 * Two layers, both decided before the first hit (the gtag `config` call, which itself sends the landing page_view):
 *  1. Off the production host (previews, localhost, the apex before its redirect) gtag.js is not loaded at all.
 *  2. On the production host gtag loads, and `traffic_type=internal` rides on the config call when navigator.webdriver is
 *     true, the UA contains HeadlessChrome/Lighthouse, or ?internal=1 was seen (persisted in localStorage; ?internal=0 clears).
 */

export const PRODUCTION_HOSTNAME = "www.puna-tech.com";
export const INTERNAL_STORAGE_KEY = "puna_internal_traffic";

export type InternalReason = "hostname" | "webdriver" | "user_agent" | "query_flag" | "stored_flag";

export interface InternalTrafficInput {
  hostname?: string;
  userAgent?: string;
  webdriver?: boolean;
  /** window.location.search, e.g. "?internal=1". */
  search?: string;
  /** localStorage-like. Any call may throw (Safari private mode, blocked storage); that is tolerated. */
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
}

export interface InternalTrafficResult {
  internal: boolean;
  reason: InternalReason | null;
}

const BOT_UA = /HeadlessChrome|Lighthouse/i;

function safely<T>(fn: () => T): T | undefined {
  try { return fn(); } catch { return undefined; }
}

/**
 * Decides whether this page load is internal traffic. Order of evidence: ?internal=0 clears the stored flag,
 * ?internal=1 sets it, then hostname, webdriver, user agent and the stored flag decide.
 * ?internal=0 only clears the stored flag: a preview hostname or an automated browser stays internal.
 */
export function detectInternalTraffic(input: InternalTrafficInput): InternalTrafficResult {
  const { hostname = "", userAgent = "", webdriver = false, search = "", storage = null } = input;
  const flag = new URLSearchParams(search).get("internal");
  let queryFlag = false;
  if (flag === "1") {
    queryFlag = true;
    if (storage) safely(() => storage.setItem(INTERNAL_STORAGE_KEY, "1"));
  } else if (flag === "0" && storage) {
    safely(() => storage.removeItem(INTERNAL_STORAGE_KEY));
  }
  if (hostname !== PRODUCTION_HOSTNAME) return { internal: true, reason: "hostname" };
  if (webdriver) return { internal: true, reason: "webdriver" };
  if (BOT_UA.test(userAgent)) return { internal: true, reason: "user_agent" };
  if (queryFlag) return { internal: true, reason: "query_flag" };
  if (flag !== "0" && storage && safely(() => storage.getItem(INTERNAL_STORAGE_KEY)) === "1") return { internal: true, reason: "stored_flag" };
  return { internal: false, reason: null };
}

export interface AnalyticsPlan extends InternalTrafficResult {
  /** false off the production host: gtag.js is not injected and gtag('config') is never called. */
  loadGtag: boolean;
}

/** Single decision point for GA4: whether to load gtag at all, and whether its config call carries traffic_type=internal. */
export function planAnalytics(input: InternalTrafficInput): AnalyticsPlan {
  return { loadGtag: input.hostname === PRODUCTION_HOSTNAME, ...detectInternalTraffic(input) };
}

function browserInput(): InternalTrafficInput {
  return {
    hostname: window.location.hostname,
    userAgent: navigator.userAgent,
    webdriver: navigator.webdriver === true,
    search: window.location.search,
    storage: safely(() => window.localStorage) ?? null,
  };
}

/** Reads the current browser environment. Must only be called in the browser. */
export function planAnalyticsInBrowser(): AnalyticsPlan {
  return planAnalytics(browserInput());
}
