import { Fragment, useMemo, useState } from "react";
import { Check, Copy, Minus, Plus, Printer, Sparkles } from "lucide-react";
import { ActionLog, ApprovedStamp, Chip, DemoFrame, ErrorNote, Kpi, Spinner, exampleDate, money, useActionLog, useBusy, type Loc } from "./shared";

interface Product { sku: string; es: string; en: string; unit: { es: string; en: string }; price: number; tiers: Array<[number, number]>; kw: RegExp }
const TIERS_A: Array<[number, number]> = [[1, 0], [10, 6], [50, 12], [100, 18]];
const TIERS_B: Array<[number, number]> = [[1, 0], [12, 4], [48, 8], [120, 12]];

const CATALOG: Product[] = [
  { sku: "LIM-001", es: "Detergente concentrado 5 L", en: "Concentrated dish soap 5 L", unit: { es: "bidón", en: "jug" }, price: 9800, tiers: TIERS_A, kw: /detergent|dish soap/i },
  { sku: "LIM-002", es: "Lavandina 5 L", en: "Bleach 5 L", unit: { es: "bidón", en: "jug" }, price: 3600, tiers: TIERS_A, kw: /lavandin|bleach/i },
  { sku: "PAP-010", es: "Papel higiénico x 4 rollos", en: "Toilet paper 4 rolls", unit: { es: "pack", en: "pack" }, price: 4200, tiers: TIERS_B, kw: /papel|higi|rollo|toilet/i },
  { sku: "PAP-020", es: "Servilletas x 500", en: "Napkins x 500", unit: { es: "pack", en: "pack" }, price: 2900, tiers: TIERS_B, kw: /servilleta|napkin/i },
  { sku: "BOL-030", es: "Bolsas de residuos 90x120 x 10", en: "Trash bags 90x120 x 10", unit: { es: "paquete", en: "pack" }, price: 5100, tiers: TIERS_A, kw: /bolsa|residuo|trash|bag/i },
  { sku: "LIM-040", es: "Jabón líquido de manos 5 L", en: "Liquid hand soap 5 L", unit: { es: "bidón", en: "jug" }, price: 7300, tiers: TIERS_A, kw: /jab[oó]n|hand soap/i },
  { sku: "ACC-050", es: "Esponja doble uso x 3", en: "Scouring sponge x 3", unit: { es: "pack", en: "pack" }, price: 1800, tiers: TIERS_B, kw: /esponja|sponge/i },
  { sku: "LIM-060", es: "Desengrasante 5 L", en: "Degreaser 5 L", unit: { es: "bidón", en: "jug" }, price: 8900, tiers: TIERS_A, kw: /desengras|degreas/i },
];

const CLIENTS = [
  { id: "new", es: "Cliente nuevo (lista)", en: "New client (list)", disc: 0 },
  { id: "a", es: "Autoservicio Los Pinos · Mayorista A", en: "Los Pinos Grocery · Wholesale A", disc: 5 },
  { id: "b", es: "Cadena Norte · Distribuidor B", en: "Norte Chain · Distributor B", disc: 8 },
  { id: "vip", es: "Hotel Costanera · VIP", en: "Costanera Hotel · VIP", disc: 12 },
];

const T = {
  es: {
    label: "Cotizador y pedidos mayorista",
    whatsapp: "Pedido que entró por WhatsApp", waHelp: "Pegá un mensaje de un cliente. El agente arma el carrito con reglas simples y te muestra lo que no entendió.",
    waSample: "Hola! Necesito 60 detergente de 5 litros, 24 lavandina, 12 papel higiénico y 3 cajas de vino", parse: "Que el agente arme el pedido", parsing: "Leyendo el pedido…",
    notFound: (s: string) => `No encontré en el catálogo: "${s}". Revisalo con el cliente.`, nothing: "No encontré ningún producto con cantidad en ese mensaje.",
    client: "Cliente", transfer: "Pago por transferencia (-3%)", iva: "Sumar IVA 21%",
    catalog: "Catálogo y escalas por volumen", cols: { prod: "Producto", list: "Lista", tiers: "Escalas", qty: "Cantidad", price: "Precio aplicado", sub: "Subtotal" },
    tierLabel: (min: number, d: number) => (d === 0 ? "1+" : `${min}+ -${d}%`), nudge: (n: number, p: string, d: number) => `Sumá ${n} más y pasás a ${p} c/u (-${d}%)`,
    emptyCart: "El carrito está vacío. Sumá productos del catálogo o pegá un pedido de WhatsApp.",
    summary: "Resumen", subtotalList: "Subtotal a precio de lista", volDisc: "Descuento por volumen", clientDisc: "Descuento de cliente", transferDisc: "Descuento por transferencia", subtotal: "Subtotal", ivaLine: "IVA 21%", total: "Total",
    kpiItems: "Unidades", kpiSaved: "Ahorro del cliente", kpiTotal: "Total", kpiLines: "Productos",
    quote: "Cotización", valid: "Válida por 7 días", date: "Fecha", to: "Para", conditions: "Condiciones: precios en pesos, entrega en 48 h en CABA y GBA, stock sujeto a confirmación.", sampleTag: "DATOS DE EJEMPLO · DOCUMENTO ILUSTRATIVO",
    seller: "Distribuidora Ejemplo S.A.", cols2: { qty: "Cant.", desc: "Descripción", unit: "P. unit.", sub: "Subtotal" },
    msg: "Mensaje de WhatsApp", copy: "Copiar mensaje", copied: "Copiado", copyErr: "No pude copiar automáticamente. Seleccioná el texto del cuadro y copialo a mano.", print: "Imprimir / guardar PDF",
    approve: "Aprobar y enviar al cliente", approvedMsg: "Cotización aprobada (envío simulado)", newQuote: "Nueva cotización",
    logParsed: (n: number, u: number) => `Leí el pedido de WhatsApp y armé el carrito: ${n} productos, ${u} unidades.`, logApproved: (q: string, c: string, tot: string) => `Aprobaste la cotización ${q} para ${c} por ${tot} (envío simulado).`, logCopied: "Copiaste el mensaje de WhatsApp.", logClient: (c: string) => `Cambiaste el cliente a ${c}: recalculé descuentos.`,
    waGreeting: (c: string) => `Hola ${c}! Te paso la cotización`, waValid: "(válida por 7 días):", waTotal: "Total", waClose: "¿Te la confirmo? Puedo reservarte el stock hoy.",
  },
  en: {
    label: "Wholesale quotes and orders",
    whatsapp: "Order that came in on WhatsApp", waHelp: "Paste a client message. The agent builds the cart with simple rules and shows what it didn't understand.",
    waSample: "Hi! I need 60 dish soap 5 liter, 24 bleach, 12 toilet paper and 3 boxes of wine", parse: "Let the agent build the order", parsing: "Reading the order…",
    notFound: (s: string) => `Not found in the catalog: "${s}". Check it with the client.`, nothing: "I couldn't find any product with a quantity in that message.",
    client: "Client", transfer: "Pay by bank transfer (-3%)", iva: "Add 21% VAT",
    catalog: "Catalog and volume price tiers", cols: { prod: "Product", list: "List", tiers: "Tiers", qty: "Quantity", price: "Applied price", sub: "Subtotal" },
    tierLabel: (min: number, d: number) => (d === 0 ? "1+" : `${min}+ -${d}%`), nudge: (n: number, p: string, d: number) => `Add ${n} more to reach ${p} each (-${d}%)`,
    emptyCart: "The cart is empty. Add products from the catalog or paste a WhatsApp order.",
    summary: "Summary", subtotalList: "Subtotal at list price", volDisc: "Volume discount", clientDisc: "Client discount", transferDisc: "Transfer discount", subtotal: "Subtotal", ivaLine: "VAT 21%", total: "Total",
    kpiItems: "Units", kpiSaved: "Client savings", kpiTotal: "Total", kpiLines: "Products",
    quote: "Quote", valid: "Valid for 7 days", date: "Date", to: "For", conditions: "Terms: prices in pesos, delivery within 48 h in Buenos Aires, stock subject to confirmation.", sampleTag: "SAMPLE DATA · ILLUSTRATIVE DOCUMENT",
    seller: "Example Distributor Inc.", cols2: { qty: "Qty", desc: "Description", unit: "Unit price", sub: "Subtotal" },
    msg: "WhatsApp message", copy: "Copy message", copied: "Copied", copyErr: "I couldn't copy automatically. Select the text in the box and copy it by hand.", print: "Print / save as PDF",
    approve: "Approve and send to client", approvedMsg: "Quote approved (simulated send)", newQuote: "New quote",
    logParsed: (n: number, u: number) => `I read the WhatsApp order and built the cart: ${n} products, ${u} units.`, logApproved: (q: string, c: string, tot: string) => `You approved quote ${q} for ${c} totaling ${tot} (simulated send).`, logCopied: "You copied the WhatsApp message.", logClient: (c: string) => `You switched the client to ${c}: I recalculated discounts.`,
    waGreeting: (c: string) => `Hi ${c}! Here is the quote`, waValid: "(valid for 7 days):", waTotal: "Total", waClose: "Shall I confirm it? I can reserve the stock today.",
  },
};

function tierFor(p: Product, qty: number) {
  let current: [number, number] = p.tiers[0];
  for (const tier of p.tiers) if (qty >= tier[0]) current = tier;
  return current;
}

const INITIAL: Record<string, number> = { "LIM-001": 12, "PAP-010": 20 };

export default function QuoteDemo({ loc }: { loc: Loc }) {
  const t = T[loc];
  const [qty, setQty] = useState<Record<string, number>>(INITIAL);
  const [clientId, setClientId] = useState("a");
  const [transfer, setTransfer] = useState(true);
  const [iva, setIva] = useState(true);
  const [wa, setWa] = useState(t.waSample);
  const [parseMsg, setParseMsg] = useState<string[]>([]);
  const [quoteNo, setQuoteNo] = useState(1);
  const [approved, setApproved] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "err">("idle");
  const [msgOverride, setMsgOverride] = useState<string | null>(null);
  const { entries, push, clear } = useActionLog("quotes");
  const { busy, run } = useBusy();

  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];
  const q = `COT-${String(quoteNo).padStart(4, "0")}`;

  const calc = useMemo(() => {
    const lines = CATALOG.filter((p) => (qty[p.sku] ?? 0) > 0).map((p) => {
      const n = qty[p.sku];
      const [min, d] = tierFor(p, n);
      const unit = Math.round(p.price * (1 - d / 100));
      const next = p.tiers.find(([m]) => m > n);
      return { p, n, d, min, unit, list: p.price * n, vol: unit * n, next };
    });
    const list = lines.reduce((s, l) => s + l.list, 0);
    const vol = lines.reduce((s, l) => s + l.vol, 0);
    const volDisc = list - vol;
    const clientDisc = Math.round(vol * (client.disc / 100));
    const afterClient = vol - clientDisc;
    const transferDisc = transfer ? Math.round(afterClient * 0.03) : 0;
    const subtotal = afterClient - transferDisc;
    const ivaAmt = iva ? Math.round(subtotal * 0.21) : 0;
    const total = subtotal + ivaAmt;
    const units = lines.reduce((s, l) => s + l.n, 0);
    return { lines, list, volDisc, clientDisc, transferDisc, subtotal, ivaAmt, total, units, saved: list - subtotal };
  }, [qty, client.disc, transfer, iva]);

  const defaultMsg = useMemo(() => {
    const body = calc.lines.map((l) => `• ${l.n} x ${l.p[loc]}: ${money(l.unit * l.n, loc)}`).join("\n");
    return `${t.waGreeting(client.es.split(" · ")[0])} ${q} ${t.waValid}\n${body}\n${t.waTotal}${iva ? " (IVA incl.)" : ""}: ${money(calc.total, loc)}\n${t.waClose}`;
  }, [calc, client, iva, loc, q, t]);
  const message = msgOverride ?? defaultMsg;

  function touch() { setApproved(false); setMsgOverride(null); setCopyState("idle"); }
  function setLine(sku: string, n: number) { setQty((x) => ({ ...x, [sku]: Math.max(0, Math.min(9999, Math.round(n) || 0)) })); touch(); }

  function parseOrder() {
    run(() => {
      const next: Record<string, number> = {};
      const unknown: string[] = [];
      wa.split(/[,;\n]|\sy\s|\sand\s/i).map((s) => s.trim()).filter(Boolean).forEach((seg) => {
        const m = seg.match(/(\d+)/);
        if (!m) return;
        const product = CATALOG.find((p) => p.kw.test(seg));
        if (!product) { unknown.push(seg.replace(/^(hola!?|hi!?)\s*/i, "").replace(/^(necesito|i need)\s*/i, "")); return; }
        next[product.sku] = (next[product.sku] ?? 0) + Number(m[1]);
      });
      const found = Object.keys(next).length;
      const warnings = unknown.map((u) => t.notFound(u));
      if (!found) warnings.unshift(t.nothing);
      setParseMsg(warnings);
      if (found) {
        setQty(next); touch();
        push(t.logParsed(found, Object.values(next).reduce((a, b) => a + b, 0)), "agent");
      }
      warnings.forEach((w) => push(w, "warn"));
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopyState("ok"); push(t.logCopied, "info");
    } catch { setCopyState("err"); }
  }

  function approve() {
    setApproved(true);
    push(t.logApproved(q, client.es.split(" · ")[0], money(calc.total, loc)), "approved");
  }

  function reset() { setQty(INITIAL); setClientId("a"); setTransfer(true); setIva(true); setWa(t.waSample); setParseMsg([]); setQuoteNo(1); setApproved(false); setMsgOverride(null); setCopyState("idle"); clear(); }

  return (
    <DemoFrame loc={loc} label={t.label} onReset={reset}>
      <div className="dm-kpis">
        <Kpi label={t.kpiLines} value={String(calc.lines.length)} />
        <Kpi label={t.kpiItems} value={String(calc.units)} />
        <Kpi label={t.kpiSaved} value={money(calc.saved, loc)} tone="good" />
        <Kpi label={t.kpiTotal} value={money(calc.total, loc)} tone="warn" />
      </div>

      <section className="dm-panel" aria-label={t.whatsapp}>
        <h3 className="dm-panel-title">{t.whatsapp}</h3>
        <p className="dm-hint">{t.waHelp}</p>
        <label className="dm-field"><span className="dm-sr">{t.whatsapp}</span><textarea className="dm-input dm-textarea" rows={3} value={wa} onChange={(e) => setWa(e.target.value)} /></label>
        <div className="dm-row">
          <button type="button" className="dm-btn dm-btn-primary" onClick={parseOrder} disabled={busy || !wa.trim()}>{busy ? <Spinner label={t.parsing} /> : (<><Sparkles aria-hidden="true" size={16} />{t.parse}</>)}</button>
        </div>
        {parseMsg.map((m) => <Fragment key={m}><ErrorNote>{m}</ErrorNote></Fragment>)}
      </section>

      <section className="dm-panel" aria-label={t.catalog}>
        <div className="dm-row dm-row-between">
          <h3 className="dm-panel-title">{t.catalog}</h3>
          <div className="dm-row">
            <label className="dm-field dm-inline"><span>{t.client}</span>
              <select className="dm-input" value={clientId} onChange={(e) => { setClientId(e.target.value); touch(); const c = CLIENTS.find((x) => x.id === e.target.value); if (c) push(t.logClient(c[loc]), "info"); }}>
                {CLIENTS.map((c) => <option key={c.id} value={c.id}>{c[loc]}{c.disc ? ` (-${c.disc}%)` : ""}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead><tr><th>{t.cols.prod}</th><th>{t.cols.list}</th><th>{t.cols.tiers}</th><th>{t.cols.qty}</th><th>{t.cols.price}</th><th>{t.cols.sub}</th></tr></thead>
            <tbody>
              {CATALOG.map((p) => {
                const n = qty[p.sku] ?? 0;
                const line = calc.lines.find((l) => l.p.sku === p.sku);
                const nextTier = line?.next;
                const nextDisc = nextTier ? nextTier[1] : 0;
                const nudge = line && nextTier && nextTier[0] - n <= Math.max(3, Math.round(nextTier[0] * 0.3)) ? t.nudge(nextTier[0] - n, money(Math.round(p.price * (1 - nextDisc / 100)), loc), nextDisc) : null;
                return (
                  <tr key={p.sku} className={n > 0 ? "is-active" : ""}>
                    <td><strong>{p[loc]}</strong><small>{p.sku} · {p.unit[loc]}</small></td>
                    <td>{money(p.price, loc)}</td>
                    <td className="dm-chips-cell">{p.tiers.map(([min, d]) => <Fragment key={min}><Chip tone={line && line.min === min ? "orange" : "mute"}>{t.tierLabel(min, d)}</Chip></Fragment>)}</td>
                    <td>
                      <div className="dm-stepper">
                        <button type="button" aria-label={`- ${p[loc]}`} onClick={() => setLine(p.sku, n - 1)} disabled={n === 0}><Minus aria-hidden="true" size={14} /></button>
                        <input aria-label={`${t.cols.qty} ${p[loc]}`} inputMode="numeric" value={n} onChange={(e) => setLine(p.sku, Number(e.target.value.replace(/\D/g, "")))} />
                        <button type="button" aria-label={`+ ${p[loc]}`} onClick={() => setLine(p.sku, n + 1)}><Plus aria-hidden="true" size={14} /></button>
                      </div>
                      {nudge ? <small className="dm-nudge">{nudge}</small> : null}
                    </td>
                    <td>{line ? <><strong>{money(line.unit, loc)}</strong>{line.d ? <small>-{line.d}%</small> : null}</> : "—"}</td>
                    <td>{line ? <strong>{money(line.vol, loc)}</strong> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="dm-row">
          <label className="dm-check"><input type="checkbox" checked={transfer} onChange={(e) => { setTransfer(e.target.checked); touch(); }} />{t.transfer}</label>
          <label className="dm-check"><input type="checkbox" checked={iva} onChange={(e) => { setIva(e.target.checked); touch(); }} />{t.iva}</label>
        </div>
      </section>

      <div className="dm-grid-2">
        <section className="dm-panel dm-quote-wrap" aria-label={t.quote}>
          <h3 className="dm-panel-title">{t.quote}</h3>
          {calc.lines.length === 0 ? <p className="dm-empty">{t.emptyCart}</p> : (
            <article className="dm-quote-sheet">
              <header>
                <div><strong className="dm-quote-seller">{t.seller}</strong><small>{t.sampleTag}</small></div>
                <div className="dm-quote-no"><strong>{q}</strong><small>{t.date}: {exampleDate(0, loc)} · {t.valid}</small></div>
              </header>
              <p className="dm-quote-to">{t.to}: <strong>{client[loc]}</strong></p>
              <table>
                <thead><tr><th>{t.cols2.qty}</th><th>{t.cols2.desc}</th><th>{t.cols2.unit}</th><th>{t.cols2.sub}</th></tr></thead>
                <tbody>{calc.lines.map((l) => <tr key={l.p.sku}><td>{l.n}</td><td>{l.p[loc]}</td><td>{money(l.unit, loc)}</td><td>{money(l.vol, loc)}</td></tr>)}</tbody>
              </table>
              <dl className="dm-quote-totals">
                <div><dt>{t.subtotalList}</dt><dd>{money(calc.list, loc)}</dd></div>
                {calc.volDisc > 0 ? <div><dt>{t.volDisc}</dt><dd>-{money(calc.volDisc, loc)}</dd></div> : null}
                {calc.clientDisc > 0 ? <div><dt>{t.clientDisc} ({client.disc}%)</dt><dd>-{money(calc.clientDisc, loc)}</dd></div> : null}
                {calc.transferDisc > 0 ? <div><dt>{t.transferDisc}</dt><dd>-{money(calc.transferDisc, loc)}</dd></div> : null}
                <div><dt>{t.subtotal}</dt><dd>{money(calc.subtotal, loc)}</dd></div>
                {calc.ivaAmt > 0 ? <div><dt>{t.ivaLine}</dt><dd>{money(calc.ivaAmt, loc)}</dd></div> : null}
                <div className="is-total"><dt>{t.total}</dt><dd>{money(calc.total, loc)}</dd></div>
              </dl>
              <p className="dm-quote-terms">{t.conditions}</p>
            </article>
          )}
        </section>

        <section className="dm-panel" aria-label={t.msg}>
          <h3 className="dm-panel-title">{t.msg}</h3>
          <label className="dm-field"><span className="dm-sr">{t.msg}</span>
            <textarea className="dm-input dm-textarea dm-mono" rows={10} value={calc.lines.length ? message : ""} onChange={(e) => setMsgOverride(e.target.value)} disabled={!calc.lines.length} placeholder={t.emptyCart} />
          </label>
          {copyState === "err" ? <ErrorNote>{t.copyErr}</ErrorNote> : null}
          <div className="dm-row">
            <button type="button" className="dm-btn dm-btn-ghost" onClick={copy} disabled={!calc.lines.length}>{copyState === "ok" ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}{copyState === "ok" ? t.copied : t.copy}</button>
            <button type="button" className="dm-btn dm-btn-ghost" onClick={() => window.print()} disabled={!calc.lines.length}><Printer aria-hidden="true" size={16} />{t.print}</button>
          </div>
          <div className="dm-row">
            {approved ? (
              <>
                <ApprovedStamp>{t.approvedMsg}</ApprovedStamp>
                <button type="button" className="dm-btn dm-btn-ink" onClick={() => { setQuoteNo((n) => n + 1); setQty({}); setApproved(false); setMsgOverride(null); setParseMsg([]); }}>{t.newQuote}</button>
              </>
            ) : <button type="button" className="dm-btn dm-btn-primary" onClick={approve} disabled={!calc.lines.length}><Check aria-hidden="true" size={16} />{t.approve}</button>}
          </div>
        </section>
      </div>

      <ActionLog entries={entries} loc={loc} />
    </DemoFrame>
  );
}
