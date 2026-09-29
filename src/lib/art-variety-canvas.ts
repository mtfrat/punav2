import type { ArtCompositionId, ArtCopy } from "./art-compositions";
import { drawEditorialStudy } from "./art-editorial-canvas";

const C = { cream: "#F7EFE2", orange: "#BF5226", wine: "#702B38", ink: "#181410" };
const sans = '"Art Jakarta", sans-serif';
const serif = '"Art Newsreader", serif';
type Box = { x: number; y: number; w: number; h: number };

export function drawArtComposition(canvas: HTMLCanvasElement, id: ArtCompositionId, copy: ArtCopy, photo: HTMLImageElement | null) {
  if (id === "paper-photo" && photo) {
    drawEditorialStudy(canvas, photo, copy);
    return;
  }
  canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo iniciar el lienzo.");
  const rect = (x: number, y: number, w: number, h: number, color: string) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
  const line = (x: number, y: number, x2: number, y2: number, color = C.wine) => { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke(); };
  function text(value: string, box: Box, size: number, color = C.ink, italic = false, weight = 800, align: CanvasTextAlign = "left") {
    let lines: string[] = [];
    let fits = false;
    for (; size >= 28; size -= 2) {
      ctx.font = `${italic ? "italic " : ""}${weight} ${size}px ${italic ? serif : sans}`;
      lines = [];
      for (const paragraph of value.split("\n")) {
        let current = "";
        for (const word of paragraph.split(/\s+/).filter(Boolean)) {
          if (ctx.measureText(word).width > box.w) { current = word; break; }
          const next = current ? `${current} ${word}` : word;
          if (ctx.measureText(next).width > box.w && current) { lines.push(current); current = word; } else current = next;
        }
        if (current) lines.push(current);
      }
      fits = lines.length * size * 1.16 <= box.h && lines.every(t => ctx.measureText(t).width <= box.w);
      if (fits) break;
    }
    if (!fits) throw new Error("El texto no entra con buena legibilidad. Acortalo para descargar esta composición.");
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = "top";
    lines.forEach((s, i) => ctx.fillText(s, align === "center" ? box.x + box.w / 2 : box.x, box.y + i * size * 1.16));
    ctx.textAlign = "left";
  }
  function picture(x: number, y: number, w: number, h: number) {
    if (!photo) throw new Error("Esta composición necesita una fotografía. Cargá una imagen o elegí una composición tipográfica.");
    const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
    const sw = w / scale, sh = h / scale;
    ctx.drawImage(photo, (photo.naturalWidth - sw) / 2, (photo.naturalHeight - sh) * .6, sw, sh, x, y, w, h);
  }
  function signature(color = C.wine) { text("PUNA TECH", { x: 70, y: 64, w: 900, h: 48 }, 28, color, false, 800); }
  function closing(color = C.wine) { line(70, 1214, 1010, 1214, color); text(copy.closing, { x: 70, y: 1242, w: 940, h: 68 }, 30, color, false, 500); }
  rect(0, 0, 1080, 1350, C.cream);
  switch (id) {
    case "paper-photo":
      throw new Error("Esta composición necesita una fotografía.");
    case "manifesto":
      rect(0, 0, 1080, 1350, C.wine); signature(C.cream);
      text(copy.headline, { x: 70, y: 220, w: 940, h: 670 }, 132, C.cream);
      text(copy.support, { x: 70, y: 1000, w: 830, h: 160 }, 37, C.cream, false, 500); closing(C.cream); break;
    case "letter":
      signature(); line(70, 146, 1010, 146);
      text(copy.headline, { x: 120, y: 240, w: 835, h: 330 }, 100, C.wine, true, 500);
      text(copy.support, { x: 120, y: 670, w: 800, h: 360 }, 46, C.ink, false, 400);
      text("Con criterio,\nPuna.", { x: 620, y: 1060, w: 370, h: 130 }, 51, C.wine, true, 500); closing(); break;
    case "contrast": {
      rect(540, 0, 540, 1350, C.wine); signature(C.ink);
      rect(64, 180, 952, 330, C.cream); text(copy.headline, { x: 95, y: 215, w: 890, h: 270 }, 88, C.wine);
      const sides = copy.support.split("\n");
      text(sides[0] || "", { x: 70, y: 695, w: 400, h: 370 }, 67, C.ink, false, 500);
      text(sides.slice(1).join(" ") || "", { x: 605, y: 695, w: 405, h: 370 }, 67, C.cream, true, 600);
      rect(0, 1200, 1080, 150, C.cream); closing(); break;
    }
    case "steps":
      signature(); text(copy.headline, { x: 70, y: 180, w: 940, h: 300 }, 112, C.wine);
      copy.support.split("\n").forEach((s, i) => { const y = 555 + i * 195; line(106, y + 30, 106, y + 182); rect(70, y, 74, 74, C.wine); text(String(i + 1), { x: 87, y: y + 12, w: 50, h: 55 }, 41, C.cream); text(s, { x: 190, y, w: 780, h: 140 }, 54, C.ink, false, 500); }); closing(); break;
    case "question":
      rect(0, 0, 1080, 1350, C.orange); signature(C.cream);
      text("¿", { x: 60, y: 170, w: 230, h: 460 }, 350, C.cream, true, 500);
      text(copy.headline.replace(/^¿/, ""), { x: 280, y: 330, w: 720, h: 580 }, 99, C.cream);
      rect(70, 1015, 940, 155, C.cream); text(copy.support, { x: 100, y: 1040, w: 880, h: 110 }, 40, C.wine, false, 500); closing(C.cream); break;
    case "photo-caption":
      picture(0, 0, 1080, 790); rect(0, 790, 1080, 560, C.cream);
      rect(55, 50, 275, 70, C.cream); signature();
      text(copy.headline, { x: 70, y: 845, w: 940, h: 210 }, 91, C.wine, true, 600);
      text(copy.support, { x: 70, y: 1080, w: 940, h: 110 }, 36, C.ink, false, 500); closing(); break;
    case "type-poster":
      rect(0, 0, 1080, 1350, C.ink); rect(0, 0, 35, 1350, C.orange); signature(C.cream);
      text(copy.headline, { x: 85, y: 220, w: 870, h: 760 }, 162, C.cream);
      text(copy.support, { x: 400, y: 1020, w: 600, h: 150 }, 35, C.cream, false, 400); closing(C.cream); break;
    case "margin":
      picture(635, 0, 445, 1195); signature();
      text(copy.headline, { x: 70, y: 225, w: 505, h: 510 }, 80, C.wine, true, 600);
      text(copy.support, { x: 70, y: 850, w: 505, h: 300 }, 35, C.ink, false, 400); closing(); break;
    case "myth": {
      signature(); const ideas = copy.support.split("\n");
      text(ideas[0] || "", { x: 70, y: 210, w: 940, h: 140 }, 51, C.ink, false, 500); line(65, 252, 1005, 252);
      rect(0, 435, 1080, 735, C.wine);
      text(copy.headline, { x: 70, y: 490, w: 940, h: 395 }, 98, C.cream);
      text(ideas.slice(1).join(" "), { x: 70, y: 975, w: 940, h: 145 }, 53, C.cream, true, 500); closing(); break;
    }
    case "checklist":
      rect(0, 0, 1080, 190, C.wine); signature(C.cream);
      text(copy.headline, { x: 70, y: 260, w: 940, h: 280 }, 104, C.wine, true, 600);
      copy.support.split("\n").forEach((s, i) => { const y = 640 + i * 175; ctx.strokeStyle = C.wine; ctx.lineWidth = 3; ctx.strokeRect(75, y + 4, 48, 48); text(s, { x: 165, y, w: 820, h: 130 }, 48, C.ink, false, 500); line(165, y + 138, 1005, y + 138); }); closing(); break;
    case "invitation":
      signature(); text(copy.headline, { x: 120, y: 285, w: 840, h: 440 }, 121, C.wine, true, 500, "center");
      text(copy.support, { x: 205, y: 825, w: 670, h: 245 }, 43, C.ink, false, 400, "center");
      rect(0, 1190, 1080, 160, C.wine); text(copy.closing, { x: 70, y: 1240, w: 940, h: 80 }, 37, C.cream, false, 500, "center"); break;
  }
}
