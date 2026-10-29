import { useCallback, useRef } from "react";
import { trackEvent } from "../tracking";

/** Fires tool_use once per page view (first real interaction) and tool_export on every export. */
export function useToolTracking(tool: string) {
  const used = useRef(false);
  const markUsed = useCallback(
    (detail: Record<string, string | number | boolean | undefined> = {}) => {
      if (used.current) return;
      used.current = true;
      trackEvent("tool_use", { locale: "es", tool, ...detail });
    },
    [tool],
  );
  const markExport = useCallback(
    (format: string, detail: Record<string, string | number | boolean | undefined> = {}) => {
      trackEvent("tool_export", { locale: "es", tool, format, ...detail });
    },
    [tool],
  );
  return { markUsed, markExport };
}
