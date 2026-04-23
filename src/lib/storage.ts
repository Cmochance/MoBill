const STORAGE_KEYS = {
  EXPENSES: "mochan_expenses",
  CATEGORIES: "mochan_categories",
  BUDGETS: "mochan_budgets",
  SETTINGS: "mochan_settings",
};

export function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getExpenses: () => {
    const items = getItem(STORAGE_KEYS.EXPENSES, [] as any[]);
    // Migrate old data without type field
    const migrated = items.map((e: any) => ({
      ...e,
      type: e.type || "expense",
    }));
    return migrated;
  },
  setExpenses: (v: any[]) => setItem(STORAGE_KEYS.EXPENSES, v),
  getCategories: () => getItem(STORAGE_KEYS.CATEGORIES, [] as any[]),
  setCategories: (v: any[]) => setItem(STORAGE_KEYS.CATEGORIES, v),
  getBudgets: () => getItem(STORAGE_KEYS.BUDGETS, [] as any[]),
  setBudgets: (v: any[]) => setItem(STORAGE_KEYS.BUDGETS, v),
  getSettings: () => getItem(STORAGE_KEYS.SETTINGS, {}),
  setSettings: (v: any) => setItem(STORAGE_KEYS.SETTINGS, v),
};
