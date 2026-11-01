/** Phones and small tablets: lighter pixel ratio, shadow maps, noise maps and textures (read once, when the GL chunk loads). */
export const LITE = typeof window !== "undefined" && window.innerWidth < 1024;
