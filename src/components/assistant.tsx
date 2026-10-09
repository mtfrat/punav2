import { useEffect, useRef, useState } from "react";
import type * as React from "react";
import { Form } from "react-router";
import { Bot, Send, X } from "lucide-react";
import { type Locale } from "../content/site";
import { CalButton } from "./marketing";
import { trackEvent } from "./tracking";

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

