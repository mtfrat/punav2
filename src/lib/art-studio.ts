export const ART_PIECE_ROLES = ["cover", "evidence", "carousel"] as const;
export type ArtPieceRole = (typeof ART_PIECE_ROLES)[number];

export const ART_PIECE_LABELS: Record<ArtPieceRole, string> = {
  cover: "Portada / idea",
  evidence: "Prueba visual",
  carousel: "Carrusel explicativo",
};

export const ART_REVIEW_KEYS = [
  "coherent_variety",
  "brand_recognition",
  "mobile_legibility",
  "distinct_roles",
  "evidence_ok",
  "rights_ok",
  "grid_ok",
] as const;

export const ART_REVIEW_LABELS: Record<(typeof ART_REVIEW_KEYS)[number], string> = {
  coherent_variety: "Las tres piezas comparten una idea sin parecer duplicadas.",
  brand_recognition: "La campaña se reconoce como Puna sin depender del logo.",
  mobile_legibility: "Titulares e información esencial se leen en tamaño móvil.",
  distinct_roles: "Cada pieza cumple una función narrativa distinta.",
  evidence_ok: "Hechos y cifras están ligados a evidencia verificable.",
  rights_ok: "Todos los activos tienen permiso y procedencia confirmados.",
  grid_ok: "Cada publicación funciona por sí sola y la secuencia mantiene continuidad.",
};

export function isArtPieceRole(value: string): value is ArtPieceRole {
  return ART_PIECE_ROLES.includes(value as ArtPieceRole);
}

export function hasValidAssetRights(asset: Record<string, any> | null | undefined, today = new Date().toISOString().slice(0, 10)) {
  return Boolean(asset)
    && ["owned", "licensed", "permission"].includes(asset!.rights_status)
    && (!asset!.rights_expires_at || asset!.rights_expires_at >= today)
    && (asset!.category !== "people" || asset!.people_consent === true);
}

export function artCampaignReadiness(
  campaign: Record<string, any>,
  pieces: Array<Record<string, any>>,
  assets: Array<Record<string, any>> = [],
) {
  const issues: string[] = [];
  if (!campaign?.thesis || !campaign?.perspective || !campaign?.audience || !campaign?.problem_statement)
    issues.push("Completá el brief y la tesis de campaña.");
  if (!Array.isArray(campaign?.facts) || campaign.facts.length < 1)
    issues.push("Agregá al menos un hecho con fuente HTTPS.");
  const routes = Array.isArray(campaign?.direction_routes) ? campaign.direction_routes : [];
  if (routes.length !== 2 || !campaign?.selected_route_key)
    issues.push("Documentá dos rutas visuales y elegí una.");
  const byRole = new Map(pieces.map((piece) => [piece.role, piece]));
  for (const role of ART_PIECE_ROLES) {
    const piece = byRole.get(role);
    const editorial = piece?.media_urls?.primary?.kind === "editorial_canvas";
    if (!piece?.narrative_function || !piece?.headline || !(piece?.template_id || editorial) || !piece?.alt_text)
      issues.push(`Completá ${ART_PIECE_LABELS[role].toLowerCase()}.`);
    if (editorial && (!piece.media_urls.primary.rights_confirmed || !piece.media_urls.primary.rights_source))
      issues.push(`Confirmá procedencia y derechos de ${ART_PIECE_LABELS[role].toLowerCase()}.`);
    if (!piece?.media_urls?.primary?.output_path)
      issues.push(`Componé ${ART_PIECE_LABELS[role].toLowerCase()} antes de revisar.`);
    if (role === "carousel" && (!Array.isArray(piece?.media_urls?.slides) || piece.media_urls.slides.length < 2))
      issues.push("El carrusel necesita al menos dos placas compuestas.");
  }
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));
  for (const piece of pieces) {
    if (!piece.asset_id) continue;
    const asset = assetById.get(piece.asset_id);
    if (!hasValidAssetRights(asset))
      issues.push(`Confirmá los derechos del activo usado en ${ART_PIECE_LABELS[piece.role as ArtPieceRole] || "la pieza"}.`);
  }
  const review = campaign?.review || {};
  if (ART_REVIEW_KEYS.some((key) => review[key] !== true))
    issues.push("Completá el checklist de revisión humana.");
  if (!review.internal_reviewer || !review.design_reviewer)
    issues.push("Registrá la revisión de Puna y la revisión de diseño/CM.");
  return [...new Set(issues)];
}
