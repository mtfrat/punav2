// A deliberately art-directed 4:5 study, not an automatic campaign template.
export const EDITORIAL_SIZE = { width: 1080, height: 1350 };
export const EDITORIAL_PHOTO = "/art-direction/workspace-cup-of-couple.jpg";
export const EDITORIAL_ALT = "Publicación terracota y crema: Tu equipo tiene mejores cosas que hacer. Fotografía cálida de un cuaderno y una computadora. Una nota dice: Lo repetitivo, al sistema. Al pie: Diseñamos procesos que te devuelven tiempo.";

export function drawEditorialStudy(canvas: HTMLCanvasElement, photo: HTMLImageElement, copy = {
  headline: "Tu equipo tiene mejores cosas que hacer.",
  support: "Lo repetitivo, al sistema.",
  closing: "Diseñamos procesos que te devuelven tiempo.",
}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo iniciar el lienzo.");
  canvas.width = EDITORIAL_SIZE.width;
  canvas.height = EDITORIAL_SIZE.height;
  const cream = "#F7EFE2", orange = "#BF5226", wine = "#702B38";
  const sans = '"Art Jakarta", sans-serif';
  const serif = '"Art Newsreader", serif';
  function fitLines(value: string, width: number, maxLines: number, maxSize: number, minSize: number, font: (size: number) => string) {
    for (let size = maxSize; size >= minSize; size -= 2) {
      ctx!.font = font(size);
      const lines: string[] = [];
      let current = "";
      for (const word of value.trim().split(/\s+/)) {
        const next = current ? `${current} ${word}` : word;
        if (current && ctx!.measureText(next).width > width) { lines.push(current); current = word; } else current = next;
      }
      if (current) lines.push(current);
      if (lines.length <= maxLines && lines.every(s => ctx!.measureText(s).width <= width)) return { lines, size };
    }
    throw new Error("El texto no entra con buena legibilidad. Acortalo para descargar esta composición.");
  }
  ctx.fillStyle = orange;
  ctx.fillRect(0, 0, 1080, 1350);
  // Photography is a material in the composition, not a dark background for a text block.
  const cropHeight = photo.naturalWidth * 790 / 1080;
  const cropY = (photo.naturalHeight - cropHeight) * .85;
  ctx.drawImage(photo, 0, cropY, photo.naturalWidth, cropHeight, 0, 560, 1080, 790);
  ctx.fillStyle = cream;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(1080, 0); ctx.lineTo(1080, 594);
  for (let x = 1080; x >= 0; x -= 12) ctx.lineTo(x, 594 + Math.sin(x * .17) * 3 + Math.sin(x * .049) * 5);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = orange;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(1080, 0); ctx.lineTo(1080, 580);
  for (let x = 1080; x >= 0; x -= 12) ctx.lineTo(x, 580 + Math.sin(x * .17) * 3 + Math.sin(x * .049) * 5);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = cream;
  ctx.font = `800 27px ${sans}`;
  ctx.fillText("PUNA", 70, 79);
  ctx.font = `500 17px ${sans}`;
  ctx.fillText("T E C H", 164, 79);
  ctx.textAlign = "right";
  ctx.font = `500 15px ${sans}`;
  ctx.fillText("AUTOMATIZACIÓN", 1010, 64);
  ctx.fillText("CON CRITERIO", 1010, 86);
  ctx.textAlign = "left";
  const words = copy.headline.trim().split(/\s+/);
  const accent = words.pop() || "";
  if (copy.headline === "Tu equipo tiene mejores cosas que hacer.") {
    ctx.font = `800 105px ${sans}`;
    ctx.fillText("Tu equipo", 64, 240);
    ctx.fillText("tiene mejores", 64, 358);
    ctx.fillText("cosas que", 64, 476);
  } else {
    const title = fitLines(words.join(" "), 940, 3, 105, 60, size => `800 ${size}px ${sans}`);
    title.lines.forEach((line, i) => ctx.fillText(line, 64, 230 + i * title.size * 1.13));
  }
  ctx.save();
  ctx.translate(380, 635);
  ctx.rotate(-.055);
  ctx.shadowColor = "rgba(40,20,10,.15)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;
  fitLines(accent, 600, 1, 224, 60, size => `italic 600 ${size}px ${serif}`);
  ctx.fillText(accent, 0, 0);
  ctx.restore();

  // An offset paper note: a secondary voice, separated from the main headline.
  ctx.save();
  ctx.translate(86, 1004);
  ctx.rotate(-.07);
  ctx.shadowColor = "rgba(35,20,10,.24)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = cream;
  ctx.fillRect(0, 0, 565, 169);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = wine;
  if (copy.support === "Lo repetitivo, al sistema.") {
    ctx.font = `500 22px ${sans}`;
    ctx.fillText("LO REPETITIVO,", 32, 53);
    ctx.font = `italic 500 71px ${serif}`;
    ctx.fillText("al sistema.", 28, 124);
  } else {
    const note = fitLines(copy.support, 500, 2, 60, 32, size => `italic 500 ${size}px ${serif}`);
    note.lines.forEach((line, i) => ctx.fillText(line, 28, 66 + i * note.size));
  }
  ctx.strokeStyle = wine;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(29, 139); ctx.bezierCurveTo(125, 132, 240, 148, 361, 137); ctx.stroke();
  ctx.fillStyle = "rgba(225,199,153,.75)";
  ctx.translate(363, -13); ctx.rotate(.15); ctx.fillRect(0, 0, 120, 34);
  ctx.restore();

  ctx.fillStyle = wine;
  ctx.fillRect(0, 1244, 1080, 106);
  ctx.fillStyle = cream;
  fitLines(copy.closing, 880, 1, 26, 24, size => `500 ${size}px ${sans}`);
  ctx.fillText(copy.closing, 65, 1306);
  ctx.strokeStyle = cream;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(965, 1296); ctx.lineTo(1012, 1296);
  ctx.moveTo(998, 1282); ctx.lineTo(1012, 1296); ctx.lineTo(998, 1310); ctx.stroke();
}
