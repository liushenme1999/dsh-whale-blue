# dsh-whale-blue 🐋

Repaint the **DeepSeek Harness** whale in **DeepSeek blue** — in the chat UI, the system tray, the window / about icon, and the first-run welcome window. Fully reversible.

After installing, **Settings → 通用设置 → 外观** gains a "鲸鱼配色" item: switch blue on or off with one click, or pick your own light and dark colors. Nothing is added to the page itself.

> Unofficial. The whale artwork belongs to DeepSeek; this project only changes its color.

Two ways to install: paste this repository's URL into DSH's **Plugins** page (recommended — no Node.js, no clone), or clone it and run `install.cmd`. See [Install](#install).

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

![welcome mark](docs/welcome-mark.png)

## Why two halves

The chat UI runs inside the Cordis plugin host, so a plugin can inject a `<style>` row into every index response (`webserver/index-inject`). The tray icon, window icon and welcome window live in the Electron shell instead — plain files (`resources/tray.ico`, `resources/icon.png`) and a file inside `app.asar` — which no plugin can reach. Those are patched by `bin/cli.mjs`, with backups and a byte-exact `restore`.

## Install

Requires Windows DSH desktop (verified on `0.2.1-rc.2`). **Installing from the Plugins page needs no Node.js and no clone.**

### Option 1: the Plugins page (recommended)

1. Open DSH and pick **插件** in the sidebar.
2. Click **添加插件**, paste the repository URL and press Enter:

   ```
   https://github.com/liushenme1999/dsh-whale-blue
   ```

3. **安装**, then click **立即启用** on the result screen.

   > Closing the dialog also installs it, but the bundle stays **off**. Go to **已安装插件**, find 蓝色鲸鱼 and switch it on (the same switch is on its detail page).
4. Restart DSH. `Ctrl+R` only reloads the page: the plugin row is composed when the host starts, so the first time needs a full restart.
5. Open **Settings → 通用设置**: 鲸鱼配色 sits under 外观.

That installs a **bundle**: `dsh.bundle.patch` in `package.json` points at `cordis.patch.yml`, which inserts the plugin row. Your choices are not written back into the package — they go into the profile's own `cordis.patch.yml` as an id-targeted override, so **upgrading or reinstalling the bundle keeps your colors**.

To confirm it took: `dsh.profile.bundles` in `~/.dsh/profiles/desktop/package.json` should list `dsh-whale-blue`. If only `dependencies` has it, the bundle is installed but not enabled.

This installs from GitHub, not from npm, so no registry mirror is involved. Behind a network that cannot reach GitHub the dialog reports 无法访问 GitHub / 连接 GitHub 超时; use option 2 there.

### Option 2: the command line (local clone)

For machines without the Plugins page (a `dsh web` build, a custom profile) or when you also want the tray icon:

```powershell
git clone https://github.com/liushenme1999/dsh-whale-blue.git
cd dsh-whale-blue
```

1. Quit DeepSeek Harness completely (tray icon → Quit).
2. Double-click `install.cmd`, or run `node bin/cli.mjs install`.
3. Start DeepSeek Harness.

This copies the package to `<profile>/local/whale-blue/` and inserts the row itself. **Pick one option per profile**: two rows with the same id mount the plugin twice. If you already installed from the CLI and switch to the Plugins page, run `restore.cmd` first — and if you forget, the plugin rewrites the leftover insert row on its next start (one extra log line on that boot).

Web GUI only (no file patching, no admin, no shell restart) — which is also the default for a Plugins-page install (`desktop: false`), where tray syncing is one click in Settings:

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

Every choice is written back into the managed block of the profile's `cordis.patch.yml`, so it survives restarts. To drop the item: turn the bundle off on the Plugins page, use `install --no-ui` from the CLI, or set `ui: false` in that block.

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

### How it becomes an installable bundle

DSH's definition is narrow: **a package whose `package.json` declares `dsh.bundle.patch` is a bundle**. The Plugins page only runs `pnpm add` in the profile and appends the package name to `dsh.profile.bundles`; everything else is layered at startup:

```
each bundle's cordis.patch.yml  →  the profile's cordis.patch.yml  →  --patch overlays
```

So the package ships:

| File | Role |
| --- | --- |
| `cordis.patch.yml` | the bundle layer: inserts the `whale-blue` row; its `config` is just the default |
| `dsh.bundle.patch` in `package.json` | declares the bundle and the patch file |
| `exports` in `package.json` | lets `locale/*.json`, `icon` and `cordis.patch.yml` be resolved as subpaths (an `exports` map hides everything it does not list) |
| `locale/{zh,en}.json` | card title and description (`meta.title` / `meta.description`, readable without loading code) |
| `icon.svg` | card icon: SVG / PNG / JPEG / WebP, ≤256 KiB, inside the package |

Two loader semantics shape the managed block:

1. A non-insert patch **replaces the whole `config`** (no deep merge), so every write carries the complete set of fields.
2. A non-insert patch matches by `id`, and optionally by `name` — a mismatch skips the patch entirely. The bundle inserts the row as `whale-blue`, so the block writes only the id: the CLI's row is named by a `file://` URL, and naming it here would fail the check.

One trap is bundle-specific: the bundle already inserts `whale-blue`, so a second `insert` in the profile layer would put two rows with one id in the tree and mount the plugin twice. The plugin therefore picks the shape from where it is installed (`install: 'bundle' | 'local'`, i.e. whether its path contains `node_modules`) and rewrites a leftover insert row into an override at startup.

Tray syncing self-checks at startup for the same reason: a bundle install has no CLI to run, so if the config asks for the icons and the files are unpatched (say a DSH update replaced `resources/`), boot applies the patch again.

## Notes

- Still black after installing? The plugin row is read at startup — restart DSH (a browser tab only needs a refresh).
- No "鲸鱼配色" item? Same reason, plus check that the row does not say `ui: false`. It lives in Settings → 通用设置, under 外观.
- Installed from the Plugins page but there is no "鲸鱼配色" item? First check that the bundle is **on**: Plugins → **已安装插件** → the 蓝色鲸鱼 switch. Closing the install dialog leaves it installed but **off**, its patch layer never applies, and the row is never inserted (`dependencies` lists it, `dsh.profile.bundles` does not). Switch it on, then restart DSH.
- No card in the list at all? `pnpm add` failed — reinstall and read **查看安装详情**.
- The dialog says 无法访问 GitHub / 连接 GitHub 超时? It probes the repository with `git ls-remote` before installing. Change network, or use the command line (clone and `install.cmd`).
- Synced the tray but the welcome page is unchanged? Both are read at startup; restart DSH. If `app.asar` was busy the settings item says so: a bundle install retries on the next start, a CLI install needs `restore.cmd` + `install.cmd`.
- A settings change that comes back after a restart means it could not be written to `cordis.patch.yml`: the item shows that in red, and `node bin/cli.mjs status` prints what the file records.
- Installed from the CLI first and then from the Plugins page? The plugin rewrites the leftover insert row into an override at startup and keeps your colors; running `restore.cmd` first is cleaner. The other order is refused by the CLI, which points at the Plugins page.
- `dsh web` / browser use: the plugin half works everywhere (`--no-desktop`, or the Plugins page).
- The asar integrity fuse is disabled in the desktop build, and the file length never changes.

## Development

```powershell
node --test test/lib.test.mjs
```

## License

MIT
