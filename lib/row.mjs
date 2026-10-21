/**
 * The managed patch row this project owns inside a profile's
 * `cordis.patch.yml`. Both the CLI and the colour form write the same block,
 * always between markers, so a rewrite never disturbs the user's own rows.
 *
 * The block has two shapes, because the loader has two ways to mount a row:
 *
 * - `insert` — the CLI's standalone copy under `<profile>/local/whale-blue`
 *   carries its own `- insert:` entry with the module URL as the name;
 * - `override` — a copy installed as a profile bundle from the Plugins page is
 *   already inserted by the bundle's own patch, so this block must instead
 *   patch that row by id. A second `insert:` would mount the plugin twice.
 *
 * A non-insert patch replaces the matched entry's fields wholesale, which is why
 * the block always carries the complete `config`.
 */

import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

/** Opening marker of the managed block. */
export const START = '# dsh-whale-blue:start'
/** Closing marker of the managed block. */
export const END = '# dsh-whale-blue:end'

/** @returns {{ light: string, dark: string, enabled: boolean, desktop: boolean }} the defaults. */
export function defaults() {
  return { light: '#4d6bfe', dark: '#7aaaff', enabled: true, desktop: false }
}

/**
 * Render the managed YAML block.
 * @param {{ name: string, light: string, dark: string, enabled: boolean, desktop: boolean, patchFile?: string, mode?: 'insert' | 'override' }} row - row values.
 * @returns {string} YAML text, newline terminated.
 */
export function renderRowBlock(row) {
  const override = row.mode === 'override'
  // `insert` nests the entry four spaces deep; an override sits at the top level.
  const key = override ? '  ' : '      '
  const field = override ? '    ' : '        '
  const lines = [`${START} — managed by dsh-whale-blue; remove this block to uninstall`]
  if (override) {
    // The bundle already inserts the row; patch it by id instead of inserting again.
    lines.push('- id: whale-blue')
  } else {
    lines.push('- insert:', '    - id: whale-blue', `      name: "${row.name}"`)
  }
  lines.push(`${key}config:`, `${field}light: "${row.light}"`, `${field}dark: "${row.dark}"`)
  lines.push(`${field}enabled: ${row.enabled === true}`, `${field}desktop: ${row.desktop === true}`)
  if (typeof row.patchFile === 'string' && row.patchFile !== '') {
    lines.push(`${field}patchFile: "${row.patchFile.replaceAll('\\', '/')}"`)
  }
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
 * @returns {{ mode: 'insert' | 'override', light?: string, dark?: string, enabled?: boolean, desktop?: boolean, name?: string, patchFile?: string } | null} parsed values, or null when absent.
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
    mode: /^\s*- insert:/m.test(block) ? 'insert' : 'override',
    name: string('name'),
    light: string('light'),
    dark: string('dark'),
    enabled: bool('enabled'),
    desktop: bool('desktop'),
    patchFile: string('patchFile'),
  }
}

/**
 * Drop a bare `[]` line — what an untouched profile records as "no patches".
 * A flow sequence is a complete document, so a list block appended behind it
 * makes the file unparseable; the empty list carries no information anyway.
 * @param {string} text - patch file contents.
 * @returns {string} text without a bare empty list.
 */
function dropEmptyList(text) {
  return text.replace(/^[ \t]*\[\][ \t]*(?:\r?\n)?/m, '')
}

/**
 * Replace (or append) the managed block.
 * @param {string} text - current patch file contents.
 * @param {{ name: string, light: string, dark: string, enabled: boolean, desktop: boolean, mode?: 'insert' | 'override' }} row - row values.
 * @returns {string} the new file contents.
 */
export function replaceRowBlock(text, row) {
  const rest = dropEmptyList(stripRowBlock(text)).replace(/\s*$/, '')
  const head = rest === '' ? '' : `${rest}\n\n`
  return `${head}${renderRowBlock(row)}`
}

/**
 * Find the patch list a row should record itself in.
 *
 * Three answers, most specific first: an explicit `patchFile` (tests, dev
 * overlays), the profile directory the host exports, and — because a host does
 * not always export it — the profile this package was installed into. That last
 * one is found by walking up from the package: `<profile>/local/whale-blue` and
 * `<profile>/node_modules[/.pnpm/…]/dsh-whale-blue` both end up at a directory
 * that holds `cordis.patch.yml`. The walk starts at the package's parent, so the
 * bundle's own copy of that filename (it ships one) is never mistaken for the
 * profile. Skipping the installed layout is what once made the colour form
 * look like it saved and then lose the setting at the next start.
 * @param {{ patchFile?: unknown, profileDir?: unknown, here?: string }} [hints] - what is known about the location.
 * @returns {string | null} absolute path, or null when it cannot be known.
 */
export function locatePatchFile({ patchFile, profileDir, here } = {}) {
  if (typeof patchFile === 'string' && patchFile !== '') return patchFile
  if (typeof profileDir === 'string' && profileDir !== '') return join(profileDir, 'cordis.patch.yml')
  if (typeof here !== 'string' || here === '') return null
  let dir = resolve(here)
  for (let depth = 0; depth < 8; depth++) {
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
    const candidate = join(dir, 'cordis.patch.yml')
    if (existsSync(candidate)) return candidate
  }
  return null
}
