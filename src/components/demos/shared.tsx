import { useCallback, useEffect, useRef, useState } from "react";
import type * as React from "react";
import { Link } from "react-router";
import { ArrowRight, Check, FlaskConical, Loader2, RotateCcw } from "lucide-react";
import { CalButton, trackEvent } from "../marketing";
import { contactPath, type Locale } from "../../content/chrome";
import { demoDefinitions } from "../../content/demos";
import { wantThisHref, wantThisLabel } from "../../content/demo-cta";

export type Loc = Locale;

/** Pick the right string table for the locale. */
export function pick<T>(loc: Loc, table: { es: T; en: T }): T {
  return table[loc];
}

/** Deterministic number formatting (identical on server and browser, so no hydration mismatch). */
export function groupThousands(n: number, sep: string) {
  const sign = n < 0 ? "-" : "";
  const digits = String(Math.abs(Math.round(n)));
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}
export function money(n: number, loc: Loc) {
  return loc === "es" ? `$ ${groupThousands(n, ".")}` : `ARS ${groupThousands(n, ",")}`;
}
export function num(n: number, loc: Loc, decimals = 0) {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const grouped = groupThousands(Number(int), loc === "es" ? "." : ",");
  return `${n < 0 ? "-" : ""}${grouped}${dec ? (loc === "es" ? "," : ".") + dec : ""}`;
}

const MONTHS = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
/** Example "today" for every demo: Tuesday 27 Oct 2026. Fixed so the data never goes stale. */
export const EXAMPLE_TODAY = Date.UTC(2026, 9, 27);
export function exampleDate(offsetDays: number, loc: Loc) {
  const d = new Date(EXAMPLE_TODAY + offsetDays * 86_400_000);
  return `${d.getUTCDate()} ${MONTHS[loc][d.getUTCMonth()]}`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/* ---------- Action log ---------- */
export interface LogEntry { id: number; time: string; text: string; kind: "agent" | "approved" | "info" | "warn" }

function clock() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

export function useActionLog(demo: string) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const counter = useRef(0);
  const push = useCallback((text: string, kind: LogEntry["kind"] = "info") => {
    counter.current += 1;
    const id = counter.current;
    setEntries((current) => [{ id, time: clock(), text, kind }, ...current].slice(0, 40));
    if (kind === "approved") trackEvent("demo_action", { demo, action: "approve" });
  }, [demo]);
  const clear = useCallback(() => setEntries([]), []);
  return { entries, push, clear };
}

const logCopy = {
  es: { title: "Registro de acciones", empty: "Todavía no pasó nada. Cada cosa que prepara el agente y cada aprobación tuya queda anotada acá.", agent: "Agente", approved: "Aprobado", info: "Sistema", warn: "Ojo" },
  en: { title: "Action log", empty: "Nothing yet. Everything the agent prepares and every approval you give is recorded here.", agent: "Agent", approved: "Approved", info: "System", warn: "Heads up" },
};

export function ActionLog({ entries, loc }: { entries: LogEntry[]; loc: Loc }) {
  const t = logCopy[loc];
  return (
    <section className="dm-panel dm-log" aria-label={t.title}>
      <h3 className="dm-panel-title">{t.title}</h3>
      {entries.length === 0 ? (
        <p className="dm-empty">{t.empty}</p>
      ) : (
        <ol className="dm-log-list" role="log" aria-live="polite">
          {entries.map((entry) => (
            <li key={entry.id} className={`dm-log-item is-${entry.kind}`}>
              <time>{entry.time}</time>
              <span className="dm-log-tag">{t[entry.kind]}</span>
              <span>{entry.text}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/* ---------- Building blocks ---------- */
export function ExampleBadge({ loc }: { loc: Loc }) {
  return (
    <span className="dm-badge"><FlaskConical aria-hidden="true" size={14} />{loc === "es" ? "Datos de ejemplo" : "Sample data"}</span>
  );
}

const frameCopy = {
  es: { steps: ["El agente prepara", "Vos revisás", "Vos aprobás"], reset: "Reiniciar demo", note: "Todo corre en tu navegador. No se envía nada a nadie y no se guardan datos." },
  en: { steps: ["The agent prepares", "You review", "You approve"], reset: "Reset demo", note: "Everything runs in your browser. Nothing is sent to anyone and no data is stored." },
};

export function DemoFrame({ loc, label, onReset, children }: { loc: Loc; label: string; onReset: () => void; children: React.ReactNode }) {
  const t = frameCopy[loc];
  return (
    <section className="dm-stage" aria-label={label}>
      <div className="dm-stage-head">
        <div className="dm-stage-title">
          <span className="dm-dot" aria-hidden="true" />
          <strong>{label}</strong>
          <ExampleBadge loc={loc} />
        </div>
        <ol className="dm-pattern" aria-label={loc === "es" ? "Cómo funciona" : "How it works"}>
          {t.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}
        </ol>
        <button type="button" className="dm-btn dm-btn-ghost dm-btn-sm" onClick={onReset}><RotateCcw aria-hidden="true" size={14} />{t.reset}</button>
      </div>
      <p className="dm-stage-note">{t.note}</p>
      <div className="dm-stage-body">{children}</div>
    </section>
  );
}

export function Kpi({ label, value, sub, tone = "ink" }: { label: string; value: string; sub?: string; tone?: "ink" | "good" | "bad" | "warn" }) {
  return (
    <div className={`dm-kpi is-${tone}`}>
      <span className="dm-kpi-label">{label}</span>
      <strong className="dm-kpi-value">{value}</strong>
      {sub ? <small>{sub}</small> : null}
    </div>
  );
}

export function Chip({ tone = "ink", children }: { tone?: "ink" | "good" | "bad" | "warn" | "orange" | "mute"; children: React.ReactNode }) {
  return <span className={`dm-chip is-${tone}`}>{children}</span>;
}

/** Runs a fake "agent is working" delay so the loading state is visible and testable. */
export function useBusy() {
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const run = useCallback((fn: () => void, ms = 650) => {
    setBusy(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setBusy(false); fn(); }, ms);
  }, []);
  return { busy, run };
}

export function Spinner({ label }: { label: string }) {
  return <span className="dm-spinner" role="status"><Loader2 aria-hidden="true" size={16} />{label}</span>;
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return <p className="dm-error" role="alert">{children}</p>;
}

export function ApprovedStamp({ children }: { children: React.ReactNode }) {
  return <span className="dm-stamp"><Check aria-hidden="true" size={14} />{children}</span>;
}

const ctaCopy = {
  es: { title: "¿Lo querés con tus datos?", body: "Lo armamos sobre tus planillas, tu WhatsApp y tu sistema de facturación. El agente prepara y vos aprobás, siempre.", brief: "Mandanos un brief", note: "Respondemos por mail, sin secuencias automáticas." },
  en: { title: "Want it running on your data?", body: "We build it on top of your spreadsheets, WhatsApp and billing system. The agent prepares, you approve, always.", brief: "Send us a brief", note: "We reply by email, no automated sequences." },
};

export function DemoCta({ loc, demo, extra }: { loc: Loc; demo: string; extra?: React.ReactNode }) {
  const t = ctaCopy[loc];
  // Standalone demo page: the demo's first vertical is its "home" rubro (see DemoDefinition.verticals).
  const def = demoDefinitions.find((d) => d.id === demo);
  const rubro = def?.verticals[0] ?? "commerce";
  const params = { rubro, demo_slug: def?.slug[loc] ?? demo };
  return (
    <section className="dm-cta" aria-labelledby={`cta-${demo}`}>
      <div>
        <h2 id={`cta-${demo}`} className="dm-h2">{t.title}</h2>
        <p>{t.body}</p>
        <small>{t.note}</small>
      </div>
      <div className="dm-cta-actions">
        <CalButton locale={loc} placement={`demo_${demo}`} params={params} />
        <Link
          to={wantThisHref(contactPath(loc), "demo", demo)}
          className="dm-btn dm-btn-ink"
          data-cta="want-this"
          onClick={() => trackEvent("cta_click", { locale: loc, placement: `demo_${demo}`, destination: "brief", cta: "want_this", ...params })}
        >{wantThisLabel(loc, rubro)}<ArrowRight aria-hidden="true" size={16} /></Link>
        {extra}
      </div>
    </section>
  );
}

export function DemoHeading({ text, mark }: { text: string; mark: string }) {
  const index = text.indexOf(mark);
  if (index < 0) return <>{text}</>;
  return <>{text.slice(0, index)}<span className="dm-mark">{mark}</span>{text.slice(index + mark.length)}</>;
}
