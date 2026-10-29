#!/usr/bin/env python3
"""Generate the 1200x630 Open Graph images for the long-tail /es/automatizaciones landings (code-only, Pillow).

Same generator style as scripts/generate-demo-og.py: ink background, orange left bar, Anton headline
(last line highlighted), Atkinson Hyperlegible for small text.

Usage: python3 scripts/generate-automatizaciones-og.py
Override font locations with ANTON_TTF / BODY_TTF.
"""
import os
from PIL import Image, ImageDraw, ImageFont

ANTON = os.environ.get("ANTON_TTF", "/workspace/fonts/Anton-Regular.ttf")
BODY = os.environ.get("BODY_TTF", "/workspace/fonts/AtkinsonHyperlegible-Bold.ttf")
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "og")
INK, ORANGE, CREAM = (24, 20, 16), (255, 107, 0), (239, 235, 219)
W, H = 1200, 630

PAGES = {
    "convenio-multilateral-coeficientes": ("Coeficientes de Convenio Multilateral", "CM03, CM05 y ajuste de abril, con las normas a la vista"),
    "conciliacion-sifere-retenciones-percepciones": ("Conciliación de retenciones y percepciones SIFERE", "SIRCREB, certificados y extractos, cruzados"),
    "control-de-expedientes-estudio-juridico": ("Control de expedientes y vencimientos", "Del Excel a un sistema con avisos"),
    "control-de-honorarios-estudio-juridico": ("Control de honorarios del estudio", "Saldos, vencimientos y recordatorios que aprobás vos"),
    "cartera-de-polizas-y-renovaciones": ("Cartera de pólizas y renovaciones", "De los PDF al Excel y a los avisos a 30 días"),
    "matricula-productor-asesor-de-seguros": ("Matrícula de productor asesor de seguros", "Fechas y pasos según la SSN, y un calendario que avisa"),
}
BADGE = "DIAGNÓSTICO EN 15 MIN"


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


def render(key):
    title, sub = PAGES[key]
    url = "puna-tech.com/es/automatizaciones"
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 28, H], fill=ORANGE)
    d.rectangle([W - 260, 0, W, 18], fill=ORANGE)
    f_small = ImageFont.truetype(BODY, 28)
    f_sub = ImageFont.truetype(BODY, 34)
    f_tiny = ImageFont.truetype(BODY, 24)
    d.text((80, 64), "PUNA TECH · AUTOMATIZACIONES", font=f_small, fill=ORANGE)
    size = 118
    while True:
        f_title = ImageFont.truetype(ANTON, size)
        lines = wrap(d, title.upper(), f_title, W - 160)
        if len(lines) <= 3 and size * 1.08 * len(lines) <= 270:
            break
        size -= 6
    y = 128
    for i, line in enumerate(lines):
        last = i == len(lines) - 1
        w = d.textlength(line, font=f_title)
        if last:
            d.rectangle([80 - 8, y + size * 0.16, 80 + w + 12, y + size * 1.22], fill=ORANGE)
        d.text((80, y), line, font=f_title, fill=INK if last else CREAM)
        y += size * 1.08
    d.text((80, H - 178), sub, font=f_sub, fill=CREAM)
    bw = d.textlength(BADGE, font=f_tiny) + 36
    d.rounded_rectangle([80, H - 120, 80 + bw, H - 70], radius=25, fill=ORANGE)
    d.text((98, H - 109), BADGE, font=f_tiny, fill=INK)
    d.text((W - 80, H - 100), url, font=f_tiny, fill=CREAM, anchor="ra")
    return img


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for key in PAGES:
        path = os.path.join(OUT, f"automatizaciones-{key}.png")
        render(key).save(path, optimize=True)
        print(path)
