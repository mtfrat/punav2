import { useEffect, useId, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { CampaignArtDraft } from "../lib/art-campaign-drafts";
import { Download, Shuffle, ExternalLink } from "lucide-react";
import jakartaUrl from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2";
import newsreaderUrl from "@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2";
import { ART_COMPOSITIONS, CURATED_ART_ASSETS, nextArtComposition, parseArtHistory, trendResearchUrl, type ArtCompositionId, type ArtCopy } from "../lib/art-compositions";
import { drawArtComposition } from "../lib/art-variety-canvas";
import { EDITORIAL_PHOTO } from "../lib/art-editorial-canvas";
import "../art-concept.css";

const HISTORY_KEY = "puna:art:download-history:v1";
const defaults = (id: ArtCompositionId): ArtCopy => {
  const { headline, support, closing } = ART_COMPOSITIONS.find(c => c.id === id)!;
  return { headline, support, closing };
};

export function ArtCompositionStudio({ campaign }: { campaign?: { action: string; detailUrl: string; version: number; revision: string; saved: CampaignArtDraft[]; seed: ArtCopy } }) {
  const saver = useFetcher<{ error?: string; saved?: string }>();
  const pieceSaver = useFetcher<{ error?: string; attached?: string }>();
  const uid = useId();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<ArtCompositionId>(() => {
    const savedMatch = campaign?.saved?.find(s => ART_COMPOSITIONS.some(c => c.id === s.composition))?.composition;
    return savedMatch || "paper-photo";
  });
  const [drafts, setDrafts] = useState<Partial<Record<ArtCompositionId, ArtCopy>>>(() => Object.fromEntries(campaign?.saved.map(d => [d.composition, d]) || []));
  const [history, setHistory] = useState<ArtCompositionId[]>([]);
  const [explored, setExplored] = useState<ArtCompositionId[]>([]);
  const [storageNotice, setStorageNotice] = useState("");
  const [photoSrc, setPhotoSrc] = useState(EDITORIAL_PHOTO);
  const [uploadError, setUploadError] = useState("");
  const [render, setRender] = useState({ key: "", url: "", message: "Preparando la publicación…" });
  const [keyword, setKeyword] = useState("automatización");
  const [country, setCountry] = useState("AR");
  const [role, setRole] = useState("cover");
  const [narrativeFunction, setNarrativeFunction] = useState("");
  const [altText, setAltText] = useState("");
  const [rightsSource, setRightsSource] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [attachError, setAttachError] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const composition = ART_COMPOSITIONS.find(c => c.id === selected) || ART_COMPOSITIONS[0];
  const copy = drafts[selected] || campaign?.seed || defaults(selected);
  const renderKey = JSON.stringify([selected, copy, photoSrc, slideIndex]);
  const ready = render.key === renderKey && Boolean(render.url);
  const supportLines = null;

  useEffect(() => {
    try { setHistory(parseArtHistory(localStorage.getItem(HISTORY_KEY))); }
    catch { setStorageNotice("El navegador no permite guardar el historial. Se conservará sólo mientras esta página esté abierta."); }
  }, []);
  useEffect(() => () => { if (photoSrc.startsWith("blob:")) URL.revokeObjectURL(photoSrc); }, [photoSrc]);
  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    const jakarta = new FontFace("Art Jakarta", `url(${jakartaUrl})`, { weight: "200 800" });
    const newsreader = new FontFace("Art Newsreader", `url(${newsreaderUrl})`, { weight: "200 800", style: "italic" });
    async function paint() {
      try {
        if (!copy.headline.trim() || !copy.support.trim() || !copy.closing.trim()) throw new Error("Completá el titular, el apoyo y el cierre para preparar el PNG.");
        if (copy.headline.length > 100 || copy.support.length > 240 || copy.closing.length > 75) throw new Error("Adaptá el brief a esta pieza: titular hasta 100 caracteres, apoyo hasta 240 y cierre hasta 75.");
        const photo = new Image();
        photo.src = photoSrc;
        await Promise.all([jakarta.load(), newsreader.load(), photo.decode()]);
        if (cancelled || !canvas.current) return;
        document.fonts.add(jakarta); document.fonts.add(newsreader);
        // Draw off-screen so an error never exposes a half-painted downloadable image.
        const stage = document.createElement("canvas");
        drawArtComposition(stage, selected, { ...copy, support: supportLines ? copy.support.split("\n").filter(s => s.trim()).join("\n") : copy.support }, photo, slideIndex);
        canvas.current.width = 1080; canvas.current.height = 1350;
        canvas.current.getContext("2d")!.drawImage(stage, 0, 0);
        stage.toBlob(blob => {
          if (cancelled) return;
          if (!blob) { setRender({ key: renderKey, url: "", message: "No se pudo crear el PNG. Cambiá de molde y reintentá." }); return; }
          objectUrl = URL.createObjectURL(blob);
          setRender({ key: renderKey, url: objectUrl, message: "PNG listo · 1080 × 1350 px" });
        }, "image/png");
      } catch (error) {
        if (!cancelled) setRender({ key: renderKey, url: "", message: error instanceof Error ? error.message : "No se pudo cargar la imagen o las fuentes. Recargá para reintentar." });
      }
    }
    void paint();
    return () => { cancelled = true; document.fonts.delete(jakarta); document.fonts.delete(newsreader); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [renderKey, selected, copy.headline, copy.support, copy.closing, composition.photo, photoSrc, supportLines]);

  function edit(field: keyof ArtCopy, value: string) { setDrafts(d => ({ ...d, [selected]: { ...(d[selected] || campaign?.seed || defaults(selected)), [field]: value } })); }
  function choose(id: ArtCompositionId) {
    setExplored(items => [...items, selected].slice(-120));
    setSelected(id);
    if (id === "dark-tech" && photoSrc === EDITORIAL_PHOTO) {
      setPhotoSrc("/art-direction/3d-laptop-slate.jpg");
    } else if (id === "pop-collage") {
      setPhotoSrc("/art-direction/pop-cutout-couple.png");
    } else if (id === "bolder-poster" && (photoSrc === EDITORIAL_PHOTO || photoSrc.startsWith("/art-direction/pop-cutout-") || photoSrc.startsWith("/art-direction/3d-"))) {
      setPhotoSrc("/art-direction/editorial-craft-pottery.jpg");
    } else if (id === "paper-photo" && (photoSrc === "/art-direction/3d-laptop-slate.jpg" || photoSrc.startsWith("/art-direction/pop-cutout-"))) {
      setPhotoSrc(EDITORIAL_PHOTO);
    }
  }
  function recordDownload() {
    const updated = [...history, selected].slice(-120);
    setHistory(updated);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); }
    catch { setStorageNotice("No se pudo guardar el historial entre sesiones. La descarga funciona y la selección recuerda esta sesión."); }
  }
  async function attachPiece() {
    if (!campaign || !ready || !render.url) return;
    setAttachError("");
    if (!narrativeFunction.trim() || !altText.trim() || !rightsSource.trim() || !rightsConfirmed) {
      setAttachError("Completá función, texto alternativo, procedencia y confirmá el permiso antes de guardar.");
      return;
    }
    try {
      const blob = await new Promise<Blob>((resolve, reject) => canvas.current?.toBlob(value => value ? resolve(value) : reject(new Error("png_unavailable")), "image/png"));
      if (blob.size > 4 * 1024 * 1024) { setAttachError("El PNG pesa más de 4 MB. Probá otra foto o una composición tipográfica."); return; }
      const form = new FormData();
      form.set("intent", "attach_editorial_piece");
      form.set("expected_version", String(campaign.version));
      form.set("role", role);
      form.set("composition", selected);
      form.set("headline", copy.headline);
      form.set("support", copy.support);
      form.set("closing", copy.closing);
      form.set("narrative_function", narrativeFunction.trim());
      form.set("alt_text", altText.trim());
      form.set("rights_source", rightsSource.trim());
      form.set("rights_confirmed", "yes");
      form.set("png", new File([blob], `puna-${selected}.png`, { type: "image/png" }));
      pieceSaver.submit(form, { method: "post", action: campaign.action, encType: "multipart/form-data" });
    } catch { setAttachError("No se pudo preparar el PNG para guardarlo. Volvé a intentar."); }
  }
  const seen = new Set(history);
  return <div className="art-variety">
    <div className="art-variety-intro"><h3>La misma marca. Otro punto de vista.</h3><p>7 composiciones editoriales pro · una publicación por vez. Cambia la estructura, no sólo el color.</p></div>
    <div className="art-study-layout">
      <figure className="art-study-stage">
        <canvas ref={canvas} width={1080} height={1350} role="img" aria-label={`${composition.name}: ${copy.headline}. ${copy.support}. ${copy.closing}`} style={{ visibility: ready ? "visible" : "hidden" }}/>
        {!ready && <div className="art-preview-message" role="status">{render.key === renderKey ? render.message : "Preparando tu publicación…"}</div>}
        <figcaption>{composition.name}{["notebook-carousel", "pop-collage"].includes(selected) ? ` · Lámina 0${slideIndex}` : ""}<span>1080 × 1350</span></figcaption>
      </figure>
      <div className="art-variety-controls">
        <label htmlFor={`${uid}-layout`}>Composición</label>
        <select id={`${uid}-layout`} value={selected} onChange={e => { choose(e.target.value as ArtCompositionId); setSlideIndex(0); }}>{ART_COMPOSITIONS.map(c => <option key={c.id} value={c.id}>{c.name} · {c.family}</option>)}</select>
        <p>{composition.description}</p>
        {selected === "notebook-carousel" && <div style={{ display: "flex", gap: "6px", margin: "8px 0", flexWrap: "wrap" }}>
          {[
            { label: "00 · Portada", idx: 0 },
            { label: "01 · Duda", idx: 1 },
            { label: "02 · Criterio", idx: 2 },
            { label: "03 · Cierre", idx: 3 },
          ].map(tab => (
            <button
              key={tab.idx}
              type="button"
              className={`ops-button ${slideIndex === tab.idx ? "" : "ops-button-secondary"}`}
              style={{ padding: "4px 8px", fontSize: "11px", minHeight: "28px" }}
              onClick={() => setSlideIndex(tab.idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>}
        {selected === "pop-collage" && <div style={{ display: "flex", gap: "6px", margin: "8px 0", flexWrap: "wrap" }}>
          {[
            { label: "00 · Portada", idx: 0, photo: "/art-direction/pop-cutout-couple.png" },
            { label: "01 · Criterio", idx: 1, photo: "/art-direction/pop-cutout-megaphone.png" },
            { label: "02 · Historia", idx: 2, photo: "/art-direction/pop-cutout-notebook.png" },
            { label: "03 · Emoción", idx: 3, photo: "/art-direction/pop-cutout-shocked.png" },
            { label: "04 · Confianza", idx: 4, photo: "/art-direction/pop-cutout-cheering.png" },
          ].map(tab => (
            <button
              key={tab.idx}
              type="button"
              className={`ops-button ${slideIndex === tab.idx ? "" : "ops-button-secondary"}`}
              style={{ padding: "4px 8px", fontSize: "11px", minHeight: "28px" }}
              onClick={() => {
                setSlideIndex(tab.idx);
                if (photoSrc.startsWith("/art-direction/pop-cutout-")) {
                  setPhotoSrc(tab.photo);
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>}
        {selected === "bolder-poster" && <div style={{ display: "flex", gap: "6px", margin: "8px 0", flexWrap: "wrap" }}>
          {[
            { label: "01 · Fondo Terracota", idx: 0 },
            { label: "02 · Fondo Crema", idx: 1 },
            { label: "03 · Fotografía B&W", idx: 2 },
          ].map(tab => (
            <button
              key={tab.idx}
              type="button"
              className={`ops-button ${slideIndex === tab.idx ? "" : "ops-button-secondary"}`}
              style={{ padding: "4px 8px", fontSize: "11px", minHeight: "28px" }}
              onClick={() => setSlideIndex(tab.idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>}
        <button type="button" className="ops-button ops-button-secondary" onClick={() => { choose(nextArtComposition(selected, [...history, ...explored, selected])); setSlideIndex(0); }}><Shuffle size={16}/>Proponer otra estructura</button>
        <p className="art-history" role="status">{seen.size} de 7 moldes descargados en este navegador. La sugerencia recorre el catálogo antes de repetir, considera descargas y exploración de esta sesión y prioriza otra familia. La selección manual sigue libre.</p>
        {storageNotice && <p role="status">{storageNotice}</p>}
        <label htmlFor={`${uid}-headline`}>Titular</label><textarea id={`${uid}-headline`} value={copy.headline} maxLength={100} rows={3} onChange={e => edit("headline", e.target.value)}/>
        <label htmlFor={`${uid}-support`}>Apoyo{supportLines ? ` · ${supportLines} líneas` : ""}</label><textarea id={`${uid}-support`} value={copy.support} maxLength={240} rows={4} onChange={e => edit("support", e.target.value)}/>
        <label htmlFor={`${uid}-closing`}>Cierre</label><input id={`${uid}-closing`} value={copy.closing} maxLength={75} onChange={e => edit("closing", e.target.value)}/>
        {composition.photo && <div className="art-photo-input">
          <label htmlFor={`${uid}-curated`}>Imagen o render 3D · Colección Puna Tech</label>
          <select id={`${uid}-curated`} value={CURATED_ART_ASSETS.some(a => a.url === photoSrc) ? photoSrc : "custom"} onChange={e => {
            if (e.target.value !== "custom") {
              setPhotoSrc(e.target.value);
              setUploadError("");
            }
          }}>
            {CURATED_ART_ASSETS.map(asset => <option key={asset.id} value={asset.url}>{asset.name}</option>)}
            {!CURATED_ART_ASSETS.some(a => a.url === photoSrc) && <option value="custom">Imagen personalizada cargada</option>}
          </select>
          <label htmlFor={`${uid}-photo`}>O subí tu propio render / foto · JPG, PNG o WebP, hasta 12 MB</label>
          <input id={`${uid}-photo`} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 12 * 1024 * 1024) { setUploadError("Elegí un JPG, PNG o WebP de hasta 12 MB."); return; }
            setUploadError(""); setPhotoSrc(URL.createObjectURL(file));
          }}/>
          <p>Usá material propio o autorizado. {campaign ? "La foto queda en este navegador hasta que guardes el PNG final como pieza revisable." : "La foto queda en este navegador; no se sube ni guarda en una campaña."}</p>
          {uploadError && <p role="alert">{uploadError}</p>}
          {!CURATED_ART_ASSETS.some(a => a.url === photoSrc) && <button type="button" className="ops-button ops-button-secondary" onClick={() => { setPhotoSrc(selected === "dark-tech" ? "/art-direction/3d-laptop-slate.jpg" : EDITORIAL_PHOTO); setUploadError(""); }}>Volver a la imagen predeterminada</button>}
        </div>}
        {ready ? <a className="ops-button" href={render.url} download={`puna-${selected}${["notebook-carousel", "pop-collage"].includes(selected) ? `-lamina-0${slideIndex}` : ""}.png`} onClick={recordDownload}><Download size={17}/>Descargar publicación</a> : <button type="button" className="ops-button" disabled>PNG no disponible</button>}
        <p role="status">{render.key === renderKey ? render.message : "Preparando imagen y tipografías…"}</p>
        {campaign && <saver.Form method="post" action={campaign.action}>
          <input type="hidden" name="intent" value="save_editorial_draft"/>
          <input type="hidden" name="expected_revision" value={campaign.revision}/>
          <input type="hidden" name="composition" value={selected}/>
          <input type="hidden" name="headline" value={copy.headline}/>
          <input type="hidden" name="support" value={copy.support}/>
          <input type="hidden" name="closing" value={copy.closing}/>
          <button className="ops-button" disabled={!ready || saver.state !== "idle" || photoSrc !== EDITORIAL_PHOTO}>{saver.state !== "idle" ? "Guardando…" : "Guardar texto y diseño en campaña"}</button>
          <p>Guarda una versión editable por composición. No guarda el PNG ni fotos propias y no publica. Con una foto propia, descargá el PNG o volvé a la foto de ejemplo para guardar.</p>
          {saver.data?.error && <p role="alert">{saver.data.error}</p>}
          {saver.data?.saved && <p role="status">Guardado: {saver.data.saved}. Podés volver a abrirlo desde esta campaña.</p>}
        </saver.Form>}
        {campaign && <section className="art-attach-piece" aria-labelledby={`${uid}-attach-title`}>
          <h4 id={`${uid}-attach-title`}>Incorporar esta publicación a la campaña</h4>
          <p>Guarda el PNG final como pieza versionada para revisión; no publica ni aprueba la campaña. La portada y la prueba visual pueden usar composiciones diferentes. El carrusel se prepara por separado.</p>
          <label htmlFor={`${uid}-role`}>Función de la publicación</label>
          <select id={`${uid}-role`} value={role} onChange={event => setRole(event.target.value)}><option value="cover">Portada / idea</option><option value="evidence">Prueba visual</option></select>
          <label htmlFor={`${uid}-narrative`}>Qué aporta a la historia</label>
          <textarea id={`${uid}-narrative`} value={narrativeFunction} maxLength={600} rows={2} onChange={event => setNarrativeFunction(event.target.value)} placeholder="Ej.: abre la tensión principal sin adelantar la solución"/>
          <label htmlFor={`${uid}-alt`}>Texto alternativo de la imagen</label>
          <textarea id={`${uid}-alt`} value={altText} maxLength={500} rows={2} onChange={event => setAltText(event.target.value)} placeholder="Describí el texto y los elementos visuales para quien no ve la imagen"/>
          <label htmlFor={`${uid}-rights`}>Procedencia de fotos y elementos</label>
          <input id={`${uid}-rights`} value={rightsSource} maxLength={500} onChange={event => setRightsSource(event.target.value)} placeholder={photoSrc === EDITORIAL_PHOTO ? "Ej.: composición original; foto Cup of Couple / Pexels" : "Ej.: fotografía propia de Puna; personas con consentimiento"}/>
          <label className="art-attach-consent"><input type="checkbox" checked={rightsConfirmed} onChange={event => setRightsConfirmed(event.target.checked)}/><span>Confirmo que tenemos derecho a usar todos los elementos y consentimiento de las personas retratadas, si corresponde.</span></label>
          <button type="button" className="ops-button" disabled={!ready || pieceSaver.state !== "idle"} onClick={() => void attachPiece()}>{pieceSaver.state !== "idle" ? "Guardando publicación…" : "Guardar PNG como pieza revisable"}</button>
          {(attachError || pieceSaver.data?.error) && <p role="alert">{attachError || pieceSaver.data?.error}</p>}
          {pieceSaver.data?.attached && <p role="status">{pieceSaver.data.attached} guardada y versionada. <a href={campaign.detailUrl}>Ver en Producción</a>.</p>}
        </section>}
        <details className="art-trends"><summary>Investigar un tema actual</summary><p>Buscá señales reales antes de redactar. Estas consultas abren fuentes externas: no son un ranking automático ni prueban que una palabra sea tendencia.</p>
          <label htmlFor={`${uid}-keyword`}>Tema para investigar</label><input id={`${uid}-keyword`} value={keyword} maxLength={100} onChange={e => setKeyword(e.target.value)}/>
          <label htmlFor={`${uid}-country`}>Mercado</label><select id={`${uid}-country`} value={country} onChange={e => setCountry(e.target.value)}><option value="AR">Argentina</option><option value="UY">Uruguay</option><option value="CL">Chile</option><option value="MX">México</option><option value="ES">España</option></select>
          <a href={trendResearchUrl(keyword, country)} target="_blank" rel="noreferrer">Comparar interés · últimos 7 días <ExternalLink size={14}/></a>
          <a href={`https://trends.google.com/trending?geo=${country}`} target="_blank" rel="noreferrer">Ver búsquedas en auge <ExternalLink size={14}/></a>
          <a href="https://ads.tiktok.com/business/creativecenter/keyword-insights/pc/en" target="_blank" rel="noreferrer">Explorar palabras de anuncios en TikTok <ExternalLink size={14}/></a>
          <p>Elegí un tema sólo si conecta con un problema del cliente. Verificá fecha, mercado y fuente; luego adaptá el titular con una mirada propia. Interés de búsqueda no equivale a intención de compra.</p>
        </details>
      </div>
    </div>
    <p className="art-variety-disclaimer">Laboratorio de publicaciones individuales. Los textos son propuestas editables; no son testimonios ni resultados de clientes. {campaign ? "Los borradores de texto son editables; los PNG incorporados se revisan por separado antes de cualquier entrega o publicación." : "Descargas e historial locales: no guarda ni publica piezas en campañas."} Foto de ejemplo: <a href="https://www.pexels.com/photo/pen-and-paper-beside-a-laptop-on-wooden-table-8473907/" target="_blank" rel="noreferrer">Cup of Couple / Pexels</a>. Usar otra composición no sustituye variar la idea y el material fotográfico.</p>
  </div>;
}
