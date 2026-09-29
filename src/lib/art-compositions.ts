export type ArtFamily = "Editorial" | "Anotación" | "Afiche" | "Collage" | "Tech" | "Cuaderno" | "Pop-Collage";
export type ArtCopy = { headline: string; support: string; closing: string };

export const CURATED_ART_ASSETS = [
  { id: "puna-workspace", name: "Espacio de trabajo · Luz matinal y taza terracota", url: "/art-direction/puna-workspace.jpg" },
  { id: "puna-portrait", name: "Retrato profesional · Criterio y tecnología", url: "/art-direction/puna-portrait.jpg" },
  { id: "puna-process", name: "Método y procesos · Mapeo en papel y sistema", url: "/art-direction/puna-process.jpg" },
  { id: "pop-couple", name: "Recorte Sticker · Pareja asombrada con laptop", url: "/art-direction/pop-cutout-couple.png" },
  { id: "pop-megaphone", name: "Recorte Sticker · Mujer con megáfono", url: "/art-direction/pop-cutout-megaphone.png" },
  { id: "pop-notebook", name: "Recorte Sticker · Mujer con libreta de notas", url: "/art-direction/pop-cutout-notebook.png" },
  { id: "pop-shocked", name: "Recorte Sticker · Mujer con gesto dramático", url: "/art-direction/pop-cutout-shocked.png" },
  { id: "pop-cheering", name: "Recorte Sticker · Mujer celebrando", url: "/art-direction/pop-cutout-cheering.png" },
  { id: "cup-of-couple", name: "Escena cotidiana · Cuaderno y laptop (Pexels)", url: "/art-direction/workspace-cup-of-couple.jpg" },
  { id: "3d-laptop", name: "Render Tech · Laptop en roca oscura", url: "/art-direction/3d-laptop-slate.jpg" },
  { id: "3d-chess", name: "Render Tech · Estrategia de ajedrez", url: "/art-direction/3d-chess-strategy.jpg" },
] as const;

export const ART_COMPOSITIONS = [
  { id: "paper-photo", name: "Papel rasgado + nota", family: "Editorial", photo: true, description: "El beneficio humano, con papel rasgado y una nota sobre una escena cotidiana.", headline: "Tu equipo tiene mejores cosas que hacer.", support: "Lo repetitivo, al sistema.", closing: "Diseñamos procesos que te devuelven tiempo." },
  { id: "dark-tech", name: "Tech B2B / Dark Glow", family: "Tech", photo: true, description: "Estilo Nexora/Agyweb: fondo oscuro, titular con glow naranja, render 3D central y botón pill.", headline: "CONSTRUIMOS SISTEMAS. ESCALAMOS RESULTADOS.", support: "Automatización con criterio que elimina cuellos de botella y acelera tu equipo.", closing: "Hablemos de tu proceso" },
  { id: "marker-note", name: "Marcador y anotación", family: "Anotación", photo: true, description: "Fotografía central, palabra clave destacada con marcador a mano y flecha con nota.", headline: "Es momento de construir tu sistema.", support: "Ideas, personas y criterio.", closing: "Hagamos que el trabajo fluya con intención." },
  { id: "bolder-poster", name: "Afiche Bolder", family: "Afiche", photo: true, description: "Alto contraste en fondo tinta, tipografía de impacto, píldora y remate editorial.", headline: "EQUIPOS CREATIVOS PARA PROCESOS SÓLIDOS", support: "Automatización con criterio humano.", closing: "PUNA TECH // 2026" },
  { id: "polaroid-collage", name: "Collage Polaroid", family: "Collage", photo: true, description: "Fotografía en marco polaroid con cinta adhesiva y retícula editorial cuidada.", headline: "Espacio real para las grandes ideas.", support: "Diseñamos procesos que eliminan la fricción cotidiana.", closing: "El método detrás del resultado." },
  { id: "notebook-carousel", name: "Cuaderno troquelado (Carrusel)", family: "Cuaderno", photo: true, description: "Carrusel editorial: hoja de cuaderno con espiral perforado, stickers vectoriales y pestañas troqueladas.", headline: "Pensamientos de lunes sobre tu negocio", support: "Tratando de ordenar los procesos de una vez", closing: "Lo repetitivo, al sistema." },
  { id: "pop-collage", name: "Pop-Collage Sticker (Carrusel)", family: "Pop-Collage", photo: true, description: "Carrusel pop: personajes B&W con contorno sticker die-cut, titular de impacto y caja de contraste.", headline: "4 cosas que la IA no hace por vos", support: "El criterio, la empatía y la responsabilidad siguen siendo de tu equipo.", closing: "Pero vos sí." },
] as const satisfies readonly ({ id: string; name: string; family: ArtFamily; photo: boolean; description: string } & ArtCopy)[];
export type ArtComposition = typeof ART_COMPOSITIONS[number];
export type ArtCompositionId = ArtComposition["id"];

export function parseArtHistory(value: string | null): ArtCompositionId[] {
  try {
    const parsed: unknown = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is ArtCompositionId => ART_COMPOSITIONS.some(c => c.id === id)).slice(-120) : [];
  } catch { return []; }
}

// Exclude every downloaded composition in the current cycle, then prefer a different family.
// This is local download history, deliberately not described as publication history.
export function nextArtComposition(current: ArtCompositionId, history: readonly ArtCompositionId[]): ArtCompositionId {
  let cycle = new Set<ArtCompositionId>();
  for (const id of history) {
    if (ART_COMPOSITIONS.some(c => c.id === id)) {
      cycle.add(id);
      if (cycle.size === ART_COMPOSITIONS.length) cycle = new Set();
    }
  }
  const currentComp = ART_COMPOSITIONS.find(c => c.id === current) || ART_COMPOSITIONS[0];
  const family = currentComp.family;
  const eligible = ART_COMPOSITIONS.filter(c => !cycle.has(c.id));
  if (eligible.length === 1 && eligible[0].id === current) return current;
  const candidates = eligible.length ? eligible : ART_COMPOSITIONS.filter(c => c.id !== current);
  const varied = candidates.filter(c => c.family !== family);
  const pool = (varied.length ? varied : candidates).filter(c => c.id !== current);
  if (!pool.length) return current;
  return [...pool].sort((a, b) => history.lastIndexOf(a.id) - history.lastIndexOf(b.id))[0].id;
}

export function trendResearchUrl(keyword: string, country: string) {
  const geo = ["AR", "UY", "CL", "MX", "ES"].includes(country) ? country : "AR";
  return `https://trends.google.com/trends/explore?${new URLSearchParams({ geo, date: "now 7-d", q: keyword.trim().slice(0, 100) || "automatización" })}`;
}
