export type ArtFamily = "Fotografía" | "Tipografía" | "Editorial" | "Comparativa" | "Método" | "Conversación";
export type ArtCopy = { headline: string; support: string; closing: string };
export const ART_COMPOSITIONS = [
  { id: "paper-photo", name: "Fotografía + nota", family: "Fotografía", photo: true, description: "El beneficio humano, con una nota sobre una escena cotidiana.", headline: "Tu equipo tiene mejores cosas que hacer.", support: "Lo repetitivo, al sistema.", closing: "Diseñamos procesos que te devuelven tiempo." },
  { id: "manifesto", name: "Manifiesto", family: "Tipografía", photo: false, description: "Una afirmación contundente, sin fotografía ni adornos.", headline: "No falta tiempo. Sobra trabajo repetido.", support: "Antes de sumar otra herramienta, revisemos el proceso.", closing: "Automatización con criterio." },
  { id: "letter", name: "Carta abierta", family: "Editorial", photo: false, description: "Lectura íntima: un mensaje editorial con espacio y una firma.", headline: "Para quienes sostienen todo de memoria.", support: "Un buen proceso no debería depender de una persona que se acuerda de todo. Empecemos por hacer visible ese trabajo.", closing: "Menos pendientes. Más claridad." },
  { id: "contrast", name: "Dos maneras", family: "Comparativa", photo: false, description: "Dos mitades contrastadas para comparar hábitos, no resultados inventados.", headline: "¿Recordarlo todo o diseñar un sistema?", support: "Depender de la memoria\nDefinir el próximo paso", closing: "El trabajo necesita un método." },
  { id: "steps", name: "Ruta de trabajo", family: "Método", photo: false, description: "Tres pasos conectados, con una secuencia que se puede guardar.", headline: "Antes de automatizar.", support: "Entendé el trabajo\nDefiní quién decide\nElegí qué medir", closing: "Primero el criterio. Después, la herramienta." },
  { id: "question", name: "Una buena pregunta", family: "Conversación", photo: false, description: "Una pregunta grande y un remate corto para abrir una conversación.", headline: "¿Qué tarea no querés repetir el lunes?", support: "Ahí puede empezar tu próximo proceso.", closing: "Te leemos." },
  { id: "photo-caption", name: "Escena + epígrafe", family: "Fotografía", photo: true, description: "La fotografía ocupa el primer plano; el mensaje vive debajo, sobre papel.", headline: "Dejá espacio para pensar.", support: "Que lo urgente no se quede con toda tu agenda.", closing: "Tecnología al servicio de tu equipo." },
  { id: "type-poster", name: "Afiche de palabras", family: "Tipografía", photo: false, description: "Tipografía apilada, una franja lateral y un cierre a contrapunto.", headline: "Menos copiar. Más conectar.", support: "La información puede viajar sin que alguien la lleve a mano.", closing: "Hagamos que el trabajo fluya." },
  { id: "margin", name: "Margen editorial", family: "Editorial", photo: true, description: "Columna fotográfica y texto alineado como una página de revista.", headline: "El trabajo invisible también cuenta.", support: "Buscar un dato. Reenviar un mensaje. Actualizar otra planilla. Miremos lo que pasa entre las tareas.", closing: "Diseñar también es observar." },
  { id: "myth", name: "Idea / mirada", family: "Comparativa", photo: false, description: "Una idea habitual en pequeño; una nueva mirada toma el protagonismo.", headline: "Automatizar no es dejar de decidir.", support: "La herramienta hace todo\nEl equipo define el criterio", closing: "Las decisiones importantes siguen siendo humanas." },
  { id: "checklist", name: "Lista de criterio", family: "Método", photo: false, description: "Una lista práctica de preguntas, con casillas y jerarquía editorial.", headline: "¿Este proceso está listo?", support: "¿Tiene un responsable?\n¿Tiene una regla clara?\n¿Sabemos cuándo terminó?", closing: "Guardalo para tu próxima reunión." },
  { id: "invitation", name: "Invitación", family: "Conversación", photo: false, description: "Composición centrada con mucho aire: una invitación, no un anuncio ruidoso.", headline: "Empecemos por una tarea.", support: "Esa que se repite. Esa que nadie quiere hacer. Esa que podría funcionar mejor.", closing: "Contanos cuál es la tuya." },
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
    cycle.add(id);
    if (cycle.size === ART_COMPOSITIONS.length) cycle = new Set();
  }
  const family = ART_COMPOSITIONS.find(c => c.id === current)!.family;
  const eligible = ART_COMPOSITIONS.filter(c => !cycle.has(c.id));
  if (eligible.length === 1 && eligible[0].id === current) return current;
  const candidates = eligible.length ? eligible : ART_COMPOSITIONS.filter(c => c.id !== current);
  const varied = candidates.filter(c => c.family !== family);
  const pool = (varied.length ? varied : candidates).filter(c => c.id !== current);
  return [...pool].sort((a, b) => history.lastIndexOf(a.id) - history.lastIndexOf(b.id))[0].id;
}

export function trendResearchUrl(keyword: string, country: string) {
  const geo = ["AR", "UY", "CL", "MX", "ES"].includes(country) ? country : "AR";
  return `https://trends.google.com/trends/explore?${new URLSearchParams({ geo, date: "now 7-d", q: keyword.trim().slice(0, 100) || "automatización" })}`;
}
