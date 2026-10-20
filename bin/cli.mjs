#!/usr/bin/env node
/**
 * `dsh-whale-blue` — command line companion for the plugin.
 *
 *   install   install the Web GUI plugin row and recolor the desktop shell assets
 *   restore   undo both, from the backups taken by `install`
 *   status    report what is currently installed
 *
 * The Web GUI half only needs a DSH restart. The desktop shell half (tray icon,
 * window icon, welcome mark) writes into the install directory, so DeepSeek
 * Harness must be closed while it runs.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  defaultDshHome,
  desktopStatus,
  patchDesktopAssets,
  resolveAppDir,
  restoreDesktopAssets,
  stateDir,
} from '../lib/desktop.mjs'
import { installPluginRow, pluginDir, readPluginRow, removePluginRow, selectsBundle } from '../lib/profile.mjs'

const PACKAGE = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const PACKAGE_DIR = dirname(fileURLToPath(new URL('../index.js', import.meta.url)))
const DEFAULT_LIGHT = '#4d6bfe'
const DEFAULT_DARK = '#7aaaff'

const USAGE = `dsh-whale-blue ${PACKAGE.version} — paint the DeepSeek Harness whale DeepSeek blue

Usage:
  dsh-whale-blue install [options]   plugin row + tray icon + window icon + welcome mark
  dsh-whale-blue restore [options]   undo everything (backups are kept until restore)
  dsh-whale-blue status  [options]   show what is installed

Options:
  --app-dir <path>    DeepSeek Harness install directory (default: auto-detect)
  --dsh-home <path>   DSH home (default: $DSH_HOME or ~/.dsh)
  --profile <name>    DSH profile to configure (default: desktop)
  --light <color>     light-palette whale color (default: ${DEFAULT_LIGHT})
  --dark <color>      dark-palette whale color (default: ${DEFAULT_DARK})
  --no-plugin         skip the Web GUI plugin row
  --no-ui             keep the plugin but hide the settings item
  --no-desktop        skip the tray icon, window icon and welcome mark
  --dry-run           report what would change without writing anything
  -h, --help          show this help
  -v, --version       print the version

Notes:
  * The recommended install is the Plugins page: DeepSeek Harness -> 插件 ->
    添加插件 -> paste https://github.com/liushenme1999/dsh-whale-blue .
    This command is the standalone alternative: it copies the package into
    <dsh-home>/profiles/<profile>/local/whale-blue instead. Use one or the other
    for a profile: two rows with the same id mount the plugin twice.
  * Only hex colors (#rgb, #rrggbb) are accepted.
  * The desktop shell files live inside the install directory: close DeepSeek
    Harness before running \`install\`, then start it again.
  * \`restore\` uses the backups under <install>/resources/.dsh-whale-blue.
`

/**
 * Parse `--flag value`, `--flag=value`, and boolean flags.
 * @param {string[]} argv - arguments after the command.
 * @returns {Record<string, string | boolean>} parsed options.
 */
function parseOptions(argv) {
  const options = {}
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (token === '-h' || token === '--help') options.help = true
    else if (token === '-v' || token === '--version') options.version = true
    else if (token === '--dry-run') options.dryRun = true
    else if (token === '--no-plugin') options.noPlugin = true
    else if (token === '--no-ui') options.noUi = true
    else if (token === '--no-desktop') options.noDesktop = true
    else if (token === '--app-dir') options.appDir = argv[++i]
    else if (token.startsWith('--app-dir=')) options.appDir = token.slice('--app-dir='.length)
    else if (token === '--dsh-home') options.dshHome = argv[++i]
    else if (token.startsWith('--dsh-home=')) options.dshHome = token.slice('--dsh-home='.length)
    else if (token === '--profile') options.profile = argv[++i]
    else if (token.startsWith('--profile=')) options.profile = token.slice('--profile='.length)
    else if (token === '--light') options.light = argv[++i]
    else if (token.startsWith('--light=')) options.light = token.slice('--light='.length)
    else if (token === '--dark') options.dark = argv[++i]
    else if (token.startsWith('--dark=')) options.dark = token.slice('--dark='.length)
    else throw new Error(`unknown argument: ${token}`)
  }
  return options
}

/**
 * Reject anything that is not a plain hex color.
 * @param {string | undefined} value - option value.
 * @param {string} fallback - default color.
 * @returns {string} a valid color.
 */
function color(value, fallback) {
  if (value === undefined) return fallback
  if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) throw new Error(`not a hex color: ${value}`)
  return value
}

/**
 * Turn parsed options into the settings every command shares.
 * @param {Record<string, string | boolean>} options - parsed options.
 * @returns {{ dshHome: string, profile: string, light: string, dark: string, appDir?: string, dryRun: boolean, noPlugin: boolean, noDesktop: boolean }} resolved settings.
 */
function settings(options) {
  return {
    dshHome: typeof options.dshHome === 'string' ? options.dshHome : defaultDshHome(),
    profile: typeof options.profile === 'string' ? options.profile : 'desktop',
    light: color(typeof options.light === 'string' ? options.light : undefined, DEFAULT_LIGHT),
    dark: color(typeof options.dark === 'string' ? options.dark : undefined, DEFAULT_DARK),
    appDir: typeof options.appDir === 'string' ? options.appDir : undefined,
    dryRun: options.dryRun === true,
    noPlugin: options.noPlugin === true,
    noUi: options.noUi === true,
    noDesktop: options.noDesktop === true,
  }
}

/**
 * Install both halves.
 * @param {ReturnType<typeof settings>} config - resolved settings.
 * @returns {Promise<number>} process exit code.
 */
async function install(config) {
  console.log(`dsh-whale-blue ${PACKAGE.version}${config.dryRun ? ' (dry run)' : ''}`)
  console.log(`  profile: ${config.profile}   home: ${config.dshHome}\n`)

  let code = 0
  let desktopPatched = false

  if (config.noDesktop) {
    console.log('Desktop shell: skipped (--no-desktop)\n')
  } else {
    console.log('Desktop shell (tray icon, window icon, welcome mark)')
    let appDir
    try {
      appDir = resolveAppDir(config.appDir)
    } catch (error) {
      console.log(`  skipped: ${error instanceof Error ? error.message : String(error)}`)
      console.log('  (the Web GUI half does not need the desktop app)\n')
      appDir = undefined
    }
    if (appDir !== undefined) {
      console.log(`  install: ${appDir}`)
      const result = patchDesktopAssets({
        appDir,
        color: config.light,
        dryRun: config.dryRun,
        log: (line) => console.log(line),
      })
      desktopPatched = result.welcome !== 'failed'
      if (result.welcome === 'failed') {
        code = 2
        console.log('\n  The tray and window icons are patched. The welcome mark needs the app closed:')
        console.log('  1. quit DeepSeek Harness completely (tray icon -> Quit)')
        console.log('  2. run this command again')
        console.log('  3. start DeepSeek Harness')
        console.log(`  backups: ${join(stateDir(appDir), 'backup')}\n`)
      } else {
        console.log('  done\n')
      }
    }
  }

  if (config.noPlugin) {
    console.log('Web GUI plugin: skipped (--no-plugin)')
  } else {
    console.log('Web GUI plugin')
    try {
      installPluginRow({
        dshHome: config.dshHome,
        profile: config.profile,
        packageDir: PACKAGE_DIR,
        light: config.light,
        dark: config.dark,
        desktop: desktopPatched,
        ui: !config.noUi,
        dryRun: config.dryRun,
        log: (line) => console.log(line),
      })
      console.log('  -> restart DeepSeek Harness to load it')
      console.log('  -> then open Settings > 通用设置: the 鲸鱼配色 item sits under 外观\n')
    } catch (error) {
      console.error(`  failed: ${error instanceof Error ? error.message : String(error)}\n`)
      code = code === 0 ? 1 : code
    }
  }

  if (code === 0 && desktopPatched) console.log('Done. Start DeepSeek Harness to see the blue whale.')
  return code
}

/**
 * Undo both halves.
 * @param {ReturnType<typeof settings>} config - resolved settings.
 * @returns {Promise<number>} process exit code.
 */
async function restore(config) {
  console.log(`dsh-whale-blue ${PACKAGE.version}${config.dryRun ? ' (dry run)' : ''}\n`)

  console.log('Web GUI plugin')
  const removed = removePluginRow({
    dshHome: config.dshHome,
    profile: config.profile,
    dryRun: config.dryRun,
    log: (line) => console.log(line),
  })
  if (!removed) console.log('  nothing to remove')

  if (config.noDesktop) {
    console.log('\nDesktop shell: skipped (--no-desktop)')
    return 0
  }

  console.log('\nDesktop shell')
  let appDir
  try {
    appDir = resolveAppDir(config.appDir)
  } catch (error) {
    console.log(`  skipped: ${error instanceof Error ? error.message : String(error)}`)
    return 0
  }
  const status = desktopStatus(appDir)
  if (!status.installed && !status.hasBackup) {
    console.log('  nothing to restore')
    return 0
  }
  try {
    restoreDesktopAssets({ appDir, log: (line) => console.log(line) })
    console.log('\nRestored. Restart DeepSeek Harness.')
    return 0
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`  failed: ${message}`)
    console.log('  quit DeepSeek Harness completely and run `dsh-whale-blue restore` again')
    return 2
  }
}

/**
 * Report the current installation.
 * @param {ReturnType<typeof settings>} config - resolved settings.
 * @returns {Promise<number>} process exit code.
 */
async function status(config) {
  console.log(`dsh-whale-blue ${PACKAGE.version}\n`)
  const row = readPluginRow(config.dshHome, config.profile)
  const bundle = selectsBundle(config.dshHome, config.profile)
  console.log('Web GUI plugin')
  console.log(`  profile:  ${config.profile}`)
  console.log(`  install:  ${bundle ? 'bundle (Plugins page)' : row === null ? 'not installed' : 'standalone (local copy)'}`)
  if (bundle) {
    console.log('  row:      inserted by the bundle patch; colors are an id override in cordis.patch.yml')
  } else {
    console.log(`  row:      ${row === null ? 'not installed' : 'installed'}`)
    console.log(`  module:   ${join(pluginDir(config.dshHome, config.profile), 'index.mjs')}`)
  }
  if (row !== null) {
    console.log(`  colors:   light ${row.light ?? '(default)'}   dark ${row.dark ?? '(default)'}`)
    console.log(`  whale:    ${row.enabled === false ? 'default black' : 'recolored'}`)
    console.log(`  settings: ${row.ui === false ? 'hidden' : 'visible (Settings > 通用设置 > 外观)'}`)
    console.log(`  desktop:  ${row.desktop === true ? 'synced' : 'not synced'}`)
  } else if (bundle) {
    console.log('  colors:   light #4d6bfe   dark #7aaaff (bundle defaults, never changed)')
    console.log('  settings: visible (Settings > 通用设置 > 外观)')
  }

  console.log('\nDesktop shell')
  let appDir
  try {
    appDir = resolveAppDir(config.appDir)
  } catch (error) {
    console.log(`  skipped: ${error instanceof Error ? error.message : String(error)}`)
    return 0
  }
  const desktop = desktopStatus(appDir)
  console.log(`  install:  ${appDir}`)
  if (!desktop.installed) {
    console.log('  assets:   untouched')
    return 0
  }
  console.log(`  color:    ${desktop.state.color}`)
  console.log(`  icons:    ${(desktop.state.icons ?? []).join(', ') || 'none'}`)
  console.log(`  welcome:  ${desktop.state.welcome}`)
  console.log(`  patched:  ${desktop.state.patchedAt}`)
  return 0
}

async function main() {
  const [command, ...rest] = process.argv.slice(2)
  let options
  try {
    options = parseOptions(rest)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    console.error('\n' + USAGE)
    return 1
  }
  if (options.help === true || command === undefined) {
    console.log(USAGE)
    return options.help === true ? 0 : 1
  }
  if (options.version === true) {
    console.log(PACKAGE.version)
    return 0
  }

  let config
  try {
    config = settings(options)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    return 1
  }

  switch (command) {
    case 'install':
      return install(config)
    case 'restore':
      return restore(config)
    case 'status':
      return status(config)
    default:
      console.error(`unknown command: ${command}\n`)
      console.log(USAGE)
      return 1
  }
}

process.exitCode = await main()
