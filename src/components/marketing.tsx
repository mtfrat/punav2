import { useEffect, useRef, useState } from "react";
import type * as React from "react";
import { Form, Link, useFetcher, useLocation } from "react-router";
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
import { CAL_LINK, CONTACT_EMAIL, copy, type Locale } from "../content/site";
import { trackEvent } from "./tracking";
export { trackEvent } from "./tracking";

function useCtaView(ref: React.RefObject<HTMLElement | null>, locale: Locale, placement: string) {
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    let sent = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !sent) {
        sent = true;
        trackEvent("cta_view", { locale, placement });
        observer.disconnect();
      }
    }, { threshold: 0.6 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [locale, placement, ref]);
}

export function CalButton({ locale, placement, className = "", compact = false, label }: { locale: Locale; placement: string; className?: string; compact?: boolean; label?: string }) {
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
      <span>{loading ? (locale === "en" ? "Opening calendar…" : "Abriendo calendario…") : (label || copy[locale].book)}</span>
      <ArrowRight aria-hidden="true" size={18} />
    </a>
  );
}

const localeRoutePairs: Record<string, string> = {
  "/": "/es",
  "/es": "/",
  "/services/ai-automation": "/es/servicios/automatizacion-ia",
  "/services/custom-software": "/es/servicios/software-a-medida",
  "/services/data-integrations": "/es/servicios/integraciones-de-datos",
  "/es/servicios/automatizacion-ia": "/services/ai-automation",
  "/es/servicios/software-a-medida": "/services/custom-software",
  "/es/servicios/integraciones-de-datos": "/services/data-integrations",
  "/industries/automotive-dealers": "/es/industrias/concesionarias",
  "/industries/agricultural-equipment-dealers": "/es/industrias/maquinaria-agricola",
  "/es/industrias/concesionarias": "/industries/automotive-dealers",
  "/es/industrias/maquinaria-agricola": "/industries/agricultural-equipment-dealers",
  "/case-studies/edtech-web3-platform": "/es/casos/plataforma-edtech-web3",
  "/case-studies/b2b-gtm-automation": "/es/casos/automatizacion-gtm-b2b",
  "/case-studies/autopost-content-infrastructure": "/es/casos/autopost-infraestructura-contenido",
  "/es/casos/plataforma-edtech-web3": "/case-studies/edtech-web3-platform",
  "/es/casos/automatizacion-gtm-b2b": "/case-studies/b2b-gtm-automation",
  "/es/casos/autopost-infraestructura-contenido": "/case-studies/autopost-content-infrastructure",
  "/blog": "/es/blog",
  "/es/blog": "/blog",
  "/privacy": "/es/privacidad",
  "/es/privacidad": "/privacy",
  "/terms": "/es/terminos",
  "/es/terminos": "/terms",
};

function alternatePath(pathname: string, locale: Locale) {
  if (localeRoutePairs[pathname]) return localeRoutePairs[pathname];
  if (pathname.startsWith("/es/blog/")) return pathname.replace("/es/blog/", "/blog/");
  if (pathname.startsWith("/blog/")) return pathname.replace("/blog/", "/es/blog/");
  return locale === "en" ? "/es" : "/";
}

export function Brand() {
  return (
    <span className="brand">
      <svg className="brand-mark" aria-hidden="true" viewBox="0 0 76 48" focusable="false">
        <path d="M0 48 23 12l18 36H0Z" fill="#ff6b00" />
        <path d="M18 48 48 0l28 48H18Z" fill="currentColor" />
        <path d="M51 48 64 25l12 23H51Z" fill="#7d2935" />
      </svg>
      <span className="brand-name"><strong>Puna</strong><small>Tech</small></span>
    </span>
  );
}

export function SiteHeader({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const t = copy[locale];
  const home = locale === "en" ? "/" : "/es";
  const servicesAnchor = `${home}#services`;
  const workAnchor = `${home}#work`;
  const processAnchor = `${home}#process`;
  const insights = locale === "en" ? "/blog" : "/es/blog";
  const languageHref = alternatePath(location.pathname, locale);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="site-header">
      <div className="site-nav shell">
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
          <CalButton locale={locale} placement="navigation" compact className="desktop-cal" label={locale === "en" ? "Book audit" : "Auditoría gratis"} />
          <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? (locale === "en" ? "Close menu" : "Cerrar menú") : (locale === "en" ? "Open menu" : "Abrir menú")}>
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label={locale === "en" ? "Mobile navigation" : "Navegación móvil"}>
          <Link to={servicesAnchor}>{t.nav.services}</Link>
          <Link to={workAnchor}>{t.nav.work}</Link>
          <Link to={processAnchor}>{t.nav.process}</Link>
          <Link to={insights}>{t.nav.insights}</Link>
          <CalButton locale={locale} placement="mobile_navigation" label={locale === "en" ? "Get the free audit" : "Pedir auditoría gratis"} />
        </nav>
      )}
    </header>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();
  const home = locale === "en" ? "/" : "/es";
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div><Brand /><p>{copy[locale].footerLine}</p></div>
        <div className="footer-links">
          <Link to={`${home}#services`}>{copy[locale].nav.services}</Link>
          <Link to={`${home}#work`}>{copy[locale].nav.work}</Link>
          <Link to={locale === "en" ? "/industries/automotive-dealers" : "/es/industrias/concesionarias"}>{locale === "en" ? "Automotive dealers" : "Concesionarias"}</Link>
          <Link to={locale === "en" ? "/industries/agricultural-equipment-dealers" : "/es/industrias/maquinaria-agricola"}>{locale === "en" ? "Agricultural equipment" : "Maquinaria agrícola"}</Link>
          <Link to={locale === "en" ? "/blog" : "/es/blog"}>{copy[locale].nav.insights}</Link>
        </div>
        <div className="footer-links">
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

export function PageShell({ locale, children, includeChat = true }: { locale: Locale; children: React.ReactNode; includeChat?: boolean }) {
  return (
    <>
      <a className="skip-link" href="#main-content">{locale === "en" ? "Skip to main content" : "Saltar al contenido principal"}</a>
      <SiteHeader locale={locale} />
      {children}
      <SiteFooter locale={locale} />
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

export function ProjectBrief({ locale }: { locale: Locale }) {
  const fetcher = useFetcher<LeadActionData>();
  const started = useRef(false);
  const busy = fetcher.state !== "idle";
  const success = fetcher.data?.ok;

  useEffect(() => {
    if (success) trackEvent("project_brief_submit", { locale, placement: "final_cta" });
  }, [success, locale]);

  function recordStart() {
    if (!started.current) {
      started.current = true;
      trackEvent("project_brief_start", { locale, placement: "final_cta" });
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
        <label><span>{locale === "en" ? "Name" : "Nombre"}</span><input name="name" autoComplete="name" required maxLength={80} /></label>
        <label><span>{locale === "en" ? "Work email" : "Email laboral"}</span><input name="email" type="email" inputMode="email" autoComplete="email" required maxLength={160} /></label>
      </div>
      <label><span>{locale === "en" ? "Company" : "Empresa"}</span><input name="company" autoComplete="organization" required maxLength={120} /></label>
      <label><span>{locale === "en" ? "What is slowing the operation down?" : "¿Qué está frenando la operación?"}</span><textarea name="problem" required minLength={20} maxLength={1600} rows={5} /></label>
      <label><span>{locale === "en" ? "Approximate budget" : "Presupuesto aproximado"}</span><select name="budget" required defaultValue=""><option value="" disabled>{locale === "en" ? "Select a range" : "Seleccioná un rango"}</option><option value="usd_3_10">US$3–10k</option><option value="usd_10_25">US$10–25k</option><option value="usd_25_50">US$25–50k</option><option value="usd_50_plus">US$50k+</option><option value="not_sure">{locale === "en" ? "Not sure yet" : "Todavía no lo sé"}</option></select></label>
      <label className="consent-field"><input name="consent" type="checkbox" value="yes" required /><span>{locale === "en" ? "I agree that Puna Tech may use these details to respond to my request." : "Acepto que Puna Tech use estos datos para responder mi solicitud."}</span></label>
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
