import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { PageShell } from "../components/marketing";
import type { Locale } from "../content/site";
import { createMeta } from "../lib/seo";

export async function loader({ request }: LoaderFunctionArgs) {
  const pathname = new URL(request.url).pathname;
  const locale: Locale = pathname.startsWith("/es/") ? "es" : "en";
  const kind: "privacy" | "terms" = pathname.endsWith("terms") || pathname.endsWith("terminos") ? "terms" : "privacy";
  return { locale, kind, path: pathname };
}

function legalDescription(kind: "privacy" | "terms", locale: Locale) {
  if (kind === "terms") {
    return locale === "en"
      ? "Terms of use for the Puna Tech website. Pages are general information, not a binding proposal, and a discovery call or brief is not a signed agreement."
      : "Términos de uso del sitio de Puna Tech. El contenido es información general, no una propuesta vinculante, y una llamada o un brief no son un acuerdo firmado.";
  }
  return locale === "en"
    ? "How Puna Tech handles website and inquiry data."
    : "Cómo Puna Tech gestiona los datos del sitio y las consultas.";
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const title = data.kind === "privacy"
    ? (data.locale === "en" ? "Privacy Policy | Puna Tech" : "Política de Privacidad | Puna Tech")
    : (data.locale === "en" ? "Terms of Use | Puna Tech" : "Términos de Uso | Puna Tech");
  const alternatePath = data.kind === "privacy"
    ? (data.locale === "en" ? "/es/privacidad" : "/privacy")
    : (data.locale === "en" ? "/es/terminos" : "/terms");
  return createMeta({ locale: data.locale, title, description: legalDescription(data.kind, data.locale), path: data.path, alternatePath });
};

export default function LegalPage({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { locale, kind } = loaderData;
  const privacy = kind === "privacy";
  return <PageShell locale={locale} includeChat={false}><main id="main-content" className="legal-page"><div className="shell legal-copy"><p className="eyebrow">{privacy ? (locale === "en" ? "Last updated October 7, 2026" : "Última actualización: 7 de octubre de 2026") : (locale === "en" ? "Last updated August 25, 2026" : "Última actualización: 25 de agosto de 2026")}</p><h1>{privacy ? (locale === "en" ? "Privacy Policy" : "Política de Privacidad") : (locale === "en" ? "Terms of Use" : "Términos de Uso")}</h1>{privacy ? <Privacy locale={locale} /> : <Terms locale={locale} />}</div></main></PageShell>;
}

function Privacy({ locale }: { locale: Locale }) {
  return locale === "en" ? <><h2>Information we collect</h2><p>We collect information you intentionally submit in a project brief, including your name, work email, company, and project description. Analytics tools may collect device, referral, and interaction information when permitted by your browser and applicable settings.</p><h2>How we use it</h2><p>We use inquiry data only to evaluate and respond to your request. We use aggregated analytics to understand site reliability and improve content and navigation.</p><h2>AI assistant</h2><p>Messages entered in the project assistant are sent to an AI service to produce a reply. They are not added to Puna Tech’s lead database through the assistant.</p><h2>Sharing and retention</h2><p>We use service providers for hosting, analytics, scheduling, databases, and AI processing. We do not sell personal information. Inquiry records are retained only as long as reasonably necessary for communication, security, and business records.</p><h2>Cookies</h2><p>Public pages do not use a login or session cookie. The private operations area uses an essential session cookie so an administrator stays signed in.</p><p>Google Analytics sets cookies on public pages to measure visits, referrals, and page use. Microsoft Clarity may set a cookie to understand aggregated interaction on those same pages. These analytics scripts are not loaded in the operations area. You can block or delete cookies in your browser, and the site remains available if you do.</p><h2>Your choices</h2><p>You may request access, correction, or deletion by emailing punatechba@gmail.com. This page is operational guidance and should be reviewed by qualified counsel for the jurisdictions in which Puna Tech operates.</p></> : <><h2>Información que recopilamos</h2><p>Recopilamos los datos que enviás intencionalmente mediante un brief, como nombre, email laboral, empresa y descripción del proyecto. Las herramientas de analítica pueden recopilar información del dispositivo, referencia e interacción cuando lo permiten el navegador y la configuración aplicable.</p><h2>Cómo la usamos</h2><p>Usamos los datos de consultas únicamente para evaluar y responder la solicitud. Usamos analítica agregada para comprender la confiabilidad del sitio y mejorar contenidos y navegación.</p><h2>Asistente de IA</h2><p>Los mensajes ingresados en el asistente se envían a un servicio de IA para generar una respuesta. El asistente no los incorpora a la base de leads de Puna Tech.</p><h2>Proveedores y conservación</h2><p>Usamos proveedores para hosting, analítica, agenda, base de datos y procesamiento de IA. No vendemos información personal. Conservamos las consultas solo durante el tiempo razonablemente necesario para comunicación, seguridad y registros comerciales.</p><h2>Cookies</h2><p>Las páginas públicas no usan una cookie de sesión ni de inicio de sesión. El área privada de operaciones usa una cookie de sesión esencial para que el administrador permanezca autenticado.</p><p>Google Analytics instala cookies en las páginas públicas para medir visitas, referencias y el uso de cada página. Microsoft Clarity puede instalar una cookie para entender la interacción agregada en esas mismas páginas. Esos scripts de analítica no se cargan en el área de operaciones. Podés bloquear o borrar cookies en el navegador; el sitio sigue disponible si lo hacés.</p><h2>Tus opciones</h2><p>Podés solicitar acceso, corrección o eliminación escribiendo a punatechba@gmail.com. Esta página describe prácticas operativas y debe ser revisada por asesoramiento legal calificado para las jurisdicciones donde opera Puna Tech.</p></>;
}

function Terms({ locale }: { locale: Locale }) {
  return locale === "en" ? <><h2>Website use</h2><p>This website provides general information about Puna Tech’s services and experience. Content does not constitute a binding proposal, warranty, or professional advice.</p><h2>Project discussions</h2><p>A discovery call or project brief does not create a client relationship. Scope, responsibilities, fees, confidentiality, and deliverables are established only in a signed agreement.</p><h2>Content and availability</h2><p>We aim to keep information accurate and the website available, but we do not guarantee uninterrupted access. Third-party names and product marks belong to their respective owners.</p><h2>Contact</h2><p>Questions may be sent to punatechba@gmail.com.</p></> : <><h2>Uso del sitio</h2><p>Este sitio brinda información general sobre los servicios y la experiencia de Puna Tech. El contenido no constituye una propuesta vinculante, garantía ni asesoramiento profesional.</p><h2>Conversaciones de proyecto</h2><p>Una llamada de descubrimiento o un brief no crean una relación contractual. Alcance, responsabilidades, honorarios, confidencialidad y entregables se establecen únicamente mediante un acuerdo firmado.</p><h2>Contenido y disponibilidad</h2><p>Buscamos mantener la información correcta y el sitio disponible, pero no garantizamos acceso ininterrumpido. Los nombres y marcas de terceros pertenecen a sus respectivos propietarios.</p><h2>Contacto</h2><p>Las consultas pueden enviarse a punatechba@gmail.com.</p></>;
}
