export type MoneyMethod = "wechat" | "alipay" | "bankcard" | "other";

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  expenseDate: string; // YYYY-MM-DD
  expenseTime: string; // HH:mm
  createdAt: string;
  type: "expense" | "income";
  paymentMethod?: MoneyMethod;
  incomeMethod?: MoneyMethod;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  iconImg: string;
  iconImgDark?: string;
  color: string;
  budgetAmount?: number;
  sortOrder: number;
}

export interface MonthlyBudget {
  id: string;
  yearMonth: string; // YYYY-MM
  totalBudget: number;
}

export interface DailySummary {
  date: string;
  total: number;
  count: number;
  categoryBreakdown: { categoryId: string; amount: number }[];
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  total: number;
  dailyTotals: { date: string; total: number }[];
  categoryBreakdown: { categoryId: string; amount: number }[];
}

export interface MonthlySummary {
  yearMonth: string;
  total: number;
  dailyAverage: number;
  count: number;
  categoryBreakdown: { categoryId: string; amount: number }[];
  budgetProgress?: number;
}

export type ViewTab = "home" | "add" | "stats" | "calendar" | "settings";
