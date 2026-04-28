# Changelog

## v1.1.3 - 2026-04-28

### 中文

- 重构首页账本入口：今日账本直接展示，右上角日历按钮打开最近记录，支持按日、月、年筛选。
- 新增统一国风卡片框、定制日期选择器、备注历史选择器，统计页默认进入周分析。
- 移除云盘同步开关，改为基于 `Documents/MoBill/data.json` 的本机备份与恢复，并在覆盖前自动备份冲突数据。
- 新增分类管理、自定义分类图标上传与方形裁剪处理、五套主题配色，以及带 GitHub Release 检测的关于我们弹窗。
- 重构 README 截图展示，补充英文 README、MIT License、项目技术说明，并归档已完成的 Codex 任务文档。
- 清理仓库边界：运行时图片统一放在 `public/`，设计原稿保留在 `docs/assets/`，构建产物继续忽略。

### English

- Reworked the home page ledger entry points: today's ledger is shown directly, and recent records can be opened from the calendar button with day, month, and year filters.
- Added the shared ink-style card frame, custom date picker, note history picker, and weekly default statistics view.
- Replaced the cloud-sync toggle with local backup and restore based on `Documents/MoBill/data.json`, including backup-before-overwrite conflict handling.
- Added category management, custom category icon upload with square crop processing, five theme palettes, and the About dialog with GitHub Release update checks.
- Added README screenshots, English README, MIT license, project technical notes, and archived completed Codex task documents.
- Cleaned repository boundaries so runtime assets live under `public/`, source design assets stay under `docs/assets/`, and generated build outputs remain ignored.
