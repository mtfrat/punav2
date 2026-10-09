import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { activateAnalytics, GA_MEASUREMENT_ID } from "./tracking";

const CLARITY_ID = "wuakxf8xet";

function injectScript(src: string, datasetKey: "gtag" | "clarityTag") {
  const selector = datasetKey === "gtag" ? "script[data-gtag]" : "script[data-clarity-tag]";
  if (document.querySelector(selector)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  if (datasetKey === "gtag") script.dataset.gtag = "true";
  else script.dataset.clarityTag = "true";
  document.head.appendChild(script);
}

export function Analytics() {
  const location = useLocation();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (location.pathname === "/ops" || location.pathname.startsWith("/ops/")) return;
    activateAnalytics();
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`, "gtag");
    injectScript(`https://www.clarity.ms/tag/${CLARITY_ID}`, "clarityTag");

    // gtag('config') inside activateAnalytics queues the first page_view for this
    // URL (UTMs stay on dl, document.referrer stays on dr). This effect also runs
    // on that first mount, so a manual hit here would count the same page twice.
    const url = window.location.href;
    if (lastUrl.current === null) {
      lastUrl.current = url;
      return;
    }
    if (url === lastUrl.current) return;
    window.gtag?.("event", "page_view", {
      page_location: url,
      page_referrer: lastUrl.current,
      page_title: document.title,
    });
    lastUrl.current = url;
  }, [location.pathname, location.search]);

  return null;
}
