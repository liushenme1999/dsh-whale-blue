# dsh-whale-blue 🐋

Repaint the **DeepSeek Harness** whale in **DeepSeek blue** — in the chat UI, the system tray, the window / about icon, and the first-run welcome window. Fully reversible.

After installing, **Settings → 通用设置 → 外观** gains a "鲸鱼配色" item: switch blue on or off with one click, or pick your own light and dark colors. Nothing is added to the page itself.

> Unofficial. The whale artwork belongs to DeepSeek; this project only changes its color.

![before](docs/gui-before.png)
![after](docs/gui-after.png)

[中文说明](README.md)

## What changes

| Where | How | Result |
| --- | --- | --- |
| Sidebar brand mark (and the collapsed rail) | Cordis plugin, one injected stylesheet | ✅ |
| Empty-conversation hero whale | same SVG, same stylesheet | ✅ |
| System tray icon | `install` recolors `resources/tray.ico` | ✅ |
| Window / about / quit-dialog icon | `install` recolors `resources/icon.png` | ✅ |
| First-run / sign-in welcome mark | `install` rewrites `welcome-brand.svg` inside `app.asar` in place | ✅ (whale only, text keeps its color) |
| Settings item under 通用设置 → 外观 | injected `<script>` that inserts one DOM row | — |
| Windows taskbar button icon | comes from the exe resources | ❌ |

![welcome mark](docs/welcome-mark.png)

## Why two halves

The chat UI runs inside the Cordis plugin host, so a plugin can inject a `<style>` row into every index response (`webserver/index-inject`). The tray icon, window icon and welcome window live in the Electron shell instead — plain files (`resources/tray.ico`, `resources/icon.png`) and a file inside `app.asar` — which no plugin can reach. Those are patched by `bin/cli.mjs`, with backups and a byte-exact `restore`.

## Install

Requires Node.js 20+ (or use `install.cmd`, which also finds the node bundled with DSH).

```powershell
git clone https://github.com/<you>/dsh-whale-blue.git
cd dsh-whale-blue
```

1. Quit DeepSeek Harness completely (tray icon → Quit).
2. Double-click `install.cmd`, or run `node bin/cli.mjs install`.
3. Start DeepSeek Harness.

Web GUI only (no file patching, no admin, no restart of any shell):

```powershell
node bin/cli.mjs install --no-desktop
```

## The settings item

No extra button and nothing over the page. After a restart, open **Settings → 通用设置** and it sits directly under **外观**:

| Light | Dark |
| --- | --- |
| ![light settings item](docs/settings-light.png) | ![dark settings item](docs/settings-dark.png) |

- **蓝色 / 默认** switches the whale instantly; no reload.
- The two color fields take any `#rgb` / `#rrggbb` and apply immediately.
- **同步托盘图标和欢迎页图标** rewrites the icons and `app.asar` right away; the tray and welcome window read them at startup, so a DSH restart is what makes them visible.
- **默认** also un-syncs the tray and welcome mark, so one click puts everything back.

Every choice is written back into the managed block of the profile's `cordis.patch.yml`, so it survives restarts. `install --no-ui` (or `ui: false` in that block) installs the plugin without the settings item.

## Commands

```
dsh-whale-blue install|restore|status [options]

--app-dir <path>   install directory (auto-detected by default)
--dsh-home <path>  DSH home (default $DSH_HOME or ~/.dsh)
--profile <name>   profile to configure (default desktop)
--light <color>    light-palette whale color (default #4d6bfe)
--dark <color>     dark-palette whale color (default #7aaaff)
--no-plugin        skip the web GUI plugin
--no-ui            install the plugin without the settings item
--no-desktop       skip tray icon, window icon and welcome mark
--dry-run          report only
```

`restore.cmd` / `node bin/cli.mjs restore` puts the original bytes back (verify with `Get-FileHash` if you like), removes the plugin row and deletes the installed plugin copy.

## How it works

- **Web GUI**: `svg[viewBox="0 0 23.16 17.04"] path { fill: … }` beats the SVG's `fill="currentColor"` presentation attribute, so only the whale changes; theme tokens (which also color all text) are untouched. Dark mode is `body[data-ds-dark-theme]`, not `prefers-color-scheme`.
- **Icons**: a dependency-free PNG/ICO codec remaps dark pixels to the brand color, fades mid-tones toward white to keep the original antialiasing, and leaves light pixels alone.
- **Welcome mark**: only the whale's `fill` attribute is rewritten, to an *equal-length* value (`rgb(77,107,254)` padded with spaces). The archive's directory and every offset stay untouched, and `replaceAsarFile()` refuses any replacement that changes the byte length.
- **Settings item**: not a bundled frontend — a plain `<script>` row injected next to the stylesheet. It finds the 外观 block (a `_title` element whose text is 外观) and inserts one node after it, reusing the class names it reads from that block (`_group`, `_title`, `_cubeRow`, `_themeCube`), so spacing, radius, hover and selected states match the native rows. Its own rules sit inside `:where()` at zero specificity: pure fallback if those class names ever change. The settings pane is rendered on demand, so a debounced `MutationObserver` re-inserts the node whenever React unmounts it. State lives behind the plugin's `/dsh-whale-blue/state` route; POSTs must carry an `x-dsh-whale-blue` header, so a cross-origin page cannot drive it (the preflight is never answered).
- **Preview icons**: the two cubes draw the same whale SVG, so the recoloring rule would paint the "default" preview blue too. Those SVGs are marked `data-dsh-wb-icon` and the rule is `svg[viewBox="…"]:not([data-dsh-wb-icon]) path`.
- **Electron gotcha**: inside the desktop shell, `node:fs` is wrapped by the asar layer, and `open('app.asar', 'r+')` is read as "open an entry of that archive" → `ENOENT,  not found in …app.asar`. `lib/asar.mjs` therefore switches to `original-fs` when it detects `process.versions.electron`, so a running DSH can patch the welcome mark too.

Backups live in `<install>\resources\.dsh-whale-blue\`. After a DSH update the tool notices the assets no longer match its own output and retakes the backups.

## Notes

- Still black after installing? The plugin row is read at startup — restart DSH (a browser tab only needs a refresh).
- No "鲸鱼配色" item? Same reason, plus check that the row does not say `ui: false`. It lives in Settings → 通用设置, under 外观.
- Synced the tray but the welcome page is unchanged? Both are read at startup; restart DSH. If `app.asar` was busy, the settings item says so — quit DSH and run `restore.cmd` + `install.cmd`.
- A settings change that comes back after a restart means it could not be written to `cordis.patch.yml`: the item shows that in red, and `node bin/cli.mjs status` prints what the file records.
- The Windows taskbar button icon is baked into the exe; changing it would break code signing, so it is out of scope.
- `dsh web` / browser use: the plugin half works everywhere (`--no-desktop`).
- The asar integrity fuse is disabled in the desktop build, and the file length never changes.

## Development

```powershell
node --test test/lib.test.mjs
```

## License

MIT
