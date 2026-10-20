/**
 * dsh-whale-blue — host half.
 *
 * Two jobs, both reachable from the page:
 *
 * 1. Paint the whale. The GUI's mark is one shared SVG (`FishLogo`, viewBox
 *    `0 0 23.16 17.04`) whose path carries `fill="currentColor"`; a CSS `fill`
 *    wins over that presentation attribute, so a single rule recolors the
 *    sidebar mark, the collapsed rail and the conversation hero without
 *    touching any theme token. The rule arrives through the documented
 *    `webserver/index-inject` seat, and the same seat carries the settings script.
 *
 * 2. Own the settings API. `/dsh-whale-blue/state` reports the current palette
 *    and accepts changes from Settings → 通用设置: it recolors the tray/window
 *    icons and the welcome wordmark in the Electron shell when asked, and
 *    records everything in the managed block of this profile's
 *    `cordis.patch.yml`, which is what the next boot reads.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { COLOR, DEFAULT_DARK, DEFAULT_LIGHT, normalizeColor, whaleCss } from './lib/css.mjs'
import { desktopStatus, patchDesktopAssets, resolveAppDir, restoreDesktopAssets } from './lib/desktop.mjs'
import { locatePatchFile, readRowBlock, replaceRowBlock } from './lib/row.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const MODULE_URL = import.meta.url
const STATE_ROUTE = '/dsh-whale-blue/state'
/**
 * How this copy was installed: the Plugins page installs it as a profile bundle
 * under `<profile>/node_modules`, while the CLI copies it to
 * `<profile>/local/whale-blue`. The two need different patch shapes.
 */
const INSTALL_MODE = /[\\/]node_modules[\\/]/u.test(HERE) ? 'bundle' : 'local'
/** Largest request body the settings item may send. */
const MAX_BODY = 8 * 1024

/** Cordis plugin name, used by loader diagnostics. */
export const name = 'whale-blue'

/** The settings API rides the Web server's route table. */
export const inject = ['webServer']

/** @param {unknown} value - anything. @returns {string} */
function message(value) {
  return value instanceof Error ? value.message : String(value)
}

/**
 * Resolve the configured palette and switches.
 * @param {any} raw - the row's `config`.
 * @returns {{ light: string, dark: string, enabled: boolean, desktop: boolean, ui: boolean }} resolved state.
 */
function normalize(raw) {
  const config = raw ?? {}
  return {
    light: normalizeColor(config.light, DEFAULT_LIGHT),
    dark: normalizeColor(config.dark, DEFAULT_DARK),
    enabled: config.enabled !== false,
    desktop: config.desktop === true,
    ui: config.ui !== false,
  }
}

/**
 * Where this plugin records its state: an explicit `patchFile`, otherwise the
 * profile's own patch list (see `locatePatchFile`).
 * @param {any} raw - the row's `config`.
 * @returns {string | null} absolute path, or null when it cannot be known.
 */
function resolvePatchFile(raw) {
  return locatePatchFile({
    patchFile: raw?.patchFile,
    profileDir: process.env.DSH_PROFILE_DIR,
    here: HERE,
  })
}

/**
 * Read a small JSON request body.
 * @param {import('node:http').IncomingMessage} req - request.
 * @returns {Promise<any>} parsed body.
 */
async function readJson(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY) throw new Error('request body is too large')
    chunks.push(chunk)
  }
  if (size === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/**
 * Register the palette API and the page injections.
 * @param {import('@deepseek-ai/cordis').Context} ctx - host root context.
 * @param {any} [raw] - the row's `config`.
 */
export function apply(ctx, raw) {
  let state = normalize(raw)
  const patchFile = resolvePatchFile(raw)
  const log = (line) => {
    try {
      ctx.logger?.info?.(`whale-blue: ${line}`)
    } catch {
      // logging must never break the plugin
    }
  }

  /** @returns {string | null} the install directory, when the desktop shell is present. */
  const appDir = () => {
    try {
      return resolveAppDir()
    } catch {
      return null
    }
  }

  /** @returns {boolean} whether the desktop assets currently carry the patch. */
  const desktopApplied = () => {
    const dir = appDir()
    return dir !== null && desktopStatus(dir).installed
  }

  /** Last partial failure worth showing in the settings item. */
  let lastWarning
  /** Why the last write to `cordis.patch.yml` failed, if it did. */
  let storeError

  /** @returns {any} what the settings item sees. */
  const snapshot = () => ({ ...state, install: INSTALL_MODE, desktopApplied: desktopApplied(), patchFile, warning: lastWarning, storeError })

  /**
   * Apply the shell patch and remember a partial failure.
   * @param {string} dir - install directory.
   * @param {string} color - color to paint.
   */
  const patchShell = (dir, color) => {
    const result = patchDesktopAssets({ appDir: dir, color, log: () => {} })
    const retry = INSTALL_MODE === 'bundle' ? '重启 DSH 时还会再试一次' : '退出 DSH 后运行 restore.cmd + install.cmd 可以补上'
    lastWarning = result.welcome === 'failed'
      ? `欢迎页图标没有写入（${result.reason ?? 'archive is busy'}）：${retry}`
      : undefined
    if (lastWarning !== undefined) log(lastWarning)
  }

  /**
   * Record the current state in the profile patch list.
   *
   * The block is ours alone; `replaceRowBlock` keeps the user's other rows and
   * never appends a second copy. Its shape follows how this copy was installed:
   * a profile bundle already inserts `whale-blue`, so the block then patches that
   * row by id instead of inserting a second one.
   * @param {string} [mode] - `insert` for the CLI layout, `override` for a bundle.
   * @returns {string | undefined} why the write failed, when it did.
   */
  const persist = (mode = INSTALL_MODE === 'bundle' ? 'override' : 'insert') => {
    if (patchFile === null) return '找不到 cordis.patch.yml 的位置，设置无法持久化'
    try {
      const existing = existsSync(patchFile) ? readFileSync(patchFile, 'utf8') : ''
      const row = { name: MODULE_URL, ...state, mode }
      if (typeof raw?.patchFile === 'string' && raw.patchFile !== '') row.patchFile = raw.patchFile
      const next = replaceRowBlock(existing, row)
      if (next !== existing) writeFileSync(patchFile, next, 'utf8')
      return undefined
    } catch (error) {
      log(`could not record state in ${patchFile}: ${message(error)}`)
      return message(error)
    }
  }

  /**
   * Record the requested state, then move the desktop shell to match it.
   *
   * The write comes first on purpose: the palette is the user's decision and
   * must survive a restart even when the shell assets cannot be touched (a
   * locked `app.asar`, a read-only install). Only an explicit `desktop` field
   * moves those assets, so a page that just changes a color never undoes an
   * install the CLI made.
   * @param {any} body - partial state from the settings item.
   */
  const update = (body) => {
    const previous = state
    lastWarning = undefined
    storeError = undefined
    const next = { ...state }
    if (body.enabled !== undefined) next.enabled = body.enabled === true
    if (body.desktop !== undefined) next.desktop = body.desktop === true
    for (const key of ['light', 'dark']) {
      if (body[key] === undefined) continue
      if (typeof body[key] !== 'string' || !COLOR.test(body[key].trim())) {
        throw new Error(`${key} must be a hex color such as #4d6bfe`)
      }
      next[key] = body[key].trim()
    }

    state = next
    storeError = persist()

    const dir = appDir()
    const applied = dir !== null && desktopStatus(dir).installed
    try {
      if (body.desktop !== undefined) {
        if (next.desktop && dir === null) throw new Error('DeepSeek Harness install directory not found')
        if (dir !== null && next.desktop && !applied) patchShell(dir, next.light)
        else if (dir !== null && !next.desktop && applied) restoreDesktopAssets({ appDir: dir, log: () => {} })
      } else if (dir !== null && applied && next.light !== previous.light) {
        patchShell(dir, next.light)
      }
    } catch (error) {
      lastWarning = `桌面图标没有更新：${message(error)}`
      log(lastWarning)
    }
  }

  // The CLI patches the shell without a `desktop` flag in older rows; adopt the
  // shell's actual state instead of undoing it on the first change from the settings item.
  if (!state.desktop && desktopApplied()) {
    state.desktop = true
    persist()
  }
  // The same direction the other way: a requested sync is re-applied at startup,
  // which is what repairs the icons after a DSH update replaced `resources/` —
  // a bundle install has no CLI to run by hand.
  if (state.desktop && !desktopApplied()) {
    const dir = appDir()
    try {
      if (dir === null) throw new Error('DeepSeek Harness install directory not found')
      patchShell(dir, state.light)
    } catch (error) {
      lastWarning = `桌面图标没有更新：${message(error)}`
      log(lastWarning)
    }
  }
  // A profile that selects the bundle must not also keep the CLI's standalone row:
  // two `insert` entries with one id would mount this plugin twice.
  if (INSTALL_MODE === 'bundle' && patchFile !== null) {
    try {
      const text = existsSync(patchFile) ? readFileSync(patchFile, 'utf8') : ''
      if (readRowBlock(text)?.mode === 'insert') {
        storeError = persist('override')
        log('rewrote the standalone row as a bundle override')
      }
    } catch (error) {
      log(`could not rewrite the standalone row: ${message(error)}`)
    }
  }

  ctx.on('webserver/index-inject', (table) => {
    if (state.enabled) table.push({ kind: 'style', text: whaleCss(state) })
    if (!state.ui) return
    try {
      table.push({ kind: 'script', text: readFileSync(join(HERE, 'lib', 'ui.js'), 'utf8') })
    } catch (error) {
      log(`settings script missing: ${message(error)}`)
    }
  })

  const handler = async (req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      res.end(JSON.stringify(body))
    }
    try {
      if (req.method === 'GET' || req.method === 'HEAD') return send(200, snapshot())
      if (req.method !== 'POST') {
        res.writeHead(405, { allow: 'GET, POST', 'content-type': 'application/json; charset=utf-8' })
        return res.end(JSON.stringify({ error: 'method not allowed' }))
      }
      // A non-simple header keeps a cross-origin page from driving this route:
      // the browser has to preflight it first, and nothing answers that.
      if (req.headers['x-dsh-whale-blue'] !== '1') return send(403, { error: 'missing x-dsh-whale-blue header' })
      update(await readJson(req))
      send(200, snapshot())
    } catch (error) {
      send(400, { error: message(error) })
    }
  }

  const dispose = ctx.webServer.register({ kind: 'exact', path: STATE_ROUTE, handler })
  if (typeof ctx.effect === 'function') ctx.effect(() => dispose)
  else if (typeof ctx.on === 'function') ctx.on('dispose', dispose)

  log(`enabled=${String(state.enabled)} light=${state.light} desktop=${String(state.desktop)} state=${patchFile ?? '(not persisted)'}`)
}
