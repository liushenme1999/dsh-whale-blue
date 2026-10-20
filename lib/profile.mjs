/**
 * Profile half: install the plugin package into the DSH profile and keep one
 * marked block in the profile's `cordis.patch.yml`, so install/restore never
 * touch the user's own rows.
 *
 * The installed copy is a small package directory rather than a single file:
 * the host half imports `./lib/*`, and the settings script `./lib/ui.js` is read at
 * request time. The entry is installed as `.mjs` because a profile directory is
 * a CommonJS package, where a `.js` module would be loaded as CJS and fail on
 * `export`.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { readRowBlock, replaceRowBlock, stripRowBlock } from './row.mjs'

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
 * Destination directory of the installed plugin package.
 * @param {string} dshHome - DSH home directory.
 * @param {string} profile - profile name.
 * @returns {string} absolute plugin directory.
 */
export function pluginDir(dshHome, profile) {
  return join(profileDir(dshHome, profile), 'local', 'whale-blue')
}

/**
 * Path of the installed entry module.
 * @param {string} dshHome - DSH home directory.
 * @param {string} profile - profile name.
 * @returns {string} absolute path.
 */
export function entryModule(dshHome, profile) {
  return join(pluginDir(dshHome, profile), 'index.mjs')
}

/**
 * Copy the package's runtime files into the profile.
 * @param {string} packageDir - repository root.
 * @param {string} target - destination directory.
 */
function copyPackage(packageDir, target) {
  mkdirSync(join(target, 'lib'), { recursive: true })
  copyFileSync(join(packageDir, 'index.js'), join(target, 'index.mjs'))
  const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'))
  const installed = { name: manifest.name, version: manifest.version, private: true, type: 'module' }
  writeFileSync(join(target, 'package.json'), `${JSON.stringify(installed, null, 2)}\n`, 'utf8')
  for (const name of readdirSync(join(packageDir, 'lib'))) {
    if (!/\.(mjs|js)$/.test(name)) continue
    copyFileSync(join(packageDir, 'lib', name), join(target, 'lib', name))
  }
}

/**
 * Whether the profile already selects this package as a bundle, which is what
 * the Plugins page installs. The CLI must then not add an `insert` row: the
 * bundle patch already inserts `whale-blue`, and two rows with one id mount the
 * plugin twice.
 * @param {string} dshHome - DSH home directory.
 * @param {string} profile - profile name.
 * @returns {boolean} true when `dsh.profile.bundles` lists the package.
 */
export function selectsBundle(dshHome, profile) {
  const manifest = join(profileDir(dshHome, profile), 'package.json')
  if (!existsSync(manifest)) return false
  try {
    const parsed = JSON.parse(readFileSync(manifest, 'utf8'))
    const bundles = parsed?.dsh?.profile?.bundles
    return Array.isArray(bundles) && bundles.includes('dsh-whale-blue')
  } catch {
    return false
  }
}

/**
 * Whether the profile currently carries the managed block.
 * @param {string} dshHome - DSH home directory.
 * @param {string} profile - profile name.
 * @returns {boolean} true when the row is present.
 */
export function hasPluginRow(dshHome, profile) {
  const patchPath = join(profileDir(dshHome, profile), 'cordis.patch.yml')
  return existsSync(patchPath) && readRowBlock(readFileSync(patchPath, 'utf8')) !== null
}

/**
 * Read the values recorded in the managed block.
 * @param {string} dshHome - DSH home directory.
 * @param {string} profile - profile name.
 * @returns {any} parsed values, or null.
 */
export function readPluginRow(dshHome, profile) {
  const patchPath = join(profileDir(dshHome, profile), 'cordis.patch.yml')
  if (!existsSync(patchPath)) return null
  return readRowBlock(readFileSync(patchPath, 'utf8'))
}

/**
 * Install the plugin package and (re)write the managed row.
 * @param {{ dshHome: string, profile: string, packageDir: string, light: string, dark: string, enabled?: boolean, desktop?: boolean, ui?: boolean, dryRun?: boolean, log: (line: string) => void }} options - install inputs.
 * @returns {string} the installed module path.
 */
export function installPluginRow({ dshHome, profile, packageDir, light, dark, enabled = true, desktop = false, ui = true, dryRun = false, log }) {
  const dir = pluginDir(dshHome, profile)
  const target = entryModule(dshHome, profile)
  const patchPath = join(profileDir(dshHome, profile), 'cordis.patch.yml')

  if (!existsSync(join(profileDir(dshHome, profile), 'package.json'))) {
    throw new Error(`profile "${profile}" not found under ${dshHome}; pass --profile with an existing profile name`)
  }
  if (selectsBundle(dshHome, profile)) {
    throw new Error(
      `profile "${profile}" already installs dsh-whale-blue as a bundle (Plugins page). `
      + 'Manage it there: the bundle patch already mounts the row, so the CLI would mount it twice.',
    )
  }
  if (!dryRun) copyPackage(packageDir, dir)

  const existing = existsSync(patchPath) ? readFileSync(patchPath, 'utf8') : ''
  const next = replaceRowBlock(existing, {
    name: pathToFileURL(target).href,
    light,
    dark,
    enabled,
    desktop,
    ui,
  })
  if (!dryRun && next !== existing) writeFileSync(patchPath, next, 'utf8')

  log(`  ${target}`)
  log(`  ${join(dir, 'lib')} (host modules + settings script)`)
  log(`  ${patchPath} (managed block)`)
  return target
}

/**
 * Remove the managed row and the installed plugin package.
 * @param {{ dshHome: string, profile: string, dryRun?: boolean, log: (line: string) => void }} options - removal inputs.
 * @returns {boolean} whether anything changed.
 */
export function removePluginRow({ dshHome, profile, dryRun = false, log }) {
  const patchPath = join(profileDir(dshHome, profile), 'cordis.patch.yml')
  const dir = pluginDir(dshHome, profile)
  let changed = false

  if (existsSync(patchPath)) {
    const text = readFileSync(patchPath, 'utf8')
    if (readRowBlock(text) !== null) {
      const next = `${stripRowBlock(text).replace(/\s*$/, '')}\n`
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
