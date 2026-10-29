import { useEffect, useMemo, useState } from "react";
import { Check, FileSpreadsheet, Sparkles } from "lucide-react";
import { ActionLog, Chip, DemoFrame, ErrorNote, Kpi, Spinner, money, useActionLog, useBusy, type Loc } from "./shared";

interface Product { sku: string; name: string; stock: number; price: number; visible: boolean }
interface FeedRow { sku: string; name: string; stock: number; cost: number }
interface Row {
  key: string; sku: string; name: string; kind: "update" | "new" | "missing" | "same";
  stockFrom: number | null; stockTo: number | null; priceFrom: number | null; priceTo: number | null;
  visFrom: boolean | null; visTo: boolean | null; review: string | null;
}

const STORE: Product[] = [
  { sku: "TAL-001", name: "Taladro percutor 650W", stock: 8, price: 62000, visible: true },
  { sku: "TAL-002", name: "Amoladora angular 115mm", stock: 5, price: 48500, visible: true },
  { sku: "LLA-010", name: "Llave combinada 12mm", stock: 40, price: 3900, visible: true },
  { sku: "DES-020", name: "Set destornilladores x6", stock: 22, price: 8900, visible: true },
  { sku: "CIN-030", name: "Cinta métrica 5m", stock: 0, price: 4200, visible: false },
  { sku: "PIN-040", name: "Pintura látex 4L blanca", stock: 12, price: 21800, visible: true },
  { sku: "PIN-041", name: "Rodillo de lana 22cm", stock: 30, price: 3200, visible: true },
  { sku: "GUA-050", name: "Guantes de seguridad", stock: 100, price: 2100, visible: true },
  { sku: "CAS-060", name: "Casco de obra", stock: 15, price: 5400, visible: true },
  { sku: "LUZ-070", name: "Linterna LED recargable", stock: 0, price: 9800, visible: true },
  { sku: "TOR-080", name: "Tornillos autoperforantes x100", stock: 60, price: 2600, visible: true },
  { sku: "ESC-090", name: "Escalera aluminio 5 escalones", stock: 3, price: 74000, visible: true },
];

const FEED_MON = `sku,nombre,stock,costo
TAL-001,Taladro percutor 650W,14,41000
TAL-002,Amoladora angular 115mm,0,33000
LLA-010,Llave combinada 12mm,55,2750
DES-020,Set destornilladores x6,22,6300
CIN-030,Cinta métrica 5m,35,2900
PIN-040,Pintura látex 4L blanca,9,15900
PIN-041,Rodillo de lana 22cm,30,2500
GUA-050,Guantes de seguridad,100,1400
CAS-060,Casco de obra,18,3900
LUZ-070,Linterna LED recargable,0,7000
TOR-080,Tornillos autoperforantes x100,60,3800
NIV-100,Nivel láser autonivelante,6,38000`;

const FEED_BAD = `sku,nombre,stock,costo
TAL-001,Taladro percutor 650W,12,42500
TAL-002,Amoladora angular 115mm,-4,33000
LLA-010,Llave combinada 12mm,sin dato,2750
DES-020,Set destornilladores x6,18
PIN-040,Pintura látex 4L blanca,9,quince mil
CAS-060,Casco de obra,16,4000
GUA-050,Guantes de seguridad,90,1500`;

const T = {
  es: {
    label: "Sync de stock con proveedores",
    feed: "Feed del proveedor (CSV)", feedHelp: "Pegá el CSV que te manda tu proveedor o cargá uno de prueba. Columnas: sku, nombre, stock, costo.",
    loadOk: "Feed del lunes", loadBad: "Feed con errores", compare: "Comparar con la tienda", comparing: "Leyendo el feed y comparando…",
    rules: "Reglas de la tienda", margin: "Margen sobre costo", rounding: "Redondear precio a", minStock: "Ocultar si el proveedor tiene stock ≤", maxJump: "Revisar si el precio cambia más de",
    kpiProducts: "Productos en tienda", kpiChanges: "Cambios propuestos", kpiReview: "Para revisar a mano", kpiErrors: "Líneas con error",
    empty: "Todavía no se comparó nada. Cargá un feed y tocá \"Comparar con la tienda\".",
    diff: "Diferencias", cols: { inc: "Aplicar", prod: "Producto", stock: "Stock", price: "Precio", action: "Qué hace el agente" },
    stockTag: (a: number, b: number) => `Stock ${a} → ${b}`, priceTag: "Precio", hide: "Ocultar (sin stock)", show: "Volver a mostrar", fix: "Ocultar: figura visible sin stock",
    newProd: "Producto nuevo: crear oculto", missing: "No viene en el feed: no se toca", same: "Sin cambios",
    reviewJump: (p: number) => `Precio ${p > 0 ? "+" : ""}${p}%: revisalo`, reviewNew: "Nuevo: confirmá precio y foto", reviewMissing: "Revisá con el proveedor",
    errorsTitle: "Líneas que el agente no pudo leer", errLine: (n: number, why: string) => `Línea ${n}: ${why}`,
    errCols: "faltan columnas", errStock: "stock inválido", errCost: "costo inválido", errHeader: "El CSV no tiene las columnas sku, stock y costo. Revisá el encabezado.", errEmpty: "El CSV está vacío.",
    approve: (n: number) => `Aprobar y aplicar ${n} cambios`, none: "Tildá al menos un cambio para aplicar.", applied: "Cambios aplicados", allSame: "La tienda ya está al día con este feed.",
    logAnalyzed: (c: number, r: number, e: number) => `Comparé el feed con la tienda: ${c} productos con cambios, ${r} para revisar, ${e} líneas con error.`,
    logApplied: (s: number, p: number, h: number, v: number, n: number) => `Aprobaste el sync: stock en ${s} productos, precio en ${p}, ocultaste ${h}, mostraste ${v}, creaste ${n} nuevos (oculto).`,
    logRules: "Cambiaste una regla: recalculé los precios y las acciones.", logLoaded: (n: string) => `Cargaste ${n}.`,
    shopify: "En la versión real, el último paso es la API de tu tienda (Shopify, Tienda Nube o Mercado Libre).", currentStore: "Tienda hoy",
  },
  en: {
    label: "Supplier stock sync",
    feed: "Supplier feed (CSV)", feedHelp: "Paste the CSV your supplier sends you or load a test one. Columns: sku, name, stock, cost.",
    loadOk: "Monday feed", loadBad: "Feed with errors", compare: "Compare with the store", comparing: "Reading the feed and comparing…",
    rules: "Store rules", margin: "Margin over cost", rounding: "Round price to", minStock: "Hide if supplier stock ≤", maxJump: "Flag if price moves more than",
    kpiProducts: "Products in store", kpiChanges: "Proposed changes", kpiReview: "Needs manual review", kpiErrors: "Lines with errors",
    empty: "Nothing compared yet. Load a feed and press \"Compare with the store\".",
    diff: "Differences", cols: { inc: "Apply", prod: "Product", stock: "Stock", price: "Price", action: "What the agent does" },
    stockTag: (a: number, b: number) => `Stock ${a} → ${b}`, priceTag: "Price", hide: "Hide (out of stock)", show: "Show again", fix: "Hide: listed but out of stock",
    newProd: "New product: create hidden", missing: "Not in the feed: untouched", same: "No changes",
    reviewJump: (p: number) => `Price ${p > 0 ? "+" : ""}${p}%: review it`, reviewNew: "New: confirm price and photo", reviewMissing: "Check with the supplier",
    errorsTitle: "Lines the agent could not read", errLine: (n: number, why: string) => `Line ${n}: ${why}`,
    errCols: "missing columns", errStock: "invalid stock", errCost: "invalid cost", errHeader: "The CSV has no sku, stock and cost columns. Check the header row.", errEmpty: "The CSV is empty.",
    approve: (n: number) => `Approve and apply ${n} changes`, none: "Tick at least one change to apply.", applied: "Changes applied", allSame: "The store is already up to date with this feed.",
    logAnalyzed: (c: number, r: number, e: number) => `Compared the feed with the store: ${c} products with changes, ${r} to review, ${e} lines with errors.`,
    logApplied: (s: number, p: number, h: number, v: number, n: number) => `You approved the sync: stock on ${s} products, price on ${p}, hid ${h}, showed ${v}, created ${n} new (hidden).`,
    logRules: "You changed a rule: I recalculated prices and actions.", logLoaded: (n: string) => `You loaded ${n}.`,
    shopify: "In the real version, the last step is your store API (Shopify, Tienda Nube or Mercado Libre).", currentStore: "Store today",
  },
};

function parseFeed(text: string, t: typeof T.es) {
  const errors: string[] = [];
  const rows: FeedRow[] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { rows, errors: [t.errEmpty], fatal: true };
  const sep = lines[0].includes(";") && !lines[0].includes(",") ? ";" : ",";
  const head = lines[0].split(sep).map((h) => h.trim().toLowerCase());
  const idx = {
    sku: head.indexOf("sku"),
    name: Math.max(head.indexOf("nombre"), head.indexOf("name")),
    stock: head.indexOf("stock"),
    cost: head.includes("costo") ? head.indexOf("costo") : head.indexOf("cost"),
  };
  if (idx.sku < 0 || idx.stock < 0 || idx.cost < 0) return { rows, errors: [t.errHeader], fatal: true };
  lines.slice(1).forEach((line, i) => {
    const n = i + 2;
    const cells = line.split(sep).map((c) => c.trim());
    if (cells.length < head.length) { errors.push(t.errLine(n, t.errCols)); return; }
    const stock = Number(cells[idx.stock]);
    const cost = Number(cells[idx.cost]);
    if (!Number.isFinite(stock) || stock < 0 || cells[idx.stock] === "") { errors.push(t.errLine(n, t.errStock)); return; }
    if (!Number.isFinite(cost) || cost <= 0 || cells[idx.cost] === "") { errors.push(t.errLine(n, t.errCost)); return; }
    rows.push({ sku: cells[idx.sku], name: idx.name >= 0 ? cells[idx.name] : cells[idx.sku], stock: Math.round(stock), cost });
  });
  return { rows, errors, fatal: false };
}

export default function StockSyncDemo({ loc }: { loc: Loc }) {
  const t = T[loc];
  const [store, setStore] = useState<Product[]>(STORE);
  const [feedText, setFeedText] = useState(FEED_MON);
  const [analyzed, setAnalyzed] = useState<string | null>(null);
  const [margin, setMargin] = useState(45);
  const [rounding, setRounding] = useState(100);
  const [minStock, setMinStock] = useState(0);
  const [maxJump, setMaxJump] = useState(25);
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const [applied, setApplied] = useState(false);
  const { entries, push, clear } = useActionLog("stock-sync");
  const { busy, run } = useBusy();
  const [runId, setRun] = useState(0);

  const parsed = useMemo(() => (analyzed === null ? null : parseFeed(analyzed, t)), [analyzed, t]);

  const rows: Row[] = useMemo(() => {
    if (!parsed || parsed.fatal) return [];
    const out: Row[] = [];
    const feed = new Map<string, FeedRow>(parsed.rows.map((r): [string, FeedRow] => [r.sku, r]));
    for (const p of store) {
      const f = feed.get(p.sku);
      if (!f) { out.push({ key: p.sku, sku: p.sku, name: p.name, kind: "missing", stockFrom: p.stock, stockTo: null, priceFrom: p.price, priceTo: null, visFrom: p.visible, visTo: null, review: t.reviewMissing }); continue; }
      const priceTo = Math.round((f.cost * (1 + margin / 100)) / rounding) * rounding;
      const visTo = f.stock > minStock;
      const jump = Math.round(((priceTo - p.price) / p.price) * 100);
      const changed = f.stock !== p.stock || priceTo !== p.price || visTo !== p.visible;
      out.push({
        key: p.sku, sku: p.sku, name: p.name, kind: changed ? "update" : "same",
        stockFrom: p.stock, stockTo: f.stock, priceFrom: p.price, priceTo, visFrom: p.visible, visTo,
        review: Math.abs(jump) > maxJump ? t.reviewJump(jump) : null,
      });
    }
    const known = new Set(store.map((p) => p.sku));
    for (const f of parsed.rows) {
      if (known.has(f.sku)) continue;
      const priceTo = Math.round((f.cost * (1 + margin / 100)) / rounding) * rounding;
      out.push({ key: f.sku, sku: f.sku, name: f.name, kind: "new", stockFrom: null, stockTo: f.stock, priceFrom: null, priceTo, visFrom: null, visTo: false, review: t.reviewNew });
    }
    return out;
  }, [parsed, store, margin, rounding, minStock, maxJump, t]);

  const isChecked = (row: Row) => row.kind === "same" || row.kind === "missing" ? false : included[row.key] ?? !row.review;
  const actionable = rows.filter((r) => r.kind === "update" || r.kind === "new");
  const selected = actionable.filter(isChecked);
  const reviewCount = rows.filter((r) => r.review).length;

  function analyze(text: string) {
    run(() => { setAnalyzed(text); setIncluded({}); setApplied(false); setRun((n) => n + 1); });
  }
  // One summary line per comparison, written after the rows exist.
  useEffect(() => {
    if (!parsed || runId === 0) return;
    if (parsed.fatal) { push(parsed.errors[0], "warn"); return; }
    const changes = rows.filter((r) => r.kind === "update" || r.kind === "new").length;
    push(t.logAnalyzed(changes, reviewCount, parsed.errors.length), "agent");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  function load(kind: "ok" | "bad") {
    const text = kind === "ok" ? FEED_MON : FEED_BAD;
    setFeedText(text);
    push(t.logLoaded(kind === "ok" ? t.loadOk : t.loadBad), "info");
    analyze(text);
  }

  function apply() {
    const next = store.map((p) => ({ ...p }));
    let s = 0, pr = 0, h = 0, v = 0, n = 0;
    for (const row of selected) {
      if (row.kind === "new") {
        next.push({ sku: row.sku, name: row.name, stock: row.stockTo ?? 0, price: row.priceTo ?? 0, visible: false });
        n++; continue;
      }
      const p = next.find((x) => x.sku === row.sku);
      if (!p) continue;
      if (row.stockTo !== null && p.stock !== row.stockTo) { p.stock = row.stockTo; s++; }
      if (row.priceTo !== null && p.price !== row.priceTo) { p.price = row.priceTo; pr++; }
      if (row.visTo !== null && p.visible !== row.visTo) { p.visible = row.visTo; row.visTo ? v++ : h++; }
    }
    setStore(next); setApplied(true); setIncluded({});
    push(t.logApplied(s, pr, h, v, n), "approved");
  }

  function onRule(setter: (n: number) => void, value: number) { setter(value); if (analyzed !== null) push(t.logRules, "info"); }

  function reset() {
    setStore(STORE); setFeedText(FEED_MON); setAnalyzed(null); setRun(0); setMargin(45); setRounding(100); setMinStock(0); setMaxJump(25); setIncluded({}); setApplied(false); clear();
  }

  const visibleCount = store.filter((p) => p.visible).length;

  return (
    <DemoFrame loc={loc} label={t.label} onReset={reset}>
      <div className="dm-kpis">
        <Kpi label={t.kpiProducts} value={String(store.length)} sub={`${visibleCount} ${loc === "es" ? "visibles" : "visible"}`} />
        <Kpi label={t.kpiChanges} value={String(actionable.length)} tone="warn" />
        <Kpi label={t.kpiReview} value={String(reviewCount)} tone={reviewCount ? "bad" : "good"} />
        <Kpi label={t.kpiErrors} value={String(parsed?.errors.length ?? 0)} tone={parsed?.errors.length ? "bad" : "good"} />
      </div>

      <div className="dm-grid-2">
        <section className="dm-panel" aria-label={t.feed}>
          <h3 className="dm-panel-title"><FileSpreadsheet aria-hidden="true" size={18} />{t.feed}</h3>
          <p className="dm-hint">{t.feedHelp}</p>
          <label className="dm-field"><span className="dm-sr">{t.feed}</span>
            <textarea className="dm-input dm-textarea dm-mono" rows={9} value={feedText} onChange={(e) => setFeedText(e.target.value)} spellCheck={false} />
          </label>
          <div className="dm-row">
            <button type="button" className="dm-btn dm-btn-primary" onClick={() => analyze(feedText)} disabled={busy}>
              {busy ? <Spinner label={t.comparing} /> : (<><Sparkles aria-hidden="true" size={16} />{t.compare}</>)}
            </button>
            <button type="button" className="dm-btn dm-btn-ghost" onClick={() => load("ok")} disabled={busy}>{t.loadOk}</button>
            <button type="button" className="dm-btn dm-btn-ghost" onClick={() => load("bad")} disabled={busy}>{t.loadBad}</button>
          </div>
        </section>

        <section className="dm-panel" aria-label={t.rules}>
          <h3 className="dm-panel-title">{t.rules}</h3>
          <label className="dm-field"><span>{t.margin}: <strong>{margin}%</strong></span>
            <input type="range" min={10} max={100} step={5} value={margin} onChange={(e) => onRule(setMargin, Number(e.target.value))} />
          </label>
          <label className="dm-field"><span>{t.rounding}</span>
            <select className="dm-input" value={rounding} onChange={(e) => onRule(setRounding, Number(e.target.value))}>
              <option value={10}>$ 10</option><option value={50}>$ 50</option><option value={100}>$ 100</option>
            </select>
          </label>
          <label className="dm-field"><span>{t.minStock}: <strong>{minStock}</strong></span>
            <input type="range" min={0} max={10} step={1} value={minStock} onChange={(e) => onRule(setMinStock, Number(e.target.value))} />
          </label>
          <label className="dm-field"><span>{t.maxJump}: <strong>{maxJump}%</strong></span>
            <input type="range" min={5} max={80} step={5} value={maxJump} onChange={(e) => onRule(setMaxJump, Number(e.target.value))} />
          </label>
          <p className="dm-hint">{t.shopify}</p>
        </section>
      </div>

      {parsed && parsed.errors.length > 0 ? (
        <section className="dm-panel" aria-label={t.errorsTitle}>
          <h3 className="dm-panel-title">{t.errorsTitle}</h3>
          <ul className="dm-errlist">{parsed.errors.map((e) => <li key={e}><ErrorNote>{e}</ErrorNote></li>)}</ul>
        </section>
      ) : null}

      <section className="dm-panel" aria-label={t.diff}>
        <div className="dm-row dm-row-between">
          <h3 className="dm-panel-title">{t.diff}</h3>
          {actionable.length > 0 ? (
            <button type="button" className="dm-btn dm-btn-primary" disabled={selected.length === 0} onClick={apply}><Check aria-hidden="true" size={16} />{t.approve(selected.length)}</button>
          ) : null}
        </div>
        {busy ? <p className="dm-empty"><Spinner label={t.comparing} /></p> : parsed === null ? (
          <p className="dm-empty">{t.empty}</p>
        ) : parsed.fatal ? null : (
          <>
            {applied && actionable.length === 0 ? <p className="dm-note-ok"><Check aria-hidden="true" size={16} />{t.applied}. {t.allSame}</p> : null}
            <div className="dm-table-wrap">
              <table className="dm-table">
                <thead><tr><th>{t.cols.inc}</th><th>{t.cols.prod}</th><th>{t.cols.stock}</th><th>{t.cols.price}</th><th>{t.cols.action}</th></tr></thead>
                <tbody>
                  {rows.map((row) => {
                    const canCheck = row.kind === "update" || row.kind === "new";
                    return (
                      <tr key={row.key} className={row.review ? "is-review" : ""}>
                        <td>{canCheck ? <input type="checkbox" aria-label={`${t.cols.inc} ${row.sku}`} checked={isChecked(row)} onChange={(e) => setIncluded((x) => ({ ...x, [row.key]: e.target.checked }))} /> : <span className="dm-muted">·</span>}</td>
                        <td><strong>{row.name}</strong><small>{row.sku}</small></td>
                        <td>{row.stockTo === null ? "—" : row.stockFrom === null ? `0 → ${row.stockTo}` : row.stockFrom === row.stockTo ? row.stockFrom : <><s>{row.stockFrom}</s> → <strong>{row.stockTo}</strong></>}</td>
                        <td>{row.priceTo === null ? money(row.priceFrom ?? 0, loc) : row.priceFrom === null ? <strong>{money(row.priceTo, loc)}</strong> : row.priceFrom === row.priceTo ? money(row.priceFrom, loc) : <><s>{money(row.priceFrom, loc)}</s> → <strong>{money(row.priceTo, loc)}</strong></>}</td>
                        <td className="dm-chips-cell">
                          {row.kind === "same" ? <Chip tone="mute">{t.same}</Chip> : null}
                          {row.kind === "missing" ? <Chip tone="mute">{t.missing}</Chip> : null}
                          {row.kind === "new" ? <Chip tone="orange">{t.newProd}</Chip> : null}
                          {row.kind === "update" && row.stockFrom !== row.stockTo ? <Chip tone="ink">{t.stockTag(row.stockFrom ?? 0, row.stockTo ?? 0)}</Chip> : null}
                          {row.kind === "update" && row.priceFrom !== row.priceTo ? <Chip tone="ink">{t.priceTag}</Chip> : null}
                          {row.kind === "update" && row.visFrom && !row.visTo ? <Chip tone={row.stockFrom === 0 ? "bad" : "warn"}>{row.stockFrom === 0 ? t.fix : t.hide}</Chip> : null}
                          {row.kind === "update" && !row.visFrom && row.visTo ? <Chip tone="good">{t.show}</Chip> : null}
                          {row.review ? <Chip tone="bad">{row.review}</Chip> : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {actionable.length > 0 && selected.length === 0 ? <p className="dm-hint">{t.none}</p> : null}
          </>
        )}
      </section>

      <ActionLog entries={entries} loc={loc} />
    </DemoFrame>
  );
}
