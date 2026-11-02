import { useEffect, useId, useRef, useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import { Link, useFetcher, useLocation } from "react-router";
import { CalendarDays, Check, Mail, Send } from "lucide-react";
import { CAL_LINK, CONTACT_EMAIL, type Locale } from "../content/chrome";
import { trackEvent } from "./tracking";

/**
 * Two ways to take the next step, side by side:
 *  1. an inline Cal.com calendar, loaded only when the visitor asks for it (or, with `eager`, when it nears the viewport),
 *     so the embed never touches first paint or LCP;
 *  2. an email-only box with one optional line, saved through /api/lead-rapido.
 */

const copyByLocale = {
  es: {
    calEyebrow: "Opción 1 · 15 minutos",
    calTitle: "Elegí un horario",
    calBody: "Una videollamada corta para ver si tu proceso se puede automatizar. Sin compromiso.",
    calButton: "Ver horarios disponibles",
    calLoading: "Cargando el calendario…",
    calFrameTitle: "Calendario para agendar una llamada de 15 minutos con Puna Tech",
    calFallback: "Abrir el calendario en otra pestaña",
    calFailed: "No pudimos cargar el calendario acá.",
    quickEyebrow: "Opción 2 · Sin agenda",
    quickTitle: "Dejanos tu mail",
    quickBody: "Te escribimos nosotros, sin llamada. Una persona lo lee y te responde con la siguiente pregunta útil.",
    emailLabel: "Tu email",
    noteLabel: "Qué querés automatizar (opcional)",
    notePlaceholder: "Una línea alcanza",
    submit: "Que me escriban",
    sending: "Enviando…",
    successTitle: "Listo, recibimos tu mail.",
    successBody: "Lo leemos y te respondemos por mail.",
    errorFallback: "No pudimos enviarlo. Probá de nuevo o escribinos a",
    privacyLead: "Usamos tu mail solo para responderte.",
    privacyLink: "Política de privacidad",
    privacyHref: "/es/privacidad",
  },
  en: {
    calEyebrow: "Option 1 · 15 minutes",
    calTitle: "Pick a time",
    calBody: "A short video call to see whether your process can be automated. No strings attached.",
    calButton: "See available times",
    calLoading: "Loading the calendar…",
    calFrameTitle: "Calendar to book a 15-minute call with Puna Tech",
    calFallback: "Open the calendar in a new tab",
    calFailed: "We could not load the calendar here.",
    quickEyebrow: "Option 2 · No scheduling",
    quickTitle: "Leave us your email",
    quickBody: "We write to you, no call needed. A person reads it and replies with the next useful question.",
    emailLabel: "Your email",
    noteLabel: "What do you want to automate? (optional)",
    notePlaceholder: "One line is enough",
    submit: "Have us write to me",
    sending: "Sending…",
    successTitle: "Done, we got your email.",
    successBody: "We will read it and reply by email.",
    errorFallback: "We could not send it. Try again or write to",
    privacyLead: "We only use your email to reply to you.",
    privacyLink: "Privacy policy",
    privacyHref: "/privacy",
  },
} as const;

type CalComponent = ComponentType<{ namespace?: string; calLink: string; style?: CSSProperties; config?: Record<string, string> }>;

export function CalInline({ locale, placement, eager = false }: { locale: Locale; placement: string; eager?: boolean }) {
  const t = copyByLocale[locale];
  const anchorRef = useRef<HTMLDivElement>(null);
  const [requested, setRequested] = useState(false);
  const [Cal, setCal] = useState<CalComponent | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const viewed = useRef(false);
  // Read through a ref so a placement that changes after hydration (contact page ?bloque=) never restarts the embed.
  const track = useRef({ locale, placement });
  track.current = { locale, placement };

  // Eager mode (contact page): start loading when the block is about to scroll into view AND the page has
  // finished loading and gone idle, so the embed never competes with first paint / LCP.
  useEffect(() => {
    if (!eager || requested || !anchorRef.current || typeof IntersectionObserver === "undefined") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      timer = setTimeout(() => { if (!cancelled) setRequested(true); }, 1200);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (document.readyState === "complete") start();
      else window.addEventListener("load", start, { once: true });
    }, { rootMargin: "200px 0px" });
    observer.observe(anchorRef.current);
    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("load", start);
      if (timer) clearTimeout(timer);
    };
  }, [eager, requested]);

  // Impression of the block itself (not the embed), for the funnel.
  useEffect(() => {
    if (!anchorRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !viewed.current) {
        viewed.current = true;
        trackEvent("cal_inline_view", { locale, placement });
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(anchorRef.current);
    return () => observer.disconnect();
  }, [locale, placement]);

  useEffect(() => {
    if (!requested) return;
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("@calcom/embed-react");
        const api = await mod.getCalApi({ namespace: "puna-inline" });
        api("on", { action: "linkReady", callback: () => !cancelled && setReady(true) });
        api("on", { action: "bookingSuccessfulV2", callback: () => trackEvent("cal_booked", { ...track.current, mode: "inline" }) });
        if (cancelled) return;
        setCal(() => mod.default as unknown as CalComponent);
        trackEvent("cal_open", { ...track.current, mode: "inline" });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    // If the iframe never reports ready, stop showing the spinner and keep the new-tab link.
    const timer = window.setTimeout(() => !cancelled && setReady(true), 10_000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [requested]);

  function request() {
    trackEvent("cta_click", { locale, placement, destination: "cal_inline" });
    setRequested(true);
  }

  const fallback = (
    <a className="booking-newtab" href={`https://cal.com/${CAL_LINK}`} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("cta_click", { locale, placement, destination: "cal_newtab" })}>
      {t.calFallback}
    </a>
  );

  return (
    <div ref={anchorRef} className="booking-cal">
      {!requested ? (
        <button type="button" className="button-primary button-primary-terracotta booking-cal-button" onClick={request}>
          <CalendarDays aria-hidden="true" size={18} />
          <span>{t.calButton}</span>
        </button>
      ) : failed ? (
        <p className="booking-cal-failed" role="status">{t.calFailed}</p>
      ) : (
        <div className="booking-cal-frame" role="group" aria-label={t.calFrameTitle} aria-busy={!ready}>
          {!ready ? <p className="booking-cal-loading" role="status">{t.calLoading}</p> : null}
          {Cal ? <Cal namespace="puna-inline" calLink={CAL_LINK} style={{ width: "100%", height: "100%", overflow: "auto" }} config={{ layout: "month_view" }} /> : null}
        </div>
      )}
      {fallback}
    </div>
  );
}

type QuickLeadResponse = { ok: boolean; error?: string; fieldErrors?: Record<string, string> };

export function QuickLeadForm({ locale, placement }: { locale: Locale; placement: string }) {
  const t = copyByLocale[locale];
  const fetcher = useFetcher<QuickLeadResponse>();
  const location = useLocation();
  const id = useId();
  const started = useRef(false);
  const reported = useRef<unknown>(null);
  const [startedAt, setStartedAt] = useState("");
  useEffect(() => { setStartedAt(String(Date.now())); }, []);
  const busy = fetcher.state !== "idle";
  const success = fetcher.data?.ok === true;
  const fieldErrors = fetcher.data?.fieldErrors || {};
  const failureMessage = fetcher.data && !fetcher.data.ok && !Object.keys(fieldErrors).length ? fetcher.data.error : undefined;

  useEffect(() => {
    if (!fetcher.data || reported.current === fetcher.data) return;
    reported.current = fetcher.data;
    if (fetcher.data.ok) {
      trackEvent("quick_lead_submit", { locale, placement });
      trackEvent("generate_lead", { locale, placement, method: "quick_lead" });
    } else {
      trackEvent("quick_lead_error", { locale, placement, reason: Object.keys(fieldErrors).length ? "validation" : "server" });
    }
  }, [fetcher.data, fieldErrors, locale, placement]);

  function recordStart() {
    if (started.current) return;
    started.current = true;
    trackEvent("quick_lead_start", { locale, placement });
  }

  if (success) {
    return (
      <div className="form-success" role="status">
        <Check aria-hidden="true" />
        <div><strong>{t.successTitle}</strong><p>{t.successBody}</p></div>
      </div>
    );
  }

  return (
    <fetcher.Form method="post" action="/api/lead-rapido" className="brief-form quick-lead-form" onFocus={recordStart}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="page" value={location.pathname} />
      <input type="hidden" name="placement" value={placement} />
      <input type="hidden" name="started_at" value={startedAt} />
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label>
        <span>{t.emailLabel}</span>
        <input name="email" type="email" inputMode="email" autoComplete="email" required maxLength={160} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? `${id}-email-error` : undefined} />
        {fieldErrors.email ? <small id={`${id}-email-error`} className="field-error">{fieldErrors.email}</small> : null}
      </label>
      <label>
        <span>{t.noteLabel}</span>
        <input name="note" type="text" maxLength={280} placeholder={t.notePlaceholder} aria-invalid={!!fieldErrors.note} aria-describedby={fieldErrors.note ? `${id}-note-error` : undefined} />
        {fieldErrors.note ? <small id={`${id}-note-error`} className="field-error">{fieldErrors.note}</small> : null}
      </label>
      {failureMessage ? (
        <p className="form-error" role="alert">
          {failureMessage} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      ) : null}
      {/* Disabled until hydration: without JS the timestamp is missing and the server would silently drop the lead. */}
      <button className="button-secondary button-submit" type="submit" disabled={busy || !startedAt}>
        {busy ? t.sending : t.submit}
        <Send aria-hidden="true" size={17} />
      </button>
      <p className="quick-lead-privacy">{t.privacyLead} <Link to={t.privacyHref}>{t.privacyLink}</Link></p>
    </fetcher.Form>
  );
}

export function BookingChoice({ locale, placement, eager = false }: { locale: Locale; placement: string; eager?: boolean }) {
  const t = copyByLocale[locale];
  return (
    <div className="booking-choice">
      <div className="booking-card booking-card-cal">
        <p className="eyebrow"><CalendarDays aria-hidden="true" size={14} /> {t.calEyebrow}</p>
        <h3>{t.calTitle}</h3>
        <p>{t.calBody}</p>
        <CalInline locale={locale} placement={placement} eager={eager} />
      </div>
      <div className="booking-card booking-card-quick">
        <p className="eyebrow"><Mail aria-hidden="true" size={14} /> {t.quickEyebrow}</p>
        <h3>{t.quickTitle}</h3>
        <p>{t.quickBody}</p>
        <QuickLeadForm locale={locale} placement={placement} />
      </div>
    </div>
  );
}
