/**
 * Recolor a dark monochrome mark to a brand color while keeping the artwork's
 * own antialiasing: pixels darker than `body` become the target color, pixels
 * between `body` and `paper` fade from that color to white, and lighter pixels
 * (backgrounds, highlights) are left exactly as they were.
 */

/**
 * Parse `#rgb`, `#rrggbb`, or `#rrggbbaa`.
 * @param {string} hex - color string.
 * @returns {{ r: number, g: number, b: number }} channels.
 */
export function parseColor(hex) {
  const value = hex.trim()
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value)
  if (match === null) throw new Error(`invalid color: ${hex}`)
  const digits = match[1]
  const expand = (part) => parseInt(part.length === 1 ? part + part : part, 16)
  if (digits.length === 3) {
    return { r: expand(digits[0]), g: expand(digits[1]), b: expand(digits[2]) }
  }
  return {
    r: parseInt(digits.slice(0, 2), 16),
    g: parseInt(digits.slice(2, 4), 16),
    b: parseInt(digits.slice(4, 6), 16),
  }
}

/**
 * Map every sufficiently dark pixel of an RGBA buffer onto a brand color.
 * @param {Buffer} rgba - source pixels, 4 bytes each.
 * @param {{ r: number, g: number, b: number }} color - target brand color.
 * @param {{ body?: number, paper?: number }} [thresholds] - luminance cutoffs (0-255).
 * @returns {Buffer} a new RGBA buffer.
 */
export function recolorRgba(rgba, color, thresholds = {}) {
  const body = thresholds.body ?? 72
  const paper = thresholds.paper ?? 200
  if (paper <= body) throw new Error('paper threshold must be greater than the body threshold')

  const out = Buffer.from(rgba)
  for (let i = 0; i < out.length; i += 4) {
    const alpha = out[i + 3]
    if (alpha === 0) continue
    const luminance = 0.2126 * out[i] + 0.7152 * out[i + 1] + 0.0722 * out[i + 2]
    if (luminance >= paper) continue
    if (luminance <= body) {
      out[i] = color.r
      out[i + 1] = color.g
      out[i + 2] = color.b
      continue
    }
    const fade = (luminance - body) / (paper - body)
    out[i] = Math.round(color.r * (1 - fade) + 255 * fade)
    out[i + 1] = Math.round(color.g * (1 - fade) + 255 * fade)
    out[i + 2] = Math.round(color.b * (1 - fade) + 255 * fade)
  }
  return out
}
