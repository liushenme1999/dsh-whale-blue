/**
 * In-page panel for dsh-whale-blue.
 *
 * Injected as a `script` row next to the stylesheet, so it runs in the app's own
 * document with the app's session. It renders a small whale button in the
 * bottom-right corner; opening it shows the palette controls. Everything is
 * plain DOM inside a shadow root, styled with the app's design tokens, so the
 * panel follows the light/dark palette without caring which one is active.
 *
 * The stylesheet stays authoritative on the server; this script keeps one
 * `<style>` element in the document that always wins by document order, and
 * falls back to `currentColor` (the mark's original color) when disabled.
 */
(() => {
  'use strict'

  if (window.__dshWhaleBlueUi === true) return
  window.__dshWhaleBlueUi = true

  const API = '/dsh-whale-blue/state'
  const STYLE_ID = 'dsh-whale-blue-live'
  const WHALE_PATH = 'M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746L11.1749 14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z'

  /** @type {{ enabled: boolean, light: string, dark: string, desktop: boolean, desktopApplied?: boolean }} */
  const state = { enabled: false, light: '#4d6bfe', dark: '#7aaaff', desktop: false, desktopApplied: false }

  /** @type {HTMLElement | null} */
  let host = null
  let panelOpen = false
  let busy = false

  const STYLES = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: var(--dsw-font-family, -apple-system, "Segoe UI", sans-serif); }
    .fab {
      position: fixed; right: 16px; bottom: 16px; z-index: 2147483000;
      width: 34px; height: 34px; padding: 6px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      background: var(--dsw-alias-button-elevated-fill, #fff);
      border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12));
      box-shadow: 0 2px 10px rgba(0,0,0,.12);
      cursor: pointer; opacity: .82; transition: opacity .15s ease, transform .15s ease;
    }
    .fab:hover { opacity: 1; transform: translateY(-1px); }
    .fab:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #4d6bfe); outline-offset: 2px; }
    .fab svg { width: 100%; height: 100%; display: block; }
    .panel {
      position: fixed; right: 16px; bottom: 60px; z-index: 2147483001;
      width: 292px; padding: 14px; border-radius: 14px;
      display: flex; flex-direction: column; gap: 12px;
      background: var(--dsw-alias-button-elevated-fill, #fff);
      border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12));
      box-shadow: 0 12px 32px rgba(0,0,0,.18);
      color: var(--dsw-alias-label-primary, #0f1115);
      font-size: 13px; line-height: 1.4;
    }
    .panel[hidden] { display: none; }
    header { display: flex; align-items: center; justify-content: space-between; }
    .title { font-size: 13px; font-weight: 600; letter-spacing: .01em; }
    .close {
      width: 22px; height: 22px; border: 0; border-radius: 6px; background: transparent;
      color: var(--dsw-alias-label-tertiary, #81858c); font-size: 16px; line-height: 1;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .close:hover { background: var(--dsw-alias-button-floating-hover, rgba(0,0,0,.06)); }
    .seg { display: flex; gap: 6px; }
    .seg button {
      flex: 1; height: 30px; border-radius: 8px; cursor: pointer;
      border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12));
      background: transparent; color: var(--dsw-alias-label-secondary, #61666b);
      font-size: 12.5px; font-weight: 500;
    }
    .seg button:hover { background: var(--dsw-alias-button-floating-hover, rgba(0,0,0,.05)); }
    .seg button[aria-pressed="true"] {
      background: var(--dsw-whale-accent, #4d6bfe);
      border-color: transparent; color: #fff;
    }
    .row { display: flex; align-items: center; gap: 8px; }
    .row > .label { flex: 1; font-size: 12.5px; color: var(--dsw-alias-label-secondary, #61666b); }
    .hex {
      width: 78px; height: 26px; padding: 0 8px; border-radius: 7px;
      border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12));
      background: transparent; color: inherit;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 11.5px;
    }
    .hex:focus { outline: none; border-color: var(--dsw-whale-accent, #4d6bfe); }
    .hex[data-invalid="true"] { border-color: #d93838; }
    .swatch {
      width: 26px; height: 26px; padding: 0; border-radius: 7px; cursor: pointer;
      border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12));
      background: transparent; overflow: hidden;
    }
    .swatch::-webkit-color-swatch-wrapper { padding: 2px; }
    .swatch::-webkit-color-swatch { border: 0; border-radius: 5px; }
    .desktop { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; color: var(--dsw-alias-label-secondary, #61666b); }
    .desktop input { margin: 2px 0 0; accent-color: var(--dsw-whale-accent, #4d6bfe); }
    .hint { margin: -4px 0 0; font-size: 11.5px; color: var(--dsw-alias-label-tertiary, #81858c); }
    .hint[data-error="true"] { color: #c2410c; }
    footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; border-top: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); padding-top: 10px; }
    .status { font-size: 11.5px; color: var(--dsw-alias-label-tertiary, #81858c); }
    .status[data-error="true"] { color: #d93838; }
    .reset {
      border: 0; background: transparent; padding: 0; cursor: pointer;
      font-size: 11.5px; color: var(--dsw-alias-label-secondary, #61666b); text-decoration: underline;
    }
    .panel[data-busy="true"] { opacity: .72; }
  `

  const MARKUP = `
    <button class="fab" type="button" title="鲸鱼配色" aria-label="鲸鱼配色" aria-expanded="false">
      <svg viewBox="0 0 23.16 17.04" aria-hidden="true"><path d="${WHALE_PATH}" fill="currentColor"/></svg>
    </button>
    <section class="panel" role="dialog" aria-label="鲸鱼配色" hidden>
      <header>
        <span class="title">鲸鱼配色</span>
        <button class="close" type="button" aria-label="关闭">×</button>
      </header>
      <div class="seg" role="group" aria-label="颜色开关">
        <button type="button" data-mode="blue" aria-pressed="false">蓝色</button>
        <button type="button" data-mode="default" aria-pressed="false">默认</button>
      </div>
      <div class="row">
        <span class="label">亮色</span>
        <input class="hex" type="text" maxlength="7" spellcheck="false" aria-label="亮色十六进制值" data-color="light">
        <input class="swatch" type="color" aria-label="选择亮色" data-color="light">
      </div>
      <div class="row">
        <span class="label">暗色</span>
        <input class="hex" type="text" maxlength="7" spellcheck="false" aria-label="暗色十六进制值" data-color="dark">
        <input class="swatch" type="color" aria-label="选择暗色" data-color="dark">
      </div>
      <label class="desktop">
        <input type="checkbox" data-desktop>
        <span>同步托盘图标和欢迎页图标</span>
      </label>
      <p class="hint">网页部分立即生效；托盘与欢迎页需重启 DSH。</p>
      <footer>
        <span class="status">读取中…</span>
        <button class="reset" type="button">恢复默认</button>
      </footer>
    </section>
  `

  /** @returns {string} the live stylesheet for the current state. */
  function liveCss() {
    if (!state.enabled) return 'svg[viewBox="0 0 23.16 17.04"] path{fill:currentColor!important}'
    return `svg[viewBox="0 0 23.16 17.04"] path{fill:${state.light}}\nbody[data-ds-dark-theme] svg[viewBox="0 0 23.16 17.04"] path{fill:${state.dark}}`
  }

  /** Keep one stylesheet element that always comes after the server-injected one. */
  function applyLive() {
    let tag = document.getElementById(STYLE_ID)
    if (tag === null) {
      tag = document.createElement('style')
      tag.id = STYLE_ID
      document.head.append(tag)
    }
    tag.textContent = liveCss()
    if (host !== null) host.style.setProperty('--dsw-whale-accent', state.light)
  }

  /** @param {string} color - `#rgb` or `#rrggbb`. @returns {boolean} */
  function validColor(color) {
    return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)
  }

  /** Push the current state into the panel controls. */
  function render() {
    if (host === null) return
    const root = host.shadowRoot
    const blue = root.querySelector('[data-mode="blue"]')
    const plain = root.querySelector('[data-mode="default"]')
    blue.setAttribute('aria-pressed', String(state.enabled))
    plain.setAttribute('aria-pressed', String(!state.enabled))
    for (const key of ['light', 'dark']) {
      const hex = root.querySelector(`.hex[data-color="${key}"]`)
      const swatch = root.querySelector(`.swatch[data-color="${key}"]`)
      if (document.activeElement !== hex) hex.value = state[key]
      swatch.value = state[key]
      hex.setAttribute('data-invalid', String(!validColor(state[key])))
    }
    root.querySelector('[data-desktop]').checked = state.desktop === true
    root.querySelector('.fab').style.color = state.enabled ? state.light : 'var(--dsw-alias-label-secondary, #61666b)'
    const status = root.querySelector('.status')
    status.dataset.error = 'false'
    if (busy) status.textContent = '保存中…'
    else if (state.enabled && state.desktop) status.textContent = state.desktopApplied ? '图标已同步，重启后生效' : '图标待重启同步'
    else if (state.enabled) status.textContent = '仅网页生效'
    else status.textContent = '默认黑色'
    root.querySelector('.panel').dataset.busy = String(busy)
    const hint = root.querySelector('.hint')
    hint.dataset.error = String(typeof state.warning === 'string')
    hint.textContent = typeof state.warning === 'string' ? state.warning : '网页部分立即生效；托盘与欢迎页需重启 DSH。'
  }

  /**
   * Report a failure in the footer.
   * @param {string} message - text to show.
   */
  function fail(message) {
    if (host === null) return
    const status = host.shadowRoot.querySelector('.status')
    status.dataset.error = 'true'
    status.textContent = message
  }

  /**
   * Send a state change to the host and adopt its answer.
   * @param {Partial<typeof state>} patch - fields to change.
   */
  async function save(patch) {
    if (busy) return
    const next = { ...state, ...patch }
    Object.assign(state, next)
    applyLive()
    render()
    busy = true
    render()
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-dsh-whale-blue': '1' },
        // Send only what the user touched: the host treats an explicit
        // `desktop` field as a request to move the shell assets.
        body: JSON.stringify(patch),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`)
      Object.assign(state, body)
      state.warning = body.warning
      applyLive()
    } catch (error) {
      fail(`保存失败：${error instanceof Error ? error.message : String(error)}`)
      await load()
    } finally {
      busy = false
      applyLive()
      render()
    }
  }

  /** Read the authoritative state from the host. */
  async function load() {
    try {
      const response = await fetch(API, { headers: { accept: 'application/json' } })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const body = await response.json()
      Object.assign(state, body)
      state.warning = body.warning
      applyLive()
      render()
    } catch (error) {
      fail(`读取失败：${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /** Create the button and panel once the document is ready. */
  function mount() {
    if (host !== null || document.body === null) return
    host = document.createElement('div')
    host.id = 'dsh-whale-blue-ui'
    const shadow = host.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = STYLES
    const wrapper = document.createElement('div')
    wrapper.innerHTML = MARKUP
    shadow.append(style, wrapper)
    document.body.append(host)

    const root = shadow
    const fab = root.querySelector('.fab')
    const panel = root.querySelector('.panel')

    const open = (value) => {
      panelOpen = value
      panel.hidden = !value
      fab.setAttribute('aria-expanded', String(value))
      if (value) load()
    }

    fab.addEventListener('click', (event) => {
      event.stopPropagation()
      open(!panelOpen)
    })
    root.querySelector('.close').addEventListener('click', () => open(false))
    // Keep clicks inside the widget from reaching the document-level dismisser.
    host.addEventListener('pointerdown', (event) => event.stopPropagation())
    document.addEventListener('pointerdown', () => {
      if (panelOpen) open(false)
    })
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && panelOpen) open(false)
    })

    for (const button of root.querySelectorAll('.seg button')) {
      button.addEventListener('click', () => save({ enabled: button.dataset.mode === 'blue' }))
    }
    for (const key of ['light', 'dark']) {
      const hex = root.querySelector(`.hex[data-color="${key}"]`)
      const swatch = root.querySelector(`.swatch[data-color="${key}"]`)
      const commit = () => {
        const value = hex.value.trim()
        if (!validColor(value)) {
          hex.setAttribute('data-invalid', 'true')
          fail('颜色要写成 #4d6bfe 这样的格式')
          return
        }
        hex.setAttribute('data-invalid', 'false')
        save({ [key]: value.toLowerCase(), enabled: true })
      }
      hex.addEventListener('change', commit)
      hex.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          commit()
        }
      })
      swatch.addEventListener('input', () => {
        hex.value = swatch.value
        hex.setAttribute('data-invalid', 'false')
      })
      swatch.addEventListener('change', () => save({ [key]: swatch.value.toLowerCase(), enabled: true }))
    }
    root.querySelector('[data-desktop]').addEventListener('change', (event) => {
      save({ desktop: event.target.checked })
    })
    root.querySelector('.reset').addEventListener('click', () => {
      save({ enabled: false, light: '#4d6bfe', dark: '#7aaaff', desktop: false })
    })

    applyLive()
    render()
    load()
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true })
  else mount()
})()
