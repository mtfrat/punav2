import { useEffect } from "react";
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

  useEffect(() => {
    if (location.pathname === "/ops" || location.pathname.startsWith("/ops/")) return;
    activateAnalytics();
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`, "gtag");
    injectScript(`https://www.clarity.ms/tag/${CLARITY_ID}`, "clarityTag");
    window.gtag?.("event", "page_view", {
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}`,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}
