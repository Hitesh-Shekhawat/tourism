import * as THREE from "three";

/**
 * A full-view background quad (drawn first, no depth) that cover-fits a texture into whatever
 * rect the drei <View> currently has. uAspect = view w/h, uImage = texture w/h.
 */
export function screenMaterial(map: THREE.Texture, imageAspect: number, focusY = 0.5) {
  return new THREE.ShaderMaterial({
    uniforms: { uMap: { value: map }, uAspect: { value: 1 }, uImage: { value: imageAspect }, uFocusY: { value: focusY }, uDim: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap; uniform float uAspect; uniform float uImage; uniform float uFocusY; uniform float uDim;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        if (uAspect > uImage) { float s = uImage / uAspect; uv.y = (uv.y - (1.0 - uFocusY)) * s + (1.0 - uFocusY); }
        else { float s = uAspect / uImage; uv.x = (uv.x - 0.5) * s + 0.5; }
        vec4 c = texture2D(uMap, uv);
        gl_FragColor = vec4(c.rgb * uDim, 1.0);
        #include <colorspace_fragment>
      }`,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
}
