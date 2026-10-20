/**
 * The one stylesheet that repaints the whale, shared by the host (which injects
 * it into every index response) and the in-page panel (which swaps it live).
 */

/** DeepSeek brand blue, used in the light palette. */
export const DEFAULT_LIGHT = '#4d6bfe'
/** A lighter blue that keeps contrast on the dark palette. */
export const DEFAULT_DARK = '#7aaaff'

/** `#rgb` or `#rrggbb`. */
export const COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * Keep only a plain hex color, so a config value can never inject CSS.
 * @param {unknown} value - candidate.
 * @param {string} fallback - used when the candidate is missing or invalid.
 * @returns {string} a safe CSS color.
 */
export function normalizeColor(value, fallback) {
  return typeof value === 'string' && COLOR.test(value.trim()) ? value.trim() : fallback
}

/**
 * Build the whale stylesheet.
 *
 * `FishLogo` is one SVG with `viewBox="0 0 23.16 17.04"` and a path filled with
 * `currentColor`; a CSS `fill` declaration wins over that presentation
 * attribute, so these two rules recolor the sidebar mark, the collapsed rail and
 * the conversation hero without touching any theme token.
 *
 * @param {{ light: string, dark: string }} colors - palette colors.
 * @returns {string} CSS text.
 */
export function whaleCss({ light, dark }) {
  return [
    `svg[viewBox="0 0 23.16 17.04"] path{fill:${light}}`,
    `body[data-ds-dark-theme] svg[viewBox="0 0 23.16 17.04"] path{fill:${dark}}`,
  ].join('\n')
}
