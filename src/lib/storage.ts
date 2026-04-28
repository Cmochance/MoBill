import { Preferences } from "@capacitor/preferences";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Category, Expense, MonthlyBudget } from "./types";
import { APP_VERSION } from "./app-info";

const STORAGE_KEYS = {
  EXPENSES: "mochan_expenses",
  CATEGORIES: "mochan_categories",
  BUDGETS: "mochan_budgets",
  SETTINGS: "mochan_settings",
};

const LOCAL_DATA_FILE = "MoBill/data.json";
export const LOCAL_BACKUP_ERROR_EVENT = "mobill:local-backup-error";

export interface AppSettings {
  nickname?: string;
  assetAccounts?: Array<{ name: string; amount: number }>;
  themeId?: string;
  recentDescriptions?: string[];
  [key: string]: unknown;
}

export interface SyncPayload {
  expenses?: Expense[];
  categories?: Category[];
  budgets?: MonthlyBudget[];
  settings?: AppSettings;
  updatedAt?: string;
  appVersion?: string;
}

interface LocalFileSnapshot {
  raw: string;
  payload: SyncPayload;
}

export interface LocalDataConflict {
  appPayload: SyncPayload;
  filePayload: SyncPayload;
  fileRaw: string;
}

export type LocalDataConflictResolution = "import-file" | "keep-app";

export interface StorageInitResult {
  conflict: LocalDataConflict | null;
}

export interface StorageActionResult {
  success: boolean;
  message: string;
  shouldReload?: boolean;
}

const cache: Record<string, unknown> = {};
let initialized = false;

function normalizeForCompare(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeForCompare);
  }
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    return Object.keys(source)
      .filter((key) => key !== "updatedAt" && key !== "appVersion")
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

function isSyncPayload(value: unknown): value is SyncPayload {
  if (!value || typeof value !== "object") return false;
  const data = value as SyncPayload;
  return Boolean(
    Array.isArray(data.expenses) ||
      Array.isArray(data.categories) ||
      Array.isArray(data.budgets) ||
      (data.settings && typeof data.settings === "object"),
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

function getBackupPath(date: Date): string {
  return `MoBill/backup-${formatBackupTimestamp(date)}.json`;
}

function withMetadata(payload: SyncPayload): SyncPayload {
  return {
    ...payload,
    updatedAt: new Date().toISOString(),
    appVersion: payload.appVersion || APP_VERSION,
  };
}

async function readLocalFileSnapshot(): Promise<LocalFileSnapshot | null> {
  try {
    const { data } = await Filesystem.readFile({
      path: LOCAL_DATA_FILE,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    const raw = data as string;
    const parsed = JSON.parse(raw);
    if (!isSyncPayload(parsed)) return null;
    return { raw, payload: parsed };
  } catch {
    return null;
  }
}

async function writePayloadToLocalFile(payload: SyncPayload): Promise<void> {
  await Filesystem.writeFile({
    path: LOCAL_DATA_FILE,
    data: JSON.stringify(withMetadata(payload), null, 2),
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
    recursive: true,
  });
}

async function writeBackupFileFromRaw(raw: string, now = new Date()) {
  await Filesystem.writeFile({
    path: getBackupPath(now),
    data: raw,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
    recursive: true,
  });
}

async function writeBackupFileFromPayload(
  payload: SyncPayload,
  now = new Date(),
) {
  await Filesystem.writeFile({
    path: getBackupPath(now),
    data: JSON.stringify(withMetadata(payload), null, 2),
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
    appVersion: APP_VERSION,
  };
}

/** 将统一数据对象加载到缓存 */
function loadPayload(payload: SyncPayload) {
  if (payload.expenses) cache[STORAGE_KEYS.EXPENSES] = payload.expenses;
  if (payload.categories) cache[STORAGE_KEYS.CATEGORIES] = payload.categories;
  if (payload.budgets) cache[STORAGE_KEYS.BUDGETS] = payload.budgets;
  if (payload.settings) cache[STORAGE_KEYS.SETTINGS] = payload.settings;
}

async function loadInternalStorage() {
  for (const key of Object.values(STORAGE_KEYS)) {
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

    // 兼容旧版本 localStorage 数据。
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
}

async function detectLocalDataConflict(): Promise<LocalDataConflict | null> {
  const snapshot = await readLocalFileSnapshot();
  if (!snapshot) return null;

  const appPayload = buildPayload();
  if (!hasPayloadChanged(snapshot.payload, appPayload)) return null;

  return {
    appPayload,
    filePayload: snapshot.payload,
    fileRaw: snapshot.raw,
  };
}

/** 初始化存储，并在本机备份文件与应用内数据不一致时返回冲突信息。 */
export async function initStorage(): Promise<StorageInitResult> {
  if (typeof window === "undefined") return { conflict: null };

  if (!initialized) {
    await loadInternalStorage();
    initialized = true;
  }

  return { conflict: await detectLocalDataConflict() };
}

/** 将缓存数据同步到内部存储 */
async function syncToInternal() {
  for (const [key, value] of Object.entries(cache)) {
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

function reportLocalBackupError(error: unknown) {
  console.error("本机备份写入失败", error);
  window.dispatchEvent(
    new CustomEvent(LOCAL_BACKUP_ERROR_EVENT, {
      detail: { message: "本机备份失败，请检查 Documents/MoBill 写入权限" },
    }),
  );
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  cache[key] = value;
  const serialized = JSON.stringify(value);

  Preferences.set({ key, value: serialized }).catch(() => {});
  try {
    localStorage.setItem(key, serialized);
  } catch {
    /* ignore */
  }

  writePayloadToLocalFile(buildPayload()).catch(reportLocalBackupError);
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

/** 手动备份：把应用内数据写入 Documents/MoBill/data.json。 */
export async function backupDataToLocalFile(): Promise<StorageActionResult> {
  try {
    const appPayload = buildPayload();
    const snapshot = await readLocalFileSnapshot();
    if (snapshot && hasPayloadChanged(snapshot.payload, appPayload)) {
      await writeBackupFileFromRaw(snapshot.raw);
    }
    await writePayloadToLocalFile(appPayload);
    return {
      success: true,
      message: "已备份到 Documents/MoBill/data.json",
    };
  } catch {
    return {
      success: false,
      message: "备份失败，请检查 Documents/MoBill 写入权限",
    };
  }
}

/** 手动恢复：用 Documents/MoBill/data.json 覆盖应用内数据。 */
export async function restoreDataFromLocalFile(): Promise<StorageActionResult> {
  try {
    const snapshot = await readLocalFileSnapshot();
    if (!snapshot) {
      return {
        success: false,
        message: "未找到可恢复的 Documents/MoBill/data.json",
      };
    }

    const appPayload = buildPayload();
    if (!hasPayloadChanged(snapshot.payload, appPayload)) {
      return { success: true, message: "当前数据已一致，无需恢复" };
    }

    await writeBackupFileFromPayload(appPayload);
    loadPayload(snapshot.payload);
    await syncToInternal();
    return {
      success: true,
      message: "已从 Documents/MoBill/data.json 恢复数据",
      shouldReload: true,
    };
  } catch {
    return {
      success: false,
      message: "恢复失败，请检查 Documents/MoBill/data.json",
    };
  }
}

/** 处理启动时检测到的数据冲突。 */
export async function resolveLocalDataConflict(
  conflict: LocalDataConflict,
  resolution: LocalDataConflictResolution,
): Promise<StorageActionResult> {
  try {
    if (resolution === "import-file") {
      await writeBackupFileFromPayload(buildPayload());
      loadPayload(conflict.filePayload);
      await syncToInternal();
      return {
        success: true,
        message: "已导入 Documents/MoBill/data.json",
        shouldReload: true,
      };
    }

    await writeBackupFileFromRaw(conflict.fileRaw);
    await writePayloadToLocalFile(buildPayload());
    return {
      success: true,
      message: "已保留应用内数据，并更新 Documents/MoBill/data.json",
    };
  } catch {
    return {
      success: false,
      message: "处理本地数据冲突失败，请检查 Documents/MoBill 写入权限",
    };
  }
}

/** 彻底清空所有数据（localStorage + Preferences + 缓存 + 本机数据文件） */
export async function clearAllData(): Promise<void> {
  for (const key of Object.keys(cache)) {
    delete cache[key];
  }

  for (const key of Object.values(STORAGE_KEYS)) {
    await Preferences.remove({ key }).catch(() => {});
  }

  if (typeof window !== "undefined") {
    localStorage.clear();
  }

  try {
    await Filesystem.deleteFile({
      path: LOCAL_DATA_FILE,
      directory: Directory.Documents,
    });
  } catch {
    /* 文件可能不存在，忽略 */
  }
}
