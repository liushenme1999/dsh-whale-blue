# dsh-whale-blue 🐋

把 **DeepSeek Harness**（DSH）里那只黑色鲸鱼换成 **DeepSeek 蓝**。

聊天界面的品牌标志、系统托盘图标、窗口 / 关于面板图标、首次启动的欢迎页——一次性全部换掉，随时可以逐字节还原。

装完之后，**设置 → 通用设置 → 外观** 下面会多一项「鲸鱼配色」：**一键换蓝、一键还原**，也能自己调亮色 / 暗色两个颜色。页面本身不加任何按钮。

> 非官方项目。鲸鱼标志的版权归 DeepSeek 所有，本项目只是重新上色。

两种装法：**DSH 的插件页面**里粘贴本仓库地址（推荐，不用 Node.js，不用克隆），或者克隆下来跑 `install.cmd`。详见 [安装](#安装)。

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
| 设置页里的「鲸鱼配色」 | 注入一段 `<script>`，挂到 设置 → 通用设置 → 外观 下面 | — |

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

前提：Windows 上的 DSH 桌面版（已在 `0.2.1-rc.2` 上验证）。**在插件页面里安装不需要 Node.js**，也不用克隆仓库。

### 方式一：在 DSH 的插件页面里装（推荐）

1. 打开 DSH，左侧栏点 **插件**；
2. 点 **添加插件**，把仓库地址粘进去，回车：

   ```
   https://github.com/liushenme1999/dsh-whale-blue
   ```

3. **安装**。装完直接关掉对话框就行——新装的组合包默认是选中的；点 **立即启用** 会顺手把它的卡片滚出来。
4. 重启 DSH（或按 `Ctrl+R` 刷新窗口）；
5. 打开 **设置 → 通用设置**，「鲸鱼配色」就在 **外观** 下面。

这样装的是一个**组合包**（bundle）：`package.json` 里的 `dsh.bundle.patch` 指向 `cordis.patch.yml`，由它把插件行插进 profile。你在设置里的选择不会写回这个包，而是写进 profile 自己的 `cordis.patch.yml`（一条按 `id` 覆盖的行），所以**升级、重装、换版本都不会丢你的颜色**。

有一个前提：这里是**从 GitHub 装**，不走 npm，所以不经过 registry 镜像。连不上 GitHub 时，安装对话框会提示「无法访问 GitHub / 连接 GitHub 超时」，那种情况用下面的方式二。

### 方式二：命令行（本地克隆）

适合没有插件页面的环境（`dsh web` 的克隆版、自定义 profile），或者想顺手把托盘图标一起换掉：

```powershell
git clone https://github.com/liushenme1999/dsh-whale-blue.git
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

这种方式把包拷到 `<profile>/local/whale-blue/`，插件行由命令行自己插入。**同一个 profile 只选一种方式**：插两行同 `id` 的组件会让插件被加载两次。已经用命令行装过、又想改用插件页面时，先跑一次 `restore.cmd` 再装；忘了也不要紧，插件启动时会把旧的插入行改写成覆盖行，只是那一次启动会多一条日志。

### 只想要网页里的蓝鲸鱼

```powershell
node bin/cli.mjs install --no-desktop
```

只会往 profile 里写一行插件配置，不碰安装目录，重启 DSH 生效。插件页面装的时候默认就是这样（`desktop: false`），托盘图标在设置里勾一下才会同步。

### 各平台说明

- **Windows 桌面版**：全部生效。
- **`dsh web` / 浏览器打开**：插件部分生效（插件页面或 `--no-desktop` 都行）。
- **macOS / Linux 桌面版**：插件部分可用；托盘与图标不在本项目的处理范围内。

---

## 设置里的配色项

不另起按钮、不挡视线。重启 DSH 之后，打开 **设置 → 通用设置**，它就在 **外观** 选项下面：

| 亮色 | 暗色 |
| --- | --- |
| ![亮色设置项](docs/settings-light.png) | ![暗色设置项](docs/settings-dark.png) |

- **蓝色 / 默认**：一键切换，网页立即变，不用刷新。
- **亮色 / 暗色**：直接改颜色（`#rgb` 或 `#rrggbb`），改完网页同样立即生效。
- **同步托盘图标和欢迎页图标**：勾上会立刻改写安装目录里的图标和 `app.asar`；图标与欢迎页是 DSH 启动时读的，**重启 DSH 后**才看得到。
- **默认** 除了取消换色，也会把托盘图标和欢迎页一起还原，等于全部回到原样。

每个选择都会写回 profile 的 `cordis.patch.yml`（就是下面那个标记块），所以下次启动还是你选的样子。不想要这个设置项：插件页面里把组合包关掉，命令行装的用 `install --no-ui`，或者把行里的 `ui:` 改成 `false`。

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
--no-ui              装插件但不加设置里的配色项
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

最省事的方式是在 **设置 → 通用设置** 里改颜色框。等价于命令行：

```powershell
node bin/cli.mjs install --light "#5b8cff" --dark "#9dc0ff"
```

颜色最终写在 profile 的 `cordis.patch.yml` 里，随时可以改。命令行装的是一行插入：

```yaml
# dsh-whale-blue:start — managed by dsh-whale-blue; remove this block to uninstall
- insert:
    - id: whale-blue
      name: "file:///C:/Users/you/.dsh/profiles/desktop/local/whale-blue/index.mjs"
      config:
        light: "#4d6bfe"
        dark: "#7aaaff"
        enabled: true      # false = 保持默认黑色
        desktop: true      # 托盘 / 欢迎页是否同步
        ui: true           # false = 不加设置里的配色项
# dsh-whale-blue:end
```

插件页面装的是同一个标记块，但换成按 `id` 覆盖（因为行已经由组合包的 patch 插进去了，再插一次就会加载两遍）：

```yaml
# dsh-whale-blue:start — managed by dsh-whale-blue; remove this block to uninstall
- id: whale-blue
  config:
    light: "#4d6bfe"
    dark: "#7aaaff"
    enabled: true
    desktop: false
    ui: true
# dsh-whale-blue:end
```

两种写法都只管这个标记块，你自己在同一个文件里写的其它行不会被碰。

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

### 设置里的配色项

设置项不是前端打包产物，就是一段注入到 `index.html` 里的普通 `<script>`：

- `ctx.on('webserver/index-inject', table => table.push({ kind: 'script', text }))`——官方给插件留的注入口，和那条 CSS 在同一个位置，`kind: 'style'` / `kind: 'script'` 随你放；
- 设置项本身就是一个普通 DOM 节点：脚本先找到「外观」那一块（`class$="_title"` 且文字是「外观」），再把节点插到它后面。类名是**从页面上现读的**（`v01cdW_group` / `v01cdW_title` / `v01cdW_cubeRow` / `v01cdW_themeCube`），所以间距、圆角、hover、选中态都跟旁边原生项一模一样；自己那套样式全裹在 `:where()` 里，权重为 0，只在原生类名变了以后兜底，不会反过来抢样式；
- 设置页是按需渲染的，关掉就整棵卸载，所以脚本挂了一个 `MutationObserver`（150ms 合并），发现节点被 React 拔掉就重新插回去，打开/关闭设置多少次都一样；
- 状态走 `/dsh-whale-blue/state`（`ctx.webServer.register`）：GET 取当前值，POST 改。POST 要求一个自定义头 `x-dsh-whale-blue: 1`，别的网页没法用跨站表单替你改设置——那会先触发预检，而预检没人应答；
- 改完写回 `cordis.patch.yml` 的标记块，下次启动读到的就是它。

有个细节：设置项里的鲸鱼预览和页面上的品牌标志是同一个 SVG（同一个 `viewBox`），换色那条 CSS 会一视同仁地把预览也涂蓝。所以预览图标带上 `data-dsh-wb-icon`，规则写成 `svg[viewBox="…"]:not([data-dsh-wb-icon]) path`，「默认」那个方块才留得住本色。

有个 Electron 的坑要绕：桌面外壳里 `node:fs` 被 asar 层接管，`open('app.asar', 'r+')` 会被理解成"打开 asar 里的某个文件"，直接 `ENOENT,  not found in …app.asar`。所以 `lib/asar.mjs` 检测到 `process.versions.electron` 时改用 `original-fs`（Electron 提供的、绕过 asar 层的原始 fs）。这样在**运行中的** DSH 里勾一下"同步"，也能把欢迎页写进去。

### 怎么变成「能在插件页面里装」的包

DSH 对组合包的定义很窄：**`package.json` 里声明了 `dsh.bundle.patch` 的包就是组合包**。插件页面的安装只做两件事——把包 `pnpm add` 进 profile，把包名写进 profile `package.json` 的 `dsh.profile.bundles`。剩下交给启动时的分层组合，顺序是：

```
各 bundle 层的 cordis.patch.yml  →  profile 层的 cordis.patch.yml  →  --patch 覆盖层
```

所以仓库里有这几样东西：

| 文件 | 作用 |
| --- | --- |
| `cordis.patch.yml` | 组合包那一层：把 `whale-blue` 这行插进去，`config` 只是默认值 |
| `package.json` 的 `dsh.bundle.patch` | 声明自己是组合包，以及 patch 文件在哪 |
| `package.json` 的 `exports` | 让 `locale/*.json`、`icon`、`cordis.patch.yml` 能按子路径被解析（`exports` 一旦存在就会挡住其它路径） |
| `locale/{zh,en}.json` | 插件页面卡片上的标题与简介（`meta.title` / `meta.description`，不加载代码也能读） |
| `icon.svg` | 卡片图标：SVG / PNG / JPEG / WebP，≤256 KiB，必须在包内 |

两处语义值得记下来，它们决定了标记块怎么写：

1. **覆盖行会整块替换 `config`**（不是深合并），所以每次写入都是全套字段；
2. 覆盖行用 `id` 匹配（`name` 可选，写了就必须一致，否则整条被跳过）。组合包插的行 `id` 是 `whale-blue`，所以标记块只写 `id`、不写 `name`——命令行装的那行 `name` 是 `file://` 地址，写进去反而匹配失败。

还有一条只有组合包才会踩到的坑：组合包已经插入了 `whale-blue`，profile 层要是再 `insert` 一次，同一个 `id` 就有两行，插件会被挂载两遍。所以插件会按自己的安装位置决定形状（响应里的 `install: 'bundle' | 'local'`，看路径里有没有 `node_modules`），启动时发现 profile 里留着旧的插入行就把它改写成覆盖行。

顺带，「同步托盘图标」在启动时也会自检一次：配置说要同步、磁盘上却没打补丁（例如 DSH 升级把 `resources/` 换掉了），启动时自动补上——组合包安装没有命令行可跑，这一步得插件自己来。

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

**设置里没有「鲸鱼配色」？**
同上，装完要重启 DSH（`dsh web` 的话刷新页面）。另外看下行里有没有 `ui: false`——写了就不注入这个设置项。打开设置 → 通用设置，它就在「外观」下面。

**插件页面装完，插件列表里没有？**
新装的组合包默认是选中的，但**要重启一次**才会加载它的行。列表里如果能找到这张卡片却是关着的，点开开关即可；卡片不在列表里，说明 `pnpm add` 没成功，重装一次看「查看安装详情」里的 pnpm 输出。

**插件页面提示「无法访问 GitHub / 连接 GitHub 超时」？**
安装前插件页面会用 `git ls-remote` 探一下仓库，探不通就不往下走。换网络，或者改用命令行方式（clone 下来跑 `install.cmd`）。

**勾了"同步托盘"但欢迎页没变？**
图标和欢迎页都是 DSH 启动时读的，重启一次才生效。万一 `app.asar` 正被占用写不进去，设置项下面会有一行提示：插件页面装的，下次启动会自动再试一次；命令行装的，退出 DSH 后跑 `restore.cmd` + `install.cmd` 补上。

**设置里改完，重启又变回去了？**
设置里的每个选择都写进 profile 的 `cordis.patch.yml`，重启读的就是它。万一写不进去（权限、路径），设置项下面会出红字，`node bin/cli.mjs status` 也会显示文件里到底记了什么。

**欢迎页没变？**
说明当时 `app.asar` 被占用，`install` 的输出里会有 `skipped`。完全退出 DSH 再跑一次 `install`。

**先命令行装过，再在插件页面装，会冲突吗？**
插件会自己收拾：启动时发现 profile 里那条插入行，就改写成按 `id` 覆盖的行，颜色照旧。想干净一点就先 `restore.cmd` 再装。反过来（先插件页面、再命令行）命令行会直接拒绝，提示你去插件页面管理。

**会不会影响 DSH 更新？**
`resources/` 下的文件被改过，但 DSH 的更新流程会整体替换这个目录，最坏情况是图标变回黑色，重跑 `install`（或插件页面装的话，重启一次让插件自己补）即可。`app.asar` 只动了 16 KB 里的一条属性，长度未变。

**会不会破坏签名 / 校验？**
这个桌面版的 asar 完整性校验（Electron fuse `EnableEmbeddedAsarIntegrityValidation`）是关闭的，且文件长度未变、头部未变，所以不会有校验问题。

---

## 开发

```powershell
node --test test/lib.test.mjs
```

测试覆盖：PNG 编解码往返、去色映射、欢迎页改写（长度不变、只改鲸鱼、失败时报错）、ICO 多帧、asar 原地读写（包括"长度不一致必须拒绝"）、标记块反复写入只留一份且不碰用户自己的行、插件页面那种"按 id 覆盖"的写法（含切换安装方式时不产生第二条插入行）、组合包 `node_modules` 路径下仍能找到 profile 的 patch 文件，以及插件安装/卸载。

目录：

```
index.js           Cordis 插件（网页界面 + /dsh-whale-blue/state 接口；装进 profile 时改名为 index.mjs）
cordis.patch.yml   组合包那一层：插入 whale-blue 这行（插件页面安装时用）
icon.svg           插件页面卡片上的图标（鲸鱼，品牌蓝）
locale/zh.json     卡片标题与简介（zh / en 各一份）
lib/ui.js          注入到页面里的设置项（原生 DOM，挂到 设置 → 通用设置 → 外观 下面，无构建步骤）
lib/css.mjs        那条鲸鱼样式表
lib/row.mjs        cordis.patch.yml 里那个标记块的读写（插入行 / 覆盖行两种形状）
bin/cli.mjs        命令行：install / restore / status
lib/desktop.mjs    桌面外壳补丁（图标、欢迎页、备份、状态）
lib/profile.mjs    profile 插件包的安装与卸载（并拒绝和组合包重复装）
lib/asar.mjs       asar 头部解析 + 原地改写（Electron 里走 original-fs）
lib/png.mjs        8 位 PNG 编解码
lib/ico.mjs        ICO 容器（PNG 帧）
lib/recolor.mjs    像素重新上色
```

## License

MIT

