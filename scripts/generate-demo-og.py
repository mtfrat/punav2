#!/usr/bin/env python3
"""Generate the 1200x630 Open Graph images for /demos (free, code-only, Pillow).

Usage: python3 scripts/generate-demo-og.py
Fonts: Anton (OFL) for headlines, Atkinson Hyperlegible for small text.
Override locations with ANTON_TTF / BODY_TTF env vars.
"""
import os
from PIL import Image, ImageDraw, ImageFont

ANTON = os.environ.get("ANTON_TTF", "/workspace/fonts/Anton-Regular.ttf")
BODY = os.environ.get("BODY_TTF", "/workspace/fonts/AtkinsonHyperlegible-Bold.ttf")
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "og")
INK, ORANGE, CREAM = (24, 20, 16), (255, 107, 0), (239, 235, 219)
W, H = 1200, 630

DEMOS = {
    "hub": {"es": ("Probalo antes de contratarlo", "10 demos de automatización"), "en": ("Try it before you hire it", "10 automation demos")},
    "collections": {"es": ("Cobranzas automáticas", "El agente prepara, vos aprobás"), "en": ("Automatic collections", "The agent prepares, you approve")},
    "stock-sync": {"es": ("Sync de stock con proveedores", "CSV del proveedor vs tu tienda"), "en": ("Supplier stock sync", "Supplier CSV vs your store")},
    "payroll": {"es": ("Control de horas y pagos", "Anomalías y liquidación para aprobar"), "en": ("Hours and payroll control", "Anomalies and payroll to approve")},
    "lead-scoring": {"es": ("Leads calificados con IA", "Puntaje con reglas que podés leer"), "en": ("AI lead qualification", "A score with rules you can read")},
    "wholesale-quotes": {"es": ("Cotizador mayorista", "Escalas por volumen y WhatsApp"), "en": ("Wholesale quote builder", "Volume tiers and WhatsApp")},
    "store-dashboard": {"es": ("Panel para tu comercio", "Ventas, stock y caja en una pantalla"), "en": ("Store dashboard", "Sales, stock and cash on one screen")},
    "convenio-multilateral": {"es": ("Convenio Multilateral / DDJJ SIFERE", "Video de 34 segundos para estudios contables"), "en": ("Multilateral Agreement / SIFERE", "34-second video for accounting firms")},
    "client-invoices": {"es": ("Facturas de tus clientes a planilla", "CUIT, CAE, duplicados y percepciones"), "en": ("Client invoices to a spreadsheet", "Tax ID, CAE, duplicates and withholdings")},
    "monthly-docs": {"es": ("Documentación del mes", "Checklist por cliente y recordatorios"), "en": ("Monthly client documents", "A checklist per client and reminders")},
    "policies-renewals": {"es": ("Pólizas desde PDF y renovaciones", "Cartera y avisos para aprobar"), "en": ("Policies from PDF and renewals", "Portfolio and notices to approve")},
    # One image per rubro page, saved as demos-para-<id>-<loc>.png
    "para-accounting": {"es": ("Demos para estudios contables", "Facturas, documentación y Convenio Multilateral"), "en": ("Demos for accounting firms", "Invoices, documents and Convenio Multilateral")},
    "para-legal": {"es": ("Demos para estudios jurídicos", "Consultas ordenadas y honorarios al día"), "en": ("Demos for law firms", "Sorted inquiries and fees on time")},
    "para-insurance": {"es": ("Demos para productores de seguros", "Pólizas desde PDF y renovaciones"), "en": ("Demos for insurance brokers", "Policies from PDF and renewals")},
    "para-real-estate": {"es": ("Demos para inmobiliarias", "Consultas con puntaje y cobros a tiempo"), "en": ("Demos for real estate agencies", "Scored inquiries and rent on time")},
    "para-clinics": {"es": ("Demos para clínicas y consultorios", "Horas del equipo sin planillas a mano"), "en": ("Demos for clinics and practices", "Team hours without hand-made sheets")},
}
SAMPLE = {"es": "DATOS DE EJEMPLO", "en": "SAMPLE DATA"}


def wrap(draw, text, font, max_w):
    lines, cur = [], ""
    for word in text.split():
        trial = f"{cur} {word}".strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    lines.append(cur)
    return lines


def render(key, loc):
    title, sub = DEMOS[key][loc]
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 28, H], fill=ORANGE)
    d.rectangle([W - 260, 0, W, 18], fill=ORANGE)
    f_small = ImageFont.truetype(BODY, 28)
    f_tiny = ImageFont.truetype(BODY, 24)
    d.text((80, 64), "PUNA TECH · DEMOS", font=f_small, fill=ORANGE)
    size = 118
    while True:
        f_title = ImageFont.truetype(ANTON, size)
        lines = wrap(d, title.upper(), f_title, W - 160)
        if len(lines) <= 3 and size * 1.08 * len(lines) <= 330:
            break
        size -= 6
    y = 140
    for line in lines:
        w = d.textlength(line, font=f_title)
        d.rectangle([80 - 6, y + 8, 80 + w + 10, y + size * 1.05], fill=ORANGE) if line is lines[-1] else None
        d.text((80, y), line, font=f_title, fill=INK if line is lines[-1] else CREAM)
        y += size * 1.08
    d.text((80, H - 190), sub, font=ImageFont.truetype(BODY, 36), fill=CREAM)
    badge = SAMPLE[loc]
    bw = d.textlength(badge, font=f_tiny) + 36
    d.rounded_rectangle([80, H - 120, 80 + bw, H - 70], radius=25, fill=ORANGE)
    d.text((98, H - 109), badge, font=f_tiny, fill=INK)
    d.text((W - 80, H - 100), "puna-tech.com" + ("/es/demos" if loc == "es" else "/demos"), font=f_tiny, fill=CREAM, anchor="ra")
    return img


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for key in DEMOS:
        for loc in ("es", "en"):
            path = os.path.join(OUT, f"demos-{key}-{loc}.png")
            render(key, loc).save(path, optimize=True)
            print(path)
