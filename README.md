# Billiards Project · 台球入门指南
在线访问：[台球入门指南](https://m1022901.github.io/billiards-project/)

源码仓库：[M1022901/billiards-project](https://github.com/M1022901/billiards-project)

GitHub Pages 使用 `main` 分支的 `docs/` 目录。更新网站时，先在 `app/` 运行 `npm run build`，再将 `app/dist/` 中的文件同步到 `docs/`（保留 `docs/.nojekyll`）并提交推送。

面向初学者的台球互动教学网站，覆盖 **斯诺克（Snooker）**、**美式 9 球（9-Ball）** 与 **中式八球 / Heyball**。
前端是一个单页 React 应用，通过顶部导航在 5 个页面之间切换：发展地图、名人堂、规则入门、3D 教学模拟、关于。

---

## 本地运行

**环境要求**：Node.js ≥ 20.19（或 ≥ 22.12）与 npm（Vite 7 不支持更老的 Node）。

```bash
# 1. 进入前端工程。前端代码在 app/ 里
cd app

# 2. 安装依赖
npm install

# 3. 启动开发服务器，浏览器打开 http://127.0.0.1:5174
npm run dev
```

构建与预览已构建产物：

```bash
npm run build     # 生产构建，产物输出到 app/dist/
npm run preview   # 以 http://127.0.0.1:5174 预览 app/dist/
```

> `dev` 与 `preview` 默认都用 5174 端口（`preview` 带 `--strictPort`），同一时间只能跑其中一个，否则会报端口被占用；需要换端口时可用 `npx vite --port <port>`。

可选的联网脚本（日常开发不需要执行）：

```bash
npm run sync:players              # 重新抓取球员数据到 app/data/generated/（已 gitignore）
npm run fetch:equipment           # 重新下载 Case 04 装备照片到 src/assets/equipment/
npm run fetch:equipment -- --force  # 忽略已有文件，强制重新下载
```

> `fetch:equipment` 需要 [ImageMagick](https://imagemagick.org)（macOS：`brew install imagemagick`）：它负责把图片缩到 1200px 宽并把 PNG 源图转成 JPEG。`sync:players` 只依赖 Node。

> **图片资源与联网说明**：About 照片、Rules 101 的分步图解（16 个 SVG）、以及 Case 04 的 5 张装备照片都已存放在 `app/src/assets/` 并随构建打包，不需要联网。
> 但 **Hall of Fame 的 32 张球员肖像**与 **Rules 101 的 5 张总览 / 步骤照片**目前仍是 Wikimedia 等站点的外链，首次加载需要联网；`PROJECT_NOTES.md` 已把「教学图本地缓存」列为待办。
> 只有 `sync:players` 与 `fetch:equipment` 两个脚本会主动访问网络。

## 技术栈

| 依赖 | 版本 | 用途 |
| --- | --- | --- |
| React | 19 | UI 框架（`main.jsx` → `App.jsx`） |
| Vite | 7 | 开发服务器与打包 |
| Tailwind CSS | 4 | 工具类样式（主要用于 Rules 101 页与部分布局） |
| ECharts | 6 | Heat Map 页的世界地图 |
| Three.js | 0.185 | Simulation 页的 3D 球桌与击球演示 |

---

## 页面总览

应用没有路由库，`App.jsx` 用一个 `views` 数组注册 5 个页面，`useState` 切换当前页。

| # | 页面 | 目录 | 一句话说明 |
| --- | --- | --- | --- |
| 1 | **Heat Map** 发展地图 | `src/pages/HeatMap` | 用 ECharts 世界地图分 5 个阶段展示台球运动的地理扩散 |
| 2 | **Hall of Fame** 名人堂 | `src/pages/HallOfFame` | 32 张球员卡，按地域 / 世代编排 |
| 3 | **Rules 101** 规则入门 | `src/pages/Rules101` | 三种玩法各 6 步图解 + 横向对比表 |
| 4 | **Simulation** 教学模拟 | `src/pages/Simulation` | 4 个可交互 Three.js 教学案例 |
| 5 | **About** 关于 | `src/pages/About` | 项目作者与缘起 |

### 1. Heat Map — 发展地图

- **功能**：一张可缩放拖拽的世界地图，按 5 个历史阶段给国家着色；右侧面板显示当前阶段、选中国家的说明、当前阶段国家列表、以及「仍然可见的历史图层」。
- **交互**：点击时间轴切换阶段；点击 / 悬停地图上的国家，或点击右侧列表里的国家来查看说明。
- **阶段数据**：`src/pages/HeatMap/data/heatMapStages.js`（5 个阶段：欧洲宫廷起源 → 现代球杆与美国球房 → 斯诺克诞生 → 彩色电视热潮 → 中国加速）。
- **地图数据**：`src/data/world-geojson.json`（177 个国家/地区）。原始 GeoJSON 在 `src/pages/HeatMap/lib/worldGeo.js` 中被清洗（去掉跨 180° 经线的环、修正法国的海外领地），再注册给 ECharts。

### 2. Hall of Fame — 名人堂

- **功能**：左侧地域导航（英国斯诺克 / 美国 9 球 / 中国中式台球），右侧按「世代」排布球员卡时间轴。
- **球员卡**：照片（带首字母兜底）、国家 / 项目、生涯荣誉三宫格、风格标签，展开后还有生涯数据、honours、轶事与资料来源链接。
- **规模**：9 个世代分组、共 **32 张卡**（含 3 张地域文化入口卡）。数据来自 `src/data/player-generations.json`。
- **资料核对**：见根目录 `PLAYER_CARDS_RESEARCH.md`。

### 3. Rules 101 — 规则入门

- **功能**：三张玩法大卡（Snooker / American 9-Ball / Chinese 8-Ball），点击打开分步图解弹窗；下方是横向对比表。
- **每个玩法 6 步**：Goal、Initial setup、Your turn、What you can do、What you cannot do、Scoring。
- **对比表 7 行**：Origin、Ball set、Win condition、First contact、Call shot、Foul penalty、Main skill。
- **弹窗快捷键**：`←` / `→` 切换步骤，`Esc` 关闭。
- **数据**：`src/pages/Rules101/data/ruleGames.js`、`comparisonRows.js`；图解 SVG 在 `src/assets/rules/`（16 个）。

### 4. Simulation — 教学模拟

交互式 3D 教学手册，底部案例菜单切换案例。**已实现 4 个案例**，另有 4 个规划中（菜单里显示为禁用）。

| 案例 | 标题 | 说明 |
| --- | --- | --- |
| Case 01 | Table & Ball Tour | 点击球桌上的球 / 袋口 / 区域，学习台面与球的分工；可切换斯诺克、8 球、9 球三种摆球布局 |
| Case 02 | Ghost Ball Aiming | 假想球瞄准：练习视角显示目标线、假想球与接触阴影，实战视角隐藏辅助线后自己瞄 |
| Case 03 | Cue Ball Control | 高杆 / 中杆 / 低杆 / 左右塞五个击球点，控制母球撞击后停在哪里；含 5 个教学情境 + 5 球连续走位挑战 |
| Case 04 | Equipment Bag | 球杆、架杆、皮头、巧克、杆盒的基础选购建议；5 张装备照片已从 Wikimedia Commons 下载到 `src/assets/equipment/` 本地打包，图片查看器按 3:2 比例完整显示整张照片，并带作者与许可协议署名 |
| Case 05–08 | Speed Control 等 | 规划中（速度控制、斯诺克防守、库边侧塞、解斯诺克路线） |

- **物理**：每个演示内部自带一个轻量数值模型（摩擦减速、库边反弹、球球碰撞冲量、落袋判定），并非真实物理引擎。
- **教学路线图**：见根目录 `PROJECT_NOTES.md`。

### 5. About — 关于

作者 Tony 的自述、与台球的结缘、做这个站点的原因，以及 3 张生活照 + 1 张头像（`src/assets/about/`）。

---

## 目录结构

```
biliards_project/
├── README.md                      ← 本文件：项目总览
├── PROJECT_NOTES.md               ← 产品待办 + Three.js 教学路线图（Phase 1 / 2）
├── PLAYER_CARDS_RESEARCH.md       ← 球员卡资料盘点（人工核对数据源用）
└── app/                           ← 前端工程
    ├── index.html                 ← Vite 入口 HTML
    ├── vite.config.js             ← Vite + Tailwind 插件配置
    ├── package.json               ← 依赖与 npm scripts
    ├── scripts/
    │   ├── sync-player-data.mjs       ← 球员数据抓取 / 派生脚本
    │   └── fetch-equipment-images.mjs ← Case 04 装备照片下载 / 压缩脚本
    ├── data/                      ← 脚本产出目录（当前为空，已 gitignore）
    ├── dist/                      ← 构建产物（已 gitignore，可用 npm run build 重新生成）
    └── src/
        ├── main.jsx               ← React 挂载入口
        ├── App.jsx                ← 5 个页面的注册与切换
        ├── index.css              ← 样式入口（@import 各分片）
        ├── assets/                ← 本地图片资源（About / equipment / rules SVG）
        │   ├── about/             ← 关于页照片（4 张 PNG）
        │   ├── equipment/         ← Case 04 装备照片（5 张 JPG）
        │   └── rules/             ← 规则图解（16 个 SVG）
        ├── components/            ← 跨页面复用的通用组件
        │   └── Layout/SiteHeader.jsx
        ├── data/                  ← 全局静态数据（JSON）
        ├── pages/                 ← 5 个页面，每页自带 components / data / lib
        └── styles/                ← 拆分后的 CSS 分片
```

### 每个文件夹在做什么

| 路径 | 作用 |
| --- | --- |
| `app/scripts/` | 数据与素材脚本。`sync-player-data.mjs` 按 `src/data/wst-player-mapping.json` 里的 URL 抓取 WST / WPBSA / CueTracker 页面，解析出排名赛冠军数、147、奖金等派生数据；`fetch-equipment-images.mjs` 从 Wikimedia Commons 下载 Case 04 的装备照片并用 ImageMagick 压缩到 1200px 宽。 |
| `app/data/` | 脚本的输出目录（`data/generated/`）。**已 gitignore**，属于可再生的中间结果，已从仓库中清理；需要时运行 `npm run sync:players` 重新生成。 |
| `app/dist/` | Vite 构建产物，已 gitignore。 |
| `app/src/assets/` | 本地图片资源。`about/` 是作者照片，`equipment/` 是 Case 04 装备照片，`rules/` 是规则页的 16 张教学 SVG。注意球员肖像与部分规则照片仍是外链，不在这个目录里。 |
| `app/src/components/` | 只放**跨页面**复用的组件；目前只有顶部导航 `SiteHeader`。 |
| `app/src/data/` | 全局静态数据 JSON：球员世代、球员覆盖项、资料来源、WST 映射、世界 GeoJSON。 |
| `app/src/pages/` | 5 个页面。每个页面目录内部统一为 `XxxPage.jsx` + `components/`（页面私有组件）+ `data/`（页面文案数据）+ `lib/`（纯函数工具）。 |
| `app/src/styles/` | 按页面 / 模块拆分的 CSS 分片，由 `src/index.css` 顺序 `@import`。`styles/pages/` 对应页面，`styles/simulation/` 对应 4 个模拟案例，`styles/responsive.css` 放共享断点且必须最后引入。 |

---

## 页面内部结构（拆解后的组件）

每个页面从「一个几百到几千行的大文件」拆成了「极薄的页面壳 + 小组件 + 数据 + 纯函数」。组件文件统一 **PascalCase**，数据 / 工具模块用 camelCase。

### About（`pages/About`）

```
AboutPage.jsx                 页面壳，组合下面三块
components/AboutHero.jsx      顶部介绍 + 头像
components/AboutStoryGrid.jsx 01/02/03 三张自述卡
components/AboutPhotoGrid.jsx 三张生活照
data/aboutContent.js          文案与图片引用
```

### Hall of Fame（`pages/HallOfFame`）

```
HallOfFamePage.jsx            页面壳：地域筛选 + 世代数据派生
components/RegionRail.jsx     左侧地域导航 + 文化入口说明
components/GenerationTimeline.jsx  右侧世代时间轴
components/PlayerCard.jsx     单张球员卡
components/HonorPanel.jsx     卡上的荣誉小面板
components/PlayerSourceList.jsx    资料来源链接列表
data/regionTracks.js          3 条地域线及其世代归属
lib/playerCardUtils.js        覆盖合并、荣誉/生涯数据组装、来源解析等纯函数
```

### Heat Map（`pages/HeatMap`）

```
HeatMapPage.jsx               页面壳：阶段与累计国家状态
components/WorldMapChart.jsx  ECharts 地图（初始化 / option / 事件）
components/StageTimeline.jsx  阶段时间轴
components/StageCard.jsx      当前阶段说明卡
components/SelectedCountryCard.jsx  选中国家说明卡
components/HotspotList.jsx    国家列表（当前阶段 / 历史图层共用）
data/heatMapStages.js         5 个阶段及其国家文案
lib/worldGeo.js               GeoJSON 清洗、颜色工具、地图注册与国名列表
```

### Rules 101（`pages/Rules101`）

```
Rules101Page.jsx              页面壳：当前玩法与步骤状态
components/RuleGameCard.jsx   一张玩法大卡
components/GameComparisonTable.jsx  横向对比表
components/RuleGuideModal.jsx 分步图解弹窗（含键盘快捷键）
data/ruleGames.js             3 种玩法的全部步骤与图解引用
data/comparisonRows.js        对比表 7 行数据
```

### Simulation（`pages/Simulation`）

```
SimulationPage.jsx            页面壳：案例注册与切换（约 40 行）
components/SimulationCaseMenu.jsx  底部案例菜单
components/TableTourDemo.jsx       Case 01 球桌与球
components/GhostBallAimingDemo.jsx Case 02 假想球瞄准
components/CueControlDemo.jsx      Case 03 母球控制
components/EquipmentDemo.jsx       Case 04 装备
data/simulationCases.js       案例清单（含 enabled 开关）
data/tableTourData.js         三种摆球布局的可点击条目
data/aimingShots.js           假想球瞄准的两条练习球路
data/cueControlData.js        击球点、教学情境、连续走位球序
data/equipmentData.js         装备条目、本地照片与图片署名（作者 + 许可协议）
lib/tableGeometry.js          球桌尺寸、球半径、摆球坐标、球色等几何常量
lib/shotGeometry.js           进球几何、瞄准仿真、镜头取景等纯函数
lib/threeHelpers.js           文字精灵、台球号码贴图等 Three.js 工具
```

> 说明：`TableTourDemo` / `GhostBallAimingDemo` / `CueControlDemo` 各自拥有一个完整且自洽的 Three.js 场景（含自带的碰撞与落袋模型），所以仍是本仓库最大的几个文件；它们已经按「一个案例一个组件」拆开，页面壳和数据完全分离。

---

## 数据流水线

```
src/data/wst-player-mapping.json     手写的球员 → 官方/数据站 URL 映射
              │
              ▼
scripts/sync-player-data.mjs         抓取 + 解析（npm run sync:players [slug...]）
              │
              ▼
data/generated/player-derived-stats.json        抓取到的原始派生字段（gitignore）
data/generated/player-overrides.generated.json  可直接合并的覆盖项（gitignore）
data/generated/raw/*.html                       抓取下来的原始页面（gitignore）
              │  人工核对后挑选字段
              ▼
src/data/player-overrides.json       页面实际读取的覆盖项（29 条）
src/data/player-sources.json         每个球员的资料链接（29 条）
src/data/player-generations.json     球员卡主体内容（9 组 / 32 张）
```

- 只抓取指定球员：`npm run sync:players ronnie-o-sullivan ding-junhui`
- **`data/generated/` 是可再生的中间产物**，不参与构建、不被任何前端代码引用（`grep` 可验证），需要时脚本会重新创建目录。

---

## 样式组织

`src/index.css` 只是清单，按顺序 `@import` 各分片（顺序有语义，勿随意调整）：

```
styles/base.css                   设计变量、重置、应用外壳与顶部导航
styles/pages/heatMap.css          Heat Map 页
styles/pages/rules101.css         Rules 101 页（对比表 + 弹窗）
styles/pages/hallOfFame.css       Hall of Fame 页
styles/pages/about.css            About 页
styles/simulation/simulationShell.css  模拟页外壳与案例菜单
styles/simulation/tableTour.css   Case 01
styles/simulation/ghostAiming.css Case 02
styles/simulation/cueControl.css  Case 03
styles/simulation/equipment.css   Case 04
styles/responsive.css             两个共享断点（980px / 620px），必须最后引入
```

约定：新增页面样式放 `styles/pages/`，新增模拟案例样式放 `styles/simulation/`；媒体查询统一收敛到 `responsive.css`，避免 `.a` 规则被后面的媒体查询漏掉。
Rules 101 页大量使用 Tailwind 工具类，因此它的自定义 CSS 分片较薄。

---

## 命名与代码约定

- **组件**：文件与函数名都用 **PascalCase**（连续单词首字母大写），如 `PlayerCard.jsx` → `PlayerCard`。
- **数据 / 工具模块**：camelCase，如 `playerCardUtils.js`、`regionTracks.js`。
- **页面目录内固定三层**：`components/`（页面私有组件）、`data/`（文案与静态数据）、`lib/`（无 React 依赖的纯函数）。
- **组件尽量无状态可复用**：数据从页面传入，组件只负责渲染；有交互的组件把回调通过 props 暴露（如 `HotspotList`、`StageTimeline`、`SimulationCaseMenu`）。
- **跨页面复用**才上移到 `src/components/`。
- 相对导入一律带扩展名（`./components/X.jsx`、`../lib/y.js`），与现有代码保持一致。

---

## 常见任务

**新增一个页面**

1. 在 `src/pages/<Name>/` 下建 `<Name>Page.jsx`，按需加 `components/`、`data/`、`lib/`。
2. 在 `src/styles/pages/<name>.css` 写样式，并在 `src/index.css` 的 `styles/pages/` 区块加一行 `@import`。
3. 在 `App.jsx` 的 `views` 数组里注册 `{ id, label, Page }`。

**新增一个 Simulation 案例**

1. 在 `data/simulationCases.js` 加一条记录并把 `enabled` 设为 `true`。
2. 在 `components/` 新建 `XxxDemo.jsx`。
3. 在 `SimulationPage.jsx` 的 `caseComponents` 里按 `id` 注册组件。
4. 在 `styles/simulation/xxx.css` 写样式并在 `index.css` 引入。

**更新球员数据**

编辑 `src/data/player-generations.json`（卡片内容）与 `player-overrides.json`（排名 / 荣誉覆盖项）；资料来源在 `player-sources.json`。需要重新抓取时先跑 `npm run sync:players`，核对 `data/generated/` 结果后再手工合并，不要把生成文件提交进仓库。

**更换 Case 04 装备照片**

1. 把新的 Wikimedia Commons 文件页地址填进 `scripts/fetch-equipment-images.mjs` 的 `images` 列表。
2. 运行 `npm run fetch:equipment -- --force`，脚本会下载、转成 JPEG 并压缩到 `src/assets/equipment/`（需要 ImageMagick）。
3. 在 `data/equipmentData.js` 中更新对应的 `import` 与 `imageSource` 里的作者和许可协议（CC 图片必须署名）。
4. 选图注意：查看器用 `object-fit: contain` 完整显示整张照片，所以要挑**主体完整落在画面内**的图。球杆、杆盒这类细长物件要选带球台背景的取景——把整根杆紧贴着裁出来会变成几十比一的细长条，放进 3:2 画框里反而看不清。

---

## 后续可做

- `PROJECT_NOTES.md` 里的英文待办：名人堂数据口径统一、规则页配图替换、三大项目赛事介绍。
- 把 Hall of Fame 的 32 张球员肖像与 Rules 101 的 5 张照片也下载到 `src/assets/`（可仿照 `fetch-equipment-images.mjs`），全站即可离线可用；迁移时记得同步补上作者与许可协议署名。
- 图片体积可继续压缩：`src/assets/equipment/` 现有 5 张 JPG 约 1.2 MB，`src/assets/about/` 的 PNG 单张 1–2.8 MB，转成 WebP 通常能再省一半以上。
- 模拟页 Case 05–08（速度控制、斯诺克防守、库边侧塞、解斯诺克路线）。
- `CueControlDemo` 内的球体物理（库边反弹、碰撞、走位判定）可进一步抽成 `lib/` 下的可复用物理模块，供后续案例共享。
- 主 JS 包约 2.5 MB（Three.js + ECharts 占大头），如需优化可对 Simulation / HeatMap 做 `React.lazy` 代码分割。
