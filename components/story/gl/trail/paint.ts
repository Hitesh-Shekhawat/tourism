import * as THREE from "three";
import { fbm, rng } from "../textures";
import { BD, BOUNDS, BW, RIDGE, tracePath, type V2 } from "./geo";

/* Canvas-painted textures for the Golden Trail: the printed sheet, its baked desk shadow, the desk, the brass tags. */

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
};

const toTex = (c: HTMLCanvasElement, srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** World → canvas pixel for a canvas covering BOUNDS. */
const px = (W: number, H: number) => (p: V2) => [((p[0] - BOUNDS.minX) / BW) * W, ((p[1] - BOUNDS.minZ) / BD) * H] as const;

/**
 * The sheet's top: sandstone handmade paper with mottling and fibres, an ochre wash along the
 * Aravallis, a printed hairline border inside the deckle and a faint dotted itinerary that the brass
 * route later traces. Transparent outside the outline (used with alphaTest as the cut-out).
 */
export function paperTexture(outline: V2[], route: V2[], S = 2048) {
  const [c, g] = canvas(S, S);
  const P = px(S, S);
  g.save();
  tracePath(g, outline, S, S);
  g.clip();
  g.fillStyle = "#E3CFAD";
  g.fillRect(0, 0, S, S);

  // mottling: two fbm layers, multiplied in
  for (const [seed, size, alpha] of [
    [21, 128, 0.22],
    [22, 256, 0.14],
  ] as const) {
    const n = fbm(size, seed, 5, 4);
    const [m, gm] = canvas(size, size);
    const id = gm.createImageData(size, size);
    for (let i = 0; i < n.length; i++) {
      const v = n[i];
      id.data[i * 4] = 205 + v * 50;
      id.data[i * 4 + 1] = 180 + v * 60;
      id.data[i * 4 + 2] = 140 + v * 75;
      id.data[i * 4 + 3] = 255;
    }
    gm.putImageData(id, 0, 0);
    g.globalAlpha = alpha;
    g.globalCompositeOperation = "multiply";
    g.imageSmoothingQuality = "high";
    g.drawImage(m, 0, 0, S, S);
  }
  g.globalCompositeOperation = "source-over";

  // ochre wash along the ridge, like a miniature painter's hill tint
  g.filter = "blur(28px)";
  g.strokeStyle = "#bf8656";
  g.globalAlpha = 0.17;
  g.lineWidth = S * 0.04;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  RIDGE.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p))));
  g.stroke();
  g.filter = "none";

  // fibres
  const r = rng(5);
  for (let i = 0; i < 2600; i++) {
    const x = r() * S;
    const y = r() * S;
    const a = r() * Math.PI * 2;
    const l = 4 + r() * 14;
    g.globalAlpha = 0.05 + r() * 0.08;
    g.strokeStyle = r() < 0.55 ? "#fff6e2" : "#8a6a44";
    g.lineWidth = 0.6 + r() * 0.9;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  // a few darker inclusions
  for (let i = 0; i < 260; i++) {
    g.globalAlpha = 0.08 + r() * 0.12;
    g.fillStyle = "#7a5a36";
    g.beginPath();
    g.arc(r() * S, r() * S, 0.6 + r() * 1.4, 0, Math.PI * 2);
    g.fill();
  }

  // stipple of dune arcs in the west (miniature-painting shorthand), very faint
  g.globalAlpha = 0.1;
  g.strokeStyle = "#8a6438";
  g.lineWidth = 1.6;
  for (let i = 0; i < 40; i++) {
    const x = r() * S * 0.33;
    const y = S * 0.22 + r() * S * 0.5;
    const w = 14 + r() * 18;
    g.beginPath();
    g.arc(x, y + w, w, Math.PI * 1.2, Math.PI * 1.8);
    g.stroke();
  }

  // the planned route, dotted in sepia (the brass tube will trace it)
  g.globalAlpha = 0.42;
  g.strokeStyle = "#7c5a34";
  g.lineWidth = 3;
  g.setLineDash([2, 11]);
  g.lineCap = "round";
  g.beginPath();
  route.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p))));
  g.stroke();
  g.setLineDash([]);
  g.restore();

  // printed hairline border ~14 px inside the deckle: a ring stroke, hollowed, clipped to the inside
  const [b, gb] = canvas(S, S);
  gb.lineJoin = "round";
  tracePath(gb, outline, S, S);
  gb.strokeStyle = "#6e4f2c";
  gb.lineWidth = 34;
  gb.stroke();
  gb.globalCompositeOperation = "destination-out";
  gb.lineWidth = 30;
  gb.stroke();
  g.save();
  tracePath(g, outline, S, S);
  g.clip();
  g.globalAlpha = 0.38;
  g.drawImage(b, 0, 0);
  // and a soft darkening right at the torn edge, where handmade paper is thinner and fibrous
  g.globalAlpha = 0.18;
  g.filter = "blur(5px)";
  tracePath(g, outline, S, S);
  g.strokeStyle = "#9b7a50";
  g.lineWidth = 14;
  g.stroke();
  g.restore();

  const t = toTex(c);
  t.generateMipmaps = true;
  return t;
}

/** Baked soft shadow of the sheet on the desk (sun from the upper left → shadow to the lower right). */
export const SHADOW_MARGIN = 0.7;
export function shadowTexture(outline: V2[], S = 1024) {
  const [c, g] = canvas(S, S);
  g.fillStyle = "#000";
  g.fillRect(0, 0, S, S);
  const u = S / (BW + SHADOW_MARGIN * 2);
  // wide penumbra, offset
  g.filter = `blur(${Math.round(0.09 * u)}px)`;
  g.fillStyle = "rgba(255,255,255,0.75)";
  tracePath(g, outline, S, S, SHADOW_MARGIN, 0.07, 0.09);
  g.fill();
  // tight contact shadow
  g.filter = `blur(${Math.max(2, Math.round(0.018 * u))}px)`;
  g.fillStyle = "rgba(255,255,255,0.9)";
  tracePath(g, outline, S, S, SHADOW_MARGIN, 0.012, 0.016);
  g.fill();
  g.filter = "none";
  return toTex(c, false);
}

/** The ivory desk: a soft radial light falloff and a little grain. */
export function deskTexture(S = 1024) {
  const [c, g] = canvas(S, S);
  const grd = g.createRadialGradient(S / 2, S / 2, S * 0.05, S / 2, S / 2, S * 0.55);
  grd.addColorStop(0, "#FAF5EC");
  grd.addColorStop(0.55, "#F3EBDC");
  grd.addColorStop(1, "#E9DEC9");
  g.fillStyle = grd;
  g.fillRect(0, 0, S, S);
  const r = rng(9);
  for (let i = 0; i < 9000; i++) {
    g.globalAlpha = 0.03 + r() * 0.04;
    g.fillStyle = r() < 0.5 ? "#ffffff" : "#b9a27e";
    g.fillRect(r() * S, r() * S, 1 + r() * 1.5, 1 + r() * 1.5);
  }
  return toTex(c);
}

/** Brass tag face with an engraved Devanagari name. Redrawn once the webfont has loaded. */
export const TAG_PX: [number, number] = [512, 160];
export function drawTag(c: HTMLCanvasElement, text: string, family: string) {
  const [W, H] = TAG_PX;
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, "#C6A46C");
  grd.addColorStop(0.45, "#A98652");
  grd.addColorStop(1, "#BC985F");
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
  // brushing
  const r = rng(text.length * 31 + 7);
  for (let i = 0; i < 260; i++) {
    g.globalAlpha = 0.05 + r() * 0.07;
    g.strokeStyle = r() < 0.5 ? "#f6e3b8" : "#7d5f33";
    g.lineWidth = 0.6 + r();
    const y = r() * H;
    const x = r() * W;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 40 + r() * 140, y + (r() - 0.5) * 2);
    g.stroke();
  }
  g.globalAlpha = 1;
  // engraved inner border
  const rr = (x: number, y: number, w: number, h: number, rad: number) => {
    g.beginPath();
    g.roundRect(x, y, w, h, rad);
  };
  g.lineWidth = 3;
  rr(17, 19, W - 34, H - 36, (H - 36) / 2);
  g.strokeStyle = "rgba(255,240,205,0.7)";
  g.stroke();
  rr(17, 17, W - 34, H - 34, (H - 34) / 2);
  g.strokeStyle = "rgba(70,46,18,0.75)";
  g.stroke();
  // the name: dark cut with a light lower lip
  let size = 92;
  const fam = family || "serif";
  g.font = `${size}px ${fam}`;
  const wMax = W - 120;
  const m = g.measureText(text).width;
  if (m > wMax) {
    size = Math.floor((size * wMax) / m);
    g.font = `${size}px ${fam}`;
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  const y = H / 2 + size * 0.12;
  g.fillStyle = "rgba(255,236,196,0.6)";
  g.fillText(text, W / 2 + 1, y + 2.5);
  g.fillStyle = "#2a1b09";
  g.fillText(text, W / 2, y);
  g.globalAlpha = 0.35;
  g.fillStyle = "#1f1408";
  g.fillText(text, W / 2 - 0.8, y - 1.2);
  g.globalAlpha = 1;
}
