# dsh-whale-blue 🐋

把 **DeepSeek Harness**（DSH）里那只黑色鲸鱼换成 **DeepSeek 蓝**。

聊天界面的品牌标志、系统托盘图标、窗口 / 关于面板图标、首次启动的欢迎页——一次性全部换掉，随时可以逐字节还原。

> 非官方项目。鲸鱼标志的版权归 DeepSeek 所有，本项目只是重新上色。

![改前](docs/gui-before.png)
![改后](docs/gui-after.png)

---

## 覆盖范围

| 位置 | 实现方式 | 是否变色 |
| --- | --- | --- |
| 侧边栏品牌标志（含折叠状态） | Cordis 插件，注入一条 CSS | ✅ |
| 空会话页的大鲸鱼 | 同一个 SVG，同一条 CSS | ✅ |
| 系统托盘 / 通知区域图标 | `install` 重给 `resources/tray.ico` 上色 | ✅ |
| 窗口图标、关于面板、退出确认框 | `install` 重给 `resources/icon.png` 上色 | ✅ |
| 首次启动 / 登录欢迎页的品牌标志 | `install` 原地改写 `app.asar` 里的 `welcome-brand.svg` | ✅（只有鲸鱼，文字保持原色） |
| Windows 任务栏按钮图标 | 由 exe 内的图标资源决定，不改 exe 就改不了 | ❌ |

![欢迎页](docs/welcome-mark.png)

| 托盘图标 | 窗口图标 |
| --- | --- |
| ![托盘改前](docs/tray-before.png) → ![托盘改后](docs/tray-after.png) | ![图标改前](docs/icon-before.png) → ![图标改后](docs/icon-after.png) |

---

## 为什么是两个部分

DSH 的界面由两层组成，鲸鱼在这两层各有一份：

1. **网页界面**（聊天窗口里的所有内容）跑在 Cordis 插件宿主里。插件可以往每个页面 `<head>` 注入样式，所以这部分是**真正的插件**，纯 CSS，零依赖，不碰任何文件。
2. **桌面外壳**（Electron：托盘、窗口、欢迎页）在插件够不到的地方——托盘图标是 `resources/tray.ico`，欢迎页的 logo 打包在 `app.asar` 里。这部分只能由 `bin/cli.mjs` 做**可逆的文件级补丁**（先备份，再改写）。

所以这个仓库 = 一个 Cordis 插件 + 一个配套的、带备份和还原的小工具。

---

## 安装

前提：Windows 上的 DSH 桌面版（已在 `0.2.1-rc.2` 上验证）＋ Node.js 20 或更新版本。没装 Node 也行，`install.cmd` 会自动找 DSH 自带的 node。

```powershell
git clone https://github.com/<you>/dsh-whale-blue.git
cd dsh-whale-blue
```

1. **完全退出 DSH**（托盘图标 → 退出）。`app.asar` 被占用时补丁会跳过欢迎页。
2. 双击 **`install.cmd`**，或者：

   ```powershell
   node bin/cli.mjs install
   ```

3. 重新打开 DSH。

输出大概是这样：

```
Web GUI plugin
  C:\Users\you\.dsh\profiles\desktop\local\whale-blue\index.mjs
  C:\Users\you\.dsh\profiles\desktop\cordis.patch.yml (managed block)

Desktop shell (tray icon, window icon, welcome mark)
  install: D:\Program Files\DeepSeek Harness
  tray.ico: 15698 -> 10790 bytes
  icon.png: 128820 -> 85989 bytes
  app.asar (renderer/assets/welcome-brand.svg): 15929 bytes, whale repainted
```

### 只想要网页里的蓝鲸鱼

```powershell
node bin/cli.mjs install --no-desktop
```

只会往 profile 里写一行插件配置，不碰安装目录，重启 DSH 生效。

### 各平台说明

- **Windows 桌面版**：全部生效。
- **`dsh web` / 浏览器打开**：插件部分生效（`--no-desktop` 即可）。
- **macOS / Linux 桌面版**：插件部分可用；托盘与图标不在本项目的处理范围内。

---

## 命令

```
dsh-whale-blue install [options]   装插件行 + 上色托盘/窗口图标 + 欢迎页
dsh-whale-blue restore [options]   全部还原（从备份逐字节写回）
dsh-whale-blue status  [options]   看看现在是什么状态

--app-dir <path>     DSH 安装目录（默认自动查找）
--dsh-home <path>    DSH 主目录（默认 $DSH_HOME 或 ~/.dsh）
--profile <name>     要配置的 profile（默认 desktop）
--light <color>      亮色下的鲸鱼颜色（默认 #4d6bfe）
--dark <color>       暗色下的鲸鱼颜色（默认 #7aaaff）
--no-plugin          跳过网页插件
--no-desktop         跳过托盘/窗口图标/欢迎页
--dry-run            只报告，不写任何文件
```

卸载：

```powershell
restore.cmd        # 或 node bin/cli.mjs restore
```

`restore` 会把图标和 `app.asar` 里的 SVG 写回备份里的原始字节（可以自己用 `Get-FileHash` 校验），删掉插件行和 `local/whale-blue/`，然后清掉备份目录。

---

## 自定义颜色

```powershell
node bin/cli.mjs install --light "#5b8cff" --dark "#9dc0ff"
```

颜色最终写在 profile 的 `cordis.patch.yml` 里，随时可以改：

```yaml
# dsh-whale-blue:start — managed by `dsh-whale-blue install`; `dsh-whale-blue restore` removes it
- insert:
    - id: whale-blue
      name: "file:///C:/Users/you/.dsh/profiles/desktop/local/whale-blue/index.mjs"
      config:
        light: "#4d6bfe"
        dark: "#7aaaff"
# dsh-whale-blue:end
```

`install` 只管这个标记块，你自己在同一个文件里写的其它行不会被碰。

---

## 原理（想改的人看这里）

### 网页里的鲸鱼

所有鲸鱼都是同一个组件（`FishLogo`），`viewBox` 固定为 `0 0 23.16 17.04`，路径上是 `fill="currentColor"`，最终取 `--dsw-alias-label-primary`（亮色下 `#0f1115`）。

插件做两件事就够：

```js
ctx.on('webserver/index-inject', (table) => {
  table.push({ kind: 'style', text: css })
})
```

```css
svg[viewBox="0 0 23.16 17.04"] path { fill: #4d6bfe }
body[data-ds-dark-theme] svg[viewBox="0 0 23.16 17.04"] path { fill: #7aaaff }
```

为什么不用改主题变量？因为 `--dsw-alias-label-primary` 是全站文字色，改掉它整页字都变蓝了。CSS 的 `fill` 声明优先级高于 SVG 的 presentation attribute，所以一条选择器就能只动鲸鱼；用 `viewBox` 而不是混淆后的 class 名（`_2H3hWW_brandMark` 这种），换版本也不容易失效。

暗色判定用 `body[data-ds-dark-theme]`，不是 `prefers-color-scheme`。

### 托盘 / 窗口图标

`resources/tray.ico` 是 7 帧 PNG（16–64 px），`icon.png` 是 1024² 图。工具自己解码 PNG、按亮度重新映射：深色像素（鲸鱼）→ 品牌蓝，中间调 → 向白色渐变（保留原图的抗锯齿），浅色像素（背景、白边）原样不动。纯 Node 手写，没有图片库依赖。

### 欢迎页

`welcome-brand.svg`（472×40 的「鲸鱼 + deepseek HARNESS」）打包在 `app.asar` 里。重新打包 180 MB 的 asar 又慢又危险，所以直接**原地改写一个属性**：

- 鲸鱼那条路径的 `fill="var(--dsw-alias-label-primary)"` 换成等长的 `rgb(77,107,254)` + 空格补齐；
- 文件总字节数完全不变 → asar 的头部目录、所有偏移都不用动；
- 文字路径继续用原来的变量，所以只有鲸鱼变色。

`replaceAsarFile()` 会强制校验"替换后长度必须一致"，不一致就报错退出，不会把归档写坏。

### 备份与还原

```
<安装目录>\resources\.dsh-whale-blue\
├── state.json                     # 颜色、改过哪些文件、时间
└── backup\
    ├── tray.ico                   # 原始图标
    ├── icon.png
    └── welcome-brand.svg          # 从 asar 里取出来的原始 SVG
```

- `restore` 把这三份写回去，再删掉插件行。
- DSH 升级后 `resources/` 会被覆盖：直接再跑一次 `install`，工具会发现磁盘上的图标和上次产出不一致，自动用新图标重建备份。

---

## 常见问题

**改完还是黑的？**
插件行是启动时读的，必须重启 DSH。托盘图标同样是启动时加载的。浏览器里的话刷新页面即可。

**欢迎页没变？**
说明当时 `app.asar` 被占用，`install` 的输出里会有 `skipped`。完全退出 DSH 再跑一次 `install`。

**会不会影响 DSH 更新？**
`resources/` 下的文件被改过，但 DSH 的更新流程会整体替换这个目录，最坏情况是图标变回黑色，重跑 `install` 即可。`app.asar` 只动了 16 KB 里的一条属性，长度未变。

**会不会破坏签名 / 校验？**
这个桌面版的 asar 完整性校验（Electron fuse `EnableEmbeddedAsarIntegrityValidation`）是关闭的，且文件长度未变、头部未变，所以不会有校验问题。

**任务栏图标能改吗？**
不能。Windows 任务栏按钮用的是 exe 内嵌图标，改它需要重写 exe 资源（会破坏签名、影响更新），本项目不做。

---

## 开发

```powershell
node --test test/lib.test.mjs
```

测试覆盖：PNG 编解码往返、去色映射、欢迎页改写（长度不变、只改鲸鱼、失败时报错）、ICO 多帧、以及 asar 原地读写（包括"长度不一致必须拒绝"）。

目录：

```
index.js           Cordis 插件（网页界面；装进 profile 时改名为 index.mjs）
bin/cli.mjs        命令行：install / restore / status
lib/desktop.mjs    桌面外壳补丁（图标、欢迎页、备份、状态）
lib/profile.mjs    profile 插件行的安装与卸载
lib/asar.mjs       asar 头部解析 + 原地改写
lib/png.mjs        8 位 PNG 编解码
lib/ico.mjs        ICO 容器（PNG 帧）
lib/recolor.mjs    像素重新上色
```

## License

MIT

