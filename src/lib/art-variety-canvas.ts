import type { ArtCompositionId, ArtCopy } from "./art-compositions";
import { drawEditorialStudy } from "./art-editorial-canvas";

const C = {
  cream: "#F7EFE2",
  orange: "#BF5226",
  wine: "#702B38",
  ink: "#181410",
  darkBg: "#12100E",
  white: "#FFFFFF",
  tape: "rgba(225, 199, 153, 0.82)",
};

const sans = '"Art Jakarta", sans-serif';
const serif = '"Art Newsreader", serif';

function fitLines(
  ctx: CanvasRenderingContext2D,
  value: string,
  width: number,
  maxLines: number,
  maxSize: number,
  minSize: number,
  font: (size: number) => string
): { lines: string[]; size: number } {
  for (let size = maxSize; size >= minSize; size -= 2) {
    ctx.font = font(size);
    const lines: string[] = [];
    for (const paragraph of value.split("\n")) {
      let current = "";
      for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
        const next = current ? `${current} ${word}` : word;
        if (current && ctx.measureText(next).width > width) {
          lines.push(current);
          current = word;
        } else {
          current = next;
        }
      }
      if (current) lines.push(current);
    }
    if (lines.length <= maxLines && lines.every(s => ctx.measureText(s).width <= width)) {
      return { lines, size };
    }
  }
  ctx.font = font(minSize);
  const lines: string[] = [];
  for (const paragraph of value.split("\n")) {
    let current = "";
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      const next = current ? `${current} ${word}` : word;
      if (current && ctx.measureText(next).width > width) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
  }
  return { lines: lines.slice(0, maxLines), size: minSize };
}

function drawWashiTape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  angleRad: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleRad);
  ctx.shadowColor = "rgba(35, 20, 10, 0.15)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = C.tape;
  ctx.beginPath();
  const hw = w / 2;
  const hh = h / 2;
  // Left torn edge
  ctx.moveTo(-hw, -hh);
  ctx.lineTo(hw, -hh);
  // Right zigzag torn edge
  ctx.lineTo(hw + 4, -hh * 0.3);
  ctx.lineTo(hw - 2, 0);
  ctx.lineTo(hw + 5, hh * 0.4);
  ctx.lineTo(hw, hh);
  // Bottom edge
  ctx.lineTo(-hw, hh);
  // Left zigzag torn edge
  ctx.lineTo(-hw - 4, hh * 0.4);
  ctx.lineTo(-hw + 2, 0);
  ctx.lineTo(-hw - 3, -hh * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMarkerOval(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  color = "#C73E1D"
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.045);
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const rx = w / 2 + 18;
  const ry = h / 2 + 10;
  // Authentic hand-drawn felt-marker loop with overlapping start/end strokes
  ctx.beginPath();
  ctx.moveTo(-rx * 0.85, -ry * 0.65);
  ctx.bezierCurveTo(0, -ry * 1.18, rx * 1.05, -ry * 0.82, rx * 1.06, 0);
  ctx.bezierCurveTo(rx * 1.08, ry * 1.18, -rx * 0.4, ry * 1.22, -rx * 1.04, ry * 0.35);
  ctx.bezierCurveTo(-rx * 1.14, -ry * 0.45, -rx * 0.5, -ry * 1.1, rx * 0.25, -ry * 0.98);
  ctx.stroke();
  ctx.restore();
}

function drawHandArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = "#C73E1D"
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const midX = (x1 + x2) / 2 + (x2 - x1) * 0.2;
  const midY = (y1 + y2) / 2 - 15;
  ctx.quadraticCurveTo(midX, midY, x2, y2);
  ctx.stroke();
  // Arrowhead whiskers
  const angle = Math.atan2(y2 - midY, x2 - midX);
  const headLen = 18;
  ctx.beginPath();
  ctx.moveTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
  ctx.restore();
}

function drawFourPointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  color = C.cream
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawAsterisk(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  thickness = 5,
  color = C.orange
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(angle) * radius, cy - Math.sin(angle) * radius);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.stroke();
  }
  ctx.restore();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  focusY = 0.5
) {
  const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (photo.naturalWidth - sw) / 2;
  const sy = Math.max(0, Math.min(photo.naturalHeight - sh, (photo.naturalHeight - sh) * focusY));
  ctx.drawImage(photo, sx, sy, sw, sh, x, y, w, h);
}

export function drawArtComposition(
  canvas: HTMLCanvasElement,
  id: ArtCompositionId,
  copy: ArtCopy,
  photo: HTMLImageElement | null,
  slideIndex = 0
) {
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo iniciar el lienzo.");

  // 1. PAPER-PHOTO (Torn paper + photo + handwritten paper note)
  if (id === "paper-photo") {
    if (photo) {
      drawEditorialStudy(canvas, photo, copy);
      return;
    }
    throw new Error("Esta composición necesita una fotografía.");
  }

  // 2. NOTEBOOK-CAROUSEL (Perforated spiral notebook paper, vector handles, pure Brandsheet tokens)
  if (id === "notebook-carousel") {
    // Slide 0: Portada
    if (slideIndex === 0) {
      ctx.fillStyle = C.orange; // Terracota #BF5226
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.save();
      ctx.translate(540, 675);
      ctx.rotate(-0.038); // ~ -2.2°

      const w = 840;
      const h = 1140;
      const hw = w / 2;
      const hh = h / 2;

      ctx.shadowColor = "rgba(24, 20, 16, 0.28)";
      ctx.shadowBlur = 42;
      ctx.shadowOffsetY = 22;

      ctx.fillStyle = "#FAF6EF";
      ctx.beginPath();
      ctx.moveTo(-hw, hh);
      ctx.lineTo(-hw, -hh);

      // Scalloped top perforations
      const notches = 12;
      const notchW = w / notches;
      const r = notchW * 0.36;
      for (let i = 0; i < notches; i++) {
        const startX = -w / 2 + i * notchW;
        const midX = startX + notchW / 2;
        const endX = startX + notchW;
        ctx.lineTo(startX + (notchW - r * 2) / 2, -hh);
        ctx.arc(midX, -hh, r, Math.PI, 0, true);
        ctx.lineTo(endX, -hh);
      }

      ctx.lineTo(hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = "transparent";

      // Top pill sticker: @puna.tech
      const pillW = 200;
      const pillH = 46;
      ctx.fillStyle = "#EAE2D5";
      ctx.beginPath();
      ctx.roundRect(-pillW / 2, -hh + 105, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.fillStyle = C.ink;
      ctx.font = `700 19px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("@puna.tech", 0, -hh + 135);

      // Rayos dibujados a mano a la izquierda \ | /
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-hw + 85, -hh + 205);
      ctx.lineTo(-hw + 65, -hh + 230);
      ctx.moveTo(-hw + 110, -hh + 190);
      ctx.lineTo(-hw + 110, -hh + 220);
      ctx.moveTo(-hw + 135, -hh + 205);
      ctx.lineTo(-hw + 155, -hh + 230);
      ctx.stroke();

      // Titular central de portada
      const titleFit = fitLines(ctx, copy.headline, 720, 3, 94, 68, s => `800 ${s}px ${sans}`);
      ctx.fillStyle = C.ink;
      ctx.textAlign = "center";
      const startY = -hh + 340;
      titleFit.lines.forEach((line, i) => {
        ctx.font = `800 ${titleFit.size}px ${sans}`;
        ctx.fillText(line, 0, startY + i * (titleFit.size * 1.18));
      });

      // Subtítulo entre paréntesis en Newsreader Italic en Borgoña editorial
      const subText = copy.support.startsWith("(") ? copy.support : `(${copy.support})`;
      const subFit = fitLines(ctx, subText, 740, 2, 44, 30, s => `italic 500 ${s}px ${serif}`);
      ctx.fillStyle = C.wine;
      subFit.lines.forEach((line, i) => {
        ctx.font = `italic 500 ${subFit.size}px ${serif}`;
        ctx.fillText(line, 0, -hh + 760 + i * (subFit.size * 1.25));
      });

      // Flecha swipe -> en Tinta
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(-45, -hh + 870);
      ctx.lineTo(45, -hh + 870);
      ctx.moveTo(25, -hh + 850);
      ctx.lineTo(45, -hh + 870);
      ctx.lineTo(25, -hh + 890);
      ctx.stroke();

      ctx.restore();

      // Stickers editoriales alrededor de la hoja (100% Puna Tokens)
      // 1. Arriba a la derecha: Badge Tinta con acento Naranja
      ctx.save();
      ctx.translate(920, 210);
      ctx.rotate(0.08);
      ctx.fillStyle = C.ink;
      ctx.beginPath();
      ctx.roundRect(-75, -50, 150, 100, [50, 50, 8, 8]);
      ctx.fill();
      ctx.fillStyle = C.cream;
      ctx.font = `800 15px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("PUNA TECH", 0, -10);
      ctx.fillStyle = "#FF6B00";
      ctx.font = `700 12px ${sans}`;
      ctx.fillText("CON CRITERIO", 0, 15);
      ctx.restore();

      // 2. Derecha medio: Etiqueta con caja vectorial sobria (sin colisionar)
      ctx.save();
      ctx.translate(960, 390);
      ctx.rotate(-0.06);
      ctx.fillStyle = "#FAF6EF";
      ctx.fillRect(-75, -24, 150, 48);
      ctx.strokeStyle = C.wine;
      ctx.lineWidth = 2;
      ctx.strokeRect(-75, -24, 150, 48);
      const handles = [[-75, -24], [75, -24], [-75, 24], [75, 24], [0, -24], [0, 24], [-75, 0], [75, 0]];
      ctx.fillStyle = C.ink;
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.5;
      handles.forEach(([hx, hy]) => {
        ctx.fillRect(hx - 4.5, hy - 4.5, 9, 9);
        ctx.strokeRect(hx - 4.5, hy - 4.5, 9, 9);
      });
      ctx.fillStyle = C.wine;
      ctx.font = `800 18px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText(copy.closing || "SISTEMAS", 0, 6);
      ctx.restore();

      // 3. Abajo izquierda: Sello Borgoña "LO REPETITIVO AL SISTEMA"
      ctx.save();
      ctx.translate(130, 990);
      ctx.rotate(-0.1);
      ctx.fillStyle = C.wine;
      ctx.shadowColor = "rgba(24, 20, 16, 0.25)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 68, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.cream;
      ctx.font = `800 13px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("LO REPETITIVO,", 0, -8);
      ctx.fillStyle = "#FF6B00";
      ctx.font = `800 14px ${sans}`;
      ctx.fillText("AL SISTEMA", 0, 14);
      ctx.restore();

      // 4. Abajo izquierda pill: "Tiempo propio ↗"
      ctx.save();
      ctx.translate(110, 1160);
      ctx.rotate(0.05);
      ctx.fillStyle = "#EAE2D5";
      ctx.shadowColor = "rgba(24, 20, 16, 0.15)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.roundRect(-80, -25, 160, 50, 25);
      ctx.fill();
      ctx.fillStyle = C.ink;
      ctx.font = `italic 600 18px ${serif}`;
      ctx.textAlign = "center";
      ctx.fillText("Tiempo propio ↗", 0, 7);
      ctx.restore();
      return;
    }

    // Slide 1: Primera Duda
    if (slideIndex === 1) {
      ctx.fillStyle = "#FAF6EF";
      ctx.fillRect(0, 0, 1080, 1350);

      // Header bar
      ctx.fillStyle = C.ink;
      ctx.font = `700 21px ${sans}`;
      ctx.textAlign = "left";
      ctx.fillText("DIARIO DE SISTEMAS", 80, 72);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(24, 20, 16, 0.75)";
      ctx.fillText("@puna.tech", 1000, 72);
      ctx.textAlign = "left";

      ctx.strokeStyle = "rgba(24, 20, 16, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(80, 104);
      ctx.lineTo(1000, 104);
      ctx.stroke();

      // Vector badge
      ctx.save();
      ctx.translate(540, 280);
      ctx.rotate(-0.015);
      ctx.fillStyle = "#EAE2D5";
      ctx.fillRect(-110, -27, 220, 54);
      ctx.strokeStyle = C.wine;
      ctx.lineWidth = 2;
      ctx.strokeRect(-110, -27, 220, 54);
      const handles1 = [[-110, -27], [110, -27], [-110, 27], [110, 27], [0, -27], [0, 27], [-110, 0], [110, 0]];
      ctx.fillStyle = C.ink;
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.5;
      handles1.forEach(([hx, hy]) => {
        ctx.fillRect(hx - 4.5, hy - 4.5, 9, 9);
        ctx.strokeRect(hx - 4.5, hy - 4.5, 9, 9);
      });
      ctx.fillStyle = C.wine;
      ctx.font = `800 18px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("PRIMERA DUDA", 0, 6);
      ctx.restore();

      const titleFit = fitLines(ctx, copy.headline, 880, 4, 90, 64, s => `800 ${s}px ${sans}`);
      ctx.fillStyle = C.ink;
      ctx.textAlign = "center";
      titleFit.lines.forEach((l, i) => {
        ctx.font = `800 ${titleFit.size}px ${sans}`;
        ctx.fillText(l, 540, 520 + i * (titleFit.size * 1.22));
      });

      // Notebook tab 01
      ctx.save();
      ctx.translate(920, 1220);
      ctx.rotate(-0.06);
      ctx.shadowColor = "rgba(24, 20, 16, 0.22)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = C.orange;
      ctx.beginPath();
      ctx.moveTo(-75, 87.5);
      ctx.lineTo(-75, -87.5);
      for (let i = 0; i < 5; i++) {
        const sx = -75 + i * 30;
        ctx.lineTo(sx + 9.5, -87.5);
        ctx.arc(sx + 15, -87.5, 11, Math.PI, 0, true);
        ctx.lineTo(sx + 30, -87.5);
      }
      ctx.lineTo(75, 87.5);
      ctx.lineTo(-75, 87.5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = C.cream;
      ctx.font = `800 78px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("01", 0, 36);
      ctx.restore();
      return;
    }

    // Slide 2: Criterio Clave (Pizarra cálida #EDE5D8)
    if (slideIndex === 2) {
      ctx.fillStyle = "#EDE5D8";
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.fillStyle = C.ink;
      ctx.font = `700 21px ${sans}`;
      ctx.textAlign = "left";
      ctx.fillText("CRITERIO DE TRABAJO", 80, 72);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(24, 20, 16, 0.75)";
      ctx.fillText("@puna.tech", 1000, 72);
      ctx.textAlign = "left";

      ctx.strokeStyle = "rgba(24, 20, 16, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(80, 104);
      ctx.lineTo(1000, 104);
      ctx.stroke();

      // Pill badge
      ctx.save();
      ctx.translate(540, 280);
      ctx.fillStyle = C.orange;
      ctx.beginPath();
      ctx.roundRect(-120, -28, 240, 56, 28);
      ctx.fill();
      ctx.fillStyle = C.cream;
      ctx.font = `800 18px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("REGLA CLAVE", 0, 6);
      ctx.restore();

      const titleFit = fitLines(ctx, copy.support, 880, 4, 86, 60, s => `800 ${s}px ${sans}`);
      ctx.fillStyle = C.ink;
      ctx.textAlign = "center";
      titleFit.lines.forEach((l, i) => {
        ctx.font = `800 ${titleFit.size}px ${sans}`;
        ctx.fillText(l, 540, 500 + i * (titleFit.size * 1.22));
      });

      // Notebook tab 02 in Borgoña
      ctx.save();
      ctx.translate(920, 1220);
      ctx.rotate(-0.06);
      ctx.shadowColor = "rgba(24, 20, 16, 0.22)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = C.wine;
      ctx.beginPath();
      ctx.moveTo(-75, 87.5);
      ctx.lineTo(-75, -87.5);
      for (let i = 0; i < 5; i++) {
        const sx = -75 + i * 30;
        ctx.lineTo(sx + 9.5, -87.5);
        ctx.arc(sx + 15, -87.5, 11, Math.PI, 0, true);
        ctx.lineTo(sx + 30, -87.5);
      }
      ctx.lineTo(75, 87.5);
      ctx.lineTo(-75, 87.5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = C.cream;
      ctx.font = `800 78px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("02", 0, 36);
      ctx.restore();
      return;
    }

    // Slide 3: Cierre
    if (slideIndex === 3) {
      ctx.fillStyle = "#FAF6EF";
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.fillStyle = C.ink;
      ctx.font = `700 21px ${sans}`;
      ctx.textAlign = "left";
      ctx.fillText("PUNA TECH // SOLUCIONES", 80, 72);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(24, 20, 16, 0.75)";
      ctx.fillText("@puna.tech", 1000, 72);
      ctx.textAlign = "left";

      ctx.strokeStyle = "rgba(24, 20, 16, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(80, 104);
      ctx.lineTo(1000, 104);
      ctx.stroke();

      ctx.save();
      ctx.translate(540, 270);
      ctx.fillStyle = C.wine;
      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.cream;
      ctx.font = `800 13px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("OBJETIVO", 0, -4);
      ctx.fillStyle = "#FF6B00";
      ctx.fillText("PUNA", 0, 14);
      ctx.restore();

      const titleFit = fitLines(ctx, copy.headline, 880, 4, 86, 60, s => `800 ${s}px ${sans}`);
      ctx.fillStyle = C.ink;
      ctx.textAlign = "center";
      titleFit.lines.forEach((l, i) => {
        ctx.font = `800 ${titleFit.size}px ${sans}`;
        ctx.fillText(l, 540, 480 + i * (titleFit.size * 1.22));
      });

      ctx.font = `italic 500 40px ${serif}`;
      ctx.fillStyle = C.wine;
      ctx.fillText(`(${copy.closing})`, 540, 960);

      // Notebook tab 03
      ctx.save();
      ctx.translate(920, 1220);
      ctx.rotate(-0.06);
      ctx.shadowColor = "rgba(24, 20, 16, 0.22)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = C.orange;
      ctx.beginPath();
      ctx.moveTo(-75, 87.5);
      ctx.lineTo(-75, -87.5);
      for (let i = 0; i < 5; i++) {
        const sx = -75 + i * 30;
        ctx.lineTo(sx + 9.5, -87.5);
        ctx.arc(sx + 15, -87.5, 11, Math.PI, 0, true);
        ctx.lineTo(sx + 30, -87.5);
      }
      ctx.lineTo(75, 87.5);
      ctx.lineTo(-75, 87.5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = C.cream;
      ctx.font = `800 78px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("03", 0, 36);
      ctx.restore();
      return;
    }
  }

  // 3. POP-COLLAGE (Die-cut sticker character, bold headline, contrast badge, Brandsheet warm cream)
  if (id === "pop-collage") {
    // Base: Warm Crema Background
    ctx.fillStyle = C.cream;
    ctx.fillRect(0, 0, 1080, 1350);

    // Masthead: Circle with orange mark + "Puna Tech."
    ctx.save();
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.arc(104, 76, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FF6B00";
    ctx.fillRect(94, 66, 20, 20);

    ctx.fillStyle = C.ink;
    ctx.font = `800 28px ${sans}`;
    ctx.textAlign = "left";
    ctx.fillText("Puna Tech", 146, 86);

    ctx.fillStyle = C.orange;
    ctx.fillText(".", 288, 86);
    ctx.restore();

    const accent = C.orange; // Terracota #BF5226

    // Badge helper
    const drawBadge = (cx: number, cy: number, text: string) => {
      ctx.save();
      ctx.font = `800 32px ${sans}`;
      const bw = ctx.measureText(text).width + 48;
      const bh = 64;
      ctx.fillStyle = accent;
      ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
      ctx.fillStyle = C.cream;
      ctx.textAlign = "center";
      ctx.fillText(text, cx, cy + 11);
      ctx.restore();
    };

    // Doodle rays helper
    const drawDoodles = (cx: number, cy: number) => {
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy + 25);
      ctx.lineTo(cx - 55, cy + 50);
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(cx, cy + 45);
      ctx.moveTo(cx + 30, cy + 25);
      ctx.lineTo(cx + 55, cy + 50);
      ctx.stroke();
      ctx.restore();
    };

    // Slide 0: Portada
    if (slideIndex === 0) {
      // Giant Number "4"
      ctx.fillStyle = accent;
      ctx.font = `800 240px ${sans}`;
      ctx.textAlign = "left";
      ctx.fillText("4", 260, 310);

      // Headline
      ctx.fillStyle = C.ink;
      ctx.font = `800 88px ${sans}`;
      ctx.fillText("COSAS QUE", 470, 245);
      ctx.fillText("LA IA NO HACE", 260, 395);

      // Badge [ PERO VOS SÍ ]
      drawBadge(680, 480, copy.closing || "PERO VOS SÍ");

      // Cutout photo at bottom (full sticker with die-cut border & shadow)
      if (photo) {
        ctx.save();
        const sw = photo.naturalWidth;
        const sh = photo.naturalHeight;
        const targetW = 1080;
        const targetH = Math.round(sh * (targetW / sw));
        const targetY = 1350 - targetH;
        ctx.drawImage(photo, 0, 0, sw, sh, 0, targetY, targetW, targetH);
        ctx.restore();
      }

      // Swipe Pill Button ->
      ctx.save();
      ctx.translate(880, 920);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(-60, -28, 120, 56, 28);
      ctx.fill();
      ctx.strokeStyle = C.cream;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(22, 0);
      ctx.moveTo(8, -12);
      ctx.lineTo(22, 0);
      ctx.lineTo(8, 12);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Slide 1: Criterio
    if (slideIndex === 1) {
      ctx.fillStyle = C.ink;
      ctx.font = `800 76px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("La IA no te va a dar", 540, 260);

      ctx.fillStyle = accent;
      ctx.fillText("criterio de negocio", 540, 345);

      drawBadge(540, 435, copy.closing || "PERO VOS SÍ");

      ctx.fillStyle = C.ink;
      ctx.font = `500 30px ${sans}`;
      ctx.fillText("y eso es exactamente lo que define", 540, 520);
      ctx.fillText("qué procesos vale la pena automatizar.", 540, 562);

      if (photo) {
        ctx.save();
        const sw = photo.naturalWidth;
        const sh = photo.naturalHeight;
        const targetW = 1080;
        const targetH = Math.round(sh * (targetW / sw));
        const targetY = 1350 - targetH;
        ctx.drawImage(photo, 0, 0, sw, sh, 0, targetY, targetW, targetH);
        ctx.restore();
      }

      drawDoodles(750, 770);

      // Torn paper note "EL CRITERIO MANDA!"
      ctx.save();
      ctx.translate(820, 1140);
      ctx.rotate(0.04);
      ctx.fillStyle = C.cream;
      ctx.shadowColor = "rgba(24, 20, 16, 0.2)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fillRect(-140, -40, 280, 80);
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-140, -40, 280, 80);
      ctx.fillStyle = C.ink;
      ctx.font = `800 24px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("EL CRITERIO", 0, -8);
      ctx.fillStyle = accent;
      ctx.fillText("MANDA!", 0, 22);
      ctx.restore();
      return;
    }

    // Slide 2: Historia Real
    if (slideIndex === 2) {
      ctx.fillStyle = C.ink;
      ctx.font = `800 76px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("La IA no conoce", 540, 260);

      ctx.fillStyle = accent;
      ctx.fillText("TU HISTORIA REAL.", 540, 345);

      drawBadge(540, 435, copy.closing || "PERO VOS SÍ");

      ctx.fillStyle = C.ink;
      ctx.font = `500 30px ${sans}`;
      ctx.fillText("esa experiencia propia es lo que genera", 540, 520);
      ctx.fillText("confianza auténtica con tus clientes.", 540, 562);

      if (photo) {
        ctx.save();
        const sw = photo.naturalWidth;
        const sh = photo.naturalHeight;
        const targetW = 1080;
        const targetH = Math.round(sh * (targetW / sw));
        const targetY = 1350 - targetH;
        ctx.drawImage(photo, 0, 0, sw, sh, 0, targetY, targetW, targetH);
        ctx.restore();
      }

      drawDoodles(280, 860);
      return;
    }

    // Slide 3: Responsabilidad
    if (slideIndex === 3) {
      ctx.fillStyle = C.ink;
      ctx.font = `800 74px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("La IA no asume la", 540, 260);

      ctx.fillStyle = accent;
      ctx.fillText("RESPONSABILIDAD", 540, 345);

      drawBadge(540, 435, copy.closing || "PERO VOS SÍ");

      ctx.fillStyle = C.ink;
      ctx.font = `500 30px ${sans}`;
      ctx.fillText("el sistema ejecuta las tareas repetitivas,", 540, 520);
      ctx.fillText("pero las decisiones clave las toma tu equipo.", 540, 562);

      if (photo) {
        ctx.save();
        const sw = photo.naturalWidth;
        const sh = photo.naturalHeight;
        const targetW = 1080;
        const targetH = Math.round(sh * (targetW / sw));
        const targetY = 1350 - targetH;
        ctx.drawImage(photo, 0, 0, sw, sh, 0, targetY, targetW, targetH);
        ctx.restore();
      }
      return;
    }

    // Slide 4: Confianza y Cierre
    if (slideIndex === 4) {
      ctx.fillStyle = C.ink;
      ctx.font = `800 68px ${sans}`;
      ctx.textAlign = "center";
      ctx.fillText("La IA no reemplaza", 540, 245);

      ctx.fillStyle = accent;
      ctx.font = `800 64px ${sans}`;
      ctx.fillText("SISTEMAS → CONFIANZA → EQUIPO", 540, 330);

      drawBadge(540, 420, copy.closing || "PERO VOS SÍ");

      ctx.fillStyle = C.ink;
      ctx.font = `500 30px ${sans}`;
      ctx.fillText("por eso lo repetitivo va al sistema,", 540, 505);
      ctx.fillText("para devolverle tiempo a las personas.", 540, 547);

      ctx.font = `italic 500 34px ${serif}`;
      ctx.fillStyle = C.wine;
      ctx.fillText("(Hablemos de tus procesos esta semana)", 540, 605);

      if (photo) {
        ctx.save();
        const sw = photo.naturalWidth;
        const sh = photo.naturalHeight;
        const targetW = 1080;
        const targetH = Math.round(sh * (targetW / sw));
        const targetY = 1350 - targetH;
        ctx.drawImage(photo, 0, 0, sw, sh, 0, targetY, targetW, targetH);
        ctx.restore();
      }
      return;
    }
  }

  // Common photo guard: all 4 pro templates require photo
  if (!photo) {
    throw new Error("Esta composición necesita una fotografía.");
  }

  // 2. MARKER-NOTE (Cream paper, headline with hand-drawn marker oval, curved arrow, annotation, photo)
  if (id === "marker-note") {
    // Canvas background
    ctx.fillStyle = C.cream;
    ctx.fillRect(0, 0, 1080, 1350);

    // Masthead
    ctx.fillStyle = C.ink;
    ctx.font = `800 27px ${sans}`;
    ctx.fillText("PUNA", 72, 78);
    ctx.font = `500 17px ${sans}`;
    ctx.fillText("T E C H", 166, 78);

    ctx.textAlign = "right";
    ctx.fillStyle = C.wine;
    ctx.font = `600 15px ${sans}`;
    ctx.fillText("ESTUDIO EDITORIAL // 02", 1008, 78);
    ctx.textAlign = "left";

    // Hairline divider
    ctx.strokeStyle = "rgba(112, 43, 56, 0.16)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(72, 108);
    ctx.lineTo(1008, 108);
    ctx.stroke();

    // Headline with dynamic size
    const titleFit = fitLines(ctx, copy.headline, 936, 3, 86, 62, s => `800 ${s}px ${sans}`);
    let targetWord = "";
    let targetLineIdx = -1;
    let targetWordX = 0;
    let targetWordY = 0;
    let targetWordW = 0;

    // Pick keyword to circle (prefer the last word or a long word)
    const words = copy.headline.trim().split(/\s+/);
    targetWord = words[words.length - 1] || "";
    // Clean trailing punctuation for text measurement
    const cleanWord = targetWord.replace(/[.,:;?!]+$/, "");

    ctx.fillStyle = C.ink;
    const lineSpacing = titleFit.size * 1.14;
    titleFit.lines.forEach((line, i) => {
      const lineY = 158 + i * lineSpacing;
      ctx.font = `800 ${titleFit.size}px ${sans}`;
      ctx.fillText(line, 72, lineY);

      if (line.includes(cleanWord) && targetLineIdx === -1) {
        targetLineIdx = i;
        const prefix = line.substring(0, line.indexOf(cleanWord));
        targetWordX = 72 + ctx.measureText(prefix).width;
        targetWordY = lineY;
        targetWordW = ctx.measureText(cleanWord).width;
      }
    });

    // Draw hand-drawn marker oval around target word
    if (targetWordW > 0) {
      const ovalCx = targetWordX + targetWordW / 2;
      const ovalCy = targetWordY + titleFit.size * 0.42;
      drawMarkerOval(ctx, ovalCx, ovalCy, targetWordW, titleFit.size * 0.82, C.orange);

      // Draw hand-drawn arrow curling towards annotation
      drawHandArrow(ctx, ovalCx + targetWordW * 0.4, ovalCy + titleFit.size * 0.5, 750, 485, C.orange);
    }

    // Annotation note in Newsreader Italic
    const noteFit = fitLines(ctx, copy.support, 420, 2, 42, 28, s => `italic 500 ${s}px ${serif}`);
    ctx.fillStyle = C.wine;
    ctx.textAlign = "left";
    noteFit.lines.forEach((l, i) => {
      ctx.fillText(l, 570, 495 + i * (noteFit.size * 1.15));
    });

    // Photo in editorial framed box
    const photoY = 560;
    const photoH = 650;
    ctx.save();
    ctx.shadowColor = "rgba(24, 20, 16, 0.12)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#EAE2D5";
    ctx.fillRect(72, photoY, 936, photoH);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(72, photoY, 936, photoH);
    ctx.clip();
    drawImageCover(ctx, photo, 72, photoY, 936, photoH, 0.7);
    ctx.restore();

    // Subtle photo pill tag at bottom-left of photo
    ctx.fillStyle = "rgba(24, 20, 16, 0.82)";
    ctx.fillRect(92, photoY + photoH - 52, 230, 36);
    ctx.fillStyle = C.cream;
    ctx.font = `600 13px ${sans}`;
    ctx.fillText("CRITERIO + MÉTODO", 112, photoY + photoH - 29);

    // Footer bar
    ctx.fillStyle = C.wine;
    ctx.fillRect(0, 1240, 1080, 110);
    ctx.fillStyle = C.cream;
    fitLines(ctx, copy.closing, 860, 1, 25, 20, s => `500 ${s}px ${sans}`);
    ctx.fillText(copy.closing, 72, 1302);

    // Arrow icon
    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(965, 1294);
    ctx.lineTo(1008, 1294);
    ctx.moveTo(994, 1280);
    ctx.lineTo(1008, 1294);
    ctx.lineTo(994, 1308);
    ctx.stroke();
    return;
  }

  // 3. BOLDER-POSTER (Deep dark background, ultra-bold headline, integrated photo, pill badge, star mark)
  if (id === "bolder-poster") {
    // Deep dark background
    ctx.fillStyle = C.darkBg;
    ctx.fillRect(0, 0, 1080, 1350);

    // Header
    ctx.fillStyle = C.cream;
    ctx.font = `800 27px ${sans}`;
    ctx.fillText("PUNA", 72, 78);
    ctx.font = `500 17px ${sans}`;
    ctx.fillText("T E C H", 166, 78);

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(247, 239, 226, 0.55)";
    ctx.font = `600 15px ${sans}`;
    ctx.fillText("// 2026 EDITORIAL", 1008, 78);
    ctx.textAlign = "left";

    // Pill badge in terracotta
    ctx.fillStyle = C.orange;
    ctx.beginPath();
    ctx.roundRect(72, 118, 168, 38, 19);
    ctx.fill();
    ctx.fillStyle = C.cream;
    ctx.font = `800 13px ${sans}`;
    ctx.fillText("[ 01 · BOLDER ]", 90, 142);

    // 4-pointed star mark
    drawFourPointStar(ctx, 985, 137, 18, 6, C.cream);

    // Headline in high-impact Cream
    const titleFit = fitLines(ctx, copy.headline.toUpperCase(), 936, 3, 98, 70, s => `800 ${s}px ${sans}`);
    ctx.fillStyle = C.cream;
    titleFit.lines.forEach((line, i) => {
      // Accent color on the last line for maximum punch
      if (i === titleFit.lines.length - 1 && titleFit.lines.length > 1) {
        ctx.fillStyle = C.orange;
      } else {
        ctx.fillStyle = C.cream;
      }
      ctx.font = `800 ${titleFit.size}px ${sans}`;
      ctx.fillText(line, 72, 225 + i * (titleFit.size * 1.08));
    });

    // Integrated photo block with subtle dark framing
    const photoY = 560;
    const photoH = 550;
    ctx.save();
    ctx.beginPath();
    ctx.rect(72, photoY, 936, photoH);
    ctx.clip();
    drawImageCover(ctx, photo, 72, photoY, 936, photoH, 0.65);

    // Gradient vignette overlay at bottom of photo
    const grad = ctx.createLinearGradient(72, photoY + photoH - 180, 72, photoY + photoH);
    grad.addColorStop(0, "rgba(18, 16, 14, 0)");
    grad.addColorStop(1, "rgba(18, 16, 14, 0.95)");
    ctx.fillStyle = grad;
    ctx.fillRect(72, photoY + photoH - 180, 936, 180);
    ctx.restore();

    // Floating support statement in Newsreader Italic over photo lower area
    const supportFit = fitLines(ctx, copy.support, 860, 2, 44, 28, s => `italic 500 ${s}px ${serif}`);
    ctx.fillStyle = C.cream;
    supportFit.lines.forEach((line, i) => {
      ctx.fillText(line, 104, photoY + photoH - 85 + i * (supportFit.size * 1.15));
    });

    // Subtle divider
    ctx.strokeStyle = "rgba(247, 239, 226, 0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(72, 1210);
    ctx.lineTo(1008, 1210);
    ctx.stroke();

    // Footer
    ctx.fillStyle = "rgba(247, 239, 226, 0.9)";
    fitLines(ctx, copy.closing, 820, 1, 24, 18, s => `500 ${s}px ${sans}`);
    ctx.fillText(copy.closing, 72, 1264);

    ctx.textAlign = "right";
    ctx.fillStyle = C.orange;
    ctx.font = `700 16px ${sans}`;
    ctx.fillText("PUNA TECH // 2026 ↗", 1008, 1264);
    ctx.textAlign = "left";
    return;
  }

  // 4. POLAROID-COLLAGE (Cream paper, tilted polaroid print with washi tape, asterisk stamp, wine footer)
  if (id === "polaroid-collage") {
    // Cream background
    ctx.fillStyle = C.cream;
    ctx.fillRect(0, 0, 1080, 1350);

    // Delicate editorial border
    ctx.strokeStyle = "rgba(112, 43, 56, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(48, 48, 984, 1254);

    // Masthead inside border
    ctx.fillStyle = C.ink;
    ctx.font = `800 27px ${sans}`;
    ctx.fillText("PUNA", 84, 96);
    ctx.font = `500 17px ${sans}`;
    ctx.fillText("T E C H", 178, 96);

    ctx.textAlign = "right";
    ctx.fillStyle = C.wine;
    ctx.font = `600 15px ${sans}`;
    ctx.fillText("ARCHIVO // 04", 996, 96);
    ctx.textAlign = "left";

    // Headline
    const titleFit = fitLines(ctx, copy.headline, 912, 3, 80, 56, s => `800 ${s}px ${sans}`);
    ctx.fillStyle = C.ink;
    titleFit.lines.forEach((line, i) => {
      ctx.font = `800 ${titleFit.size}px ${sans}`;
      ctx.fillText(line, 84, 175 + i * (titleFit.size * 1.12));
    });

    // Asterisk graphic stamp near top-right
    drawAsterisk(ctx, 950, 210, 22, 5, C.orange);

    // Tilted Polaroid Card
    const cardW = 740;
    const cardH = 740;
    const cardX = 540;
    const cardY = 760;
    const tilt = -0.038; // ~ -2.2 degrees

    ctx.save();
    ctx.translate(cardX, cardY);
    ctx.rotate(tilt);

    // Polaroid Card Shadow
    ctx.shadowColor = "rgba(35, 20, 10, 0.22)";
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = C.white;
    ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
    ctx.shadowColor = "transparent";

    // Inside Photo
    const pad = 28;
    const photoInnerW = cardW - pad * 2;
    const photoInnerH = cardH - 140;
    const photoInnerX = -cardW / 2 + pad;
    const photoInnerY = -cardH / 2 + pad;

    ctx.save();
    ctx.beginPath();
    ctx.rect(photoInnerX, photoInnerY, photoInnerW, photoInnerH);
    ctx.clip();
    drawImageCover(ctx, photo, photoInnerX, photoInnerY, photoInnerW, photoInnerH, 0.7);
    ctx.restore();

    // Polaroid Bottom Caption Area
    const captionFit = fitLines(ctx, copy.support, cardW - 80, 2, 36, 24, s => `italic 500 ${s}px ${serif}`);
    ctx.fillStyle = C.wine;
    ctx.textAlign = "left";
    captionFit.lines.forEach((l, i) => {
      ctx.fillText(l, -cardW / 2 + pad + 6, photoInnerY + photoInnerH + 42 + i * (captionFit.size * 1.15));
    });

    // Small photo stamp
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(24, 20, 16, 0.4)";
    ctx.font = `600 13px ${sans}`;
    ctx.fillText("PUNA / COLLAGE", cardW / 2 - pad - 6, photoInnerY + photoInnerH + 68);
    ctx.textAlign = "left";

    // Washi Tape on top edge
    drawWashiTape(ctx, 0, -cardH / 2, 170, 42, 0.05);

    ctx.restore();

    // Footer Bar
    ctx.fillStyle = C.wine;
    ctx.fillRect(0, 1240, 1080, 110);
    ctx.fillStyle = C.cream;
    fitLines(ctx, copy.closing, 860, 1, 25, 20, s => `500 ${s}px ${sans}`);
    ctx.fillText(copy.closing, 72, 1302);

    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(965, 1294);
    ctx.lineTo(1008, 1294);
    ctx.moveTo(994, 1280);
    ctx.lineTo(1008, 1294);
    ctx.lineTo(994, 1308);
    ctx.stroke();
    return;
  }

  // 5. DARK-TECH (Nexora & Agyweb style: Deep obsidian background, bold stacked headline with neon glow accent, central 3D asset, pill CTA button)
  if (id === "dark-tech") {
    // Deep obsidian background
    ctx.fillStyle = "#0A0908";
    ctx.fillRect(0, 0, 1080, 1350);

    // Atmospheric orange ambient radial gradient in background
    const bgGlow = ctx.createRadialGradient(540, 750, 60, 540, 750, 640);
    bgGlow.addColorStop(0, "rgba(255, 107, 0, 0.08)");
    bgGlow.addColorStop(0.6, "rgba(191, 82, 38, 0.03)");
    bgGlow.addColorStop(1, "rgba(10, 9, 8, 0)");
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, 1080, 1350);

    // Masthead
    ctx.fillStyle = C.cream;
    ctx.font = `800 28px ${sans}`;
    ctx.fillText("PUNA", 72, 78);
    ctx.font = `500 18px ${sans}`;
    ctx.fillText("T E C H", 168, 78);

    ctx.textAlign = "right";
    ctx.fillStyle = "#FF6B00";
    ctx.font = `700 14px ${sans}`;
    ctx.fillText("SISTEMAS B2B // 2026", 1008, 78);
    ctx.textAlign = "left";

    // Headline: Stacked bold sans with neon orange accent on key phrase
    const titleFit = fitLines(ctx, copy.headline.toUpperCase(), 936, 3, 94, 66, s => `800 ${s}px ${sans}`);
    titleFit.lines.forEach((line, i) => {
      const isAccentLine = (i === titleFit.lines.length - 1 && titleFit.lines.length > 1);
      ctx.save();
      if (isAccentLine) {
        ctx.fillStyle = "#FF6B00";
        ctx.shadowColor = "rgba(255, 107, 0, 0.45)";
        ctx.shadowBlur = 18;
      } else {
        ctx.fillStyle = C.cream;
        ctx.shadowColor = "transparent";
      }
      ctx.font = `800 ${titleFit.size}px ${sans}`;
      ctx.fillText(line, 72, 165 + i * (titleFit.size * 1.08));
      ctx.restore();
    });

    // Central 3D Asset
    const photoY = 460;
    const photoH = 580;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(72, photoY, 936, photoH, 16);
    ctx.clip();
    drawImageCover(ctx, photo, 72, photoY, 936, photoH, 0.5);

    // Vignette fading edges of the 3D asset into pitch black
    const topVignette = ctx.createLinearGradient(72, photoY, 72, photoY + 70);
    topVignette.addColorStop(0, "rgba(10, 9, 8, 0.95)");
    topVignette.addColorStop(1, "rgba(10, 9, 8, 0)");
    ctx.fillStyle = topVignette;
    ctx.fillRect(72, photoY, 936, 70);

    const bottomVignette = ctx.createLinearGradient(72, photoY + photoH - 120, 72, photoY + photoH);
    bottomVignette.addColorStop(0, "rgba(10, 9, 8, 0)");
    bottomVignette.addColorStop(1, "rgba(10, 9, 8, 0.95)");
    ctx.fillStyle = bottomVignette;
    ctx.fillRect(72, photoY + photoH - 120, 936, 120);
    ctx.restore();

    // Support copy (Clean, modern B2B tech value prop)
    const supportFit = fitLines(ctx, copy.support, 936, 2, 34, 24, s => `400 ${s}px ${sans}`);
    ctx.fillStyle = "rgba(247, 239, 226, 0.85)";
    supportFit.lines.forEach((line, i) => {
      ctx.fillText(line, 72, 1085 + i * (supportFit.size * 1.3));
    });

    // Interactive CTA Pill Button (like "Let's Talk ->" in Nexora)
    const pillY = 1200;
    const pillH = 72;
    const ctaText = copy.closing || "Hablemos de tu proceso";
    ctx.font = `700 24px ${sans}`;
    const textWidth = ctx.measureText(ctaText).width;
    const pillW = Math.min(textWidth + 92, 540);

    ctx.save();
    // Pill button background with glow
    ctx.shadowColor = "rgba(255, 107, 0, 0.35)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "#FF6B00";
    ctx.beginPath();
    ctx.roundRect(72, pillY, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.shadowColor = "transparent";

    // Pill text
    ctx.fillStyle = "#12100E";
    ctx.font = `800 22px ${sans}`;
    ctx.fillText(ctaText, 106, pillY + 44);

    // Pill arrow inside circle
    const circleX = 72 + pillW - 38;
    const circleY = pillY + pillH / 2;
    ctx.fillStyle = "#12100E";
    ctx.beginPath();
    ctx.arc(circleX, circleY, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#FF6B00";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(circleX - 6, circleY);
    ctx.lineTo(circleX + 6, circleY);
    ctx.moveTo(circleX + 1, circleY - 5);
    ctx.lineTo(circleX + 6, circleY);
    ctx.lineTo(circleX + 1, circleY + 5);
    ctx.stroke();
    ctx.restore();

    // Domain tag at bottom right
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(247, 239, 226, 0.6)";
    ctx.font = `600 18px ${sans}`;
    ctx.fillText("puna-tech.com ↗", 1008, pillY + 44);
    ctx.textAlign = "left";
    return;
  }
}
