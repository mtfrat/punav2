import { useEffect } from "react";
import { useLocation } from "react-router";
import "./tracking";

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/ops" || location.pathname.startsWith("/ops/")) return;

    // Microsoft Clarity
    if (!document.querySelector("script[data-clarity-tag]")) {
      ((c: Window, d: Document, tag: string, src: string, id: string) => {
        c.clarity = c.clarity || ((...args: unknown[]) => {
          (c.clarity as unknown as { q?: unknown[] }).q = (c.clarity as unknown as { q?: unknown[] }).q || [];
          (c.clarity as unknown as { q: unknown[] }).q.push(args);
        });
        const script = d.createElement(tag) as HTMLScriptElement;
        script.async = true;
        script.src = `${src}${id}`;
        script.dataset.clarityTag = "true";
        d.head.appendChild(script);
      })(window, document, "script", "https://www.clarity.ms/tag/", "wuakxf8xet");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/ops" || location.pathname.startsWith("/ops/")) return;

    // Report client-side SPA route transitions to GA4
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_location: window.location.href,
        page_path: `${location.pathname}${location.search}`,
        page_title: document.title,
      });
    }
  }, [location.pathname, location.search]);

  return null;
}
