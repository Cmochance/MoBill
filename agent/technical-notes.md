# Technical Notes

## 本机备份恢复

- 当前数据文件固定为 `Documents/MoBill/data.json`，不再使用云盘同步开关、`history/` 目录或 24 小时备份间隔规则。
- 每次通过 `storage.setExpenses`、`storage.setCategories`、`storage.setBudgets` 或 `storage.setSettings` 保存数据后，应用会异步将完整数据写入 `Documents/MoBill/data.json`。
- 应用启动时会先加载应用内数据，再比较 `Documents/MoBill/data.json`。若业务数据一致则忽略；若不一致，入口页会提示用户选择导入文件数据或保留应用内数据。
- 任一方向发生覆盖前，先把将被覆盖的一侧写入 `Documents/MoBill/backup-YYYY-MM-DD-HHmmss.json`。导入文件数据时备份应用内数据；保留应用内数据或手动备份时备份现有 `data.json`。
- 设置页“备份数据”执行应用内数据覆盖 `data.json`；“恢复数据”执行 `data.json` 覆盖应用内数据。两个入口都不再走下载文件或文件选择器。

## 主题设置

- 主题配置集中在 `src/lib/themes.ts`，当前提供“墨风、松烟、朱砂、雨瓷、玄青”五套配色。
- 当前主题保存在 `settings.themeId`。应用启动后，`src/app/page.tsx` 会在 `initStorage()` 完成后调用 `applyTheme()` 应用主题。
- 全局配色通过 CSS 变量接管，`src/app/globals.css` 同时覆盖了现有常用硬编码色值，避免逐个组件大面积重写。
- 设置页“主题设置”入口使用 `src/components/profile/ThemeSettingsView.tsx`，选择主题后立即应用并通过 `storage.setSettings()` 持久保存。
- 覆盖内联颜色时不要使用宽泛的 `[style*="color: ..."]`，因为它会误匹配 `background-color`，导致选中态文字与背景同色。当前规则只允许 `[style^="color: ..."]` 或 `[style*="; color: ..."]` 这类明确匹配文字颜色的选择器。

## 分类管理

- 分类管理页面使用 `src/components/profile/CategoryManagerView.tsx`，当前支持新增分类，不包含编辑或删除分类。入口包括设置页“分类管理”和首页“常用分类”的“编辑”按钮。
- 分类预设图标集中在 `src/lib/category-icons.ts`。运行时可用图片必须放在 `public/` 下；`docs/assets/` 仅保留设计原稿，代码不要直接引用。
- README 展示截图也放在 `public/readme-*.png`，避免 `docs/` 同时承担运行或展示引用；`docs/` 只保留原始本地素材。
- 自定义上传图标通过 `src/lib/image-processing.ts` 在浏览器内处理为 256x256 PNG。处理方式是取原图居中最大正方形区域后等比绘制到画布，不做非对称缩放，避免图标变形。
- 新增分类通过 `addCategory()` 持久化到本地分类数据，`iconImg` 可以是 `public/` 图片路径，也可以是上传处理后的 PNG data URL。

## 关于我们

- 设置页“关于我们”入口打开 `src/components/profile/AboutUsModal.tsx` 弹窗。介绍文案、设计理念、联系方式和版本更新提示都集中在该组件中。
- 应用名称、当前版本、GitHub 地址和 GitHub Release 更新检测逻辑集中在 `src/lib/app-info.ts`。弹窗打开后会自动请求 `https://api.github.com/repos/Cmochance/MoBill/releases?per_page=20`，与当前 `APP_VERSION` 比较后显示更新提示。
- 若当前已是最新版本，版本区只显示“当前已是最新版本”。若存在新版本，版本区会按版本号从旧到新展示各个正式 Release 的标题、发布日期和正文，并优先用最新 Release 中的 `.apk` 资产生成“下载更新”按钮，其次回退到 `.dmg`、`.pkg`、`.exe`、`.msi`、`.zip` 或第一个可下载资产；草稿和 prerelease 不作为默认更新提示。
- 当前版本常量为 `APP_VERSION = "1.1.3"`，`src/lib/storage.ts` 的备份元数据也复用这个常量，不再保留旧的 `1.0.0` 硬编码。

## 页面背景

- 页面背景恢复为 `body` 直接引用单张 `public/bg.png`，不再使用三段拼接背景组件。
- `docs/assets/bg.png` 仍是设计原稿，代码只引用 `public/bg.png` 作为运行时背景资源。
- `html` 和 `body` 隐藏滚动条显示，但保留页面滚动能力；组件内部需要滚动的区域继续使用 `no-scrollbar`。

## 日期选择

- 日粒度日期选择器集中在 `src/components/DayDatePicker.tsx`。最近记录的日记录筛选和记账页日期字段共用该组件，避免再次调用系统原生 `input type="date"` 面板导致样式不一致。
- 记账页日期选择入口使用与支付方式选择相同的底部弹层结构，并通过 `DayDatePicker` 的 `plain` 模式隐藏内层边框和阴影；最近记录中的日筛选仍以内嵌卡片方式展示同一个组件。

## 备注记忆

- 记账页备注历史保存在 `settings.recentDescriptions`，因此会随现有 `Documents/MoBill/data.json` 备份和恢复。
- 每次保存记账时，通过 `rememberDescription()` 记录去除首尾空格后的非空备注；重复备注会移到最前，最多保留最近 10 条。
- 备注输入框只负责编辑文本，右侧箭头打开 `src/components/add-expense/DescriptionPicker.tsx` 底部弹层选择历史备注。
