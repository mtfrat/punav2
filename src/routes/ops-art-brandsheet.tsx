import { Link, redirect, type LoaderFunctionArgs } from "react-router";
import { ArrowLeft, ArrowUpRight, Download, Printer } from "lucide-react";
import { Brand } from "../components/marketing";
import { requireAdmin, operationsHeaders, opsData } from "../lib/admin.server";
import { artStudioEnabled } from "../lib/content-worker.server";
import { EDITORIAL_PHOTO } from "../lib/art-editorial-canvas";
import "@fontsource-variable/newsreader/wght-italic.css";
import "../brandsheet.css";
import { ArtCompositionStudio } from "../components/art-composition-studio";

export async function loader({ request }: LoaderFunctionArgs) {
  const context = await requireAdmin(request);
  if (!artStudioEnabled()) throw redirect("/ops/social", { headers: operationsHeaders(context.headers) });
  return opsData({}, context.headers);
}

const palette = [
  { name: "Terracota", hex: "#BF5226", role: "Energía · titulares y superficies protagonistas", className: "terracotta" },
  { name: "Crema", hex: "#F7EFE2", role: "Aire · papel, fondos y lectura", className: "cream" },
  { name: "Borgoña editorial", hex: "#702B38", role: "Profundidad · remates y contraste", className: "wine" },
  { name: "Tinta", hex: "#181410", role: "Claridad · textos y datos", className: "ink" },
];
const tokens = { name: "Puna / Editorial cálida", version: "1.0", scope: "Comunicación editorial; no sustituye los colores del logo ni los tokens de la web.", colors: Object.fromEntries(palette.map(p => [p.className, p.hex])), logo: { orange: "#FF6B00", burgundy: "#7D2935", preserveGeometry: true }, typography: { primary: "Plus Jakarta Sans", accent: "Newsreader Italic", headingWeight: 800, bodyWeight: 400 }, spacing: [4, 8, 16, 24, 32, 48, 64], social: { width: 1080, height: 1350, safeMargin: 64 } };


export default function Brandsheet() {
  return <div className="bs-page">
    <div className="bs-toolbar"><Link className="ops-back" to="/ops/art"><ArrowLeft size={16}/>Art Studio</Link><div><a className="ops-button ops-button-secondary" download="puna-brand-tokens.json" href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(tokens, null, 2))}`}><Download size={16}/>Tokens</a><button className="ops-button" onClick={() => window.print()}><Printer size={16}/>Imprimir / PDF</button></div></div>
    <nav className="bs-index" aria-label="Secciones de la brandsheet"><a href="#esencia">Esencia</a><a href="#identidad">Identidad</a><a href="#color">Color</a><a href="#tipografia">Tipografía</a><a href="#lenguaje">Lenguaje</a><a href="#aplicaciones">Aplicaciones</a></nav>
    <article className="bs-sheet" aria-label="Brandsheet de Puna Tech">
      <section className="bs-cover" id="esencia">
        <header className="bs-masthead"><Brand/><span>BRAND EXPRESSION<br/>VOL. 01 / 2026</span></header>
        <div className="bs-cover-layout"><div className="bs-cover-copy"><h1>Tecnología<br/>con criterio.<br/><em>Tiempo para<br/>lo importante.</em></h1><p className="bs-intro">Sistemas que ordenan el trabajo.<br/>Personas que vuelven a tener espacio.</p></div><figure className="bs-cover-photo"><img src={EDITORIAL_PHOTO} width="1600" height="2400" alt="Luz natural sobre un cuaderno, una computadora y una taza: una escena cotidiana de trabajo."/><figcaption>Lo repetitivo,<br/><em>al sistema.</em></figcaption><span className="bs-photo-index">PUNA / EL LADO HUMANO DE LA TECNOLOGÍA</span></figure></div>
        <footer className="bs-cover-foot"><span>Clara por naturaleza. Expresiva con intención.</span><ArrowUpRight aria-hidden="true" size={32}/></footer>
      </section>

      <section className="bs-section" id="identidad">
        <div className="bs-section-title"><h2>Una firma.<br/><em>Mucho carácter.</em></h2><p>Conservamos la marca de Puna. La evolución está en cómo compone, habla y se muestra; no en redibujar su símbolo.</p></div>
        <div className="bs-logo-pair"><div className="bs-logo-panel"><div className="bs-clearspace"><Brand/></div><span>01 / Sobre fondo claro</span></div><div className="bs-logo-panel bs-logo-dark"><div className="bs-clearspace"><Brand/></div><span>02 / Sobre fondo oscuro</span></div></div>
        <div className="bs-rules"><p><strong>Dejar respirar.</strong> Área libre mínima propuesta: la altura de la “P” alrededor de la firma.</p><p><strong>No intervenir.</strong> Sin estirar, rotar, agregar sombras ni sustituir las proporciones del símbolo.</p><p><strong>Separar los sistemas.</strong> El naranja #FF6B00 y el borgoña #7D2935 del logo se conservan. La paleta editorial acompaña.</p></div>
      </section>

      <section className="bs-section bs-color-section" id="color">
        <div className="bs-section-title"><h2>Tierra, papel<br/><em>y un poco de fuego.</em></h2><p>Cuatro colores, cada uno con un trabajo. La identidad se reconoce por sus relaciones, no por poner todo en todas partes.</p></div>
        <div className="bs-palette">{palette.map(p => <div key={p.hex} className={`bs-swatch bs-${p.className}`}><span>Aa</span><div><h3>{p.name}</h3><code>{p.hex}</code><p>{p.role}</p></div></div>)}</div>
        <div className="bs-rules"><p><strong>Base serena.</strong> Crema para lectura y aire; tinta para información. El borgoña concentra los remates.</p><p><strong>Un protagonista.</strong> Terracota para una portada o un titular. No hace falta que domine cada pieza.</p><p><strong>Lectura primero.</strong> Crema sobre terracota sólo en texto grande. Para texto pequeño, preferir tinta/crema o crema/borgoña.</p></div>
      </section>

      <section className="bs-section bs-type-section" id="tipografia">
        <div className="bs-type-specimen"><h2>Las ideas, claras.<br/><em>La mirada, propia.</em></h2><span>Aa<br/>Bb</span></div>
        <div className="bs-type-details"><div><h3>Plus Jakarta Sans</h3><p className="bs-alphabet">Aa Bb Cc Dd Ee Ff Gg<br/>0123456789 ¿? ¡!</p><p>800 para titulares. 400–500 para lectura.<br/>Directa, firme y fácil de recorrer.</p></div><div><h3>Newsreader Italic</h3><p className="bs-alphabet bs-serif">Aa Bb Cc Dd Ee Ff Gg<br/>0123456789 ¿? ¡!</p><p>500–600 para acentos y remates.<br/>Una palabra o frase, no todo el discurso.</p></div></div>
        <p className="bs-type-note">En una publicación de 1080 × 1350: titular 88–112 px · acento 144–224 px · apoyo 32–40 px · margen seguro 64 px. Ajustar al contenido y comprobar a tamaño móvil.</p>
      </section>

      <section className="bs-section" id="lenguaje">
        <div className="bs-material-layout"><figure className="bs-material-photo"><img loading="lazy" src={EDITORIAL_PHOTO} width="1600" height="2400" alt="Fotografía editorial cálida con materiales naturales y luz lateral."/><figcaption>Luz real. Materiales reales.<br/><em>Una escena con intención.</em></figcaption></figure><div className="bs-material-copy"><h2>Menos artificio.<br/><em>Más intención.</em></h2><p>Fotografía cálida, sombras naturales y encuadres cercanos. Mostrar trabajo, herramientas y personas reales cuando tengamos material propio autorizado.</p><div className="bs-paper-note"><p>El recurso acompaña.<br/><em>La idea manda.</em></p></div><p>Un borde de papel, un subrayado o una nota: elegir uno como acento. Sin acumular stickers ni decorar por decorar.</p></div></div>
        <div className="bs-voice"><div><span>ASÍ SUENA PUNA</span><p>“Que el seguimiento no dependa de acordarse.”</p><small>Concreto, humano, reconocible.</small></div><div><span>EVITAMOS</span><p>“Revolucionamos tu negocio con soluciones disruptivas.”</p><small>Jerga genérica y promesas sin evidencia.</small></div></div>
      </section>

      <section className="bs-section bs-applications" id="aplicaciones">
        <div className="bs-section-title"><h2>Una marca.<br/><em>Distintas maneras de contar.</em></h2><p>Cada publicación funciona sola. Cambian el ritmo y la composición; permanecen la paleta, la voz y la jerarquía.</p></div>
        <ArtCompositionStudio/>
        <details className="bs-original-examples"><summary>Ver los tres ejemplos originales de la guía</summary>
        <div className="bs-posts">
          <figure><div className="bs-post bs-post-photo"><header>PUNA <span>TECH / 01</span></header><p className="bs-post-title">Tu equipo<br/>tiene mejores<br/>cosas que<br/><em>hacer.</em></p><img loading="lazy" src={EDITORIAL_PHOTO} width="1600" height="2400" alt="Cuaderno y computadora bajo luz cálida."/><p className="bs-post-note">Lo repetitivo,<br/><em>al sistema.</em></p><footer>Tiempo para lo importante. ↗</footer></div><figcaption>01 / CONECTAR · Fotografía + beneficio humano</figcaption></figure>
          <figure><div className="bs-post bs-post-type"><header>PUNA <span>TECH / 02</span></header><p className="bs-post-title">No falta<br/><em>tiempo.</em><br/>Sobra trabajo<br/>repetido.</p><p className="bs-post-support">Antes de sumar otra herramienta,<br/>revisemos el proceso.</p><footer>Automatización con criterio. ↗</footer></div><figcaption>02 / POSICIONAR · Una idea, tipografía protagonista</figcaption></figure>
          <figure><div className="bs-post bs-post-guide"><header>PUNA <span>TECH / 03</span></header><p className="bs-post-title">Antes de<br/><em>automatizar.</em></p><div className="bs-post-checks"><p><b>01</b>Entendé el trabajo.</p><p><b>02</b>Definí quién decide.</p><p><b>03</b>Elegí qué medir.</p></div><p className="bs-post-support">Primero el criterio.<br/>Después, la herramienta.</p><footer>Guardalo para tu próximo proceso. ↗</footer></div><figcaption>03 / ENSEÑAR · Método sin ruido visual</figcaption></figure>
        </div>
        </details>
        <p className="bs-caption">Ejemplos de aplicación, no campañas publicadas ni resultados de clientes. La fotografía de stock es ilustrativa.</p>
      </section>

      <section className="bs-section bs-closing" id="criterio">
        <h2>Que se entienda.<br/>Que se reconozca.<br/><em>Que se sienta Puna.</em></h2>
        <div className="bs-rules"><p><strong>Una idea por pieza.</strong> Titular breve, apoyo útil y un solo próximo paso.</p><p><strong>Verdad antes que impacto.</strong> Datos con fuente. Imágenes con permiso. Ninguna promesa inventada.</p><p><strong>Revisión a tamaño real.</strong> Sin recortes de texto. Buen contraste. Lectura cómoda en el teléfono.</p></div>
        <footer><Brand/><span>EDITORIAL CÁLIDA / GUÍA V1<br/>PUNA TECH · SEPTIEMBRE 2026</span></footer>
      </section>
    </article>
    <aside className="bs-sources"><h2>Referencias y alcance</h2><p>Aplicación editorial de la dirección aprobada. No modifica el logo, la web pública, las campañas guardadas ni sus aprobaciones.</p><p>Principios investigados: <a href="https://mailchimp.com/about/brand-assets/" target="_blank" rel="noreferrer">Mailchimp: reconocimiento y uso de marca</a> · <a href="https://design.duolingo.com/identity/typography" target="_blank" rel="noreferrer">Duolingo: jerarquía tipográfica</a> · <a href="https://creative.starbucks.com/photography/" target="_blank" rel="noreferrer">Starbucks: fotografía editorial</a>. Aplicamos criterios, no sus identidades.</p><p>Fotografía: <a href="https://www.pexels.com/photo/pen-and-paper-beside-a-laptop-on-wooden-table-8473907/" target="_blank" rel="noreferrer">Cup of Couple / Pexels</a>, bajo <a href="https://www.pexels.com/license/" target="_blank" rel="noreferrer">licencia Pexels</a>. No representa al equipo de Puna.</p></aside>
  </div>;
}
