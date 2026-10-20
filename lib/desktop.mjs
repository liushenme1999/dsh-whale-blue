/**
 * Desktop-shell half: recolor the tray icon and window icon in `resources/`,
 * and the welcome mark inside `app.asar`. These live in the Electron shell, not
 * in the Cordis plugin host, so they cannot be themed from a plugin row — this
 * module applies a small, reversible, backed-up patch instead.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { readAsarFile, replaceAsarFile } from './asar.mjs'
import { transformIco } from './ico.mjs'
import { decodePng, encodePng } from './png.mjs'
import { parseColor, recolorRgba } from './recolor.mjs'

/** Backup and state directory, next to the patched resources. */
export const STATE_DIR = '.dsh-whale-blue'
/** Raster icons the shell reads at startup. */
export const ICON_FILES = ['tray.ico', 'icon.png']
/** The welcome window's wordmark, in the Electron renderer assets. */
export const WELCOME_ENTRY = 'renderer/assets/welcome-brand.svg'
/** Attribute that colors the whale inside that wordmark (text paths share the same token). */
const WHALE_FILL = 'fill="var(--dsw-alias-label-primary)"'

/** Directories that may hold the desktop install, most specific first. */
function appCandidates() {
  const candidates = []
  if (process.env.DSH_DESKTOP_APP_DIR) candidates.push(process.env.DSH_DESKTOP_APP_DIR)
  if (process.platform === 'win32') {
    if (process.env.ProgramFiles) candidates.push(join(process.env.ProgramFiles, 'DeepSeek Harness'))
    if (process.env['ProgramFiles(x86)']) candidates.push(join(process.env['ProgramFiles(x86)'], 'DeepSeek Harness'))
    if (process.env.LOCALAPPDATA) candidates.push(join(process.env.LOCALAPPDATA, 'Programs', 'DeepSeek Harness'))
    // The installer lets the user pick a drive, so also look at the usual
    // locations on every drive that exists.
    for (const drive of existingDrives()) {
      candidates.push(join(drive, 'Program Files', 'DeepSeek Harness'))
      candidates.push(join(drive, 'Program Files (x86)', 'DeepSeek Harness'))
      candidates.push(join(drive, 'DeepSeek Harness'))
    }
  } else if (process.platform === 'darwin') {
    candidates.push('/Applications/DeepSeek Harness.app/Contents')
  } else {
    candidates.push('/opt/DeepSeek Harness')
  }
  return candidates
}

/**
 * Enumerate drive roots that currently exist.
 * @returns {string[]} roots like `D:\`, system drive first.
 */
function existingDrives() {
  const drives = []
  const system = process.env.SystemDrive
  if (system && existsSync(`${system}\\`)) drives.push(system)
  for (let code = 65; code <= 90; code++) {
    const drive = `${String.fromCharCode(code)}:`
    if (drive === system) continue
    if (existsSync(`${drive}\\`)) drives.push(drive)
  }
  return drives
}

/**
 * Resolve the directory that contains `resources/`.
 * @param {string} [explicit] - value of `--app-dir`, if the user passed one.
 * @returns {string} absolute install directory.
 */
export function resolveAppDir(explicit) {
  if (explicit !== undefined) {
    if (!existsSync(join(explicit, 'resources', 'app.asar'))) {
      throw new Error(`--app-dir ${explicit} does not look like a DeepSeek Harness install (no resources/app.asar)`)
    }
    return explicit
  }
  for (const candidate of appCandidates()) {
    if (existsSync(join(candidate, 'resources', 'app.asar'))) return candidate
  }
  throw new Error('could not find the DeepSeek Harness install; pass --app-dir <path>')
}

/**
 * Resolve the state directory for a given install.
 * @param {string} appDir - install directory.
 * @returns {string} `<install>/resources/.dsh-whale-blue`.
 */
export function stateDir(appDir) {
  return join(appDir, 'resources', STATE_DIR)
}

/** @param {string} dir - directory to create when missing. */
function ensureDir(dir) {
  mkdirSync(dir, { recursive: true })
}

/**
 * Read the recorded patch state, if any.
 * @param {string} appDir - install directory.
 * @returns {any} parsed state or null.
 */
export function readState(appDir) {
  const file = join(stateDir(appDir), 'state.json')
  if (!existsSync(file)) return null
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

/**
 * Recolor a raster icon, preferring the pristine backup as the source so the
 * operation stays idempotent.
 * @param {Buffer} buffer - source bytes (`tray.ico` or `icon.png`).
 * @param {{ r: number, g: number, b: number }} color - target color.
 * @returns {Buffer} recolored bytes.
 */
export function recolorIcon(buffer, color) {
  const map = (rgba) => recolorRgba(rgba, color)
  if (buffer.subarray(0, 4).equals(Buffer.from([0x00, 0x00, 0x01, 0x00]))) return transformIco(buffer, map)
  const image = decodePng(buffer)
  return encodePng({ ...image, rgba: map(image.rgba) })
}

/**
 * Paint only the whale of the welcome wordmark, keeping the byte length so the
 * archive can be patched in place. Text paths keep their own color because the
 * replacement targets the one fill inside the whale's clipping group.
 * @param {Buffer} svgBuffer - the original wordmark.
 * @param {{ r: number, g: number, b: number }} color - target color.
 * @returns {Buffer} the same SVG with one attribute value rewritten.
 */
export function paintWelcomeMark(svgBuffer, color) {
  const svg = svgBuffer.toString('utf8')
  const valueLength = WHALE_FILL.length - 7
  const base = `rgb(${color.r},${color.g},${color.b}`
  const fill = `${base}${' '.repeat(Math.max(0, valueLength - base.length - 1))})`

  let group = svg.indexOf('<g ')
  while (group >= 0) {
    const end = svg.indexOf('</g>', group)
    if (end < 0) break
    const offset = svg.indexOf(WHALE_FILL, group)
    if (offset >= 0 && offset < end) {
      return Buffer.from(svg.slice(0, offset) + `fill="${fill}"` + svg.slice(offset + WHALE_FILL.length), 'utf8')
    }
    group = svg.indexOf('<g ', end)
  }
  throw new Error('welcome mark: whale fill not found — the desktop build changed its artwork')
}

/**
 * Patch the tray icon, window icon, and welcome mark.
 * @param {{ appDir: string, color: string, dryRun?: boolean, log: (line: string) => void }} options - patch inputs.
 * @returns {{ icons: string[], welcome: 'patched' | 'skipped' | 'failed', reason?: string }} what happened.
 */
export function patchDesktopAssets({ appDir, color, dryRun = false, log }) {
  const resources = join(appDir, 'resources')
  const backup = join(stateDir(appDir), 'backup')
  if (!dryRun) ensureDir(backup)

  const rgb = parseColor(color)
  const previous = readState(appDir)
  const previousRgb = typeof previous?.color === 'string' ? parseColor(previous.color) : null

  const icons = []
  for (const name of ICON_FILES) {
    const target = join(resources, name)
    if (!existsSync(target)) continue
    const pristine = join(backup, name)
    const current = readFileSync(target)
    const saved = existsSync(pristine) ? readFileSync(pristine) : null
    // If the file on disk is no longer what the last run produced, the vendor
    // replaced the artwork (an app update) and the backup has to be retaken.
    const expected = saved !== null && previousRgb !== null ? recolorIcon(saved, previousRgb) : null
    const upstreamChanged = saved === null || expected === null || !current.equals(expected)
    const source = upstreamChanged ? current : saved
    const next = recolorIcon(source, rgb)
    if (!dryRun) {
      if (upstreamChanged) copyFileSync(target, pristine)
      writeFileSync(target, next)
    }
    icons.push(name)
    log(`  ${name}: ${source.length} -> ${next.length} bytes${upstreamChanged ? '' : ' (from backup)'}`)
  }

  let welcome = 'patched'
  let reason
  const asar = join(resources, 'app.asar')
  const pristineMark = join(backup, 'welcome-brand.svg')
  try {
    const current = readAsarFile(asar, WELCOME_ENTRY)
    const saved = existsSync(pristineMark) ? readFileSync(pristineMark) : null
    const expected = saved !== null && previousRgb !== null ? paintWelcomeMark(saved, previousRgb) : null
    const upstreamChanged = saved === null || expected === null || !current.equals(expected)
    const source = upstreamChanged ? current : saved
    const next = paintWelcomeMark(source, rgb)
    if (!dryRun) {
      if (upstreamChanged) writeFileSync(pristineMark, current)
      replaceAsarFile(asar, WELCOME_ENTRY, () => next)
    }
    log(`  app.asar (${WELCOME_ENTRY}): ${source.length} bytes, whale repainted`)
  } catch (error) {
    welcome = 'failed'
    reason = error instanceof Error ? error.message : String(error)
    log(`  app.asar (${WELCOME_ENTRY}): skipped — ${reason}`)
  }

  if (!dryRun) {
    writeFileSync(join(stateDir(appDir), 'state.json'), `${JSON.stringify({
      version: 1,
      color,
      icons,
      welcome,
      patchedAt: new Date().toISOString(),
    }, null, 2)}\n`)
  }
  return { icons, welcome, reason }
}

/**
 * Undo {@link patchDesktopAssets} from the recorded backups.
 * @param {{ appDir: string, log: (line: string) => void }} options - restore inputs.
 * @returns {{ icons: string[], welcome: boolean }} restored pieces.
 */
export function restoreDesktopAssets({ appDir, log }) {
  const resources = join(appDir, 'resources')
  const backup = join(stateDir(appDir), 'backup')
  const icons = []
  for (const name of ICON_FILES) {
    const pristine = join(backup, name)
    if (!existsSync(pristine)) continue
    copyFileSync(pristine, join(resources, name))
    icons.push(name)
    log(`  ${name}: restored from backup`)
  }

  let welcome = false
  const pristineMark = join(backup, 'welcome-brand.svg')
  if (existsSync(pristineMark)) {
    const original = readFileSync(pristineMark)
    replaceAsarFile(join(resources, 'app.asar'), WELCOME_ENTRY, () => original)
    welcome = true
    log(`  app.asar (${WELCOME_ENTRY}): original whale restored`)
  }

  rmSync(stateDir(appDir), { recursive: true, force: true })
  return { icons, welcome }
}

/**
 * Describe what is currently patched.
 * @param {string} appDir - install directory.
 * @returns {{ installed: boolean, state: any, hasBackup: boolean }} status.
 */
export function desktopStatus(appDir) {
  const state = readState(appDir)
  return {
    installed: state !== null,
    state,
    hasBackup: existsSync(join(stateDir(appDir), 'backup')),
  }
}

/** @returns {string} the default DSH home directory. */
export function defaultDshHome() {
  return process.env.DSH_HOME ?? join(homedir(), '.dsh')
}
