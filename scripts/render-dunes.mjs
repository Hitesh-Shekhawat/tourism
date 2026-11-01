/**
 * render-dunes.mjs
 *
 * Procedural, deterministic (seeded) frame-sequence renderer for the "day over
 * the Thar dunes near Jaisalmer" scroll sequence. Pure Node + sharp, no assets:
 * every frame is painted into a Float32 RGB buffer (sky gradient, sun disc and
 * glow, afterglow band, thin cloud streaks, faint stars, six layered dune
 * ridges with crisp crest lines, sun/shade faces split along leaning spines,
 * cast shade from neighbouring crests, aerial perspective, wind ripples),
 * dithered by +-1 level with a static interleaved-gradient pattern (prevents
 * banding after webp), then encoded with sharp.
 *
 * Landscape only: no people, animals, camps or text.
 *
 * Frame -> local time is deliberately non-linear (the site depends on it):
 *   f 1..95   : 05:30 -> 16:30  (time-lapse intro, autoplayed)
 *   f 95..150 : 16:30 -> 21:00  (scroll-scrubbed range)
 *   sunrise ~f 6, noon ~f 50, f 104 = golden-hour poster (~17:15),
 *   sun on the far ridge ~f 113, dusk f 114-122, night f 123-150.
 *
 * Regenerate (from the project root):
 *   node scripts/render-dunes.mjs                      # both sets, 150 frames each
 *   node scripts/render-dunes.mjs --set=mobile         # one set
 *   node scripts/render-dunes.mjs --frames=1,50,104 --out=some/dir   # previews
 * Output: <out>/desktop/0001.webp..0150.webp (1920x1080)
 *         <out>/mobile/0001.webp..0150.webp  (900x1600)
 * Same seed -> identical frames on every run.
 */
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { mkdirSync } from 'node:fs';
import { cpus } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const TOTAL = 150;
const SEED = 1729;

// U = world unit in px (dune sizes, sun scale); yaw shifts the camera right (degrees)
const SETS = {
  desktop: { W: 1920, H: 1080, U: 1080, horizon: 0.585, yaw: 0, q: 80, effort: 5 },
  mobile: { W: 900, H: 1600, U: 1180, horizon: 0.55, yaw: 23, q: 78, effort: 5 },
};

// ---------------------------------------------------------------- utilities
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const H = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

/** keyframe table [[key, number|[r,g,b]], ...] sorted by key, smoothstep interpolation */
function keyed(table, k) {
  if (k <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    if (k <= table[i][0]) {
      const [k0, v0] = table[i - 1]; const [k1, v1] = table[i];
      let t = (k - k0) / (k1 - k0); t = t * t * (3 - 2 * t);
      return typeof v0 === 'number' ? lerp(v0, v1, t) : mix3(v0, v1, t);
    }
  }
  return table[table.length - 1][1];
}
function noise1(x, seed) {
  const i = Math.floor(x); const f = x - i;
  const h = (n) => { const s = Math.sin((n + seed) * 127.1) * 43758.5453; return s - Math.floor(s); };
  const a = h(i), b = h(i + 1); const u = f * f * (3 - 2 * f);
  return a + (b - a) * u;
}

// ------------------------------------------------------------- time and sun
function frameToHours(f) {
  if (f <= 95) return 5.5 + ((f - 1) / 94) * 11;
  return 16.5 + ((f - 95) / 55) * 4.5;
}
/** stylised winter sun: rises ~06:00 left of frame, arcs, sets ~18:00 into the right-hand ridges */
function sunAt(hours) {
  const el = 50 * Math.sin((Math.PI * (hours - 5.95)) / 12.15); // degrees; 0 at ~05:57 and ~18:06
  const az = -8.5 + 48.5 * ((hours - 12) / 6); // degrees from view centre, + = right
  return { el, az };
}

// ------------------------------------------------------- palettes (by sun el)
// mid-sky stop: keeps the zenith/horizon blend from going grey at low sun
const MID = [
  [-32, H('#111622')], [-14, H('#1a2132')], [-8, H('#2e3447')], [-4, H('#564a4f')], [0, H('#9c726a')],
  [4, H('#bf9580')], [10, H('#d5ae93')], [20, H('#c9c7c0')], [50, H('#bccad4')],
];
const ZENITH = [
  [-32, H('#0d111b')], [-18, H('#101624')], [-12, H('#161e30')], [-8, H('#1e2b44')], [-4, H('#2a3d5c')],
  [0, H('#3b5577')], [4, H('#4f6a8c')], [9, H('#62809f')], [20, H('#7896b2')], [50, H('#87a2bc')],
];
const HORIZON = [
  [-32, H('#151b28')], [-18, H('#181f2e')], [-12, H('#212838')], [-8, H('#3c3946')], [-5, H('#6c4b45')],
  [-2.5, H('#a95e3f')], [0, H('#d27c47')], [3, H('#e69c5c')], [7, H('#efb878')], [12, H('#f1cc98')],
  [22, H('#f0dcbc')], [50, H('#eee5d4')],
];
const SUNCOL = [
  [-1, H('#ff6a30')], [0.5, H('#ff7a3a')], [3, H('#ff914c')], [7, H('#ffac62')], [12, H('#ffc27e')],
  [22, H('#ffdcae')], [35, H('#ffeed6')], [50, H('#fff4e4')],
];
const SUNINT = [[-1.5, 0], [0, 0.25], [2, 0.65], [6, 0.9], [14, 1.0], [30, 1.0]];
const DISC = [[-1, H('#f6884a')], [1, H('#ff9c55')], [4, H('#ffb868')], [9, H('#ffd690')], [18, H('#fff0c8')], [40, H('#fffaf0')]];
const GLOW = [[-10, 0], [-4, 0.3], [0, 0.95], [6, 1.0], [12, 0.85], [25, 0.4], [50, 0.32]];
const BAND = [[-14, 0], [-9, 0.18], [-5, 0.55], [-2, 0.75], [1, 0.62], [6, 0.38], [14, 0.14], [30, 0]];
const BANDCOL = [[-12, H('#563a3e')], [-6, H('#93472f')], [-2, H('#c4603a')], [2, H('#e08646')], [10, H('#efad68')]];
// skylight on the sand (multiplicative light colour): rose-violet bounce at low sun, ink-indigo at night
const AMB = [
  [-32, [0.07, 0.083, 0.118]], [-14, [0.09, 0.105, 0.15]], [-8, [0.17, 0.175, 0.25]], [-4, [0.29, 0.25, 0.32]],
  [0, [0.42, 0.32, 0.37]], [4, [0.5, 0.39, 0.43]], [10, [0.55, 0.45, 0.5]], [20, [0.6, 0.55, 0.6]], [50, [0.66, 0.64, 0.67]],
];

const ALBEDO = H('#dfb784');
const INDIGO = H('#2F4A6D');

// ------------------------------------------------------------- scene setup
function buildScene() {
  const rnd = mulberry32(SEED);
  // dune layers far (0) -> near (5); t = crest base as a fraction of the land height
  const defs = [
    { t: 0.0, amp: 0.009, count: 40, wMin: 0.06, wMax: 0.16, par: 0.04, fog: 0.64, rip: 0, lean: 0.7 },
    { t: 0.065, amp: 0.02, count: 26, wMin: 0.1, wMax: 0.26, par: 0.12, fog: 0.5, rip: 0, lean: -0.65 },
    { t: 0.16, amp: 0.036, count: 18, wMin: 0.16, wMax: 0.38, par: 0.25, fog: 0.36, rip: 0, lean: 0.5 },
    { t: 0.29, amp: 0.056, count: 13, wMin: 0.24, wMax: 0.52, par: 0.43, fog: 0.22, rip: 0.2, lean: -0.32 },
    { t: 0.48, amp: 0.085, count: 9, wMin: 0.36, wMax: 0.7, par: 0.68, fog: 0.1, rip: 0.6, lean: 0.4 },
    { t: 0.74, amp: 0.12, count: 6, wMin: 0.55, wMax: 1.0, par: 1.0, fog: 0.025, rip: 1, lean: -0.38 },
  ];
  const layers = defs.map((d, k) => {
    const bumps = [];
    const span = 4.2;
    for (let i = 0; i < d.count; i++) {
      const x = -span + ((i + 0.15 + rnd() * 0.7) / d.count) * 2 * span;
      const w = lerp(d.wMin, d.wMax, rnd());
      const slipRight = rnd() < 0.6;
      const ratio = lerp(0.4, 0.65, rnd()); // slip face narrower (steeper) than the windward side
      bumps.push({
        x, A: d.amp * lerp(0.5, 1.0, rnd()),
        wl: slipRight ? w : w * ratio, wr: slipRight ? w * ratio : w,
        slipRight, pw: k < 3 ? lerp(1.1, 1.4, rnd()) : lerp(1.5, 2.0, rnd()), ps: lerp(1.05, 1.35, rnd()),
      });
    }
    return {
      ...d, k, bumps,
      sharp: 7 / d.amp,
      albedo: mix3(ALBEDO, H('#dca06a'), (k / 5) * 0.55),
      und: [rnd() * 6.28, rnd() * 6.28, lerp(0.8, 1.6, rnd()), lerp(2.2, 3.6, rnd()), rnd() * 6.28],
      rippleSeed: rnd() * 1000,
    };
  });
  // hero composition: a broad near dune left of centre with its slip face toward the
  // setting sun, and a low saddle on the right so the sun meets the far ridge
  layers[5].bumps = layers[5].bumps.filter((b) => b.x < -1.1 || b.x > 1.6);
  layers[5].bumps.push({ x: -0.32, A: 0.15, wl: 1.05, wr: 0.5, slipRight: true, pw: 1.7, ps: 1.15 });
  layers[5].bumps.push({ x: 0.95, A: 0.07, wl: 0.45, wr: 0.75, slipRight: false, pw: 1.8, ps: 1.2 });
  layers[4].bumps = layers[4].bumps.filter((b) => Math.abs(b.x - 0.42) > 0.35);
  layers[4].bumps.push({ x: 0.36, A: 0.07, wl: 0.55, wr: 0.3, slipRight: true, pw: 1.7, ps: 1.15 });

  const stars = [];
  for (let i = 0; i < 380; i++) stars.push({ x: rnd(), y: rnd(), m: Math.pow(rnd(), 3.2), tw: rnd() });
  const clouds = [];
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: lerp(-0.75, 0.75, (i + rnd()) / 5), h: lerp(0.06, 0.15, rnd()),
      len: lerp(0.2, 0.42, rnd()), th: lerp(0.006, 0.011, rnd()), drift: lerp(0.02, 0.05, rnd()),
    });
  }
  return { layers, stars, clouds };
}

// ----------------------------------------------------------------- render
function renderFrame(f, setName, scene) {
  const S = SETS[setName];
  const { W, H: HH, U } = S;
  const hours = frameToHours(f);
  const { el, az } = sunAt(hours);
  const prog = (f - 1) / (TOTAL - 1);

  const yh = S.horizon * HH;
  const pxDeg = U * 0.0125;
  const sunX = W / 2 + (az - S.yaw) * pxDeg;
  const sunY = yh - el * pxDeg;
  const sunR = U * 0.021;

  const zen = keyed(ZENITH, el);
  const mid = keyed(MID, el);
  let hor = keyed(HORIZON, el);
  const morning = smooth(12.5, 9, hours);
  hor = mix3(hor, mix3(hor, H('#e6b3a2'), 0.5), morning * smooth(14, 2, Math.abs(el)) * 0.45);
  const sunC = keyed(SUNCOL, el);
  const sunI = keyed(SUNINT, el);
  const discC = keyed(DISC, el);
  const glowK = keyed(GLOW, el);
  const bandK = keyed(BAND, el);
  const bandC = keyed(BANDCOL, el);
  const starK = smooth(-6, -14, el);

  const buf = new Float32Array(W * HH * 3);

  // ---- sky
  const rowCol = new Float32Array(HH * 3);
  for (let y = 0; y < HH; y++) {
    const v = clamp((yh - y) / yh, 0, 1);
    const g = Math.pow(v, 0.6);
    const c = g < 0.42 ? mix3(hor, mid, smooth(0, 0.42, g)) : mix3(mid, zen, smooth(0.42, 1, g));
    rowCol[y * 3] = c[0]; rowCol[y * 3 + 1] = c[1]; rowCol[y * 3 + 2] = c[2];
  }
  const glowR1 = U * lerp(0.16, 0.3, smooth(0, 30, el));
  const glowR2 = U * 0.065;
  const bandH = U * 0.075;
  const skyBottom = Math.min(HH, Math.ceil(yh + U * 0.03));
  for (let y = 0; y < skyBottom; y++) {
    const band = bandK * Math.exp(-Math.max(0, yh - y) / bandH);
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      let r = rowCol[y * 3], g = rowCol[y * 3 + 1], b = rowCol[y * 3 + 2];
      if (band > 0.002) {
        const k = band * (0.35 + 0.65 * Math.exp(-Math.abs(x - sunX) / (U * 0.75)));
        r = lerp(r, bandC[0], k); g = lerp(g, bandC[1], k); b = lerp(b, bandC[2], k);
      }
      if (glowK > 0.001) {
        const dx = x - sunX; const dy = (y - sunY) * 1.7;
        const d = Math.sqrt(dx * dx + dy * dy);
        const k = 0.9 * glowK * (0.55 * Math.exp(-d / glowR1) + 0.45 * Math.exp(-(d * d) / (glowR2 * glowR2)));
        r += (sunC[0] - r) * k; g += (sunC[1] - g) * k; b += (sunC[2] - b) * k;
      }
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b;
    }
  }

  // ---- stars: subtle, static, fading toward the horizon
  if (starK > 0.001) {
    for (const s of scene.stars) {
      const x = Math.floor(s.x * W);
      const y = Math.floor(s.y * yh * 0.97);
      const alt = clamp((yh - y) / yh, 0, 1);
      const a = starK * (0.08 + 0.34 * s.m) * smooth(0.06, 0.4, alt);
      if (a < 0.01) continue;
      const tint = s.tw < 0.3 ? [1, 0.92, 0.8] : [0.9, 0.93, 1];
      const plot = (px, py, aa) => {
        if (px < 0 || py < 0 || px >= W || py >= HH) return;
        const i = (py * W + px) * 3;
        buf[i] += (tint[0] - buf[i]) * aa; buf[i + 1] += (tint[1] - buf[i + 1]) * aa; buf[i + 2] += (tint[2] - buf[i + 2]) * aa;
      };
      plot(x, y, a);
      if (s.m > 0.6) { plot(x + 1, y, a * 0.3); plot(x - 1, y, a * 0.3); plot(x, y + 1, a * 0.3); plot(x, y - 1, a * 0.3); }
    }
  }

  // ---- sun disc (the dunes painted later occlude it)
  if (el > -2.5 && sunY + sunR > 0 && sunY - sunR < HH) {
    const x0 = Math.max(0, Math.floor(sunX - sunR - 2)), x1 = Math.min(W - 1, Math.ceil(sunX + sunR + 2));
    const y0 = Math.max(0, Math.floor(sunY - sunR - 2)), y1 = Math.min(HH - 1, Math.ceil(sunY + sunR + 2));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x + 0.5 - sunX, y + 0.5 - sunY);
      const a = clamp(sunR - d + 0.5, 0, 1);
      if (a <= 0) continue;
      const i = (y * W + x) * 3;
      const lim = 0.94 + 0.06 * (1 - d / sunR);
      buf[i] = lerp(buf[i], discC[0] * lim, a); buf[i + 1] = lerp(buf[i + 1], discC[1] * lim, a); buf[i + 2] = lerp(buf[i + 2], discC[2] * lim, a);
    }
  }

  // ---- thin flat cloud streaks at sunrise and sunset
  const cloudK = Math.max(
    smooth(-9, -3, el) * smooth(16, 6, el) * morning,
    smooth(-11, -4, el) * smooth(24, 10, el) * (1 - morning),
  );
  if (cloudK > 0.01) {
    const lit = mix3(sunC, H('#eaa06c'), 0.3);
    const dusk = smooth(1, -6, el);
    const under = mix3(mix3(lit, H('#B5562F'), 0.3), mix3(H('#5E1A1A'), zen, 0.45), dusk);
    const top = mix3(mix3(zen, hor, 0.55), mix3(H('#3a3d52'), zen, 0.5), dusk);
    for (const c of scene.clouds) {
      const cx = W / 2 + (c.x - S.yaw * 0.0125 + c.drift * prog) * U;
      const cy = yh - c.h * U;
      const L = c.len * U, T = c.th * U;
      const x0 = Math.max(0, Math.floor(cx - L / 2)), x1 = Math.min(W - 1, Math.ceil(cx + L / 2));
      for (let x = x0; x <= x1; x++) {
        const u = (x - cx) / (L / 2);
        const prof = Math.pow(Math.max(0, 1 - u * u), 0.7) * (0.85 + 0.15 * Math.sin(u * 7 + c.h * 40));
        if (prof <= 0) continue;
        const topY = cy - T * prof; const botY = cy + T * prof * 0.3;
        for (let y = Math.max(0, Math.floor(topY) - 1); y <= Math.min(HH - 1, Math.ceil(botY) + 1); y++) {
          const a = clamp(Math.min(y + 0.5 - topY, botY - (y - 0.5)), 0, 1) * cloudK * 0.9;
          if (a <= 0) continue;
          const col = mix3(top, under, smooth(0.3, 0.85, (y - topY) / (botY - topY)));
          const i = (y * W + x) * 3;
          buf[i] = lerp(buf[i], col[0], a); buf[i + 1] = lerp(buf[i + 1], col[1], a); buf[i + 2] = lerp(buf[i + 2], col[2], a);
        }
      }
    }
  }

  // ---- dunes
  const D2R = Math.PI / 180;
  const cosEl = Math.cos(el * D2R), sinEl = Math.sin(el * D2R);
  const Lx = Math.sin(az * D2R) * cosEl, Ly = Math.max(sinEl, -0.2), Lz = -Math.cos(az * D2R) * cosEl * 0.22;
  const sunRight = az > 0;
  const amb = keyed(AMB, el);
  const night = smooth(-4, -16, el);
  const fogC = mix3(mix3(hor, zen, 0.3), mix3(INDIGO, hor, 0.55), 0.15);
  // px drop per px toward the sun side; offset so shadows lengthen steadily instead of racing at sunset
  const shadowSlope = Math.tan((Math.max(el, -2) + 6) * D2R) * 1.0;
  const lowSun = smooth(26, 5, el) * smooth(-2, 1, el);
  const rimK = smooth(14, 1, el) * smooth(-1.5, 0.5, el) * 0.5;
  const panTotal = 0.12; // world units over the whole sequence, nearest layer
  const push = 0.04; // dolly-in, nearest layer

  const nL = scene.layers.length;
  const crest = [], slope = [], shade = [];
  for (let k = 0; k < nL; k++) {
    const Ld = scene.layers[k];
    const zoom = 1 + push * prog * Ld.par;
    const pan = (prog - 0.5) * panTotal * Ld.par;
    const baseY = yh + Ld.t * (HH - yh) * (1 + push * prog * Ld.par * 1.4);
    const cr = new Float32Array(W), hpx = new Float32Array(W), sl = new Float32Array(W);
    const [u1, u2, f1, f2] = Ld.und;
    const kS = Ld.sharp;
    for (let x = 0; x < W; x++) {
      const wx = (x - W / 2) / (U * zoom) + pan;
      let sum = 0;
      for (let b = 0; b < Ld.bumps.length; b++) {
        const B = Ld.bumps[b];
        const dx = wx - B.x;
        const right = dx >= 0;
        const u = Math.abs(dx) / (right ? B.wr : B.wl);
        if (u >= 1) continue;
        const slip = right === B.slipRight;
        // slip face: near-straight steep fall from a sharp brink; windward: long convex back
        const v = B.A * (slip ? Math.pow(1 - u, B.ps) : 1 - Math.pow(u, B.pw) * (0.6 + 0.4 * u));
        sum += Math.exp(v * kS) - 1;
      }
      let h = Math.log(1 + sum) / kS;
      h += Ld.amp * 0.16 * (Math.sin(wx * f1 + u1) * 0.6 + Math.sin(wx * f2 + u2) * 0.4);
      hpx[x] = h * U * zoom;
      cr[x] = baseY - hpx[x];
    }
    for (let x = 0; x < W; x++) {
      const a = hpx[Math.max(0, x - 1)], b = hpx[Math.min(W - 1, x + 1)];
      sl[x] = (b - a) / 2; // px of height per px; > 0 rises to the right
    }
    // cast shade along the crest profile: a column is shaded when a crest toward the sun
    // rises above the sun ray (linear scan, shadows lengthen as the sun lowers)
    const sh = new Float32Array(W); // >0 = lit margin in px, <0 = in shade
    // horizon scan includes the column itself; the test skips the nearest gap px so a
    // smoothly lit slope is not "shaded" by its own next pixel
    const hz = new Float32Array(W);
    const gap = Math.round(U * 0.03);
    let run = -1e9;
    if (sunRight) {
      for (let x = W - 1; x >= 0; x--) { run = Math.max(run - shadowSlope, hpx[x]); hz[x] = run; }
      for (let x = 0; x < W; x++) { const j = x + gap; sh[x] = j < W ? hpx[x] - (hz[j] - gap * shadowSlope) : 1e3; }
    } else {
      for (let x = 0; x < W; x++) { run = Math.max(run - shadowSlope, hpx[x]); hz[x] = run; }
      for (let x = 0; x < W; x++) { const j = x - gap; sh[x] = j >= 0 ? hpx[x] - (hz[j] - gap * shadowSlope) : 1e3; }
    }
    crest.push(cr); slope.push(sl); shade.push(sh);
    Ld._zoom = zoom; Ld._pan = pan;
  }
  const occ = scene.layers.map(() => new Float32Array(W));
  for (let x = 0; x < W; x++) {
    let m = HH + 2;
    for (let k = nL - 1; k >= 0; k--) { occ[k][x] = m; m = Math.min(m, crest[k][x]); }
  }

  for (let k = 0; k < nL; k++) {
    const Ld = scene.layers[k];
    const cr = crest[k], oc = occ[k], sl = slope[k], sh = shade[k];
    const alb = mix3(Ld.albedo, [0.78, 0.8, 0.84], night * 0.75); // moonless sand reads neutral-indigo
    const fogK = Ld.fog * (1 - night * 0.3);
    const ampPx = Ld.amp * U * Ld._zoom;
    const s0 = (Ld.amp / Ld.wMax) * 0.5 * 1.0; // slope that counts as a "full" face
    const ripK = Ld.rip;
    const [, , , , lp] = Ld.und;
    let minY = HH;
    for (let x = 0; x < W; x++) minY = Math.min(minY, cr[x]);
    const leanArr = new Float32Array(W);
    for (let x = 0; x < W; x++) {
      const wx = (x - W / 2) / (U * Ld._zoom) + Ld._pan;
      leanArr[x] = Ld.lean * (1 + 0.35 * Math.sin(wx * 2.3 + lp));
    }
    for (let y = Math.max(0, Math.floor(minY)); y < HH; y++) {
      for (let x = 0; x < W; x++) {
        const c = cr[x];
        if (y + 1 < c || y > oc[x] + 1.5) continue;
        const sd = x > 0 ? Math.abs(cr[x] - cr[x - 1]) : 0;
        const cov = clamp((y + 0.5 - c) / (1 + sd) + 0.5, 0, 1);
        if (cov <= 0) continue;
        const d = Math.max(0, y - c);
        const deep = Math.min(1, d / (ampPx * 1.8 + 1));
        // sample the crest profile along a leaning spine -> crisp diagonal face splits
        let xs = x - leanArr[x] * d;
        if (xs < 0) xs = 0; else if (xs > W - 1.001) xs = W - 1.001;
        const xi = xs | 0, xf = xs - xi;
        const s = (sl[xi] * (1 - xf) + sl[xi + 1] * xf) / Math.max(1e-6, U * Ld._zoom) * U * Ld._zoom;
        const shd = sh[xi] * (1 - xf) + sh[xi + 1] * xf;
        // flat fields: slope compressed hard so each face reads as one colour
        const a = Math.tanh(s / (s0 * 0.08));
        const nx = -a * (0.8 - 0.25 * deep);
        const ny = 0.58 - 0.2 * deep;
        const nz = 0.42 + 0.22 * deep;
        let dif = Math.max(0, nx * Lx + ny * Ly + nz * Lz);
        // cast shade creeping up from the valleys (deeper pixels shade a little earlier)
        const castLit = clamp((shd - deep * ampPx * 0.12) * 12 + 0.5, 0, 1);
        dif *= castLit;
        const bounce = (1 + 0.1 * deep) * (1 + night * (0.55 - 0.3 * smooth(-14, -30, el)) * Math.max(0, sunRight ? nx : -nx));
        let lr = amb[0] * bounce + sunC[0] * sunI * dif * 1.1;
        let lg = amb[1] * bounce + sunC[1] * sunI * dif * 1.1;
        let lb = amb[2] * bounce + sunC[2] * sunI * dif * 1.1;
        if (rimK > 0 && d < 3) {
          const rk = rimK * (1 - d / 3) * (0.35 + 0.65 * Math.exp(-Math.abs(x - sunX) / (U * 0.6))) * castLit;
          lr += sunC[0] * rk; lg += sunC[1] * rk; lb += sunC[2] * rk;
        }
        let r = alb[0] * lr, g = alb[1] * lg, b = alb[2] * lb;
        if (ripK > 0 && d > 5) {
          const wx = (x - W / 2) / (U * Ld._zoom) + Ld._pan;
          const ph = 24 * Math.log(1 + d / (U * 0.02)) + 2.4 * noise1(wx * 4, Ld.rippleSeed) + wx * 3.2;
          const tri = Math.abs(ph - Math.floor(ph) - 0.5) * 2;
          const line = smooth(0.8, 0.95, tri);
          const strength = ripK * (0.018 + 0.05 * lowSun * (0.5 + 0.5 * Math.min(1, dif * 3))) * smooth(5, 30, d);
          const m = 1 - strength * line;
          r *= m; g *= m; b *= m;
        }
        r = lerp(r, fogC[0], fogK); g = lerp(g, fogC[1], fogK); b = lerp(b, fogC[2], fogK);
        const i = (y * W + x) * 3;
        buf[i] = lerp(buf[i], r, cov); buf[i + 1] = lerp(buf[i + 1], g, cov); buf[i + 2] = lerp(buf[i + 2], b, cov);
      }
    }
  }

  // ---- dither (+-1 level, static 2x2-cell interleaved-gradient noise) and quantise
  const out = new Uint8Array(W * HH * 3);
  for (let y = 0; y < HH; y++) {
    for (let x = 0; x < W; x++) {
      const bx = x >> 1, by = y >> 1; // 2x2 cells survive webp's quantiser better than per-pixel noise
      const v0 = 0.06711056 * bx + 0.00583715 * by;
      const q = 52.9829189 * (v0 - Math.floor(v0));
      const dth = (q - Math.floor(q) - 0.5) * 2.0;
      const i = (y * W + x) * 3;
      for (let c = 0; c < 3; c++) {
        let v = buf[i + c];
        if (v > 0.86) v = 0.86 + (1 - Math.exp(-(v - 0.86) / 0.14)) * 0.14; // soft shoulder
        out[i + c] = clamp(Math.round(v * 255 + dth), 0, 255);
      }
    }
  }
  return { out, W, H: HH, q: S.q, effort: S.effort };
}

async function renderAndSave(f, setName, scene, outDir) {
  const { out, W, H: HH, q, effort } = renderFrame(f, setName, scene);
  const file = path.join(outDir, setName, String(f).padStart(4, '0') + '.webp');
  await sharp(out, { raw: { width: W, height: HH, channels: 3 } })
    .webp({ quality: q, effort, smartSubsample: true })
    .toFile(file);
}

// --------------------------------------------------------------- threading
if (!isMainThread) {
  sharp.concurrency(1);
  const scene = buildScene();
  const { jobs, outDir } = workerData;
  for (const [f, setName] of jobs) {
    await renderAndSave(f, setName, scene, outDir);
    parentPort.postMessage(1);
  }
} else {
  const args = Object.fromEntries(process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=?(.*)$/); return m ? [m[1], m[2]] : [a, ''];
  }));
  const set = args.set || 'both';
  const sets = set === 'both' ? ['desktop', 'mobile'] : [set];
  for (const s of sets) if (!SETS[s]) { console.error('unknown --set ' + s); process.exit(1); }
  const frames = args.frames
    ? args.frames.split(',').map((n) => parseInt(n, 10)).filter((n) => n >= 1 && n <= TOTAL)
    : Array.from({ length: TOTAL }, (_, i) => i + 1);
  const outDir = path.resolve(args.out || 'public/frames/dunes');
  for (const s of sets) mkdirSync(path.join(outDir, s), { recursive: true });

  const jobs = [];
  for (const s of sets) for (const f of frames) jobs.push([f, s]);
  const nW = Math.max(1, Math.min(jobs.length, cpus().length - 2, 10));
  const buckets = Array.from({ length: nW }, () => []);
  jobs.forEach((j, i) => buckets[i % nW].push(j));
  const t0 = performance.now();
  let done = 0;
  await Promise.all(buckets.map((b) => new Promise((res, rej) => {
    const w = new Worker(new URL(import.meta.url), { workerData: { jobs: b, outDir } });
    w.on('message', () => {
      done++;
      if (done % 25 === 0 || done === jobs.length) console.log(`  ${done}/${jobs.length} frames (${((performance.now() - t0) / 1000).toFixed(1)}s)`);
    });
    w.on('error', rej);
    w.on('exit', (c) => (c === 0 ? res() : rej(new Error('worker exit ' + c))));
  })));
  const secs = (performance.now() - t0) / 1000;
  console.log(`rendered ${jobs.length} frames [${sets.join(', ')}] with ${nW} workers in ${secs.toFixed(1)}s -> ${outDir}`);
}
