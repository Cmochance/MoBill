import { Preferences } from "@capacitor/preferences";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Category, Expense, MonthlyBudget } from "./types";

const STORAGE_KEYS = {
  EXPENSES: "mochan_expenses",
  CATEGORIES: "mochan_categories",
  BUDGETS: "mochan_budgets",
  SETTINGS: "mochan_settings",
  SYNC_CONFIG: "mochan_sync_config",
};

const EXTERNAL_FILE = "MoBill/data.json";
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const EXTERNAL_SYNC_ERROR_EVENT = "mobill:external-sync-error";

export interface AppSettings {
  nickname?: string;
  assetAccounts?: Array<{ name: string; amount: number }>;
  [key: string]: unknown;
}

interface SyncPayload {
  expenses?: Expense[];
  categories?: Category[];
  budgets?: MonthlyBudget[];
  settings?: AppSettings;
  updatedAt?: string;
  appVersion?: string;
}

interface ExternalFileSnapshot {
  raw: string;
  payload: SyncPayload;
}

const cache: Record<string, unknown> = {};
let initialized = false;

/** 同步配置 */
export interface SyncConfig {
  enabled: boolean;
  path: string;
}

function getSyncConfig(): SyncConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { enabled: false, path: EXTERNAL_FILE };
}

function setSyncConfig(cfg: SyncConfig) {
  localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(cfg));
}

function normalizeForCompare(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeForCompare);
  }
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    return Object.keys(source)
      .filter((key) => key !== "updatedAt")
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = normalizeForCompare(source[key]);
        return acc;
      }, {});
  }
  return value;
}

function payloadSignature(payload: SyncPayload): string {
  return JSON.stringify(normalizeForCompare(payload));
}

function hasPayloadChanged(current: SyncPayload, next: SyncPayload): boolean {
  return payloadSignature(current) !== payloadSignature(next);
}

function isOlderThanBackupInterval(updatedAt: string | undefined, now: Date) {
  if (!updatedAt) return false;
  const updatedAtMs = Date.parse(updatedAt);
  return (
    Number.isFinite(updatedAtMs) &&
    now.getTime() - updatedAtMs > BACKUP_INTERVAL_MS
  );
}

function formatBackupTimestamp(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function getBackupPath(path: string, date: Date): string {
  const slashIndex = path.lastIndexOf("/");
  const dir = slashIndex >= 0 ? path.slice(0, slashIndex) : "";
  const fileName = slashIndex >= 0 ? path.slice(slashIndex + 1) : path;
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const ext = dotIndex > 0 ? fileName.slice(dotIndex) : ".json";
  const historyDir = dir ? `${dir}/history` : "history";
  return `${historyDir}/${baseName}-${formatBackupTimestamp(date)}${ext}`;
}

async function readExternalFileSnapshot(
  cfg: SyncConfig,
): Promise<ExternalFileSnapshot | null> {
  try {
    const { data } = await Filesystem.readFile({
      path: cfg.path,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    const raw = data as string;
    return { raw, payload: JSON.parse(raw) as SyncPayload };
  } catch {
    return null;
  }
}

/** 读取外部同步文件 */
async function readExternalFile(): Promise<SyncPayload | null> {
  const cfg = getSyncConfig();
  if (!cfg.enabled) return null;
  const snapshot = await readExternalFileSnapshot(cfg);
  return snapshot?.payload ?? null;
}

async function backupExternalFile(
  cfg: SyncConfig,
  snapshot: ExternalFileSnapshot,
  now: Date,
): Promise<void> {
  await Filesystem.writeFile({
    path: getBackupPath(cfg.path, now),
    data: snapshot.raw,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
    recursive: true,
  });
}

/** 写入外部同步文件 */
async function writeExternalFile(payload: SyncPayload): Promise<void> {
  const cfg = getSyncConfig();
  if (!cfg.enabled) return;

  const now = new Date();
  const snapshot = await readExternalFileSnapshot(cfg);

  if (snapshot) {
    if (!hasPayloadChanged(snapshot.payload, payload)) {
      return;
    }

    if (isOlderThanBackupInterval(snapshot.payload.updatedAt, now)) {
      await backupExternalFile(cfg, snapshot, now);
    }
  }

  await Filesystem.writeFile({
    path: cfg.path,
    data: JSON.stringify(payload, null, 2),
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
    recursive: true,
  });
}

/** 构建统一数据对象 */
function buildPayload(): SyncPayload {
  return {
    expenses: storage.getExpenses(),
    categories: storage.getCategories(),
    budgets: storage.getBudgets(),
    settings: storage.getSettings(),
    updatedAt: new Date().toISOString(),
    appVersion: "1.0.0",
  };
}

/** 将统一数据对象加载到缓存 */
function loadPayload(payload: SyncPayload) {
  if (payload.expenses) cache[STORAGE_KEYS.EXPENSES] = payload.expenses;
  if (payload.categories) cache[STORAGE_KEYS.CATEGORIES] = payload.categories;
  if (payload.budgets) cache[STORAGE_KEYS.BUDGETS] = payload.budgets;
  if (payload.settings) cache[STORAGE_KEYS.SETTINGS] = payload.settings;
}

/** 初始化存储 */
export async function initStorage(): Promise<void> {
  if (initialized || typeof window === "undefined") return;

  const cfg = getSyncConfig();

  // 1. 若启用了外部同步，优先从外部文件加载
  if (cfg.enabled) {
    const external = await readExternalFile();
    if (external) {
      loadPayload(external);
      // 同时回写到 Preferences / localStorage
      await syncToInternal();
      initialized = true;
      return;
    }
  }

  // 2. 从 Preferences 加载
  for (const key of Object.values(STORAGE_KEYS)) {
    if (key === STORAGE_KEYS.SYNC_CONFIG) continue;
    let loaded = false;
    try {
      const { value } = await Preferences.get({ key });
      if (value !== null) {
        cache[key] = JSON.parse(value);
        loaded = true;
      }
    } catch {
      /* ignore */
    }

    // 3. 回退到 localStorage（兼容旧版本）
    if (!loaded) {
      try {
        const item = localStorage.getItem(key);
        if (item !== null) {
          cache[key] = JSON.parse(item);
          await Preferences.set({ key, value: item }).catch(() => {});
        }
      } catch {
        /* ignore */
      }
    }
  }

  initialized = true;
}

/** 将缓存数据同步到内部存储 */
async function syncToInternal() {
  for (const [key, value] of Object.entries(cache)) {
    if (key === STORAGE_KEYS.SYNC_CONFIG) continue;
    const serialized = JSON.stringify(value);
    await Preferences.set({ key, value: serialized }).catch(() => {});
    try {
      localStorage.setItem(key, serialized);
    } catch {
      /* ignore */
    }
  }
}

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  if (key in cache) return cache[key] as T;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function reportExternalSyncError(error: unknown) {
  console.error("外部同步备份或写入失败", error);
  window.dispatchEvent(
    new CustomEvent(EXTERNAL_SYNC_ERROR_EVENT, {
      detail: { message: "外部同步备份或写入失败，请检查存储权限" },
    }),
  );
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  cache[key] = value;
  const serialized = JSON.stringify(value);

  // 内部双写
  Preferences.set({ key, value: serialized }).catch(() => {});
  try {
    localStorage.setItem(key, serialized);
  } catch {
    /* ignore */
  }

  // 外部同步（若启用）
  const cfg = getSyncConfig();
  if (cfg.enabled) {
    writeExternalFile(buildPayload()).catch(reportExternalSyncError);
  }
}

export const storage = {
  getExpenses: () => {
    const items = getItem<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    const migrated = items.map((e) => ({
      ...e,
      type: e.type || "expense",
      paymentMethod: e.paymentMethod || "other",
    }));
    return migrated;
  },
  setExpenses: (v: Expense[]) => setItem(STORAGE_KEYS.EXPENSES, v),
  getCategories: () => getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []),
  setCategories: (v: Category[]) => setItem(STORAGE_KEYS.CATEGORIES, v),
  getBudgets: () => getItem<MonthlyBudget[]>(STORAGE_KEYS.BUDGETS, []),
  setBudgets: (v: MonthlyBudget[]) => setItem(STORAGE_KEYS.BUDGETS, v),
  getSettings: () => getItem<AppSettings>(STORAGE_KEYS.SETTINGS, {}),
  setSettings: (v: AppSettings) => setItem(STORAGE_KEYS.SETTINGS, v),
};

/** 外部同步相关 API */
export const syncApi = {
  getConfig: getSyncConfig,

  /** 启用/禁用外部同步 */
  async setEnabled(
    enabled: boolean,
  ): Promise<{ success: boolean; message: string }> {
    const cfg = { ...getSyncConfig(), enabled };
    setSyncConfig(cfg);

    if (enabled) {
      try {
        // 首次启用：将当前数据写入外部文件
        await writeExternalFile(buildPayload());
        return {
          success: true,
          message: "已开启外部同步，数据已写入 Documents/MoBill/data.json",
        };
      } catch {
        return {
          success: false,
          message: "开启失败，请检查存储权限或备份文件写入权限",
        };
      }
    }
    return { success: true, message: "已关闭外部同步" };
  },

  /** 手动触发从外部文件重新加载 */
  async reloadFromExternal(): Promise<{ success: boolean; message: string }> {
    const cfg = getSyncConfig();
    if (!cfg.enabled) {
      return { success: false, message: "外部同步未开启" };
    }
    const external = await readExternalFile();
    if (!external) {
      return { success: false, message: "未找到外部同步文件" };
    }
    loadPayload(external);
    await syncToInternal();
    return { success: true, message: "已从外部文件重新加载数据" };
  },

  /** 获取外部文件实际路径提示 */
  getExternalPathHint(): string {
    return "Documents/MoBill/data.json";
  },
};

/** 导出全部数据为 JSON 字符串 */
export function exportAllData(): string {
  return JSON.stringify(buildPayload(), null, 2);
}

/** 从 JSON 字符串导入全部数据 */
export function importAllData(json: string): {
  success: boolean;
  message: string;
} {
  try {
    const data = JSON.parse(json);
    if (!data.expenses && !data.categories) {
      return { success: false, message: "无效的备份文件格式" };
    }
    if (data.expenses) storage.setExpenses(data.expenses);
    if (data.categories) storage.setCategories(data.categories);
    if (data.budgets) storage.setBudgets(data.budgets);
    if (data.settings) storage.setSettings(data.settings);
    return { success: true, message: "数据恢复成功" };
  } catch {
    return { success: false, message: "文件解析失败，请检查备份文件" };
  }
}

/** 彻底清空所有数据（localStorage + Preferences + 缓存 + 外部文件） */
export async function clearAllData(): Promise<void> {
  // 1. 清空内存缓存
  for (const key of Object.keys(cache)) {
    delete cache[key];
  }

  // 2. 清空 Preferences
  for (const key of Object.values(STORAGE_KEYS)) {
    await Preferences.remove({ key }).catch(() => {});
  }

  // 3. 清空 localStorage
  if (typeof window !== "undefined") {
    localStorage.clear();
  }

  // 4. 删除外部同步文件（若启用）
  const cfg = getSyncConfig();
  if (cfg.enabled) {
    try {
      await Filesystem.deleteFile({
        path: cfg.path,
        directory: Directory.Documents,
      });
    } catch {
      /* 文件可能不存在，忽略 */
    }
  }
}
