import type { Locale } from "./chrome";
import type { RubroId } from "./rubros.ts";

/**
 * Walkthrough videos embedded on the rubro landings (law firms, insurance brokers, real estate, clinics).
 * The masters are made elsewhere (Video Lab); the web files come from scripts/encode-rubro-videos.sh.
 * Image and sound are built from the real demo pages with fictional data. Music credit lines are copied
 * from each video's CREDITS.md ("Para publicar") and must stay verbatim: they are the CC BY 4.0 attribution.
 */
export interface RubroVideoCopy {
  /** Name used in the VideoObject JSON-LD. */
  name: string;
  /** Description used in the VideoObject JSON-LD. */
  description: string;
  /** Visible heading above the player. */
  heading: string;
  /** Short lead next to the player. */
  lead: string;
  /** Alt text / aria-label: what is on screen. */
  alt: string;
  /** Short note under the player (captions language, no data). */
  note: string;
  /** Chapters shown next to the player: [m:ss, label]. Labels match the burned-in captions. */
  chapters: [string, string][];
}

export interface RubroVideo {
  /** Files are `${base}-16x9.{webm,mp4,webp}` and `${base}-9x16.{webm,mp4,webp}`. */
  base: string;
  /** Natural size of the 16x9 and 9x16 files (reserves the aspect ratio). */
  size: { wide: [number, number]; tall: [number, number] };
  /** ISO 8601 duration for the VideoObject. */
  duration: string;
  uploadDate: string;
  music: { title: string; isrc: string; trackUrl: string };
  copy: Record<Locale, RubroVideoCopy>;
}

export const CC_BY_URL = "https://creativecommons.org/licenses/by/4.0/";
export const MUSIC_ARTIST = "Kevin MacLeod";
export const MUSIC_ARTIST_URL = "https://incompetech.com";

/** The attribution line exactly as in CREDITS.md. */
export function musicCreditLine(title: string): string {
  return `Music: "${title}" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0 ${CC_BY_URL}`;
}

const track = (isrc: string) => `https://incompetech.com/music/royalty-free/index.html?isrc=${isrc}`;
const WIDE: [number, number] = [1280, 720];
const TALL: [number, number] = [720, 1280];
const DATE = "2026-10-29";

export const rubroVideos: Partial<Record<RubroId, RubroVideo>> = {
  legal: {
    base: "/media/demos/rubro-estudios-juridicos",
    size: { wide: WIDE, tall: TALL },
    duration: "PT35S",
    uploadDate: DATE,
    music: { title: "Relaxing Piano Music", isrc: "USUAN1500075", trackUrl: track("USUAN1500075") },
    copy: {
      es: {
        name: "Demo en video para estudios jurídicos: consultas con prioridad y honorarios al día",
        description: "Video de 35 segundos con datos ficticios: un estudio jurídico ordena las consultas por prioridad, prepara la respuesta y el aviso de honorarios, y vos aprobás antes de que salga nada.",
        heading: "Mirá la demo en 35 segundos",
        lead: "Una consulta entra, el agente la lee y la puntúa, redacta la respuesta y prepara el recordatorio de honorarios. Vos aprobás antes de que salga nada.",
        alt: "Recorrido en video de la demo para estudios jurídicos: bandeja de consultas con prioridad y puntaje, respuesta sugerida que espera tu OK, honorarios a cobrar con el recordatorio listo y el aviso de novedades de cada causa a medida. Datos ficticios.",
        note: "Video sin voz, con subtítulos en pantalla en español. Datos ficticios.",
        chapters: [["0:00", "Cada consulta, ordenada"], ["0:04", "Elegís una y ves qué leyó"], ["0:09", "Un puntaje con reglas visibles"], ["0:13", "La respuesta, lista para tu OK"], ["0:15", "Honorarios a cobrar, al día"], ["0:19", "Nada sale sin tu aprobación"], ["0:21", "Y lo que falta, a medida"]],
      },
      en: {
        name: "Video demo for law firms: prioritized inquiries and fees collected on time",
        description: "35-second video with fictional data: a law firm sorts inquiries by priority, drafts the reply and the fee reminder, and you approve before anything goes out.",
        heading: "Watch the demo in 35 seconds",
        lead: "An inquiry comes in, the agent reads and scores it, drafts the reply and prepares the fee reminder. You approve before anything goes out.",
        alt: "Video walkthrough of the law firm demo: inbox of inquiries with priority and score, a suggested reply waiting for your OK, fees to collect with the reminder ready, and a per-case update notice built to order. Fictional data.",
        note: "No voiceover. On-screen captions are in Spanish. Fictional data.",
        chapters: [["0:00", "Every inquiry, sorted"], ["0:04", "Pick one and see what it read"], ["0:09", "A score with visible rules"], ["0:13", "The reply, ready for your OK"], ["0:15", "Fees to collect, on time"], ["0:19", "Nothing goes out without your approval"], ["0:21", "And the rest, built to order"]],
      },
    },
  },
  insurance: {
    base: "/media/demos/rubro-productores-de-seguros",
    size: { wide: WIDE, tall: TALL },
    duration: "PT35S",
    uploadDate: DATE,
    music: { title: "Wholesome", isrc: "USUAN1900022", trackUrl: track("USUAN1900022") },
    copy: {
      es: {
        name: "Demo en video para productores de seguros: pólizas desde PDF y renovaciones",
        description: "Video de 35 segundos con datos ficticios: una productora de seguros pasa pólizas de PDF a cartera, ve qué vence este mes y prepara el aviso de renovación, y vos aprobás.",
        heading: "Mirá la demo en 35 segundos",
        lead: "Subís el PDF de la póliza, el agente arma la cartera, separa lo que vence este mes y prepara el aviso para cada asegurado. Vos aprobás antes de que salga.",
        alt: "Recorrido en video de la demo para productores de seguros: lectura de una póliza desde PDF, cartera con los vencimientos del mes, datos que no se leen marcados para revisar, aviso de renovación listo para tu OK y facturas de compra de clientes. Datos ficticios.",
        note: "Video sin voz, con subtítulos en pantalla en español. Datos ficticios.",
        chapters: [["0:00", "Pólizas sin tipear"], ["0:04", "Elegís una póliza y ves qué leyó"], ["0:10", "Qué vence este mes"], ["0:13", "Lo que no se lee, se revisa"], ["0:15", "El aviso, listo para tu OK"], ["0:17", "Facturas de compra de tus clientes"]],
      },
      en: {
        name: "Video demo for insurance brokers: policies from PDF and renewals",
        description: "35-second video with fictional data: an insurance brokerage turns policy PDFs into a portfolio, sees what expires this month and prepares the renewal notice, and you approve.",
        heading: "Watch the demo in 35 seconds",
        lead: "You upload the policy PDF, the agent builds the portfolio, separates what expires this month and prepares the notice for each policyholder. You approve before it goes out.",
        alt: "Video walkthrough of the insurance broker demo: reading a policy from a PDF, a portfolio with this month's renewals, unreadable fields flagged for review, a renewal notice ready for your OK and clients' purchase invoices. Fictional data.",
        note: "No voiceover. On-screen captions are in Spanish. Fictional data.",
        chapters: [["0:00", "Policies without typing"], ["0:04", "Pick a policy and see what it read"], ["0:10", "What expires this month"], ["0:13", "What can't be read gets reviewed"], ["0:15", "The notice, ready for your OK"], ["0:17", "Your clients' purchase invoices"]],
      },
    },
  },
  "real-estate": {
    base: "/media/demos/rubro-inmobiliarias",
    size: { wide: WIDE, tall: TALL },
    duration: "PT35S",
    uploadDate: DATE,
    music: { title: "Dreamy Flashback", isrc: "USUAN1100532", trackUrl: track("USUAN1100532") },
    copy: {
      es: {
        name: "Demo en video para inmobiliarias: consultas con prioridad y alquileres al día",
        description: "Video de 35 segundos con datos ficticios: una inmobiliaria prioriza las consultas de todos los portales, ve los alquileres del mes y manda avisos escalonados que vos aprobás.",
        heading: "Mirá la demo en 35 segundos",
        lead: "Las consultas de portales y WhatsApp llegan con su prioridad, y los alquileres del mes quedan a la vista con avisos escalonados. Vos aprobás cada paso.",
        alt: "Recorrido en video de la demo para inmobiliarias: consultas de todos los portales con prioridad, qué hace el agente según el puntaje, alquileres del mes a la vista, avisos escalonados que esperan tu OK y el ajuste de alquileres a medida. Datos ficticios.",
        note: "Video sin voz, con subtítulos en pantalla en español. Datos ficticios.",
        chapters: [["0:00", "Consultas de todos los portales"], ["0:04", "Cada consulta, con su prioridad"], ["0:09", "Qué hace el agente según el puntaje"], ["0:15", "Alquileres del mes, a la vista"], ["0:19", "Avisos escalonados, con tu OK"], ["0:21", "El ajuste de alquileres, a medida"]],
      },
      en: {
        name: "Video demo for real estate agencies: prioritized inquiries and rent on time",
        description: "35-second video with fictional data: a real estate agency prioritizes inquiries from every portal, sees the month's rents and sends staged reminders that you approve.",
        heading: "Watch the demo in 35 seconds",
        lead: "Inquiries from portals and WhatsApp arrive with their priority, and the month's rents are in plain sight with staged reminders. You approve every step.",
        alt: "Video walkthrough of the real estate demo: inquiries from every portal with priority, what the agent does by score, the month's rents at a glance, staged reminders waiting for your OK and a rent adjustment built to order. Fictional data.",
        note: "No voiceover. On-screen captions are in Spanish. Fictional data.",
        chapters: [["0:00", "Inquiries from every portal"], ["0:04", "Each inquiry, with its priority"], ["0:09", "What the agent does by score"], ["0:15", "The month's rents at a glance"], ["0:19", "Staged reminders, with your OK"], ["0:21", "Rent adjustment, built to order"]],
      },
    },
  },
  clinics: {
    base: "/media/demos/rubro-clinicas-y-consultorios",
    size: { wide: WIDE, tall: TALL },
    duration: "PT34S",
    uploadDate: DATE,
    music: { title: "Relaxing Piano Music", isrc: "USUAN1500075", trackUrl: track("USUAN1500075") },
    copy: {
      es: {
        name: "Demo en video para clínicas y consultorios: horas del equipo y liquidación",
        description: "Video de 34 segundos con datos ficticios: una clínica ve las horas de su equipo, detecta fichadas incompletas y aprueba la liquidación. Las autorizaciones de obras sociales se arman a medida.",
        heading: "Mirá la demo en 34 segundos",
        lead: "El agente junta las horas del equipo, marca la salida que falta, propone el arreglo y deja la liquidación esperando tu aprobación. Las autorizaciones de obras sociales las armamos a medida.",
        alt: "Recorrido en video de la demo para clínicas y consultorios: horas de la semana de cada persona del equipo, fichada con la salida faltante marcada, arreglo sugerido que espera tu OK y liquidación que queda bloqueada hasta resolver la alerta. Datos ficticios.",
        note: "Video sin voz, con subtítulos en pantalla en español. Datos ficticios.",
        chapters: [["0:00", "La administración, con vos aprobando"], ["0:04", "Elegís a una persona"], ["0:09", "Fichadas incompletas, a la vista"], ["0:14", "Propone el arreglo"], ["0:17", "Vos aprobás la liquidación"], ["0:20", "Las autorizaciones, a medida"]],
      },
      en: {
        name: "Video demo for clinics and practices: team hours and payroll",
        description: "34-second video with fictional data: a clinic sees its team's hours, spots incomplete clock-ins and approves payroll. Health-insurer authorizations are built to order.",
        heading: "Watch the demo in 34 seconds",
        lead: "The agent gathers the team's hours, flags the missing clock-out, suggests the fix and leaves payroll waiting for your approval. Health-insurer authorizations are built to order.",
        alt: "Video walkthrough of the clinic demo: each team member's hours for the week, a timecard with the missing clock-out flagged, a suggested fix waiting for your OK and payroll that stays blocked until the alert is resolved. Fictional data.",
        note: "No voiceover. On-screen captions are in Spanish. Fictional data.",
        chapters: [["0:00", "The admin side, with you approving"], ["0:04", "Pick a person"], ["0:09", "Incomplete clock-ins, in plain sight"], ["0:14", "It suggests the fix"], ["0:17", "You approve payroll"], ["0:20", "Authorizations, built to order"]],
      },
    },
  },
};
