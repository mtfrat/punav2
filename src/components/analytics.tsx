import { useEffect } from "react";
import { useLocation } from "react-router";
import "./tracking";

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    const host = window.location.hostname;
    const isProduction = host === "www.puna-tech.com" || host === "puna-tech.com";
    if (location.pathname === "/ops" || location.pathname.startsWith("/ops/") || !isProduction || document.querySelector("script[data-puna-analytics]")) return;
    const ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=G-JVV1Y4Y85Y";
    ga.dataset.punaAnalytics = "true";
    document.head.appendChild(ga);
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
    window.gtag("js", new Date());
    window.gtag("config", "G-JVV1Y4Y85Y", { anonymize_ip: true, send_page_view: false });
    ((c: Window, d: Document, tag: string, src: string, id: string) => {
      c.clarity = c.clarity || ((...args: unknown[]) => {
        (c.clarity as unknown as { q?: unknown[] }).q = (c.clarity as unknown as { q?: unknown[] }).q || [];
        (c.clarity as unknown as { q: unknown[] }).q.push(args);
      });
      const script = d.createElement(tag) as HTMLScriptElement;
      script.async = true;
      script.src = `${src}${id}`;
      script.dataset.punaAnalytics = "true";
      d.head.appendChild(script);
    })(window, document, "script", "https://www.clarity.ms/tag/", "wuakxf8xet");
  }, [location.pathname]);

  useEffect(() => {
    const host = window.location.hostname;
    if (location.pathname === "/ops" || location.pathname.startsWith("/ops/") || (host !== "www.puna-tech.com" && host !== "puna-tech.com")) return;
    window.gtag?.("event", "page_view", { page_location: window.location.href, page_path: `${location.pathname}${location.search}`, page_title: document.title });
  }, [location.pathname, location.search]);
  return null;
}
