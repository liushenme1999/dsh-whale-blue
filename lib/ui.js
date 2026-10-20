/**
 * Settings-row UI for dsh-whale-blue.
 *
 * Injected as a `script` row next to the stylesheet, so it runs in the app's own
 * document with the app's session. It adds one item to
 * Settings → 通用设置, directly under 外观, and nothing anywhere else: no
 * floating button, no overlay.
 *
 * The item is built from the classes the app already uses for that list
 * (`<prefix>_group`, `_title`, `_cubeRow`, `_themeCube`), read from the live
 * 外观 block instead of hard-coded, so it inherits the app's own spacing,
 * borders and hover states. Every rule of our own is wrapped in `:where()` at
 * zero specificity, which means it only styles the item when the app's classes
 * are gone — a future redesign degrades to "plain but usable" instead of
 * breaking.
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
  const OWN = 'data-dsh-whale-blue'
  const WHALE_PATH =
    'M22.9168 1.43018C22.6713 1.31018 22.5658 1.53918 22.4223 1.65519C22.3733 1.69269 22.3318 1.74169 22.2903 1.78669C21.9317 2.1697 21.5127 2.42121 20.9657 2.39121C20.1657 2.34621 19.4827 2.59771 18.8787 3.20973C18.7502 2.45521 18.3236 2.0047 17.6746 1.71569C17.3351 1.56568 16.9916 1.41518 16.7536 1.08867C16.5876 0.856163 16.5421 0.597155 16.4591 0.341647C16.4061 0.187643 16.3536 0.0301382 16.1761 0.00363739C15.9836 -0.0263635 15.9081 0.135141 15.8326 0.270145C15.5306 0.822162 15.4136 1.43018 15.4251 2.0462C15.4516 3.43174 16.0366 4.53527 17.1991 5.3203C17.3311 5.4103 17.3651 5.5003 17.3236 5.63181C17.2441 5.90231 17.1501 6.16482 17.0671 6.43533C17.0141 6.60784 16.9351 6.64584 16.7501 6.57033C16.1121 6.30383 15.5611 5.90931 15.074 5.4328C14.2475 4.63328 13.5 3.75075 12.568 3.05973C12.349 2.89822 12.13 2.74822 11.9034 2.60522C10.9524 1.68169 12.028 0.923165 12.277 0.833162C12.5375 0.739159 12.3675 0.41615 11.5259 0.42015C10.6844 0.42365 9.91439 0.705658 8.93286 1.08117C8.78935 1.13767 8.63835 1.17867 8.48384 1.21267C7.59332 1.04367 6.66829 1.00617 5.70226 1.11517C3.88321 1.31768 2.43016 2.1777 1.36213 3.64575C0.0790928 5.4103 -0.222916 7.41536 0.146595 9.50642C0.535106 11.7105 1.66014 13.535 3.38869 14.9616C5.18125 16.4406 7.24581 17.1657 9.60138 17.0266C11.0319 16.9441 12.6245 16.7526 14.421 15.2321C14.874 15.4576 15.3496 15.5476 16.1381 15.6151C16.7456 15.6716 17.3306 15.5851 17.7836 15.4911C18.4931 15.3411 18.4441 14.6841 18.1876 14.5636C16.1081 13.595 16.5646 13.9891 16.1496 13.67C17.2061 12.42 18.8202 10.1979 19.3182 7.17235C19.3672 6.83834 19.4297 6.36783 19.4222 6.09732C19.4182 5.93231 19.4562 5.86831 19.6447 5.84931C20.1657 5.78931 20.6712 5.64681 21.1357 5.3913C22.4833 4.65528 23.0268 3.44624 23.1548 1.9972C23.1738 1.77569 23.1508 1.54668 22.9168 1.43018ZM11.1749 14.4736C9.15936 12.889 8.18184 12.3675 7.77832 12.39C7.40081 12.4125 7.46881 12.8445 7.55182 13.126C7.63882 13.404 7.75182 13.5955 7.91033 13.8396C8.01983 14.0011 8.09533 14.2411 7.80083 14.4216C7.15181 14.8231 6.02327 14.2866 5.97027 14.2601C4.65673 13.4865 3.5587 12.4655 2.78467 11.069C2.03715 9.72493 1.60314 8.28289 1.53164 6.74384C1.51264 6.37233 1.62214 6.24082 1.99215 6.17332C2.47916 6.08332 2.98118 6.06432 3.46769 6.13582C5.52476 6.43633 7.27581 7.35586 8.74385 8.8129C9.58188 9.64243 10.2159 10.634 10.8689 11.6025C11.5634 12.631 12.3105 13.611 13.262 14.4146C13.598 14.6961 13.866 14.9101 14.1225 15.0681C13.349 15.1546 12.058 15.1731 11.1749 14.4746L11.1749 14.4736ZM12.141 8.25988C12.141 8.09488 12.273 7.96338 12.439 7.96338C12.4765 7.96338 12.5105 7.97088 12.541 7.98188C12.5825 7.99688 12.6205 8.01938 12.6505 8.05338C12.7035 8.10588 12.7335 8.18088 12.7335 8.25988C12.7335 8.42489 12.6015 8.55639 12.4355 8.55639C12.2695 8.55639 12.141 8.42489 12.141 8.25988ZM15.1415 9.79893C14.949 9.87793 14.7565 9.94544 14.5715 9.95294C14.2845 9.96794 13.9715 9.85143 13.8015 9.70893C13.5375 9.48742 13.3485 9.36342 13.2695 8.97691C13.2355 8.8119 13.2545 8.55639 13.2845 8.40989C13.3525 8.09438 13.277 7.89187 13.0545 7.70787C12.8735 7.55786 12.643 7.51636 12.39 7.51636C12.2955 7.51636 12.209 7.47486 12.1445 7.44136C12.039 7.38886 11.9519 7.25735 12.035 7.09585C12.0615 7.04335 12.19 6.91584 12.22 6.89334C12.5635 6.69784 12.9595 6.76184 13.326 6.90834C13.6655 7.04735 13.9225 7.30236 14.292 7.66287C14.6695 8.09838 14.7375 8.21838 14.9525 8.54539C15.1225 8.8009 15.277 9.06341 15.3831 9.36392C15.4471 9.55142 15.3641 9.70493 15.1415 9.79893Z'

  /** @type {{ enabled: boolean, light: string, dark: string, desktop: boolean, desktopApplied?: boolean, warning?: string, storeError?: string }} */
  const state = { enabled: false, light: '#4d6bfe', dark: '#7aaaff', desktop: false, desktopApplied: false }

  /** @type {HTMLElement | null} the settings item, once built. */
  let item = null
  let busy = false
  /** A validation or transport message that outranks the normal hint. */
  let fmt = ''
  /** @type {ReturnType<typeof setTimeout> | null} */
  let scheduled = null

  const CSS = `
    :where(.dsh-wb-group) {
      display: flex; flex-direction: column; gap: 8px; padding: 16px 0;
      border-bottom: .5px solid var(--dsw-alias-border-l2, rgba(128,128,128,.28));
      font-family: inherit;
    }
    :where(.dsh-wb-title) { color: var(--dsw-alias-label-primary, #0f1115); font-size: 14px; font-weight: 400; line-height: 22px; }
    :where(.dsh-wb-row) { display: flex; flex-wrap: wrap; align-items: stretch; gap: 8px; }
    :where(.dsh-wb-cube) {
      flex: 1 1 180px; box-sizing: border-box; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 4px; padding: 20px 32px;
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
    .dsh-wb-group[data-busy="true"] { opacity: .7; }
  `

  /** Ensure our stylesheet exists in the app's document. */
  function ensureCss() {
    if (document.getElementById('dsh-whale-blue-ui-css') !== null) return
    const tag = document.createElement('style')
    tag.id = 'dsh-whale-blue-ui-css'
    tag.textContent = CSS
    document.head.append(tag)
  }

  /** @param {string} color - `#rgb` or `#rrggbb`. @returns {boolean} */
  function validColor(color) {
    return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)
  }

  /** @returns {string} the live stylesheet for the current state. */
  function liveCss() {
    // Skip our own preview icons: they draw the same mark, but carry their own
    // colour (the blue cube always shows the configured light colour).
    const mark = 'svg[viewBox="0 0 23.16 17.04"]:not([data-dsh-wb-icon])'
    if (!state.enabled) return `${mark} path{fill:currentColor!important}`
    return `${mark} path{fill:${state.light}}\nbody[data-ds-dark-theme] ${mark} path{fill:${state.dark}}`
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
  }

  /** @returns {{ anchor: Element, group: Element, title: Element } | null} the 外观 block to sit under. */
  function locate() {
    for (const title of document.querySelectorAll('[class*="_title"]')) {
      if ((title.textContent ?? '').trim() !== '外观') continue
      const group = title.parentElement
      if (group === null) continue
      // Some items are wrapped in a `data-slot` div (display: contents). Sit next
      // to that wrapper when the group is its only child, so React keeps treating
      // us as a sibling item instead of appending to the whole section.
      const parent = group.parentElement
      const wrapper = parent !== null && parent.childElementCount === 1 ? parent : group
      return { anchor: wrapper, group, title }
    }
    return null
  }

  /** Copy the class names the app uses for this kind of block. */
  function nativeClasses(group, title) {
    const cubeRow = group.querySelector('[class*="_cubeRow"]')
    const cube = group.querySelector('[class*="_themeCube"]')
    return {
      group: group.className,
      title: title.className,
      row: cubeRow === null ? '' : cubeRow.className,
      cube: cube === null ? '' : cube.className,
    }
  }

  /** @param {string} classes - space separated class list. @returns {string} its first token, or '' when empty. */
  function firstClass(classes) {
    return classes.split(/\s+/).filter(Boolean)[0] ?? ''
  }

  /** @param {string} color - `#rgb` or `#rrggbb`. @returns {string} a 6-digit form for `<input type="color">`. */
  function fullHex(color) {
    if (!validColor(color)) return '#000000'
    return color.length === 4
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color.toLowerCase()
  }

  /**
   * Build the settings item.
   * @param {{ group: string, title: string, row: string, cube: string }} native - the app's class names.
   * @returns {HTMLElement} the item, not yet inserted.
   */
  function build(native) {
    const wrapper = document.createElement('div')
    wrapper.setAttribute(OWN, '')
    wrapper.className = 'dsh-wb-group'
    if (firstClass(native.group) !== '') wrapper.classList.add(firstClass(native.group))

    const heading = document.createElement('div')
    heading.className = 'dsh-wb-title'
    if (firstClass(native.title) !== '') heading.classList.add(firstClass(native.title))
    heading.textContent = '鲸鱼配色'

    const row = document.createElement('div')
    row.className = 'dsh-wb-row'
    if (firstClass(native.row) !== '') row.classList.add(firstClass(native.row))

    const cubeClass = firstClass(native.cube) === '' ? 'dsh-wb-cube' : `dsh-wb-cube ${firstClass(native.cube)}`
    for (const [mode, label] of [['blue', '蓝色'], ['default', '默认']]) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = cubeClass
      button.dataset.mode = mode
      button.setAttribute('aria-pressed', 'false')
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      icon.setAttribute('width', '22')
      icon.setAttribute('height', '16')
      icon.setAttribute('viewBox', '0 0 23.16 17.04')
      icon.setAttribute('aria-hidden', 'true')
      icon.setAttribute('data-dsh-wb-icon', '')
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', WHALE_PATH)
      path.setAttribute('fill', 'currentColor')
      icon.append(path)
      button.append(icon, document.createTextNode(label))
      row.append(button)
    }

    const colors = document.createElement('div')
    colors.className = 'dsh-wb-colors'
    for (const [key, label] of [['light', '亮色'], ['dark', '暗色']]) {
      const field = document.createElement('label')
      field.className = 'dsh-wb-color'
      field.dataset.color = key
      const swatch = document.createElement('input')
      swatch.type = 'color'
      swatch.className = 'dsh-wb-swatch'
      swatch.dataset.swatch = key
      swatch.setAttribute('aria-label', `${label}色值`)
      const hex = document.createElement('input')
      hex.type = 'text'
      hex.className = 'dsh-wb-hex'
      hex.dataset.hex = key
      hex.maxLength = 7
      hex.spellcheck = false
      hex.setAttribute('aria-label', `${label}十六进制值`)
      const text = document.createElement('span')
      text.textContent = label
      // Label, colour chip, then the hex as a fallback for exact values.
      field.append(text, swatch, hex)
      colors.append(field)
    }

    const sync = document.createElement('label')
    sync.className = 'dsh-wb-sync'
    const syncBox = document.createElement('input')
    syncBox.type = 'checkbox'
    syncBox.dataset.desktop = ''
    const syncText = document.createElement('span')
    syncText.textContent = '同步托盘图标和欢迎页图标'
    sync.append(syncBox, syncText)

    const hint = document.createElement('div')
    hint.className = 'dsh-wb-hint'
    hint.dataset.hint = ''
    hint.setAttribute('role', 'status')

    wrapper.append(heading, row, colors, sync, hint)

    wrapper.addEventListener('click', (event) => {
      const button = event.target instanceof Element ? event.target.closest('[data-mode]') : null
      if (button === null) return
      // 默认 also drops the shell patch: picking it means "put everything back".
      if (button.dataset.mode === 'blue') save({ enabled: true })
      else save({ enabled: false, desktop: false })
    })
    wrapper.addEventListener('input', (event) => {
      const target = event.target
      if (!(target instanceof HTMLInputElement) || target.dataset.swatch === undefined) return
      const hex = wrapper.querySelector(`[data-hex="${target.dataset.swatch}"]`)
      const field = wrapper.querySelector(`[data-color="${target.dataset.swatch}"]`)
      if (hex === null || field === null) return
      hex.value = target.value
      field.dataset.invalid = 'false'
    })
    wrapper.addEventListener('change', (event) => {
      const target = event.target
      if (!(target instanceof HTMLInputElement)) return
      if (target.dataset.desktop !== undefined) {
        save({ desktop: target.checked })
        return
      }
      const key = target.dataset.swatch ?? target.dataset.hex
      if (key === undefined) return
      const value = target.value.trim().toLowerCase()
      if (!validColor(value)) {
        wrapper.querySelector(`[data-color="${key}"]`).dataset.invalid = 'true'
        fmt = '颜色要写成 #4d6bfe 这样的格式'
        render()
        return
      }
      save({ [key]: value, enabled: true })
    })
    wrapper.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' || !(event.target instanceof HTMLInputElement) || event.target.dataset.hex === undefined) return
      event.preventDefault()
      event.target.blur()
      event.target.dispatchEvent(new Event('change', { bubbles: true }))
    })

    return wrapper
  }

  /** Push the current state into the controls. */
  function render() {
    if (item === null) return
    const blue = item.querySelector('[data-mode="blue"]')
    const plain = item.querySelector('[data-mode="default"]')
    blue.setAttribute('aria-pressed', String(state.enabled))
    plain.setAttribute('aria-pressed', String(!state.enabled))
    // The blue cube always previews the configured light colour; selection shows
    // in the cube background, exactly like the 浅色/深色/跟随系统 row above.
    blue.querySelector('svg').style.color = state.light
    for (const key of ['light', 'dark']) {
      const field = item.querySelector(`[data-color="${key}"]`)
      const swatch = item.querySelector(`[data-swatch="${key}"]`)
      const hex = item.querySelector(`[data-hex="${key}"]`)
      if (document.activeElement !== hex) hex.value = state[key]
      swatch.value = fullHex(state[key])
      field.dataset.invalid = String(!validColor(state[key]))
    }
    item.querySelector('[data-desktop]').checked = state.desktop === true
    item.dataset.busy = String(busy)

    const hint = item.querySelector('[data-hint]')
    const problem = typeof state.storeError === 'string'
      ? `设置没写进 cordis.patch.yml，重启会失效：${state.storeError}`
      : typeof state.warning === 'string' ? state.warning : ''
    hint.dataset.error = String(problem !== '' || fmt !== '')
    hint.textContent = problem !== '' ? problem
      : fmt !== '' ? fmt
        : busy ? '保存中…'
          : state.desktop
            ? (state.desktopApplied ? '图标已同步，重启 DSH 后生效。' : '图标还没同步。')
            : state.enabled
              ? '网页立即生效；勾选同步可一并改托盘图标和欢迎页。'
              : '现在是默认黑色；点「蓝色」立即换色。'
  }

  /**
   * Send a state change to the host and adopt its answer.
   * @param {Record<string, unknown>} patch - fields to change.
   */
  async function save(patch) {
    if (busy) return
    Object.assign(state, patch)
    applyLive()
    busy = true
    fmt = ''
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
      applyLive()
    } catch (error) {
      fmt = `保存失败：${error instanceof Error ? error.message : String(error)}`
      await load()
    } finally {
      busy = false
      render()
    }
  }

  /** Read the authoritative state from the host. */
  async function load() {
    try {
      const response = await fetch(API, { headers: { accept: 'application/json' } })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      Object.assign(state, await response.json())
      applyLive()
      render()
    } catch (error) {
      fmt = `读取失败：${error instanceof Error ? error.message : String(error)}`
      render()
    }
  }

  /** Insert the item under 外观, wherever the settings pane currently is. */
  function ensure() {
    const found = locate()
    if (found === null) {
      if (item !== null && item.isConnected) item.remove()
      return
    }
    if (item === null) {
      ensureCss()
      item = build(nativeClasses(found.group, found.title))
      load()
    }
    if (item.isConnected && item.previousElementSibling === found.anchor) return
    // A re-render put the pane back; refresh the values while we are here.
    if (!item.isConnected) load()
    found.anchor.after(item)
  }

  /** Coalesce DOM churn into one check. */
  function schedule() {
    if (scheduled !== null) return
    scheduled = setTimeout(() => {
      scheduled = null
      ensure()
    }, 150)
  }

  function start() {
    if (document.body === null) return
    ensure()
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
  else start()
})()
