/**
 * Pure checks behind the "Facturas de compra de tus clientes" demo (also unit-tested in scripts/test-demos-rubros.mjs).
 * Sample data only: nothing here talks to ARCA or to any external service.
 */

export interface PurchaseInvoice {
  id: string;
  file: string;
  emisor: string;
  cuit: string;
  /** Punto de venta + número, e.g. "0003-00018422". Empty when the reading was not legible. */
  numero: string;
  neto: number;
  iva: number;
  /** Percepción de IIBB charged on the invoice. */
  perc: number;
  /** Rate the studio has on file for this supplier (in percent). 0 when none applies. */
  percRate: number;
  total: number;
  cae: string;
}

export type AlertCode = "cuit-missing" | "cuit-invalid" | "cae-invalid" | "duplicate" | "total" | "iva" | "perc";

export interface InvoiceAlert {
  code: AlertCode;
  /** Numeric detail for the message, when it has one (expected amount, original row id, etc.). */
  value?: number | string;
}

export const IVA_RATE = 0.21;

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/** CUIT/CUIL check digit (módulo 11). */
export function isValidCuit(raw: string) {
  const d = digitsOnly(raw);
  if (d.length !== 11) return false;
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, w, i) => acc + w * Number(d[i]), 0);
  let check = 11 - (sum % 11);
  if (check === 11) check = 0;
  if (check === 10) return false;
  return check === Number(d[10]);
}

export function formatCuit(raw: string) {
  const d = digitsOnly(raw);
  if (d.length !== 11) return raw;
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
}

/** A CAE has exactly 14 digits. */
export function isValidCae(raw: string) {
  return /^\d{14}$/.test(raw.trim());
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function expectedIva(neto: number) {
  return round2(neto * IVA_RATE);
}

export function expectedPerc(neto: number, ratePercent: number) {
  return round2((neto * ratePercent) / 100);
}

/** Identity of a document for duplicate detection: same emisor CUIT and same número. */
export function duplicateKey(inv: Pick<PurchaseInvoice, "cuit" | "numero">) {
  const cuit = digitsOnly(inv.cuit);
  const numero = inv.numero.replace(/\s/g, "");
  if (!cuit || !numero) return null;
  return `${cuit}|${numero}`;
}

/** Alerts for every invoice of a batch. A duplicate points at the first row that carries the same key. */
export function checkBatch(rows: PurchaseInvoice[]): Record<string, InvoiceAlert[]> {
  const seen = new Map<string, string>();
  const result: Record<string, InvoiceAlert[]> = {};
  for (const row of rows) {
    const alerts: InvoiceAlert[] = [];
    if (!digitsOnly(row.cuit)) alerts.push({ code: "cuit-missing" });
    else if (!isValidCuit(row.cuit)) alerts.push({ code: "cuit-invalid" });
    if (!isValidCae(row.cae)) alerts.push({ code: "cae-invalid" });
    const key = duplicateKey(row);
    if (key) {
      const first = seen.get(key);
      if (first) alerts.push({ code: "duplicate", value: first });
      else seen.set(key, row.id);
    }
    if (Math.abs(row.iva - expectedIva(row.neto)) > 1) alerts.push({ code: "iva", value: expectedIva(row.neto) });
    if (row.percRate > 0 || row.perc > 0) {
      const want = expectedPerc(row.neto, row.percRate);
      if (Math.abs(row.perc - want) > 1) alerts.push({ code: "perc", value: want });
    }
    if (Math.abs(round2(row.neto + row.iva + row.perc) - row.total) > 1) alerts.push({ code: "total", value: round2(row.neto + row.iva + row.perc) });
    result[row.id] = alerts;
  }
  return result;
}

/** Spreadsheet export (what the studio imports). Semicolon-separated, comma decimals, as Argentine Excel expects. */
export function toCsv(rows: PurchaseInvoice[]) {
  const num = (n: number) => n.toFixed(2).replace(".", ",");
  const head = ["Emisor", "CUIT", "Comprobante", "Neto", "IVA 21%", "Percepción IIBB", "Total", "CAE"];
  const lines = rows.map((r) => [r.emisor, formatCuit(r.cuit), r.numero, num(r.neto), num(r.iva), num(r.perc), num(r.total), r.cae]
    .map((cell) => (/[;"\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(";"));
  return [head.join(";"), ...lines].join("\r\n");
}

/** Nine documents a client uploaded for the month. Invented suppliers, CUITs with a valid check digit unless the row is meant to fail. */
export const SAMPLE_BATCH: PurchaseInvoice[] = [
  { id: "d1", file: "factura-0003-18422.pdf", emisor: "Papelera Río Seco S.R.L.", cuit: "30-55667789-8", numero: "0003-00018422", neto: 250000, iva: 52500, perc: 7500, percRate: 3, total: 310000, cae: "74123456789012" },
  { id: "d2", file: "factura-0012-04417.pdf", emisor: "Distribuidora Del Valle S.R.L.", cuit: "30-11223344-6", numero: "0012-00004417", neto: 313200, iva: 65772, perc: 0, percRate: 0, total: 378972, cae: "74223344556677" },
  { id: "d3", file: "factura-0005-91230.pdf", emisor: "Corralón Los Ceibos S.A.", cuit: "30-70123456-8", numero: "0005-00091230", neto: 180000, iva: 37800, perc: 5400, percRate: 3, total: 223200, cae: "74556677889900" },
  { id: "d4", file: "factura-0003-18422 (copia).pdf", emisor: "Papelera Río Seco S.R.L.", cuit: "30-55667789-8", numero: "0003-00018422", neto: 250000, iva: 52500, perc: 7500, percRate: 3, total: 310000, cae: "74123456789012" },
  { id: "d5", file: "factura-0001-07731.pdf", emisor: "Transporte Pampa Alta S.A.", cuit: "30-71456789-2", numero: "0001-00007731", neto: 96000, iva: 20160, perc: 3000, percRate: 3, total: 119160, cae: "74667788990011" },
  { id: "d6", file: "ticket-libreria.jpg", emisor: "Librería La Cumbre S.R.L.", cuit: "30-68901234-7", numero: "0002-00003388", neto: 42000, iva: 8820, perc: 0, percRate: 0, total: 50820, cae: "74778899001122" },
  { id: "d7", file: "factura-0008-12005.pdf", emisor: "Servicios Técnicos Bahía S.A.", cuit: "30-64321099-8", numero: "0008-00012005", neto: 120000, iva: 25200, perc: 3600, percRate: 3, total: 148800, cae: "7412345678" },
  { id: "d8", file: "foto-factura-mayorista.jpg", emisor: "Mayorista Cerro Verde S.A.", cuit: "", numero: "0004-00055102", neto: 75000, iva: 15750, perc: 0, percRate: 0, total: 91000, cae: "74998877665544" },
  { id: "d9", file: "factura-0010-20019.pdf", emisor: "Insumos Lomas Altas S.R.L.", cuit: "30-50987654-8", numero: "0010-00020019", neto: 66500, iva: 13965, perc: 1995, percRate: 3, total: 82460, cae: "74112233445566" },
];
