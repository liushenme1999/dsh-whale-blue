/**
 * dsh-whale-blue — Cordis plugin half.
 *
 * The whale mark in the Web GUI is one shared SVG (`FishLogo`, viewBox
 * `0 0 23.16 17.04`): the sidebar brand mark, its collapsed rail, and the
 * empty-conversation hero. Its path carries `fill="currentColor"`, which
 * resolves to `--dsw-alias-label-primary` (near-black in the light palette).
 * A CSS `fill` declaration always beats that presentation attribute, so one
 * rule recolors the mark without touching theme tokens or any other text.
 *
 * The stylesheet reaches every index response through the documented
 * `webserver/index-inject` seat, which is why this works in both the desktop
 * window and a browser on a `dsh web` profile.
 */

/** DeepSeek brand blue (light palette). */
const DEFAULT_LIGHT = '#4d6bfe'
/** A lighter blue that stays readable on the dark palette. */
const DEFAULT_DARK = '#7aaaff'

/** `#rgb`, `#rrggbb`, or `#rrggbbaa`. */
const COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

/**
 * Accept only a plain hex color, so a config string can never inject CSS.
 * @param {unknown} value - candidate from the plugin row config.
 * @param {string} fallback - color used when the candidate is absent or invalid.
 * @returns {string} a safe CSS color.
 */
function color(value, fallback) {
  return typeof value === 'string' && COLOR.test(value.trim()) ? value.trim() : fallback
}

/** Cordis plugin name, used by loader diagnostics. */
export const name = 'whale-blue'

/**
 * Register the whale stylesheet for every rendered index page.
 * @param {import('@deepseek-ai/cordis').Context} ctx - host root context.
 * @param {{ light?: string, dark?: string }} [config] - colors from the plugin row.
 */
export function apply(ctx, config = {}) {
  const light = color(config.light, DEFAULT_LIGHT)
  const dark = color(config.dark, DEFAULT_DARK)
  const css = [
    `svg[viewBox="0 0 23.16 17.04"] path{fill:${light}}`,
    `body[data-ds-dark-theme] svg[viewBox="0 0 23.16 17.04"] path{fill:${dark}}`,
  ].join('\n')

  ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'style', text: css })
  })
}
