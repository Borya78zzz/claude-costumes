// Claude's mascot as pixel-art SVG: the body sits on a 16×11 grid, the
// accessories of each outfit are drawn around it on the same grid.

const SKIN = '#D97757'
const INK = '#1a1a1a'

const sparkle = (x: number, y: number, size: number, color: string, delay: number) =>
  `<text class="twinkle" style="animation-delay:${delay}s" x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="middle">✦</text>`

// What each outfit wears: drawn behind the body (`back`) or on top of it (`front`).
export const OUTFITS: Record<string, OutfitArt> = {
  cat: {
    back: `<path class="tail" d="M14 8 Q17.5 8 17 4" stroke="${SKIN}" stroke-width="1" fill="none" stroke-linecap="square"/>`,
    front: `
      <polygon points="2.5,3 4,0.4 5.5,3" fill="${SKIN}"/><polygon points="3.4,3 4,1.6 4.6,3" fill="#f4a6b8"/>
      <polygon points="10.5,3 12,0.4 13.5,3" fill="${SKIN}"/><polygon points="11.4,3 12,1.6 12.6,3" fill="#f4a6b8"/>
      <rect x="7.5" y="6.6" width="1" height="0.6" fill="#f4a6b8"/>
      <path d="M6.9 7.6 L7.5 8.1 L8 7.6 L8.5 8.1 L9.1 7.6" stroke="${INK}" stroke-width="0.25" fill="none"/>`,
  },
  pirate: {
    front: `
      <polygon points="1,3.2 15,3.2 13,0.4 8,-0.9 3,0.4" fill="#222"/>
      <rect x="7.4" y="0.6" width="1.2" height="1.1" fill="#f5f5f5"/>
      <rect x="7.6" y="1.7" width="0.8" height="0.4" fill="#f5f5f5"/>
      <line x1="2" y1="4.3" x2="14" y2="4.3" stroke="#111" stroke-width="0.3"/>
      <rect x="3.4" y="4.4" width="2.2" height="2.8" fill="#111"/>
      <circle cx="14.6" cy="7.8" r="0.45" fill="none" stroke="#f2c14e" stroke-width="0.25"/>`,
    hideLeftEye: true,
  },
  butler: {
    front: `
      <rect x="4" y="-2.6" width="8" height="5" fill="#1b1b1b"/>
      <rect x="4" y="1.2" width="8" height="0.7" fill="#7a1f2b"/>
      <rect x="2.5" y="2.3" width="11" height="0.9" fill="#1b1b1b"/>
      <polygon points="6.4,7.6 8,8.4 6.4,9.2" fill="#111"/><polygon points="9.6,7.6 8,8.4 9.6,9.2" fill="#111"/>
      <rect x="7.6" y="8" width="0.8" height="0.8" fill="#111"/>
      <circle cx="11.5" cy="6" r="1.35" fill="#ffffff" fill-opacity="0.2" stroke="#d4af37" stroke-width="0.25"/>
      <path d="M12.6 6.8 Q13.6 8.5 13 9.5" stroke="#d4af37" stroke-width="0.15" fill="none"/>`,
  },
  wizard: {
    back: `
      <line x1="15.5" y1="6.5" x2="18.5" y2="2.5" stroke="#6b4423" stroke-width="0.5"/>
      ${sparkle(18.8, 2.6, 2.2, '#ffd76a', 0)}`,
    front: `
      <polygon points="2.5,3.2 13.5,3.2 9.5,-6.5" fill="#5b3fa8"/>
      <rect x="1.5" y="2.6" width="13" height="0.9" fill="#46308a"/>
      ${sparkle(7, 0.6, 1.6, '#ffd76a', 0.4)}${sparkle(9.4, -2.4, 1.2, '#ffd76a', 1.1)}
      <polygon points="3.5,7.4 12.5,7.4 8,11.8" fill="#eeeeee"/>`,
  },
  anime: {
    back: `${sparkle(-1.5, 2, 2, '#ff7eb6', 0)}${sparkle(18, 1, 1.6, '#ffd76a', 0.7)}${sparkle(17.5, 9, 1.4, '#9ad0ff', 1.3)}`,
    front: `
      <polygon points="12.5,3 10.4,1.4 10.4,4.4" fill="#ff7eb6"/><polygon points="12.5,3 14.6,1.4 14.6,4.4" fill="#ff7eb6"/>
      <rect x="12" y="2.5" width="1" height="1" fill="#e0559a"/>
      <ellipse cx="3.6" cy="7.8" rx="0.8" ry="0.35" fill="#ff8fb1" fill-opacity="0.8"/>
      <ellipse cx="12.4" cy="7.8" rx="0.8" ry="0.35" fill="#ff8fb1" fill-opacity="0.8"/>`,
  },
  poet: {
    back: `<path d="M15.5 6.5 Q19 4 18.6 0.6 Q17 2.5 15.5 6.5 Z" fill="#fafafa" stroke="#bbb" stroke-width="0.15"/>`,
    front: `
      <ellipse cx="6.5" cy="2.9" rx="5" ry="1.5" fill="#b0303f"/>
      <rect x="6.2" y="1" width="0.6" height="0.6" fill="#b0303f"/>
      <rect x="2" y="7.6" width="12" height="1.1" fill="#e9c46a"/>
      <rect class="sway" x="11" y="8.6" width="1.3" height="3" fill="#e9c46a"/>`,
  },
  detective: {
    back: `
      <line x1="15.5" y1="6.4" x2="16.7" y2="5.4" stroke="#6b4423" stroke-width="0.5"/>
      <circle cx="18" cy="4.3" r="1.6" fill="#bfe3ff" fill-opacity="0.35" stroke="#8a8a8a" stroke-width="0.4"/>`,
    front: `
      <path d="M4 2.6 L4.4 0 L8 0.6 L11.6 0 L12 2.6 Z" fill="#5a4632"/>
      <rect x="4" y="1.8" width="8" height="0.7" fill="#2b2118"/>
      <rect x="1.5" y="2.4" width="13" height="0.9" fill="#5a4632"/>
      <polygon points="2,9 4.5,7 5.5,9" fill="#c2a878"/><polygon points="14,9 11.5,7 10.5,9" fill="#c2a878"/>`,
  },
  captain: {
    front: `
      <line x1="8" y1="-1.4" x2="8" y2="-3.4" stroke="#9aa" stroke-width="0.3"/>
      <circle class="beacon" cx="8" cy="-3.8" r="0.6" fill="#ff4d4d"/>
      <circle cx="8" cy="5.4" r="6.6" fill="#bfe8ff" fill-opacity="0.18" stroke="#dff4ff" stroke-width="0.35"/>
      <path d="M3.5 2.5 Q5 0.6 7 0.2" stroke="#ffffff" stroke-opacity="0.7" stroke-width="0.35" fill="none"/>
      <polygon points="8,7.3 8.4,8.1 9.2,8.2 8.6,8.7 8.8,9.5 8,9.1 7.2,9.5 7.4,8.7 6.8,8.2 7.6,8.1" fill="#ffd76a"/>`,
  },
  bear: {
    back: `
      <circle cx="3.5" cy="3" r="1.6" fill="#8b5a3c"/><circle cx="3.5" cy="3" r="0.8" fill="#d9a07a"/>
      <circle cx="12.5" cy="3" r="1.6" fill="#8b5a3c"/><circle cx="12.5" cy="3" r="0.8" fill="#d9a07a"/>`,
    front: `
      <ellipse cx="8" cy="7.7" rx="1.8" ry="1.1" fill="#f1d2b0"/>
      <rect x="7.5" y="7" width="1" height="0.6" fill="#3a2418"/>
      <path d="M8 7.6 L8 8.2 M7.4 8.4 Q8 8.8 8.6 8.4" stroke="#3a2418" stroke-width="0.2" fill="none"/>`,
  },
  courtier: {
    front: `
      <circle cx="3" cy="3.2" r="1.4" fill="#f3f0e8"/><circle cx="5.4" cy="2.5" r="1.4" fill="#f3f0e8"/>
      <circle cx="8" cy="2.3" r="1.5" fill="#f3f0e8"/><circle cx="10.6" cy="2.5" r="1.4" fill="#f3f0e8"/>
      <circle cx="13" cy="3.2" r="1.4" fill="#f3f0e8"/>
      <circle cx="2.4" cy="4.8" r="0.9" fill="#f3f0e8"/><circle cx="13.6" cy="4.8" r="0.9" fill="#f3f0e8"/>
      <circle cx="2.4" cy="6.4" r="0.9" fill="#f3f0e8"/><circle cx="13.6" cy="6.4" r="0.9" fill="#f3f0e8"/>
      <polygon points="6.6,7.6 9.4,7.6 8,9.8" fill="#ffffff" stroke="#ddd" stroke-width="0.15"/>
      <polygon points="6,-0.6 7,-2 8,-0.9 9,-2 10,-0.6" fill="#f2c14e"/>`,
  },
}

const STYLE = `
  .bob { animation: bob 2.6s ease-in-out infinite; }
  .busy .bob { animation-duration: 0.9s; }
  @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-0.45px); } }
  .shadow { transform-box: fill-box; transform-origin: center; animation: shadow 2.6s ease-in-out infinite; }
  .busy .shadow { animation-duration: 0.9s; }
  @keyframes shadow { 50% { transform: scaleX(0.85); opacity: 0.18; } }
  .eye { transform-box: fill-box; transform-origin: center; animation: blink 4.4s infinite; }
  @keyframes blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.12); } }
  .busy .arm { animation: tap 0.32s ease-in-out infinite alternate; }
  .busy .arm-r { animation-delay: 0.16s; }
  @keyframes tap { to { transform: translateY(-0.7px); } }
  .twinkle { animation: twinkle 1.8s ease-in-out infinite; }
  @keyframes twinkle { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
  .tail { transform-origin: 14px 8px; animation: wag 1.1s ease-in-out infinite alternate; }
  @keyframes wag { from { transform: rotate(-14deg); } to { transform: rotate(12deg); } }
  .sway { transform-box: fill-box; transform-origin: top; animation: sway 2.2s ease-in-out infinite alternate; }
  @keyframes sway { from { transform: rotate(-8deg); } to { transform: rotate(8deg); } }
  .beacon { animation: twinkle 1s steps(2) infinite; }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
`

const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// `back` sits behind the body, `front` over it. A sewn outfit may add `face`:
// what belongs on the face (glasses, a mustache), drawn over the eyes.
export type OutfitArt = { back?: string; front: string; face?: string; hideLeftEye?: true }

// The face a sewn outfit's `front` leaves open, whatever it draws: the eyes
// and the cheeks below them.
export const FACE = { x: 3.2, y: 4.2, width: 9.6, height: 4, rx: 1.2 }

export type MascotLook = {
  outfitId: string | null
  emoji?: string
  // A sewn outfit carries its own drawing.
  art?: OutfitArt
  isBusy: boolean
}

export const mascotSvg = ({ outfitId, emoji, art, isBusy }: MascotLook): string => {
  const outfit = art ?? (outfitId ? OUTFITS[outfitId] : undefined)
  // An outfit with no drawing of its own wears its emoji above the head.
  const badge =
    outfitId && !outfit && emoji
      ? `<text x="8" y="0.8" font-size="3.4" text-anchor="middle">${escapeXml(emoji)}</text>${sparkle(13.5, 0, 1.4, '#ffd76a', 0.5)}`
      : ''
  const leftEye = outfit?.hideLeftEye ? '' : `<rect class="eye" x="4" y="5" width="1" height="2" fill="${INK}"/>`
  // A sewn outfit is worn over the body with the face cut out of it, its
  // `face` layer and the eyes over that; a built-in one draws as designed.
  const isSewn = art !== undefined
  const worn = isSewn
    ? `<mask id="face" maskUnits="userSpaceOnUse" x="-4" y="-8" width="24" height="20">
      <rect x="-4" y="-8" width="24" height="20" fill="#fff"/>
      <rect x="${FACE.x}" y="${FACE.y}" width="${FACE.width}" height="${FACE.height}" rx="${FACE.rx}" fill="#000"/>
    </mask>
    <g mask="url(#face)">${art.front}</g>`
    : (outfit?.front ?? '')
  const shine = outfitId === 'anime'
    ? `<rect x="4" y="5" width="0.45" height="0.45" fill="#fff"/><rect x="11" y="5" width="0.45" height="0.45" fill="#fff"/>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -8 24 20" shape-rendering="crispEdges">
<style>${STYLE}</style>
<g class="${isBusy ? 'busy' : 'idle'}">
  <ellipse class="shadow" cx="8" cy="11.4" rx="6" ry="0.55" fill="#000" fill-opacity="0.28"/>
  <g class="bob">
    ${outfit?.back ?? ''}
    <rect x="3" y="9" width="1" height="2" fill="${SKIN}"/><rect x="5" y="9" width="1" height="2" fill="${SKIN}"/>
    <rect x="10" y="9" width="1" height="2" fill="${SKIN}"/><rect x="12" y="9" width="1" height="2" fill="${SKIN}"/>
    <rect class="arm arm-l" x="0" y="5" width="2" height="2" fill="${SKIN}"/>
    <rect class="arm arm-r" x="14" y="5" width="2" height="2" fill="${SKIN}"/>
    <rect x="2" y="3" width="12" height="6" fill="${SKIN}"/>
    ${isSewn ? worn : ''}
    ${leftEye}
    <rect class="eye" x="11" y="5" width="1" height="2" fill="${INK}"/>
    ${shine}
    ${isSewn ? (art.face ?? '') : worn}
    ${badge}
  </g>
</g>
</svg>`
}

// The terminal draws no SVG: Claude Code's own block-glyph mascot stands in.
export const mascotText = [' ▐▛███▜▌', '▝▜█████▛▘', '  ▘▘ ▝▝']
