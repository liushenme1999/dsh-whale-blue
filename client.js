/**
 * Browser half of dsh-whale-blue: the 鲸鱼配色 form on this bundle's own page.
 *
 * Registered into the Plugins page's `plugins.bundle.config` slot, keyed by the
 * bundle's package name, so it renders between the package description and the
 * row list — the same place the official bundles put their configuration. The
 * module is a lazy `__ModuleLoader__` factory: it only registers the factory,
 * nothing runs until the page needs the bundle.
 *
 * Everything the form changes goes through the host's `/dsh-whale-blue/state`
 * route, which owns the profile patch file. The stylesheet is swapped live
 * here, because the one the host injects into the index response was built at
 * page load time.
 */

const API = '/dsh-whale-blue/state'
const SHEET_ID = 'dsh-whale-blue-live'
const FORM_CSS_ID = 'dsh-whale-blue-form-css'
const WHALE_PATH =
  'M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746L11.1749 14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z'
const COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

const CSS = `
.dsh-wb-group { display: flex; flex-direction: column; gap: 8px; padding: 4px 0 20px; font-family: inherit; }
.dsh-wb-group[data-busy="true"] { opacity: .72; }
.dsh-wb-title { color: var(--dsw-alias-label-primary, #0f1115); font-size: 14px; font-weight: 400; line-height: 22px; }
.dsh-wb-row { display: flex; flex-wrap: wrap; align-items: stretch; gap: 8px; }
.dsh-wb-cube {
  flex: 1 1 180px; max-width: 340px; box-sizing: border-box; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px; padding: 18px 24px;
  border: .5px solid var(--dsw-alias-border-l4, rgba(128,128,128,.35));
  border-radius: var(--dsw-radius-xl, 12px); background: none; cursor: pointer;
  color: var(--dsw-alias-label-primary, #0f1115); font: inherit; font-size: 14px; line-height: 22px;
}
.dsh-wb-cube:hover:not([aria-pressed="true"]) { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.08)); }
.dsh-wb-cube[aria-pressed="true"] {
  background: var(--dsw-alias-bg-module-platform, rgba(77,107,254,.10));
  border-color: var(--dsw-static-neutral-bluish-400, #9bb0ff);
}
.dsh-wb-cube svg { display: block; }
.dsh-wb-cube:focus-visible, .dsh-wb-color:focus-within { outline: 2px solid var(--dsw-alias-brand-primary, #4d6bfe); outline-offset: 2px; }
.dsh-wb-colors { display: flex; flex-wrap: wrap; gap: 8px; }
.dsh-wb-color {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 8px 6px 12px;
  border: .5px solid var(--dsw-alias-border-l4, rgba(128,128,128,.35));
  border-radius: var(--dsw-radius-xl, 12px);
  color: var(--dsw-alias-label-secondary, #61666b); font-size: 13px; line-height: 20px; cursor: pointer;
}
.dsh-wb-color[data-invalid="true"] { border-color: #d93838; }
.dsh-wb-swatch {
  width: 20px; height: 20px; padding: 0; border: .5px solid var(--dsw-alias-border-l4, rgba(128,128,128,.35));
  border-radius: 50%; background: none; cursor: pointer; overflow: hidden; -webkit-appearance: none; appearance: none;
}
.dsh-wb-swatch::-webkit-color-swatch-wrapper { padding: 0; }
.dsh-wb-swatch::-webkit-color-swatch { border: 0; border-radius: 50%; }
.dsh-wb-hex {
  width: 66px; border: 0; padding: 0; background: none; color: var(--dsw-alias-label-primary, #0f1115);
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12.5px;
}
.dsh-wb-hex:focus { outline: none; }
.dsh-wb-sync { display: flex; align-items: center; gap: 8px; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-primary, #0f1115); cursor: pointer; }
.dsh-wb-sync input { margin: 0; accent-color: var(--dsw-alias-brand-primary, #4d6bfe); }
.dsh-wb-hint { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary, #61666b); min-height: 18px; }
.dsh-wb-hint[data-error="true"] { color: #c2410c; }
`

/** @param {string} color - `#rgb` or `#rrggbb`. @returns {boolean} */
function validColor(color) {
  return COLOR.test(color)
}

/** @param {string} color - `#rgb` or `#rrggbb`. @returns {string} the `#rrggbb` form. */
function fullHex(color) {
  if (!validColor(color) || color.length !== 4) return color
  return `#${[...color.slice(1)].map((digit) => digit + digit).join('')}`
}

/**
 * Build the live stylesheet for one state.
 * @param {{ enabled: boolean, light: string, dark: string }} state - current values.
 * @returns {string} CSS text that wins over the stylesheet the host injected.
 */
function liveCss(state) {
  // Our own preview marks carry `data-dsh-wb-icon`; the blue cube paints the
  // configured colour itself (through `--dsh-wb-preview`), so leave them alone.
  const mark = 'svg[viewBox="0 0 23.16 17.04"]:not([data-dsh-wb-icon])'
  const preview = [
    `:root{--dsh-wb-preview:${state.light}}`,
    `body[data-ds-dark-theme]{--dsh-wb-preview:${state.dark}}`,
  ]
  if (!state.enabled) return [...preview, `${mark} path{fill:currentColor!important}`].join('\n')
  return [...preview, `${mark} path{fill:${state.light}}`, `body[data-ds-dark-theme] ${mark} path{fill:${state.dark}}`].join('\n')
}

/** Keep one stylesheet element that always comes after the server-injected one. */
function applyLive(state) {
  let tag = document.getElementById(SHEET_ID)
  if (tag === null) {
    tag = document.createElement('style')
    tag.id = SHEET_ID
    document.head.append(tag)
  }
  tag.textContent = liveCss(state)
}

/** @returns {Promise<Record<string, unknown>>} the authoritative state. */
async function read() {
  const response = await fetch(API, { headers: { accept: 'application/json' }, cache: 'no-store' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

/**
 * Send a state change and adopt the host's answer.
 * @param {Record<string, unknown>} patch - fields to change.
 * @returns {Promise<Record<string, unknown>>} the new state.
 */
async function write(patch) {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-dsh-whale-blue': '1' },
    // Send only what the user touched: the host reads an explicit `desktop`
    // field as a request to move the shell assets.
    body: JSON.stringify(patch),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`)
  return body
}

window.__ModuleLoader__.load({
  id: 'dsh-whale-blue',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** @param {string} error - anything thrown. @returns {string} one short line. */
    const message = (error) => (error instanceof Error ? error.message : String(error))

    /** The whale mark, drawn in `currentColor`. */
    function Mark() {
      return h(
        'svg',
        { width: 22, height: 16, viewBox: '0 0 23.16 17.04', 'aria-hidden': true, 'data-dsh-wb-icon': '' },
        h('path', { d: WHALE_PATH, fill: 'currentColor' }),
      )
    }

    /** The 鲸鱼配色 form, rendered inside the bundle's page. */
    function WhaleForm() {
      const [state, setState] = React.useState(null)
      const [busy, setBusy] = React.useState(false)
      const [notice, setNotice] = React.useState('')
      const [drafts, setDrafts] = React.useState({ light: null, dark: null })
      const latest = React.useRef(null)

      const adopt = React.useCallback((next) => {
        latest.current = next
        setState(next)
        applyLive(next)
      }, [])

      React.useEffect(() => {
        if (document.getElementById(FORM_CSS_ID) === null) {
          const tag = document.createElement('style')
          tag.id = FORM_CSS_ID
          tag.textContent = CSS
          document.head.append(tag)
        }
        let alive = true
        read().then(
          (next) => { if (alive) adopt(next) },
          (error) => { if (alive) setNotice(`读取失败：${message(error)}`) },
        )
        return () => { alive = false }
      }, [adopt])

      const save = React.useCallback(async (patch) => {
        if (busy) return
        const merged = { ...(latest.current ?? {}), ...patch }
        adopt(merged) // optimistic: the page repaints before the round trip
        setBusy(true)
        setNotice('')
        try {
          adopt(await write(patch))
          setDrafts({ light: null, dark: null })
        } catch (error) {
          setNotice(`保存失败：${message(error)}`)
          try { adopt(await read()) } catch {}
        } finally {
          setBusy(false)
        }
      }, [adopt, busy])

      const pick = React.useCallback((mode) => {
        // 默认 also drops the shell patch: picking it means "put everything back".
        if (mode === 'blue') save({ enabled: true })
        else save({ enabled: false, desktop: false })
      }, [save])

      /** Accept a colour from either the swatch or the hex field. */
      const commit = React.useCallback((key, raw) => {
        const value = raw.trim().toLowerCase()
        if (!validColor(value)) {
          setDrafts((current) => ({ ...current, [key]: null }))
          setNotice('颜色要写成 #4d6bfe 这样的格式')
          return
        }
        save({ [key]: value, enabled: true })
      }, [save])

      const hint = (() => {
        if (state !== null && typeof state.storeError === 'string') {
          return { text: `设置没写进 cordis.patch.yml，重启会失效：${state.storeError}`, error: true }
        }
        if (state !== null && typeof state.warning === 'string') return { text: state.warning, error: true }
        if (notice !== '') return { text: notice, error: true }
        if (busy) return { text: '保存中…', error: false }
        if (state === null) return { text: '读取中…', error: false }
        if (state.desktop) {
          return { text: state.desktopApplied ? '图标已同步，重启 DSH 后生效。' : '图标还没同步。', error: false }
        }
        if (state.enabled) return { text: '网页立即生效；勾选同步可一并改托盘图标和欢迎页。', error: false }
        return { text: '现在是默认黑色；点「蓝色」立即换色。', error: false }
      })()

      const field = (key, label) => {
        const value = state[key]
        const draft = drafts[key]
        return h(
          'label',
          { className: 'dsh-wb-color', 'data-color': key, 'data-invalid': String(!validColor(draft ?? value ?? '')) },
          h('span', null, label),
          h('input', {
            type: 'color',
            className: 'dsh-wb-swatch',
            'aria-label': `${label}色值`,
            value: fullHex(validColor(value ?? '') ? value : '#000000'),
            onChange: (event) => save({ [key]: event.target.value, enabled: true }),
          }),
          h('input', {
            type: 'text',
            className: 'dsh-wb-hex',
            maxLength: 7,
            spellCheck: false,
            'aria-label': `${label}十六进制值`,
            value: draft ?? value ?? '',
            onChange: (event) => setDrafts((current) => ({ ...current, [key]: event.target.value })),
            onBlur: (event) => commit(key, event.target.value),
            onKeyDown: (event) => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              event.target.blur()
            },
          }),
        )
      }

      return h(
        'div',
        { className: 'dsh-wb-group', 'data-busy': String(busy) },
        h('div', { className: 'dsh-wb-title' }, '鲸鱼配色'),
        h(
          'div',
          { className: 'dsh-wb-row' },
          ...[['blue', '蓝色'], ['default', '默认']].map(([mode, label]) => h(
            'button',
            {
              key: mode,
              type: 'button',
              className: 'dsh-wb-cube',
              'data-mode': mode,
              'aria-pressed': String(state === null ? false : mode === 'blue' ? state.enabled : !state.enabled),
              // The blue cube previews the palette colour of the active theme.
              style: mode === 'blue' ? { color: 'var(--dsh-wb-preview)' } : undefined,
              onClick: () => pick(mode),
            },
            h(Mark),
            label,
          )),
        ),
        state === null ? null : h('div', { className: 'dsh-wb-colors' }, field('light', '亮色'), field('dark', '暗色')),
        h(
          'label',
          { className: 'dsh-wb-sync' },
          h('input', {
            type: 'checkbox',
            checked: state !== null && state.desktop === true,
            disabled: state === null,
            onChange: (event) => save({ desktop: event.target.checked }),
          }),
          h('span', null, '同步托盘图标和欢迎页图标'),
        ),
        h('div', { className: 'dsh-wb-hint', 'data-error': String(hint.error), role: 'status' }, hint.text),
      )
    }

    return {
      // `slots` is the client service the Plugins page declares its slots on.
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: 'dsh-whale-blue',
        }, WhaleForm))
      },
    }
  },
})
