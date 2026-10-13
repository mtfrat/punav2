export type HeroVariantId = "default" | "a" | "b" | "c";

/** Query values that select a preview hero. Anything else, including no param, is production. */
export function readHeroVariant(search: string): HeroVariantId {
  const value = new URLSearchParams(search).get("v");
  return value === "a" || value === "b" || value === "c" ? value : "default";
}

/**
 * Runs from the document head on `/` and `/es` before first paint.
 * Sets `data-hero` on `<html>` so CSS can show one slot without a React render
 * that would change the LCP line. Keep the accepted values in sync with `readHeroVariant`.
 */
export const HERO_VARIANT_BOOT =
  `(function(){var v=new URLSearchParams(location.search).get("v");document.documentElement.dataset.hero=v==="a"||v==="b"||v==="c"?v:"default";})();`;

/** Keep `?v=` when the language switch or logo stays on the home page. */
export function heroVariantHref(path: string, search: string) {
  const variant = readHeroVariant(search);
  if (variant === "default") return path;
  if (path !== "/" && path !== "/es") return path;
  return `${path}?v=${variant}`;
}
