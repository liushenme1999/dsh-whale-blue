/**
 * Profile half: install the plugin file into the DSH profile and keep one
 * marked block in the profile's `cordis.patch.yml` so install/restore never
 * touches the user's own rows.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Opening marker of the managed YAML block. */
export const START = '# dsh-whale-blue:start'
/** Closing marker of the managed YAML block. */
export const END = '# dsh-whale-blue:end'

/**
 * Directory of one profile.
 * @param {string} dshHome - DSH home directory.
 * @param {string} profile - profile name.
 * @returns {string} absolute profile directory.
 */
export function profileDir(dshHome, profile) {
  return join(dshHome, 'profiles', profile)
}

/**
 * Destination directory of the installed plugin copy.
 * @param {string} dshHome - DSH home directory.
 * @param {string} profile - profile name.
 * @returns {string} absolute plugin directory.
 */
export function pluginDir(dshHome, profile) {
  return join(profileDir(dshHome, profile), 'local', 'whale-blue')
}

/**
 * Build the managed YAML block.
 * @param {string} fileUrl - `file://` URL of the installed plugin module.
 * @param {string} light - light-palette color.
 * @param {string} dark - dark-palette color.
 * @returns {string} YAML text, newline terminated.
 */
function block(fileUrl, light, dark) {
  return [
    `${START} — managed by \`dsh-whale-blue install\`; \`dsh-whale-blue restore\` removes it`,
    '- insert:',
    '    - id: whale-blue',
    `      name: "${fileUrl}"`,
    '      config:',
    `        light: "${light}"`,
    `        dark: "${dark}"`,
    END,
    '',
  ].join('\n')
}

/**
 * Remove every managed block from a patch file's text.
 * @param {string} text - current file contents.
 * @returns {string} contents without managed blocks.
 */
function stripBlocks(text) {
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
 * Whether the profile currently carries the managed block.
 * @param {string} dshHome - DSH home directory.
 * @param {string} profile - profile name.
 * @returns {boolean} true when the row is present.
 */
export function hasPluginRow(dshHome, profile) {
  const patchPath = join(profileDir(dshHome, profile), 'cordis.patch.yml')
  return existsSync(patchPath) && readFileSync(patchPath, 'utf8').includes(START)
}

/**
 * Copy the plugin into the profile and (re)write the managed row.
 *
 * The installed copy is always `.mjs`: the profile directory is a CommonJS
 * package, so a `.js` module there would be loaded as CJS and fail on `export`.
 *
 * @param {{ dshHome: string, profile: string, source: string, light: string, dark: string, dryRun?: boolean, log: (line: string) => void }} options - install inputs.
 * @returns {string} the installed module path.
 */
export function installPluginRow({ dshHome, profile, source, light, dark, dryRun = false, log }) {
  const dir = pluginDir(dshHome, profile)
  const target = join(dir, 'index.mjs')
  const patchPath = join(profileDir(dshHome, profile), 'cordis.patch.yml')

  if (!existsSync(join(profileDir(dshHome, profile), 'package.json'))) {
    throw new Error(`profile "${profile}" not found under ${dshHome}; pass --profile with an existing profile name`)
  }
  if (!dryRun) {
    mkdirSync(dir, { recursive: true })
    copyFileSync(source, target)
  }

  const existing = existsSync(patchPath) ? readFileSync(patchPath, 'utf8') : ''
  const next = `${stripBlocks(existing).replace(/\s*$/, '')}\n\n${block(pathToFileURL(target).href, light, dark)}`
  if (!dryRun) writeFileSync(patchPath, next, 'utf8')

  log(`  ${target}`)
  log(`  ${patchPath} (managed block)`)
  return target
}

/**
 * Remove the managed row and the installed plugin copy.
 * @param {{ dshHome: string, profile: string, dryRun?: boolean, log: (line: string) => void }} options - removal inputs.
 * @returns {boolean} whether anything changed.
 */
export function removePluginRow({ dshHome, profile, dryRun = false, log }) {
  const patchPath = join(profileDir(dshHome, profile), 'cordis.patch.yml')
  const dir = pluginDir(dshHome, profile)
  let changed = false

  if (existsSync(patchPath)) {
    const text = readFileSync(patchPath, 'utf8')
    if (text.includes(START)) {
      const next = `${stripBlocks(text).replace(/\s*$/, '')}\n`
      if (!dryRun) writeFileSync(patchPath, next, 'utf8')
      changed = true
    }
  }
  if (existsSync(dir)) {
    if (!dryRun) rmSync(dir, { recursive: true, force: true })
    changed = true
  }
  if (changed) log(`  removed ${dir} and the managed block in cordis.patch.yml`)
  return changed
}
