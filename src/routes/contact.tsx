import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { CalButton, PageShell, ProjectBrief, trackEvent } from "../components/marketing";
import { CONTACT_EMAIL, CONTACT_WHATSAPP, contactPath, copy, SITE_URL, type Locale } from "../content/site";
import { useCases } from "../content/use-cases";
import { breadcrumbSchema, createMeta } from "../lib/seo";

export async function loader({ request }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const locale: Locale = pathname.startsWith("/es") ? "es" : "en";
  return { locale, alternatePath: contactPath(locale === "en" ? "es" : "en") };
}

const contactCopy = {
  en: {
    title: "Contact | Puna Tech",
    description: "Contact Puna Tech: book a 15-minute call, send a short brief, or email punatechba@gmail.com. Custom software and automation from Buenos Aires.",
    eyebrow: "Contact",
    h1: "Tell us which process is slowing you down.",
    lead: "Pick the route that suits you. A person reads every message and replies with the next useful question, not an automated sales sequence.",
    callTitle: "15-minute call",
    callBody: "We map the bottleneck and tell you whether it is worth automating, and what to do first.",
    emailTitle: "Email",
    emailBody: "Prefer your own email client? Write to us directly.",
    whatsappTitle: "WhatsApp",
    briefEyebrow: "Written route",
    briefTitle: "Send a short brief",
    briefBody: "Five fields. We reply by email.",
    location: "Puna Tech · Buenos Aires, Argentina · US & LATAM delivery",
  },
  es: {
    title: "Contacto | Puna Tech",
    description: "Contactá a Puna Tech: agendá una llamada de 15 minutos, mandá un brief corto o escribinos a punatechba@gmail.com. Software a medida en Buenos Aires.",
    eyebrow: "Contacto",
    h1: "Contanos qué proceso te está frenando.",
    lead: "Elegí la vía que te quede más cómoda. Cada mensaje lo lee una persona y te respondemos con la siguiente pregunta útil, no con una secuencia automática de ventas.",
    callTitle: "Llamada de 15 minutos",
    callBody: "Mapeamos el cuello de botella y te decimos si conviene automatizarlo y por dónde empezar.",
    emailTitle: "Email",
    emailBody: "¿Preferís tu propio mail? Escribinos directo.",
    whatsappTitle: "WhatsApp",
    briefEyebrow: "Por escrito",
    briefTitle: "Mandá un brief corto",
    briefBody: "Cinco campos. Te respondemos por mail.",
    location: "Puna Tech · Buenos Aires, Argentina · Entregas en Argentina, LATAM y EE.UU.",
  },
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const locale = data?.locale || "en";
  const c = contactCopy[locale];
  const path = contactPath(locale);
  return createMeta({
    locale,
    title: c.title,
    description: c.description,
    path,
    alternatePath: contactPath(locale === "en" ? "es" : "en"),
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: c.title,
        url: `${SITE_URL}${path}`,
        inLanguage: locale === "en" ? "en" : "es-AR",
        about: { "@id": `${SITE_URL}/#organization` },
      },
      breadcrumbSchema([
        { name: "Puna Tech", path: locale === "en" ? "/" : "/es" },
        { name: c.eyebrow, path },
      ]),
    ],
  });
};

export default function ContactPage({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale } = loaderData;
  const c = contactCopy[locale];
  const t = copy[locale];
  return (
    <PageShell locale={locale}>
      <main id="main-content">
        <section className="detail-hero contact-hero dark-section">
          <div className="shell">
            <p className="eyebrow eyebrow-dark">{c.eyebrow}</p>
            <h1>{c.h1}</h1>
            <p className="hero-lead">{c.lead}</p>
          </div>
        </section>

        <section className="section final-section" id="brief">
          <div className="shell final-grid">
            <div className="final-copy contact-routes">
              <div className="contact-route">
                <p className="eyebrow eyebrow-dark">01</p>
                <h2>{c.callTitle}</h2>
                <p>{c.callBody}</p>
                <div className="cta-group">
                  <CalButton locale={locale} placement="contact_page" label={t.book} className="button-primary-terracotta" />
                </div>
              </div>
              <div className="contact-route">
                <p className="eyebrow eyebrow-dark">02</p>
                <h2>{c.emailTitle}</h2>
                <p>{c.emailBody}</p>
                <a
                  className="button-ghost-burgundy button-ghost-burgundy-light"
                  href={`mailto:${CONTACT_EMAIL}`}
                  onClick={() => trackEvent("cta_click", { locale, placement: "contact_page", destination: "email" })}
                >
                  <Mail aria-hidden="true" size={16} />
                  <span>{CONTACT_EMAIL}</span>
                </a>
              </div>
              {/* WhatsApp / phone: shown only when CONTACT_WHATSAPP is set in src/content/site.ts. */}
              {CONTACT_WHATSAPP ? (
                <div className="contact-route">
                  <p className="eyebrow eyebrow-dark">03</p>
                  <h2>{c.whatsappTitle}</h2>
                  <a
                    className="button-ghost-burgundy button-ghost-burgundy-light"
                    href={`https://wa.me/${CONTACT_WHATSAPP}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent("cta_click", { locale, placement: "contact_page", destination: "whatsapp" })}
                  >
                    <MessageCircle aria-hidden="true" size={16} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              ) : null}
              <p className="contact-location">{c.location}</p>
            </div>

            <div className="brief-card" id="brief-form">
              <p className="eyebrow">{c.briefEyebrow}</p>
              <h2 className="brief-card-title">{c.briefTitle}</h2>
              <p>{c.briefBody}</p>
              <ProjectBrief locale={locale} placement="contact_page" />
            </div>
          </div>
        </section>

        {locale === "es" ? (
          <section className="related-guides" aria-labelledby="contact-use-cases-heading">
            <div className="shell">
              <h2 id="contact-use-cases-heading">Problemas que resolvemos seguido</h2>
              <ol className="related-guide-list">
                {useCases.map((item, index) => (
                  <li key={item.path}>
                    <Link to={item.path}>
                      <span className="related-guide-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <span className="related-guide-title">{item.cardTitle}</span>
                      <ArrowRight aria-hidden="true" size={18} />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}
      </main>
    </PageShell>
  );
}
