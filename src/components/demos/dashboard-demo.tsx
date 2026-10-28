import type * as React from "react";
import { useMemo, useState } from "react";
import { Check, ExternalLink, Plus, Sparkles, Truck } from "lucide-react";
import { ActionLog, ApprovedStamp, Chip, DemoFrame, ErrorNote, Kpi, Spinner, exampleDate, money, num, useActionLog, useBusy, type Loc } from "./shared";
import { trackEvent } from "../marketing";

export const GUMROAD_KIT_URL = "https://punatech.gumroad.com/l/kit-gestion-comercio-ar";

function rng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

interface Day { offset: number; label: { es: string; en: string }; sales: number; orders: number }
const DAYS_N = 30;
const SALES: Day[] = (() => {
  const r = rng(2610);
  const weekday = [0.7, 0.95, 0.9, 0.95, 1.05, 1.35, 1.25]; // Sun..Sat
  return Array.from({ length: DAYS_N }, (_, i) => {
    const offset = i - DAYS_N;
    const dow = new Date(Date.UTC(2026, 9, 27) + offset * 86_400_000).getUTCDay();
    const sales = Math.round((235000 * weekday[dow] * (0.88 + r() * 0.26)) / 100) * 100;
    return { offset, label: { es: exampleDate(offset, "es"), en: exampleDate(offset, "en") }, sales, orders: Math.round(sales / (8800 + r() * 2400)) };
  });
})();

const SHARE = {
  categories: [["Almacén", "Grocery", 38], ["Bebidas", "Drinks", 27], ["Limpieza", "Cleaning", 14], ["Fiambrería", "Deli", 12], ["Otros", "Other", 9]] as const,
  payments: [["Efectivo", "Cash", 34, "#181410"], ["Transferencia / MP", "Transfer / MP", 31, "#ff6b00"], ["Débito", "Debit", 20, "#702b38"], ["Crédito", "Credit", 15, "#b4a597"]] as const,
  top: [["Yerba 1 kg", "Yerba mate 1 kg", 11], ["Gaseosa cola 2,25 L", "Cola 2.25 L", 9], ["Leche entera 1 L", "Whole milk 1 L", 8], ["Fideos 500 g", "Pasta 500 g", 7], ["Aceite girasol 900 ml", "Sunflower oil 900 ml", 6], ["Pan lactal", "Sliced bread", 5], ["Jamón cocido 100 g", "Cooked ham 100 g", 5], ["Detergente 750 ml", "Dish soap 750 ml", 4]] as const,
};

interface StockItem { sku: string; es: string; en: string; stock: number; min: number; target: number; cost: number; supplier: string }
const STOCK: StockItem[] = [
  { sku: "S1", es: "Yerba 1 kg", en: "Yerba mate 1 kg", stock: 14, min: 20, target: 60, cost: 3100, supplier: "Distribuidora Norte" },
  { sku: "S2", es: "Gaseosa cola 2,25 L", en: "Cola 2.25 L", stock: 48, min: 36, target: 96, cost: 1900, supplier: "Bebidas del Plata" },
  { sku: "S3", es: "Leche entera 1 L", en: "Whole milk 1 L", stock: 9, min: 24, target: 72, cost: 1250, supplier: "Lácteos San Jorge" },
  { sku: "S4", es: "Fideos 500 g", en: "Pasta 500 g", stock: 62, min: 30, target: 90, cost: 980, supplier: "Distribuidora Norte" },
  { sku: "S5", es: "Aceite girasol 900 ml", en: "Sunflower oil 900 ml", stock: 11, min: 18, target: 48, cost: 2300, supplier: "Distribuidora Norte" },
  { sku: "S6", es: "Pan lactal", en: "Sliced bread", stock: 6, min: 12, target: 30, cost: 1700, supplier: "Panificadora Sur" },
  { sku: "S7", es: "Jamón cocido 100 g", en: "Cooked ham 100 g", stock: 40, min: 20, target: 60, cost: 1500, supplier: "Fiambres Doña Rosa" },
  { sku: "S8", es: "Detergente 750 ml", en: "Dish soap 750 ml", stock: 33, min: 15, target: 45, cost: 1450, supplier: "Distribuidora Norte" },
];

interface Move { id: number; kind: "in" | "out"; concept: string; amount: number }
const MOVES: Move[] = [
  { id: 1, kind: "in", concept: "Apertura de caja", amount: 85000 },
  { id: 2, kind: "in", concept: "Ventas en efectivo (mañana)", amount: 142300 },
  { id: 3, kind: "out", concept: "Pago proveedor panificados", amount: 96000 },
  { id: 4, kind: "out", concept: "Retiro del dueño", amount: 20000 },
];

const T = {
  es: {
    label: "Panel de gestión para comercio", range: "Período", days: (n: number) => `${n} días`,
    kpiSales: "Ventas", kpiTicket: "Ticket promedio", kpiMargin: "Margen estimado", kpiOrders: "Operaciones",
    vs: (p: number) => `${p >= 0 ? "+" : ""}${p}% vs período anterior`,
    chart: "Ventas por día", chartLabel: (n: number, total: string) => `Gráfico de barras de ventas de los últimos ${n} días. Total ${total}.`, best: "Mejor día", worst: "Día más flojo",
    payments: "Cómo cobran tus clientes", categories: "Ventas por rubro", top: "Productos más vendidos",
    stock: "Stock", low: "Stock bajo", ok: "OK", units: "u.", min: "mínimo", onTheWay: "En camino",
    prepare: "Que el agente prepare la reposición", preparing: "Armando pedidos a proveedores…", poTitle: "Pedido de reposición sugerido", poEmpty: "Todo el stock está arriba del mínimo. No hace falta reponer.", poNone: "El agente todavía no armó ningún pedido.", poApprove: "Aprobar y enviar a proveedores", poApproved: "Pedidos aprobados (envío simulado)", poTotal: "Total del pedido",
    caja: "Caja del día", cajaIn: "Ingresos", cajaOut: "Egresos", cajaBalance: "Efectivo esperado en caja",
    addMove: "Registrar movimiento", concept: "Concepto", amount: "Monto", kind: "Tipo", kindIn: "Ingreso", kindOut: "Egreso", add: "Agregar",
    errConcept: "Escribí un concepto.", errAmount: "Poné un monto mayor a cero.",
    close: "Cierre de caja", counted: "Efectivo contado", closeBtn: "Cerrar caja", closed: "Caja cerrada por vos", diffOk: "Sin diferencia", diff: (d: string) => `Diferencia de ${d}: dejo la nota para revisar`, closeErr: "Ingresá el efectivo contado.",
    movements: "Movimientos",
    kit: "Kit Gestión Comercio AR", kitBody: "La planilla de stock, ventas, caja y precios que ordena todo esto, lista para usar. US$ 7, pago único.", kitCta: "Ver el kit en Gumroad",
    logPo: (n: number, t: string) => `Detecté ${n} productos bajo el mínimo y armé pedidos por ${t}.`, logPoOk: (t: string) => `Aprobaste los pedidos de reposición por ${t} (envío simulado).`, logMove: (k: string, c: string, a: string) => `Registraste un ${k}: ${c} por ${a}.`, logClose: (d: string) => `Cerraste la caja. ${d}`, logRange: (n: number) => `Cambiaste el período a ${n} días.`,
  },
  en: {
    label: "Store management dashboard", range: "Period", days: (n: number) => `${n} days`,
    kpiSales: "Sales", kpiTicket: "Average ticket", kpiMargin: "Estimated margin", kpiOrders: "Transactions",
    vs: (p: number) => `${p >= 0 ? "+" : ""}${p}% vs previous period`,
    chart: "Sales per day", chartLabel: (n: number, total: string) => `Bar chart of sales for the last ${n} days. Total ${total}.`, best: "Best day", worst: "Slowest day",
    payments: "How customers pay", categories: "Sales by category", top: "Top products",
    stock: "Stock", low: "Low stock", ok: "OK", units: "u.", min: "minimum", onTheWay: "On the way",
    prepare: "Let the agent prepare restocking", preparing: "Building supplier orders…", poTitle: "Suggested restock order", poEmpty: "All stock is above the minimum. No need to restock.", poNone: "The agent hasn't built any order yet.", poApprove: "Approve and send to suppliers", poApproved: "Orders approved (simulated send)", poTotal: "Order total",
    caja: "Daily cash register", cajaIn: "Cash in", cajaOut: "Cash out", cajaBalance: "Expected cash in drawer",
    addMove: "Log a movement", concept: "Description", amount: "Amount", kind: "Type", kindIn: "Cash in", kindOut: "Cash out", add: "Add",
    errConcept: "Enter a description.", errAmount: "Enter an amount above zero.",
    close: "Close the register", counted: "Counted cash", closeBtn: "Close register", closed: "Register closed by you", diffOk: "No difference", diff: (d: string) => `Difference of ${d}: I'll leave a note to review`, closeErr: "Enter the counted cash.",
    movements: "Movements",
    kit: "Kit Gestión Comercio AR", kitBody: "The stock, sales, cash and pricing spreadsheet that keeps all of this in order, ready to use. US$7, one-time payment. (Spanish only.)", kitCta: "See the kit on Gumroad",
    logPo: (n: number, t: string) => `I found ${n} products under the minimum and built orders for ${t}.`, logPoOk: (t: string) => `You approved the restock orders for ${t} (simulated send).`, logMove: (k: string, c: string, a: string) => `You logged a ${k}: ${c} for ${a}.`, logClose: (d: string) => `You closed the register. ${d}`, logRange: (n: number) => `You changed the period to ${n} days.`,
  },
};

export default function DashboardDemo({ loc }: { loc: Loc }) {
  const t = T[loc];
  const [range, setRange] = useState(14);
  const stock = STOCK;
  const [po, setPo] = useState<null | Array<{ item: StockItem; qty: number }>>(null);
  const [poApproved, setPoApproved] = useState(false);
  const [incoming, setIncoming] = useState<string[]>([]);
  const [moves, setMoves] = useState<Move[]>(MOVES);
  const [form, setForm] = useState({ kind: "in" as "in" | "out", concept: "", amount: "" });
  const [formErr, setFormErr] = useState<{ concept?: string; amount?: string }>({});
  const [counted, setCounted] = useState("");
  const [closeErr, setCloseErr] = useState("");
  const [closed, setClosed] = useState<null | { diff: number }>(null);
  const { entries, push, clear } = useActionLog("dashboard");
  const { busy, run } = useBusy();

  const stats = useMemo(() => {
    const cur = SALES.slice(-range);
    const prev = SALES.slice(-range * 2, -range);
    const total = cur.reduce((s, d) => s + d.sales, 0);
    const prevTotal = prev.reduce((s, d) => s + d.sales, 0);
    const orders = cur.reduce((s, d) => s + d.orders, 0);
    const max = Math.max(...cur.map((d) => d.sales));
    const best = cur.reduce((a, b) => (b.sales > a.sales ? b : a));
    const worst = cur.reduce((a, b) => (b.sales < a.sales ? b : a));
    return { cur, total, orders, ticket: Math.round(total / orders), max, best, worst, delta: prevTotal ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0 };
  }, [range]);

  const cajaIn = moves.filter((m) => m.kind === "in").reduce((s, m) => s + m.amount, 0);
  const cajaOut = moves.filter((m) => m.kind === "out").reduce((s, m) => s + m.amount, 0);
  const expected = cajaIn - cajaOut;
  const low = stock.filter((s) => s.stock < s.min);

  // Bar chart geometry
  const W = 640, H = 220, padL = 8, padB = 26, padT = 10;
  const bw = (W - padL * 2) / stats.cur.length;

  function prepare() {
    run(() => {
      const items = stock.filter((s) => s.stock < s.min).map((item) => ({ item, qty: item.target - item.stock }));
      setPo(items); setPoApproved(false);
      const total = items.reduce((s, x) => s + x.qty * x.item.cost, 0);
      push(t.logPo(items.length, money(total, loc)), "agent");
    });
  }
  function approvePo() {
    if (!po) return;
    const total = po.reduce((s, x) => s + x.qty * x.item.cost, 0);
    setPoApproved(true);
    push(t.logPoOk(money(total, loc)), "approved");
  }
  function addMove(ev: React.FormEvent) {
    ev.preventDefault();
    const err: typeof formErr = {};
    const amount = Number(form.amount.replace(",", "."));
    if (!form.concept.trim()) err.concept = t.errConcept;
    if (!Number.isFinite(amount) || amount <= 0) err.amount = t.errAmount;
    setFormErr(err);
    if (err.concept || err.amount) return;
    setMoves((m) => [...m, { id: m.reduce((n, x) => Math.max(n, x.id), 0) + 1, kind: form.kind, concept: form.concept.trim(), amount: Math.round(amount) }]);
    push(t.logMove(form.kind === "in" ? t.kindIn.toLowerCase() : t.kindOut.toLowerCase(), form.concept.trim(), money(Math.round(amount), loc)), "info");
    setForm({ ...form, concept: "", amount: "" }); setClosed(null);
  }
  function closeRegister() {
    const c = Number(counted.replace(",", "."));
    if (counted.trim() === "" || !Number.isFinite(c) || c < 0) { setCloseErr(t.closeErr); return; }
    setCloseErr("");
    const diff = Math.round(c) - expected;
    setClosed({ diff });
    push(t.logClose(diff === 0 ? t.diffOk : t.diff(money(diff, loc))), "approved");
  }
  function reset() { setRange(14); setIncoming([]); setPo(null); setPoApproved(false); setMoves(MOVES); setForm({ kind: "in", concept: "", amount: "" }); setFormErr({}); setCounted(""); setCloseErr(""); setClosed(null); clear(); }

  // donut
  const R = 54, C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <DemoFrame loc={loc} label={t.label} onReset={reset}>
      <div className="dm-row dm-row-between">
        <div className="dm-chips" role="group" aria-label={t.range}>
          {[7, 14, 30].map((n) => <button key={n} type="button" className={`dm-pill${range === n ? " is-on" : ""}`} aria-pressed={range === n} onClick={() => { setRange(n); push(t.logRange(n), "info"); }}>{t.days(n)}</button>)}
        </div>
      </div>

      <div className="dm-kpis">
        <Kpi label={t.kpiSales} value={money(stats.total, loc)} sub={t.vs(stats.delta)} tone={stats.delta >= 0 ? "good" : "bad"} />
        <Kpi label={t.kpiTicket} value={money(stats.ticket, loc)} />
        <Kpi label={t.kpiMargin} value={money(Math.round(stats.total * 0.31), loc)} sub="31%" tone="warn" />
        <Kpi label={t.kpiOrders} value={num(stats.orders, loc)} />
      </div>

      <div className="dm-grid-2 dm-grid-2-wide">
        <section className="dm-panel" aria-label={t.chart}>
          <h3 className="dm-panel-title">{t.chart}</h3>
          <svg className="dm-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.chartLabel(range, money(stats.total, loc))} preserveAspectRatio="xMidYMid meet">
            {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={padL} x2={W - padL} y1={padT + (H - padB - padT) * (1 - g)} y2={padT + (H - padB - padT) * (1 - g)} stroke="#d9d0bd" strokeDasharray="3 4" />)}
            {stats.cur.map((d, i) => {
              const h = ((H - padB - padT) * d.sales) / stats.max;
              const isBest = d === stats.best;
              return (
                <g key={d.offset}>
                  <rect x={padL + i * bw + bw * 0.14} y={H - padB - h} width={bw * 0.72} height={h} fill={isBest ? "#ff6b00" : "#181410"} rx="2"><title>{`${d.label[loc]}: ${money(d.sales, loc)}`}</title></rect>
                  {(range <= 14 || i % 5 === 0) ? <text x={padL + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#4d433a">{d.label[loc]}</text> : null}
                </g>
              );
            })}
          </svg>
          <p className="dm-hint">{t.best}: <strong>{stats.best.label[loc]}</strong> ({money(stats.best.sales, loc)}) · {t.worst}: <strong>{stats.worst.label[loc]}</strong> ({money(stats.worst.sales, loc)})</p>
        </section>

        <section className="dm-panel" aria-label={t.payments}>
          <h3 className="dm-panel-title">{t.payments}</h3>
          <div className="dm-donut-row">
            <svg viewBox="0 0 140 140" className="dm-donut" role="img" aria-label={SHARE.payments.map((p) => `${p[loc === "es" ? 0 : 1]} ${p[2]}%`).join(", ")}>
              <g transform="rotate(-90 70 70)">
                {SHARE.payments.map((p) => {
                  const len = (p[2] / 100) * C;
                  const el = <circle key={p[0]} cx="70" cy="70" r={R} fill="none" stroke={p[3]} strokeWidth="22" strokeDasharray={`${len - 1.5} ${C - len + 1.5}`} strokeDashoffset={-acc} />;
                  acc += len;
                  return el;
                })}
              </g>
              <text x="70" y="68" textAnchor="middle" fontSize="11" fill="#4d433a">{t.kpiSales}</text>
              <text x="70" y="84" textAnchor="middle" fontSize="13" fontWeight="700" fill="#181410">{range}d</text>
            </svg>
            <ul className="dm-legend">{SHARE.payments.map((p) => <li key={p[0]}><span style={{ background: p[3] }} aria-hidden="true" />{p[loc === "es" ? 0 : 1]} <strong>{p[2]}%</strong></li>)}</ul>
          </div>
        </section>
      </div>

      <div className="dm-grid-2">
        <section className="dm-panel" aria-label={t.categories}>
          <h3 className="dm-panel-title">{t.categories}</h3>
          <ul className="dm-bars">{SHARE.categories.map((c) => (
            <li key={c[0]}><span>{c[loc === "es" ? 0 : 1]}</span><div className="dm-bar"><i style={{ width: `${c[2] * 2.2}%` }} /></div><strong>{money(Math.round((stats.total * c[2]) / 100), loc)}</strong></li>
          ))}</ul>
        </section>
        <section className="dm-panel" aria-label={t.top}>
          <h3 className="dm-panel-title">{t.top}</h3>
          <ol className="dm-bars dm-bars-num">{SHARE.top.map((c, i) => (
            <li key={c[0]}><span>{i + 1}. {c[loc === "es" ? 0 : 1]}</span><div className="dm-bar"><i style={{ width: `${c[2] * 8}%` }} /></div><strong>{money(Math.round((stats.total * c[2]) / 100), loc)}</strong></li>
          ))}</ol>
        </section>
      </div>

      <section className="dm-panel" aria-label={t.stock}>
        <div className="dm-row dm-row-between">
          <h3 className="dm-panel-title">{t.stock}</h3>
          <button type="button" className="dm-btn dm-btn-primary" onClick={prepare} disabled={busy}>{busy ? <Spinner label={t.preparing} /> : (<><Sparkles aria-hidden="true" size={16} />{t.prepare}</>)}</button>
        </div>
        <div className="dm-table-wrap">
          <table className="dm-table dm-table-tight">
            <thead><tr><th>{t.stock}</th><th>{t.units}</th><th>{t.min}</th><th /></tr></thead>
            <tbody>{stock.map((s) => (
              <tr key={s.sku} className={s.stock < s.min ? "is-review" : ""}>
                <td><strong>{s[loc]}</strong><small>{s.supplier}</small></td>
                <td>{s.stock}</td><td>{s.min}</td>
                <td className="dm-chips-cell">{incoming.includes(s.sku) ? <Chip tone="warn">{t.onTheWay}</Chip> : s.stock < s.min ? <Chip tone="bad">{t.low}</Chip> : <Chip tone="good">{t.ok}</Chip>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="dm-po" aria-live="polite">
          {busy ? <p className="dm-empty"><Spinner label={t.preparing} /></p> : po === null ? <p className="dm-empty">{t.poNone}</p> : po.length === 0 ? <p className="dm-empty">{t.poEmpty}</p> : (
            <>
              <h4 className="dm-sub"><Truck aria-hidden="true" size={16} /> {t.poTitle}</h4>
              <ul className="dm-parts">{po.map((x) => <li key={x.item.sku}><span>{x.qty} × {x.item[loc]} <small>({x.item.supplier})</small></span><strong>{money(x.qty * x.item.cost, loc)}</strong></li>)}</ul>
              <p><strong>{t.poTotal}: {money(po.reduce((s, x) => s + x.qty * x.item.cost, 0), loc)}</strong></p>
              {poApproved ? <ApprovedStamp>{t.poApproved}</ApprovedStamp> : <button type="button" className="dm-btn dm-btn-primary" onClick={() => { approvePo(); setIncoming(po.map((x) => x.item.sku)); }}><Check aria-hidden="true" size={16} />{t.poApprove}</button>}
            </>
          )}
        </div>
      </section>

      <div className="dm-grid-2">
        <section className="dm-panel" aria-label={t.caja}>
          <h3 className="dm-panel-title">{t.caja}</h3>
          <div className="dm-kpis dm-kpis-3">
            <Kpi label={t.cajaIn} value={money(cajaIn, loc)} tone="good" />
            <Kpi label={t.cajaOut} value={money(cajaOut, loc)} tone="bad" />
            <Kpi label={t.cajaBalance} value={money(expected, loc)} />
          </div>
          <h4 className="dm-sub">{t.movements}</h4>
          <ul className="dm-parts dm-moves">{moves.map((m) => <li key={m.id}><span>{m.concept}</span><strong className={m.kind === "in" ? "dm-good" : "dm-bad"}>{m.kind === "in" ? "+" : "-"}{money(m.amount, loc)}</strong></li>)}</ul>
        </section>

        <section className="dm-panel" aria-label={t.addMove}>
          <h3 className="dm-panel-title">{t.addMove}</h3>
          <form onSubmit={addMove} noValidate className="dm-form-grid">
            <label className="dm-field"><span>{t.kind}</span><select className="dm-input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as "in" | "out" })}><option value="in">{t.kindIn}</option><option value="out">{t.kindOut}</option></select></label>
            <label className="dm-field"><span>{t.amount}</span><input className="dm-input" inputMode="decimal" value={form.amount} onChange={(e) => { setForm({ ...form, amount: e.target.value }); setFormErr((x) => ({ ...x, amount: undefined })); }} aria-invalid={Boolean(formErr.amount)} />{formErr.amount ? <ErrorNote>{formErr.amount}</ErrorNote> : null}</label>
            <label className="dm-field dm-span-2"><span>{t.concept}</span><input className="dm-input" value={form.concept} onChange={(e) => { setForm({ ...form, concept: e.target.value }); setFormErr((x) => ({ ...x, concept: undefined })); }} aria-invalid={Boolean(formErr.concept)} />{formErr.concept ? <ErrorNote>{formErr.concept}</ErrorNote> : null}</label>
            <div className="dm-row dm-span-2"><button type="submit" className="dm-btn dm-btn-ink"><Plus aria-hidden="true" size={16} />{t.add}</button></div>
          </form>
          <h4 className="dm-sub">{t.close}</h4>
          <div className="dm-row">
            <label className="dm-field dm-inline"><span>{t.counted}</span><input className="dm-input dm-input-sm" inputMode="decimal" value={counted} onChange={(e) => { setCounted(e.target.value); setCloseErr(""); }} /></label>
            {closed ? <ApprovedStamp>{t.closed}</ApprovedStamp> : <button type="button" className="dm-btn dm-btn-primary" onClick={closeRegister}><Check aria-hidden="true" size={16} />{t.closeBtn}</button>}
          </div>
          {closeErr ? <ErrorNote>{closeErr}</ErrorNote> : null}
          {closed ? <p role="status" className={closed.diff === 0 ? "dm-note-ok" : "dm-bad"}>{closed.diff === 0 ? t.diffOk : t.diff(money(closed.diff, loc))}</p> : null}
        </section>
      </div>

      <ActionLog entries={entries} loc={loc} />
    </DemoFrame>
  );
}

export function GumroadKitCta({ loc }: { loc: Loc }) {
  const t = T[loc];
  return (
    <a className="dm-btn dm-btn-primary" href={GUMROAD_KIT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("cta_click", { locale: loc, placement: "demo_dashboard", destination: "gumroad_kit" })}>
      {t.kitCta}<ExternalLink aria-hidden="true" size={16} />
    </a>
  );
}

export function GumroadKitBox({ loc }: { loc: Loc }) {
  const t = T[loc];
  return (
    <section className="dm-kit" aria-label={t.kit}>
      <div><h3 className="dm-h3">{t.kit}</h3><p>{t.kitBody}</p></div>
      <GumroadKitCta loc={loc} />
    </section>
  );
}
