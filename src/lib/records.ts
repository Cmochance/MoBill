import { Category, Expense } from "./types";

const INCOME_CATEGORY_NAMES: Record<string, string> = {
  salary: "工资",
  sidejob: "副业",
  trade: "交易",
  bonus: "奖金",
  investment: "理财",
  redpacket: "红包",
  refund: "退款",
  other_income: "其他收入",
};

export function createRecordId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getCurrentRecordTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function getExpenseTimestamp(expense: Expense): number {
  const dateTime = `${expense.expenseDate}T${expense.expenseTime || "00:00"}`;
  const parsed = new Date(dateTime).getTime();
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  const created = new Date(expense.createdAt).getTime();
  return Number.isNaN(created) ? 0 : created;
}

export function sortRecordsByTimeDesc(records: Expense[]): Expense[] {
  return [...records].sort((a, b) => {
    const timeDiff = getExpenseTimestamp(b) - getExpenseTimestamp(a);
    if (timeDiff !== 0) {
      return timeDiff;
    }
    return b.id.localeCompare(a.id);
  });
}

export function getRecordCategoryName(
  expense: Expense,
  categories: Category[],
): string {
  if (expense.type === "income") {
    return INCOME_CATEGORY_NAMES[expense.categoryId] || "其他收入";
  }
  return (
    categories.find((category) => category.id === expense.categoryId)?.name ||
    expense.categoryId
  );
}
