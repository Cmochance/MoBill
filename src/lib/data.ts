import {
  Expense,
  Category,
  MonthlyBudget,
  DailySummary,
  WeeklySummary,
  MonthlySummary,
} from "./types";
import { storage } from "./storage";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  isSameMonth,
  subDays,
} from "date-fns";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "food",
    name: "餐饮",
    icon: "UtensilsCrossed",
    iconImg: "/topic-1-6.png",
    iconImgDark: "/topic-2-3.png",
    color: "#5A8F7B",
    sortOrder: 0,
  },
  {
    id: "transport",
    name: "交通",
    icon: "Bus",
    iconImg: "/topic-1-3.png",
    iconImgDark: "/topic-2-4.png",
    color: "#C4954A",
    sortOrder: 1,
  },
  {
    id: "shopping",
    name: "购物",
    icon: "ShoppingBag",
    iconImg: "/topic-1-7.png",
    iconImgDark: "/topic-2-1.png",
    color: "#C45C4A",
    sortOrder: 2,
  },
  {
    id: "housing",
    name: "住房",
    icon: "Home",
    iconImg: "/topic-1-4.png",
    color: "#7A9AA8",
    sortOrder: 3,
  },
  {
    id: "utilities",
    name: "水电",
    icon: "Zap",
    iconImg: "/topic-1-8.png",
    color: "#8C7B6B",
    sortOrder: 4,
  },
  {
    id: "entertainment",
    name: "娱乐",
    icon: "Gamepad2",
    iconImg: "/topic-1-5.png",
    iconImgDark: "/topic-2-6.png",
    color: "#9B6B8A",
    sortOrder: 5,
  },
  {
    id: "education",
    name: "学习",
    icon: "BookOpen",
    iconImg: "/topic-1-2.png",
    color: "#6B7B9B",
    sortOrder: 6,
  },
  {
    id: "medical",
    name: "医疗",
    icon: "HeartPulse",
    iconImg: "/topic-1-1.png",
    color: "#8B6B5B",
    sortOrder: 7,
  },
];

function initCategories(): Category[] {
  const cats = storage.getCategories();
  if (cats.length === 0) {
    storage.setCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  // 强制同步默认分类的颜色（样式更新时生效）
  const defaultMap = new Map(DEFAULT_CATEGORIES.map((c) => [c.id, c]));
  let changed = false;
  const merged = cats.map((c) => {
    const def = defaultMap.get(c.id);
    if (def && (def.color !== c.color || !c.iconImg)) {
      changed = true;
      return {
        ...c,
        color: def.color,
        icon: def.icon,
        iconImg: def.iconImg,
        iconImgDark: def.iconImgDark,
      };
    }
    return c;
  });
  if (changed) storage.setCategories(merged);
  return changed ? merged : cats;
}

export function getCategories(): Category[] {
  return initCategories();
}

export function addCategory(cat: Category): void {
  const cats = getCategories();
  cats.push(cat);
  storage.setCategories(cats);
}

export function updateCategory(cat: Category): void {
  const cats = getCategories();
  const idx = cats.findIndex((c) => c.id === cat.id);
  if (idx >= 0) {
    cats[idx] = cat;
    storage.setCategories(cats);
  }
}

export function deleteCategory(id: string): void {
  const cats = getCategories().filter((c) => c.id !== id);
  storage.setCategories(cats);
}

export function getExpenses(): Expense[] {
  return storage.getExpenses();
}

export function addExpense(expense: Expense): void {
  const expenses = getExpenses();
  expenses.unshift(expense);
  storage.setExpenses(expenses);
}

export function updateExpense(expense: Expense): void {
  const expenses = getExpenses();
  const idx = expenses.findIndex((e) => e.id === expense.id);
  if (idx >= 0) {
    expenses[idx] = expense;
    storage.setExpenses(expenses);
  }
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses().filter((e) => e.id !== id);
  storage.setExpenses(expenses);
}

export function getBudgets(): MonthlyBudget[] {
  return storage.getBudgets();
}

export function setBudget(budget: MonthlyBudget): void {
  const budgets = getBudgets().filter((b) => b.yearMonth !== budget.yearMonth);
  budgets.push(budget);
  storage.setBudgets(budgets);
}

export function getMonthlyBudget(yearMonth: string): number {
  const b = getBudgets().find((x) => x.yearMonth === yearMonth);
  return b?.totalBudget ?? 0;
}

// ---------- Summaries ----------

export function getDailySummary(date: string): DailySummary {
  const expenses = getExpenses().filter((e) => e.expenseDate === date);
  const cats = getCategories();
  const map = new Map<string, number>();
  expenses.forEach((e) => {
    map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount);
  });
  return {
    date,
    total: expenses.reduce((s, e) => s + e.amount, 0),
    count: expenses.length,
    categoryBreakdown: Array.from(map.entries()).map(
      ([categoryId, amount]) => ({ categoryId, amount }),
    ),
  };
}

export function getWeeklySummary(date: string): WeeklySummary {
  const d = parseISO(date);
  const ws = startOfWeek(d, { weekStartsOn: 1 });
  const we = endOfWeek(d, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: ws, end: we });
  const expenses = getExpenses().filter((e) => {
    const ed = parseISO(e.expenseDate);
    return ed >= ws && ed <= we;
  });
  const dailyTotals = days.map((day) => {
    const ds = format(day, "yyyy-MM-dd");
    const total = expenses
      .filter((e) => e.expenseDate === ds)
      .reduce((s, e) => s + e.amount, 0);
    return { date: ds, total };
  });
  const catMap = new Map<string, number>();
  expenses.forEach((e) => {
    catMap.set(e.categoryId, (catMap.get(e.categoryId) || 0) + e.amount);
  });
  return {
    weekStart: format(ws, "yyyy-MM-dd"),
    weekEnd: format(we, "yyyy-MM-dd"),
    total: expenses.reduce((s, e) => s + e.amount, 0),
    dailyTotals,
    categoryBreakdown: Array.from(catMap.entries()).map(
      ([categoryId, amount]) => ({ categoryId, amount }),
    ),
  };
}

export function getMonthlySummary(yearMonth: string): MonthlySummary {
  const [year, month] = yearMonth.split("-").map(Number);
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  const expenses = getExpenses().filter((e) => {
    const ed = parseISO(e.expenseDate);
    return ed >= start && ed <= end;
  });
  const catMap = new Map<string, number>();
  expenses.forEach((e) => {
    catMap.set(e.categoryId, (catMap.get(e.categoryId) || 0) + e.amount);
  });
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const daysInMonth = end.getDate();
  const budget = getMonthlyBudget(yearMonth);
  return {
    yearMonth,
    total,
    dailyAverage: total / daysInMonth,
    count: expenses.length,
    categoryBreakdown: Array.from(catMap.entries()).map(
      ([categoryId, amount]) => ({ categoryId, amount }),
    ),
    budgetProgress: budget > 0 ? total / budget : undefined,
  };
}

/** 计算指定月份的真实收入总额 */
export function getMonthlyIncome(yearMonth: string): number {
  const [year, month] = yearMonth.split("-").map(Number);
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  return getExpenses()
    .filter((e) => {
      const ed = parseISO(e.expenseDate);
      return e.type === "income" && ed >= start && ed <= end;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getRecentExpenses(limit: number = 10): Expense[] {
  return getExpenses().slice(0, limit);
}

export function getExpensesByDate(date: string): Expense[] {
  return getExpenses().filter((e) => e.expenseDate === date);
}

export function searchExpenses(query: string): Expense[] {
  const q = query.toLowerCase();
  return getExpenses().filter(
    (e) =>
      e.description.toLowerCase().includes(q) ||
      getCategories()
        .find((c) => c.id === e.categoryId)
        ?.name.toLowerCase()
        .includes(q),
  );
}

export function exportToCSV(): string {
  const expenses = getExpenses();
  const cats = getCategories();
  const headers = ["日期", "时间", "分类", "金额", "备注"];
  const rows = expenses.map((e) => {
    const cat = cats.find((c) => c.id === e.categoryId)?.name || e.categoryId;
    return [
      e.expenseDate,
      e.expenseTime,
      cat,
      e.amount.toFixed(2),
      e.description,
    ];
  });
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/** 计算连续记账天数（从今天往前连续有记录的天数） */
export function getStreakDays(): number {
  const expenses = getExpenses();
  if (expenses.length === 0) return 0;
  const dates = new Set(expenses.map((e) => e.expenseDate));
  let streak = 0;
  let current = new Date();
  while (true) {
    const dateStr = format(current, "yyyy-MM-dd");
    if (dates.has(dateStr)) {
      streak++;
      current = subDays(current, 1);
    } else {
      break;
    }
  }
  return streak;
}
