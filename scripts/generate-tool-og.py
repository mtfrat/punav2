#!/usr/bin/env python3
"""Generate the 1200x630 Open Graph images for /es/herramientas (free, code-only, Pillow).

Same generator style as scripts/generate-demo-og.py: ink background, orange left bar, Anton headline
(last line highlighted), Atkinson Hyperlegible for small text.

Usage: python3 scripts/generate-tool-og.py
Override font locations with ANTON_TTF / BODY_TTF.
"""
import os
from PIL import Image, ImageDraw, ImageFont

ANTON = os.environ.get("ANTON_TTF", "/workspace/fonts/Anton-Regular.ttf")
BODY = os.environ.get("BODY_TTF", "/workspace/fonts/AtkinsonHyperlegible-Bold.ttf")
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "og")
INK, ORANGE, CREAM = (24, 20, 16), (255, 107, 0), (239, 235, 219)
W, H = 1200, 630

TOOLS = {
    "hub": ("Herramientas gratis para tu estudio", "Calculadoras con la fuente de cada regla", "puna-tech.com/es/herramientas"),
    "coeficiente-convenio-multilateral": ("Coeficiente de Convenio Multilateral", "50% ingresos y 50% gastos, con 4 decimales", "puna-tech.com/es/herramientas"),
    "plazos-procesales": ("Plazos procesales en días hábiles", "Feriados, ferias y plazo de gracia", "puna-tech.com/es/herramientas"),
    "calculadora-horas-ahorradas": ("Horas ahorradas al automatizar", "Cuánto ahorrás y cuándo recuperás la inversión", "puna-tech.com/es/herramientas"),
}
BADGE = "GRATIS · SIN REGISTRO"


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
    title, sub, url = TOOLS[key]
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 28, H], fill=ORANGE)
    d.rectangle([W - 260, 0, W, 18], fill=ORANGE)
    f_small = ImageFont.truetype(BODY, 28)
    f_tiny = ImageFont.truetype(BODY, 24)
    d.text((80, 64), "PUNA TECH · HERRAMIENTAS", font=f_small, fill=ORANGE)
    size = 118
    while True:
        f_title = ImageFont.truetype(ANTON, size)
        lines = wrap(d, title.upper(), f_title, W - 160)
        if len(lines) <= 3 and size * 1.08 * len(lines) <= 330:
            break
        size -= 6
    y = 140
    for i, line in enumerate(lines):
        last = i == len(lines) - 1
        w = d.textlength(line, font=f_title)
        if last:
            d.rectangle([80 - 8, y + size * 0.16, 80 + w + 12, y + size * 1.22], fill=ORANGE)
        d.text((80, y), line, font=f_title, fill=INK if last else CREAM)
        y += size * 1.08
    d.text((80, H - 190), sub, font=ImageFont.truetype(BODY, 36), fill=CREAM)
    bw = d.textlength(BADGE, font=f_tiny) + 36
    d.rounded_rectangle([80, H - 120, 80 + bw, H - 70], radius=25, fill=ORANGE)
    d.text((98, H - 109), BADGE, font=f_tiny, fill=INK)
    d.text((W - 80, H - 100), url, font=f_tiny, fill=CREAM, anchor="ra")
    return img


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for key in TOOLS:
        path = os.path.join(OUT, f"herramientas-{key}.png")
        render(key).save(path, optimize=True)
        print(path)
