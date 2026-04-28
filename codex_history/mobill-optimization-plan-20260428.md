# MoBill 优化临时计划

此文档用于记录当前约定的十项优化，后续逐条执行。默认不提交代码，除非用户在当前对话中明确要求提交。

## 当前状态

- 2026-04-28：第 3 项的旧“外部同步 / 24 小时 history 备份”规则已被新的本机备份恢复机制取代；当前规则以 `Documents/MoBill/data.json` 为固定数据文件，覆盖前在 `Documents/MoBill/backup-YYYY-MM-DD-HHmmss.json` 保存将被覆盖的一侧。
- 2026-04-25：第 1 项已完成，支出汇总函数已排除收入记录。
- 2026-04-25：第 2 项已完成，入口页面会等待存储初始化完成后再挂载业务视图。
- 2026-04-25：第 3 项方案已按用户想法调整为外部同步文件的 24 小时历史备份机制。
- 2026-04-25：第 3 项已完成，外部同步写入前会按 24 小时规则备份旧主文件。
- 2026-04-25：第 4 项已完成，仓库交付边界已改为源码入库、构建产物和本机配置留在本地。
- 2026-04-25：第 5 至第 10 项已完成，签名文档、组件结构、质量脚本、空操作状态、记录数据细节和资产目录边界均已按约定处理。

## 计划清单

1. [x] 修正统计口径：`getDailySummary`、`getWeeklySummary`、`getMonthlySummary` 只统计 `type === "expense"` 的支出记录，避免收入进入支出、预算和分类占比。
2. [x] 重做存储初始化流程：增加全局初始化状态或 hook，等待 `initStorage` 完成后再渲染业务视图，避免 Capacitor Preferences 数据尚未加载时显示空数据或写入默认值。
3. [x] 增加外部同步历史备份机制：当前同步仍保留单个主文件 `Documents/MoBill/data.json`，但每次数据发生变化准备写入前，先读取主文件中的时间戳；如果主文件存在、内容将发生变化，并且主文件时间戳距离当前时间超过 24 小时，则先把当前主文件复制为带日期后缀的备份文件，保存到 `Documents/MoBill/history/` 下，再写入新的 `data.json`。
4. [x] 整理仓库交付方式：`.gitignore` 已改为允许 Android 工程源码入库，同时忽略本机配置、签名文件、构建缓存、`dist/` 和 `*.apk`/`*.aab`；已从 Git 索引中移出已跟踪的 `dist/` 和 APK 构建产物。
5. [x] 处理签名敏感信息：移除文档中的真实签名口令，保留示例配置和安全说明。
6. [x] 拆分大组件并清理死代码：拆分 `StatsView`、`ProfileView`、`AddExpenseView`，删除或重新接入未使用的 `CalendarView`、`SettingsView`。
7. [x] 补工程质量脚本：增加 `typecheck`、测试或轻量验证脚本，并建立 `npm ci && npm run lint && npm run typecheck && npm run build` 的检查流程。
8. [x] 修复用户可见空操作：按用户要求置灰首页搜索、日历入口、常用分类编辑、查看全部，以及我的页中未实现菜单项。
9. [x] 优化记账数据细节：使用真实时间、稳定 ID、明确收入入账方式字段，并修正最近记录排序策略。
10. [x] 压缩和归并图片资产：`img/` 设计原稿已迁移到 `docs/assets/`，运行时代码只引用 `public/`，并已清理和压缩运行时静态资源。

## 执行记录

- 第 1 项结果：`src/lib/data.ts` 中日、周、月支出汇总均已增加 `type === "expense"` 过滤；收入继续由 `getMonthlyIncome` 和各视图中的收入逻辑单独统计。
- 验证结果：`npx eslint src/lib/data.ts`、`npx tsc --noEmit`、`npm run build` 通过。`npm run lint` 当前失败，因为它扫描了已提交的 `dist/` 构建产物和既有组件 lint 问题，这属于后续第 4 项和第 7 项的处理范围。
- 第 2 项结果：`src/app/page.tsx` 新增 `storageReady` 状态，`initStorage()` 完成后才渲染业务视图和底部导航；初始化失败时也会进入业务界面，避免应用卡在加载态。
- 验证结果：`npx eslint src/app/page.tsx src/lib/data.ts` 无错误，仅保留既有 `<img>` 性能警告；`npx tsc --noEmit`、`npm run build` 通过。`npm run build` 仍会刷新已提交的 `dist/`，这是后续第 4 项需要整理的仓库交付问题。
- 第 3 项方案调整：外部同步写入流程应改为“读取现有 `data.json` -> 判断是否有实际数据变化 -> 判断现有文件 `updatedAt` 是否超过 24 小时 -> 必要时复制旧文件到 `history/data-YYYY-MM-DD.json` 或等价日期后缀文件 -> 写入新的 `data.json`”。如果主文件不存在、时间戳无效、外部同步未开启，或内容没有实际变化，则不创建历史备份。备份失败时应返回或展示明确错误，不能静默吞掉导致用户误以为已备份。
- 第 3 项结果：`src/lib/storage.ts` 的外部同步写入会先读取现有主文件并按去除 `updatedAt` 后的稳定签名比较业务内容；只有内容变化且旧主文件 `updatedAt` 超过 24 小时时，才把旧主文件写入 `history/data-YYYY-MM-DD-HHmmss.json`，再写入新的 `data.json`。常规异步同步失败会触发 `mobill:external-sync-error` 事件，`src/app/page.tsx` 会显示顶部错误提示；手动开启同步失败时仍通过 `syncApi.setEnabled` 返回错误信息。
- 验证结果：`npx eslint src/lib/storage.ts src/app/page.tsx src/lib/data.ts` 无错误，仅保留既有 `<img>` 性能警告；`npx tsc --noEmit`、`npm run build` 通过。`npm run build` 仍会刷新已提交的 `dist/`，这是后续第 4 项需要整理的仓库交付问题。
- 第 4 项阶段结果：按用户要求不额外创建本地 Android 工程文件，只对 `.gitignore` 做通用改造；已移除对整个 `android/` 目录的忽略，改为只忽略 `android/.gradle/`、`android/**/build/`、`android/local.properties`、`android/app/keystore.properties` 和 `android/app/google-services.json` 等本机或敏感文件。`dist/`、`*.apk`、`*.aab`、`tools/`、`node_modules/`、`.next/`、`next-env.d.ts`、`*.tsbuildinfo` 继续被忽略。
- 第 4 项完成结果：已执行 `git rm -r --cached --ignore-unmatch dist MoBill.apk`，从 Git 索引中移出已跟踪的 `dist/` 和根目录 `MoBill.apk`。本地文件仍保留在工作区；`git ls-files dist MoBill.apk` 无输出，`git status --ignored` 显示它们会作为被忽略的本地产物保留。
- 第 5 项结果：`BUILD_GUIDE.md` 已移除真实签名口令和具体密钥细节，改为说明本地准备 `android/release.keystore` 与 `android/app/keystore.properties`；新增 `android/app/keystore.properties.example` 作为无敏感值模板。
- 第 6 项结果：`AddExpenseView` 拆出分类选择、方式选择和选项定义；`ProfileView` 拆出资产管理和菜单组件；`StatsView` 拆出摘要、排行和洞察卡片。未接入导航的 `CalendarView`、`SettingsView` 以及只被它们使用的 `CategoryIcon` 已删除。
- 第 7 项结果：`package.json` 新增 `typecheck` 和 `check` 脚本；`eslint.config.mjs` 明确忽略 `dist/**` 与 `docs/assets/**`；`next.config.ts` 指定 `turbopack.root`，消除构建时的工作区根目录推断警告。
- 第 8 项结果：按用户要求将暂未实现入口置灰禁用，包括首页搜索、首页日历入口、常用分类编辑、最近记录查看全部、统计月份选择、统计查看全部分类、我的页设置按钮和未实现菜单项。
- 第 9 项结果：新增 `src/lib/records.ts`，统一生成稳定记录 ID、真实当前时间和记录排序时间戳；新增收入 `incomeMethod` 字段，收入记录会保存入账方式；最近记录和按日记录按实际日期时间倒序展示，CSV 导出也补充类型、方式和收入分类名称。
- 第 10 项结果：`img/` 已通过 Git 移动到 `docs/assets/` 作为设计原稿目录，代码未引用该目录；`public/` 保留唯一运行时静态资源，删除未引用的默认 SVG、墨迹背景和未用主题图，并对保留 PNG 做无损重编码压缩，`public/` 从约 7.0M 降至约 5.5M。
- 第 5 至第 10 项验证结果：`npm run check` 通过，包含 `npm run lint`、`npm run typecheck` 和 `npm run build`。当前 lint 仅剩 7 个既有 `<img>` 性能警告，无错误；build 已成功生成静态导出。
