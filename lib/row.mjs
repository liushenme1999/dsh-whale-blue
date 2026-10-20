/**
 * The managed patch row this project owns inside a profile's
 * `cordis.patch.yml`. Both the CLI and the in-page panel write the same block,
 * always between markers, so a rewrite never disturbs the user's own rows.
 */

/** Opening marker of the managed block. */
export const START = '# dsh-whale-blue:start'
/** Closing marker of the managed block. */
export const END = '# dsh-whale-blue:end'

/** @returns {{ light: string, dark: string, enabled: boolean, desktop: boolean, ui: boolean }} the defaults. */
export function defaults() {
  return { light: '#4d6bfe', dark: '#7aaaff', enabled: true, desktop: false, ui: true }
}

/**
 * Render the managed YAML block.
 * @param {{ name: string, light: string, dark: string, enabled: boolean, desktop: boolean, ui: boolean, patchFile?: string }} row - row values.
 * @returns {string} YAML text, newline terminated.
 */
export function renderRowBlock(row) {
  const lines = [
    `${START} — managed by dsh-whale-blue; remove this block to uninstall`,
    '- insert:',
    '    - id: whale-blue',
    `      name: "${row.name}"`,
    '      config:',
    `        light: "${row.light}"`,
    `        dark: "${row.dark}"`,
    `        enabled: ${row.enabled === true}`,
    `        desktop: ${row.desktop === true}`,
    `        ui: ${row.ui !== false}`,
  ]
  if (typeof row.patchFile === 'string' && row.patchFile !== '') lines.push(`        patchFile: "${row.patchFile.replaceAll('\\', '/')}"`)
  lines.push(END, '')
  return lines.join('\n')
}

/**
 * Drop every managed block from a patch file's text.
 * @param {string} text - current contents.
 * @returns {string} contents without managed blocks.
 */
export function stripRowBlock(text) {
  let out = text
  for (;;) {
    const start = out.indexOf(START)
    if (start < 0) break
    const end = out.indexOf(END, start)
    if (end < 0) break
    out = `${out.slice(0, start)}${out.slice(end + END.length)}`
  }
  return out.replace(/\n{3,}/g, '\n\n')
}

/**
 * Read the values currently recorded in the managed block.
 * @param {string} text - patch file contents.
 * @returns {{ light?: string, dark?: string, enabled?: boolean, desktop?: boolean, ui?: boolean, name?: string, patchFile?: string } | null} parsed values, or null when absent.
 */
export function readRowBlock(text) {
  const start = text.indexOf(START)
  if (start < 0) return null
  const end = text.indexOf(END, start)
  const block = end < 0 ? text.slice(start) : text.slice(start, end)
  const string = (key) => {
    const match = new RegExp(`^\\s*${key}:\\s*"([^"]*)"`, 'm').exec(block)
    return match?.[1]
  }
  const bool = (key) => {
    const match = new RegExp(`^\\s*${key}:\\s*(true|false)`, 'm').exec(block)
    return match === null ? undefined : match[1] === 'true'
  }
  return {
    name: string('name'),
    light: string('light'),
    dark: string('dark'),
    enabled: bool('enabled'),
    desktop: bool('desktop'),
    ui: bool('ui'),
    patchFile: string('patchFile'),
  }
}

/**
 * Replace (or append) the managed block.
 * @param {string} text - current patch file contents.
 * @param {{ name: string, light: string, dark: string, enabled: boolean, desktop: boolean, ui: boolean }} row - row values.
 * @returns {string} the new file contents.
 */
export function replaceRowBlock(text, row) {
  const rest = stripRowBlock(text).replace(/\s*$/, '')
  const head = rest === '' ? '' : `${rest}\n\n`
  return `${head}${renderRowBlock(row)}`
}
