/**
 * "राजस्थान" wordmark, drawn in SVG (no raster image): three chhatris and a camel standing on the
 * word's shirorekha, the word itself live text in Yatra One (brush-lettered Devanagari). Two SVG
 * filters give it a smooth, hand-made finish: soft brush streaks plus a gentle lit sheen on the
 * lettering, and a smooth sandstone sheen on the pavilions. Read by assistive technology as "Rajasthan,".
 */

/** One chhatri in local units: centred on x = 0, standing on y = 0, ~130 wide and ~150 tall. */
function Chhatri({ x, y, s }: { x: number; y: number; s: number }) {
  // three tall cusped openings between slender pillars, cut out of the pavilion body (even-odd fill)
  const arches = [0, 1, 2]
    .map((i) => {
      const x0 = -50 + i * 35;
      return `M${x0} -6V-34Q${x0 + 15} -58 ${x0 + 30} -34V-6Z`;
    })
    .join("");
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* kalash finial */}
      <circle cx="0" cy="-150" r="3.4" />
      <path d="M-1.6 -147h3.2v8h-3.2zM-5 -139h10l-2 4h-6z" />
      {/* bulbous onion dome, wider than its drum, with a lotus collar */}
      <path d="M-50 -82Q-58 -112 -26 -128Q-8 -134 0 -136Q8 -134 26 -128Q58 -112 50 -82Z" />
      <path d="M-54 -82h108l-4 6h-100z" />
      {/* drum */}
      <path d="M-46 -76h92v8h-92z" />
      {/* chhajja: the deep sloping eave */}
      <path d="M-70 -56H70L58 -68H-58Z" />
      <path d={`M-56 -56H56V-6H-56Z${arches}`} fillRule="evenodd" />
      {/* plinth */}
      <path d="M-68 -6h136v6h-136z" />
      {/* dome ribs: thin shadow lines following the curve */}
      <g fill="none" stroke="#9c4a14" strokeOpacity="0.45" strokeWidth="1.4">
        <path d="M0 -134Q-4 -108 -2 -84" />
        <path d="M-14 -131Q-30 -108 -26 -84" />
        <path d="M14 -131Q30 -108 26 -84" />
        <path d="M-30 -122Q-50 -104 -44 -84" />
        <path d="M30 -122Q50 -104 44 -84" />
      </g>
    </g>
  );
}

export function RajasthanWordmark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 240" className={className} role="img" aria-label="Rajasthan,">
      <defs>
        {/* lettering: white to warm ivory, matching the hero type */}
        <linearGradient id="wm-ink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#faf5ec" />
          <stop offset="1" stopColor="#e9dfcf" />
        </linearGradient>
        {/* pavilions: bright saffron sandstone, darker at the base */}
        <linearGradient id="wm-stone" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#f7b365" />
          <stop offset="0.6" stopColor="#e8873a" />
          <stop offset="1" stopColor="#c8651f" />
        </linearGradient>

        {/* smooth brushed texture: long soft streaks + a lit bevel, clipped to the letters */}
        <filter id="wm-brush" x="-5%" y="-10%" width="110%" height="125%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.07" numOctaves="2" seed="11" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.86  0 0 0 0 0.8  0 0 0 0 0.72  0.7 0 0 0 -0.4" result="streaksRaw" />
          <feGaussianBlur in="streaksRaw" stdDeviation="1.2" result="streaks" />
          <feComposite in="streaks" in2="SourceAlpha" operator="in" result="streaksIn" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.8" result="soft" />
          <feSpecularLighting in="soft" surfaceScale="3.2" specularConstant="0.7" specularExponent="22" lightingColor="#fff4de" result="spec">
            <feDistantLight azimuth="235" elevation="48" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="streaksIn" />
          </feMerge>
          <feComposite in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.32" k4="0" />
        </filter>

        {/* smooth sandstone sheen for the pavilions */}
        <filter id="wm-stone-sheen" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="soft" />
          <feSpecularLighting in="soft" surfaceScale="2.6" specularConstant="0.55" specularExponent="16" lightingColor="#fff1d6" result="spec">
            <feDistantLight azimuth="235" elevation="52" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.5" k4="0" />
        </filter>
      </defs>

      <g fill="url(#wm-stone)" filter="url(#wm-stone-sheen)">
        <Chhatri x={374} y={146} s={0.96} />
        <Chhatri x={124} y={146} s={0.4} />
        <Chhatri x={176} y={146} s={0.3} />
        {/* a camel walking the ridge between the pavilions */}
        <g transform="translate(246 146)">
          <path d="M-14 -14Q-11 -27 -2 -20Q4 -29 11 -16Q13 -12 8 -11H-12Q-16 -11 -14 -14Z" />
          <path d="M8 -15Q14 -16 16 -24H21" fill="none" stroke="url(#wm-stone)" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M-10 -11L-11 0M-6 -11V0M4 -11V0M8 -11L9 0M-14 -14L-17 -8" stroke="url(#wm-stone)" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </g>

      <g fill="url(#wm-ink)" stroke="#5e2a0e" strokeWidth="1.2" strokeOpacity="0.5" paintOrder="stroke" strokeLinejoin="round" filter="url(#wm-brush)">
        {/* the brushed shirorekha, tapering out past the word under the big chhatri */}
        <path d="M92 145Q260 141 466 146Q470 148 466 151Q260 155 92 153Q86 149 92 145Z" />
        {/* a calligraphic curl leading into the word */}
        <path d="M94 146C64 143 48 160 60 170C70 178 84 170 78 160C76 157 72 157 70 160C72 164 68 168 64 165C58 160 68 150 94 153Z" />
        <text x="74" y="205" fontSize="100" className="wm-text" lang="hi" aria-hidden="true">
          राजस्थान
        </text>
      </g>
    </svg>
  );
}
