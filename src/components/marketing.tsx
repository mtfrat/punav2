import { useEffect, useRef, useState } from "react";
import type * as React from "react";
import { Form, Link, useFetcher, useLocation, useMatches } from "react-router";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  ExternalLink,
  Menu,
  Send,
  X,
} from "lucide-react";
import { CAL_LINK, CONTACT_EMAIL, casesHubPath, contactPath, copy, servicesHubPath, type Locale } from "../content/site";
import { languageSwitchPath, routeAlternatePath } from "../lib/locale-switch";
import { trackEvent } from "./tracking";
export { trackEvent } from "./tracking";

/**
 * Tip A — Cal CTA impressions.
 * `cta_view` fires for every CalButton placement (diagnostic; multi-placement inflates counts).
 * Funnel denominator = `cta_primary_view` only (hero_audit, once). Do NOT use raw cta_view as denom.
 */
function useCtaView(ref: React.RefObject<HTMLElement | null>, locale: Locale, placement: string) {
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    let sent = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !sent) {
        sent = true;
        trackEvent("cta_view", { locale, placement });
        if (placement === "hero_audit") {
          trackEvent("cta_primary_view", { locale, placement: "hero_audit", is_primary: true });
        }
        observer.disconnect();
      }
    }, { threshold: 0.6 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [locale, placement, ref]);
}

export function CalButton({ locale, placement, className = "", compact = false, label, dot = false }: { locale: Locale; placement: string; className?: string; compact?: boolean; label?: string; dot?: boolean }) {
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  useCtaView(ref, locale, placement);

  async function openCal(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (loading) return;
    trackEvent("cta_click", { locale, placement, destination: "cal" });
    setLoading(true);
    try {
      const { getCalApi } = await import("@calcom/embed-react");
      const cal = await getCalApi({ namespace: "puna-audit" });
      cal("on", {
        action: "bookingSuccessfulV2",
        callback: () => trackEvent("cal_booked", { locale, placement }),
      });
      cal("modal", { calLink: CAL_LINK, config: { layout: "month_view" } });
      trackEvent("cal_open", { locale, placement });
    } catch {
      window.location.assign(`https://cal.com/${CAL_LINK}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <a
      ref={ref}
      href={`https://cal.com/${CAL_LINK}`}
      onClick={openCal}
      className={`button-primary ${compact ? "button-compact" : ""} ${className}`}
      aria-label={label || copy[locale].book}
      aria-busy={loading}
    >
      {dot ? <span className="nav-dot" aria-hidden="true" /> : null}
      <span>{loading ? (locale === "en" ? "Opening calendar…" : "Abriendo calendario…") : (label || copy[locale].book)}</span>
      {dot ? null : <ArrowRight aria-hidden="true" size={18} />}
    </a>
  );
}

export function Brand() {
  return (
    <span className="brand">
      <svg className="brand-mark" aria-hidden="true" viewBox="0 0 76 48" focusable="false">
        <path d="M0 48 23 12l18 36H0Z" fill="#BF5226" />
        <path d="M18 48 48 0l28 48H18Z" fill="currentColor" />
        <path d="M51 48 64 25l12 23H51Z" fill="#702B38" />
      </svg>
      <span className="brand-name"><strong>Puna</strong><small>Tech</small></span>
    </span>
  );
}

export function SiteHeader({ locale, chrome = "default" }: { locale: Locale; chrome?: "default" | "editorial" }) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const location = useLocation();
  const editorial = chrome === "editorial";
  const t = copy[locale];
  const home = locale === "en" ? "/" : "/es";
  const servicesAnchor = servicesHubPath(locale);
  const workAnchor = casesHubPath(locale);
  const processAnchor = `${home}#process`;
  const insights = locale === "en" ? "/blog" : "/es/blog";
  // On the home page the brief form is in-page; everywhere else the CTA opens the contact page.
  const briefAnchor = location.pathname === home ? "#brief" : location.pathname === contactPath(locale) ? "#brief-form" : contactPath(locale);
  const matches = useMatches();
  const translatedPath = [...matches].reverse().map((match) => routeAlternatePath(match.data)).find((path): path is string => Boolean(path));
  const languageHref = languageSwitchPath(location.pathname, locale, translatedPath);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!editorial) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const next = window.scrollY > 28;
        setCompact((current) => (current === next ? current : next));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [editorial]);

  const navBar = (
    <>
      <Link to={home} className="brand-link"><Brand /></Link>
      <nav className="desktop-nav" aria-label={locale === "en" ? "Primary navigation" : "Navegación principal"}>
        <Link to={servicesAnchor}>{t.nav.services}</Link>
        <Link to={workAnchor}>{t.nav.work}</Link>
        <Link to={processAnchor}>{t.nav.process}</Link>
        <Link to={insights}>{t.nav.insights}</Link>
      </nav>
      <div className="nav-actions">
        <Link
          className="language-link"
          to={languageHref}
          hrefLang={locale === "en" ? "es" : "en"}
          onClick={() => trackEvent("language_switch", { locale, destination_locale: locale === "en" ? "es" : "en" })}
        >
          {locale === "en" ? "ES" : "EN"}
        </Link>
        <a
          href={briefAnchor}
          className={`button-ghost-ink button-compact desktop-brief${editorial ? " editorial-brief" : ""}`}
          onClick={() => trackEvent("cta_click", { locale, placement: "navigation", destination: "brief" })}
        >{t.sendBrief}</a>
        <CalButton locale={locale} placement="navigation" compact className="desktop-cal" label={t.book} dot={editorial} />
        <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? (locale === "en" ? "Close menu" : "Cerrar menú") : (locale === "en" ? "Open menu" : "Abrir menú")}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
    </>
  );

  return (
    <header className={`site-header${editorial ? " site-header-editorial" : ""}${compact ? " is-compact" : ""}`}>
      {editorial ? (
        <div className="editorial-pill-scale">
          <div className="site-nav editorial-pill">{navBar}</div>
        </div>
      ) : (
        <div className="site-nav shell">{navBar}</div>
      )}
      {open && (
        <nav id="mobile-navigation" className={`mobile-nav${editorial ? " editorial-mobile" : ""}`} aria-label={locale === "en" ? "Mobile navigation" : "Navegación móvil"}>
          <Link to={servicesAnchor}>{t.nav.services}</Link>
          <Link to={workAnchor}>{t.nav.work}</Link>
          <Link to={processAnchor}>{t.nav.process}</Link>
          <Link to={insights}>{t.nav.insights}</Link>
          <a
            href={briefAnchor}
            className="button-ghost-ink"
            onClick={() => trackEvent("cta_click", { locale, placement: "mobile_navigation", destination: "brief" })}
          >{t.sendBrief}</a>
          <CalButton locale={locale} placement="mobile_navigation" label={t.book} dot={editorial} />
        </nav>
      )}
    </header>
  );
}

function FooterWave() {
  return (
    <div className="footer-wave" aria-hidden="true">
      <div className="footer-wave-ridge">
        <svg viewBox="0 0 2880 120" preserveAspectRatio="none">
          <path fill="#C4623A" d="M0 78 L140 46 L280 86 L430 40 L600 82 L760 48 L940 90 L1100 52 L1260 84 L1440 78 L1580 46 L1720 86 L1870 40 L2040 82 L2200 48 L2380 90 L2540 52 L2700 84 L2880 78 L2880 120 L0 120 Z" />
          <path fill="#E4C3AE" d="M0 96 L180 70 L340 104 L520 74 L700 108 L880 78 L1060 110 L1240 82 L1440 96 L1620 70 L1780 104 L1960 74 L2140 108 L2320 78 L2500 110 L2680 82 L2880 96 L2880 120 L0 120 Z" />
        </svg>
      </div>
      <svg className="footer-wave-sheet" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path fill="var(--paper)" d="M0 32C96 34 192 28 288 22C384 16 480 20 576 26C672 32 768 40 864 42C960 44 1056 40 1152 34C1248 28 1344 20 1392 16L1440 12V0H0Z" />
      </svg>
    </div>
  );
}

export function SiteFooter({ locale, chrome = "default" }: { locale: Locale; chrome?: "default" | "editorial" }) {
  const year = new Date().getFullYear();
  const home = locale === "en" ? "/" : "/es";
  const editorial = chrome === "editorial";
  return (
    <footer className={`site-footer${editorial ? " site-footer-editorial" : ""}`}>
      {editorial ? <FooterWave /> : null}
      <div className="shell footer-grid">
        <div><Brand /><p>{copy[locale].footerLine}</p></div>
        <div className="footer-links">
          <Link to={servicesHubPath(locale)}>{copy[locale].nav.services}</Link>
          <Link to={casesHubPath(locale)}>{copy[locale].nav.work}</Link>
          <Link to={locale === "en" ? "/services/custom-software" : "/es/servicios/software-a-medida"}>{locale === "en" ? "Custom software" : "Software a medida"}</Link>
          <Link to={locale === "en" ? "/blog" : "/es/blog"}>Blog</Link>
        </div>
        <div className="footer-links">
          <Link to={contactPath(locale)}>{locale === "en" ? "Contact" : "Contacto"}</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <a href="https://www.linkedin.com/company/puna-tech" target="_blank" rel="noreferrer">LinkedIn <ExternalLink aria-hidden="true" size={14} /></a>
          <Link to={locale === "en" ? "/privacy" : "/es/privacidad"}>{locale === "en" ? "Privacy" : "Privacidad"}</Link>
          <Link to={locale === "en" ? "/terms" : "/es/terminos"}>{locale === "en" ? "Terms" : "Términos"}</Link>
        </div>
      </div>
      <div className="shell footer-bottom"><span>© {year} Puna Tech</span><span>Buenos Aires · US & LATAM delivery</span></div>
    </footer>
  );
}

export function PageShell({ locale, children, includeChat = true, chrome = "default" }: { locale: Locale; children: React.ReactNode; includeChat?: boolean; chrome?: "default" | "editorial" }) {
  return (
    <>
      <a className="skip-link" href="#main-content">{locale === "en" ? "Skip to main content" : "Saltar al contenido principal"}</a>
      <SiteHeader locale={locale} chrome={chrome} />
      {children}
      <SiteFooter locale={locale} chrome={chrome} />
      {includeChat ? <Assistant locale={locale} /> : null}
    </>
  );
}

export function FlowDiagram({ items, label }: { items: string[]; label: string }) {
  return (
    <div className="flow-diagram" role="img" aria-label={label}>
      {items.map((item, index) => (
        <div className="flow-item" key={item}>
          <span className="flow-number">{String(index + 1).padStart(2, "0")}</span>
          <span>{item}</span>
          {index < items.length - 1 ? <ArrowRight className="flow-arrow" aria-hidden="true" /> : null}
        </div>
      ))}
    </div>
  );
}

interface LeadActionData { ok?: boolean; error?: string; fieldErrors?: Record<string, string> }

export function ProjectBrief({ locale, placement = "final_cta" }: { locale: Locale; placement?: string }) {
  const fetcher = useFetcher<LeadActionData>();
  const started = useRef(false);
  const busy = fetcher.state !== "idle";
  const success = fetcher.data?.ok;
  const fieldErrors = fetcher.data?.fieldErrors || {};

  useEffect(() => {
    if (success) {
      trackEvent("project_brief_submit", { locale, placement });
      trackEvent("generate_lead", { locale, placement, method: "project_brief" });
    }
  }, [success, locale, placement]);

  function recordStart() {
    if (!started.current) {
      started.current = true;
      trackEvent("project_brief_start", { locale, placement });
    }
  }

  if (success) {
    return <div className="form-success" role="status"><Check aria-hidden="true" /><div><strong>{locale === "en" ? "Brief received." : "Brief recibido."}</strong><p>{locale === "en" ? "We will review it and reply with the next useful question." : "Lo vamos a revisar y responder con la siguiente pregunta útil."}</p></div></div>;
  }

  return (
    <fetcher.Form method="post" action="/api/lead" className="brief-form" onFocus={recordStart}>
      <input type="hidden" name="locale" value={locale} />
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="field-grid">
        <label><span>{locale === "en" ? "Name" : "Nombre"}</span><input name="name" autoComplete="name" required maxLength={80} aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "brief-name-error" : undefined} />{fieldErrors.name && <small id="brief-name-error" className="field-error">{fieldErrors.name}</small>}</label>
        <label><span>{locale === "en" ? "Work email" : "Email laboral"}</span><input name="email" type="email" inputMode="email" autoComplete="email" required maxLength={160} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? "brief-email-error" : undefined} />{fieldErrors.email && <small id="brief-email-error" className="field-error">{fieldErrors.email}</small>}</label>
      </div>
      <label><span>{locale === "en" ? "Company" : "Empresa"}</span><input name="company" autoComplete="organization" required maxLength={120} aria-invalid={!!fieldErrors.company} aria-describedby={fieldErrors.company ? "brief-company-error" : undefined} />{fieldErrors.company && <small id="brief-company-error" className="field-error">{fieldErrors.company}</small>}</label>
      <label><span>{locale === "en" ? "What is slowing the operation down?" : "¿Qué está frenando la operación?"}</span><textarea name="problem" required minLength={20} maxLength={1600} rows={5} aria-invalid={!!fieldErrors.problem} aria-describedby={fieldErrors.problem ? "brief-problem-error" : undefined} />{fieldErrors.problem && <small id="brief-problem-error" className="field-error">{fieldErrors.problem}</small>}</label>
      <label><span>{locale === "en" ? "Approximate budget" : "Presupuesto aproximado"}</span><select name="budget" required defaultValue="" aria-invalid={!!fieldErrors.budget} aria-describedby={fieldErrors.budget ? "brief-budget-error" : undefined}><option value="" disabled>{locale === "en" ? "Select a range" : "Seleccioná un rango"}</option><option value="usd_3_10">US$3–10k</option><option value="usd_10_25">US$10–25k</option><option value="usd_25_50">US$25–50k</option><option value="usd_50_plus">US$50k+</option><option value="not_sure">{locale === "en" ? "Not sure yet" : "Todavía no lo sé"}</option></select>{fieldErrors.budget && <small id="brief-budget-error" className="field-error">{fieldErrors.budget}</small>}</label>
      <label className="consent-field"><input name="consent" type="checkbox" value="yes" required aria-invalid={!!fieldErrors.consent} aria-describedby={fieldErrors.consent ? "brief-consent-error" : undefined} /><span>{locale === "en" ? "I agree that Puna Tech may use these details to respond to my request." : "Acepto que Puna Tech use estos datos para responder mi solicitud."}</span></label>
      {fieldErrors.consent && <small id="brief-consent-error" className="field-error">{fieldErrors.consent}</small>}
      <Link className="privacy-inline" to={locale === "en" ? "/privacy" : "/es/privacidad"}>{locale === "en" ? "Read the privacy policy" : "Leer la política de privacidad"}</Link>
      {fetcher.data?.error ? <p className="form-error" role="alert">{fetcher.data.error}</p> : null}
      <button className="button-secondary button-submit" type="submit" disabled={busy}>{busy ? (locale === "en" ? "Sending…" : "Enviando…") : copy[locale].nav.brief}<Send aria-hidden="true" size={17} /></button>
    </fetcher.Form>
  );
}

type ChatMessage = { role: "user" | "assistant"; content: string };

export function Assistant({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(false);
  const [consented, setConsented] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const qualified = useRef(false);
  const title = locale === "en" ? "Project assistant" : "Asistente de proyectos";

  useEffect(() => {
    const updateAvailability = () => {
      if (window.scrollY <= Math.min(620, window.innerHeight * 0.8)) return;
      setAvailable(true);
      window.removeEventListener("scroll", updateAvailability);
    };
    updateAvailability();
    window.addEventListener("scroll", updateAvailability, { passive: true });
    return () => window.removeEventListener("scroll", updateAvailability);
  }, []);

  useEffect(() => {
    const userMessages = messages.filter((message) => message.role === "user").length;
    if (userMessages < 2 || qualified.current) return;
    qualified.current = true;
    trackEvent("chat_qualified", { locale, service_interest: "undetermined" });
  }, [locale, messages]);

  function openAssistant() {
    setOpen(true);
    trackEvent("chat_open", { locale });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    const next = [...messages, { role: "user" as const, content: message }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: next.slice(-8) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      setMessages((current) => [...current, { role: "assistant", content: data.message }]);
    } catch {
      setError(locale === "en" ? "The assistant is unavailable. You can still book a call or email us." : "El asistente no está disponible. Podés agendar una llamada o escribirnos.");
    } finally {
      setBusy(false);
    }
  }

  if (!available && !open) return null;

  return (
    <div className="assistant-wrap">
      {open ? (
        <section className="assistant-panel" aria-label={title}>
          <header><div><Bot aria-hidden="true" size={18} /><strong>{title}</strong></div><button type="button" onClick={() => setOpen(false)} aria-label={locale === "en" ? "Close assistant" : "Cerrar asistente"}><X aria-hidden="true" /></button></header>
          {!consented ? (
            <div className="assistant-consent">
              <p>{locale === "en" ? "Messages are sent to an AI provider to generate a reply. Puna Tech does not add this chat to its lead database." : "Los mensajes se envían a un proveedor de IA para generar la respuesta. Puna Tech no incorpora este chat a su base de leads."}</p>
              <label className="consent-field"><input type="checkbox" checked={consentChecked} onChange={(event) => setConsentChecked(event.target.checked)} /><span>{locale === "en" ? "I understand and want to continue." : "Entiendo y quiero continuar."}</span></label>
              <button type="button" className="button-secondary" disabled={!consentChecked} onClick={() => setConsented(true)}>{locale === "en" ? "Start assistant" : "Iniciar asistente"}</button>
            </div>
          ) : (
            <>
              <div className="assistant-messages" aria-live="polite">
                <p className="assistant-message assistant-message-bot">{locale === "en" ? "Tell me which workflow or system is creating friction. I can help frame the problem before a call." : "Contame qué flujo o sistema está generando fricción. Puedo ayudarte a ordenar el problema antes de una llamada."}</p>
                {messages.map((message, index) => <p key={`${message.role}-${index}`} className={`assistant-message ${message.role === "user" ? "assistant-message-user" : "assistant-message-bot"}`}>{message.content}</p>)}
                {busy ? <p className="assistant-status">{locale === "en" ? "Thinking…" : "Analizando…"}</p> : null}
                {error ? <p className="form-error" role="alert">{error}</p> : null}
              </div>
              {messages.filter((message) => message.role === "user").length >= 2 ? <CalButton locale={locale} placement="chat_qualified" compact className="assistant-cal" /> : null}
              <Form onSubmit={submit} className="assistant-form"><label className="sr-only" htmlFor="assistant-message">{locale === "en" ? "Message" : "Mensaje"}</label><textarea id="assistant-message" value={input} onChange={(event) => setInput(event.target.value)} rows={2} maxLength={800} placeholder={locale === "en" ? "Describe the bottleneck…" : "Describí el cuello de botella…"} /><button type="submit" disabled={busy || !input.trim()} aria-label={locale === "en" ? "Send message" : "Enviar mensaje"}><Send aria-hidden="true" /></button></Form>
            </>
          )}
        </section>
      ) : (
        <button className="assistant-trigger" type="button" onClick={openAssistant} aria-label={locale === "en" ? "Open project assistant" : "Abrir asistente de proyectos"}><Bot aria-hidden="true" /><span>{locale === "en" ? "Ask about a project" : "Consultar un proyecto"}</span></button>
      )}
    </div>
  );
}

export function Accordion({ items }: { items: Array<[string, string]> }) {
  return <div className="accordion">{items.map(([question, answer]) => <details key={question}><summary><span>{question}</span><ChevronDown aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>;
}
