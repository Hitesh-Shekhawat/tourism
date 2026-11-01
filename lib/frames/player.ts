"use client";

import { frameUrl, sequences, type SequenceName } from "@/lib/day";

/**
 * Frame-sequence engine (§5), main-thread side. One FrameSet per sequence and size; frames are
 * fetched and decoded in workers/frames.worker.ts and arrive as transferred ImageBitmaps.
 */
export type Size = "desktop" | "mobile";
type Conn = { saveData?: boolean };

/** Desktop frames for landscape viewports with enough pixels; mobile for portrait, small screens and Save-Data. */
export function pickSize(): Size {
  const c = (navigator as Navigator & { connection?: Conn }).connection;
  if (c?.saveData) return "mobile";
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (h > w) return "mobile";
  return w * Math.min(window.devicePixelRatio || 1, 2) >= 1100 ? "desktop" : "mobile";
}

/** Every 8th frame, then every 4th, then the rest (1-based indices). */
export function progressiveOrder(from: number, to: number) {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const step of [8, 4, 1]) {
    for (let i = from; i <= to; i += step) if (!seen.has(i)) seen.add(i), out.push(i);
    if (!seen.has(to)) seen.add(to), out.push(to);
  }
  return out;
}

let worker: Worker | null | undefined;
const sets = new Map<string, FrameSet>();

function getWorker() {
  if (worker !== undefined) return worker;
  try {
    worker = typeof Worker !== "undefined" && "createImageBitmap" in window ? new Worker(new URL("../../workers/frames.worker.ts", import.meta.url)) : null;
  } catch {
    worker = null;
  }
  worker?.addEventListener("message", (e: MessageEvent) => {
    const m = e.data as { type: string; id: string; i: number; bitmap?: ImageBitmap };
    const set = sets.get(m.id);
    if (!set) return m.bitmap?.close();
    if (m.type === "frame" && m.bitmap) set.receive(m.i, m.bitmap);
    else if (m.type === "done") set.emit("done");
  });
  return worker;
}

type Listener = (ev: "frame" | "done", i?: number) => void;

export class FrameSet {
  readonly id: string;
  readonly count: number;
  readonly frames: (ImageBitmap | HTMLImageElement | null)[];
  loaded = 0;
  private requested = false;
  private listeners = new Set<Listener>();
  private firstBatch = 0;

  constructor(
    readonly name: SequenceName,
    readonly size: Size,
  ) {
    this.id = `${name}:${size}`;
    this.count = sequences[name].count;
    this.frames = new Array(this.count + 1).fill(null);
  }

  get meta() {
    return sequences[this.name];
  }
  url(i: number) {
    return frameUrl(this.meta, this.size, i);
  }

  on(f: Listener) {
    this.listeners.add(f);
    return () => void this.listeners.delete(f);
  }
  emit(ev: "frame" | "done", i?: number) {
    this.listeners.forEach((f) => f(ev, i));
  }

  /** Start (or resume) loading frames from..to progressively. */
  request(from = 1, to = this.count) {
    if (this.requested) return;
    this.requested = true;
    const order = progressiveOrder(from, to).filter((i) => !this.frames[i]);
    this.firstBatch = Math.ceil((to - from + 1) / 8);
    const w = getWorker();
    if (w) {
      w.postMessage({ type: "load", id: this.id, items: order.map((i) => ({ i, url: this.url(i) })) });
      return;
    }
    // Fallback: main-thread decode, 4 at a time
    let next = 0;
    const one = () => {
      if (!this.requested || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = "async";
      img.src = this.url(i);
      img
        .decode()
        .then(() => this.requested && this.receive(i, img))
        .catch(() => {})
        .finally(one);
    };
    for (let k = 0; k < 4; k++) one();
  }

  receive(i: number, bmp: ImageBitmap | HTMLImageElement) {
    if (this.frames[i]) {
      if ("close" in bmp) bmp.close();
      return;
    }
    this.frames[i] = bmp;
    this.loaded++;
    this.emit("frame", i);
    if (this.loaded === this.firstBatch) window.dispatchEvent(new CustomEvent("frames:batch", { detail: this.id }));
  }

  /** Free decoded frames (mobile memory rule: chapter more than 2 viewports away). */
  release() {
    this.requested = false;
    getWorker()?.postMessage({ type: "cancel", id: this.id });
    this.frames.forEach((f, i) => {
      if (f && "close" in f) f.close();
      this.frames[i] = null;
    });
    this.loaded = 0;
  }

  /** The loaded frame nearest to i (searching outwards). */
  nearest(i: number) {
    const k = Math.max(1, Math.min(this.count, Math.round(i)));
    if (this.frames[k]) return k;
    for (let d = 1; d < this.count; d++) {
      if (k - d >= 1 && this.frames[k - d]) return k - d;
      if (k + d <= this.count && this.frames[k + d]) return k + d;
    }
    return 0;
  }
}

export function getFrameSet(name: SequenceName, size: Size) {
  const id = `${name}:${size}`;
  let s = sets.get(id);
  if (!s) sets.set(id, (s = new FrameSet(name, size)));
  return s;
}

/**
 * Draws frame f (1-based, fractional) into a canvas. Cover fit for landscapes, contain for objects.
 * With `crossfade`, blends frame ⌊f⌋ into ⌊f⌋+1 by the fractional part (removes stepping on slow scrolls).
 * Paints only when the visible frame (or blend) differs from `prev`; returns the new key.
 */
export function drawFrame(ctx: CanvasRenderingContext2D, set: FrameSet, f: number, crossfade: boolean, fit = set.meta.fit, focusY = 0.5, prev = "") {
  const base = Math.floor(f);
  const frac = crossfade ? f - base : 0;
  const a = set.nearest(frac > 0.5 && !crossfade ? base + 1 : base);
  if (!a) return "";
  const b = frac > 0.02 ? set.nearest(base + 1) : a;
  const key = `${a}:${b}:${b !== a ? frac.toFixed(2) : 0}:${ctx.canvas.width}x${ctx.canvas.height}`;
  if (key === prev) return key;
  const { width: W, height: H } = ctx.canvas;
  const paint = (img: ImageBitmap | HTMLImageElement, alpha: number) => {
    const iw = "naturalWidth" in img ? img.naturalWidth : img.width;
    const ih = "naturalHeight" in img ? img.naturalHeight : img.height;
    const s = fit === "cover" ? Math.max(W / iw, H / ih) : Math.min(W / iw, H / ih);
    const dw = iw * s;
    const dh = ih * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) * focusY, dw, dh);
  };
  if (fit === "contain") ctx.clearRect(0, 0, W, H);
  paint(set.frames[a]!, 1);
  if (b !== a) paint(set.frames[b]!, frac);
  ctx.globalAlpha = 1;
  return key;
}

/** Size a canvas's backing store to its CSS box × min(dpr, 2). Returns true if it changed. */
export function fitCanvas(c: HTMLCanvasElement, w = c.clientWidth, h = c.clientHeight) {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(w * d));
  const H = Math.max(1, Math.round(h * d));
  if (c.width === W && c.height === H) return false;
  c.width = W;
  c.height = H;
  return true;
}
