import * as THREE from "three";

/** Small seeded PRNG (mulberry32) so procedural textures look the same on every visit. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tileable fbm value noise, 0..1, size×size. */
export function fbm(size: number, seed: number, octaves = 5, base = 8) {
  const r = rng(seed);
  const out = new Float32Array(size * size);
  let amp = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    const g = base << o;
    const lattice = new Float32Array(g * g).map(() => r());
    for (let y = 0; y < size; y++) {
      const fy = (y / size) * g;
      const y0 = Math.floor(fy);
      const ty = fy - y0;
      const sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * g;
        const x0 = Math.floor(fx);
        const tx = fx - x0;
        const sx = tx * tx * (3 - 2 * tx);
        const a = lattice[(y0 % g) * g + (x0 % g)];
        const b = lattice[(y0 % g) * g + ((x0 + 1) % g)];
        const c = lattice[((y0 + 1) % g) * g + (x0 % g)];
        const d = lattice[((y0 + 1) % g) * g + ((x0 + 1) % g)];
        out[y * size + x] += amp * (a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy);
      }
    }
    total += amp;
    amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

/** Roughness and normal maps from the same noise (§6.1 stone). */
export function noiseTextures(size: number, seed: number, strength = 2.2) {
  const h = fbm(size, seed, 6, 6);
  const rough = new Uint8Array(size * size * 4);
  const normal = new Uint8Array(size * size * 4);
  const at = (x: number, y: number) => h[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const v = h[y * size + x];
      const r = Math.round((0.72 + v * 0.28) * 255);
      rough[i] = rough[i + 1] = rough[i + 2] = r;
      rough[i + 3] = 255;
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength * 8;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength * 8;
      const len = Math.hypot(dx, dy, 1);
      normal[i] = Math.round((-dx / len) * 127.5 + 127.5);
      normal[i + 1] = Math.round((dy / len) * 127.5 + 127.5);
      normal[i + 2] = Math.round((1 / len) * 127.5 + 127.5);
      normal[i + 3] = 255;
    }
  const mk = (data: Uint8Array) => {
    const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.needsUpdate = true;
    return t;
  };
  return { rough: mk(rough), normal: mk(normal), height: h };
}
