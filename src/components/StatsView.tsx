"use client";

import { useState, useMemo, useEffect } from "react";
import { Category } from "@/lib/types";
import {
  getWeeklySummary,
  getMonthlySummary,
  getCategories,
  getExpenses,
} from "@/lib/data";
import {
  format,
  parseISO,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

type Period = "week" | "month" | "year";

export default function StatsView() {
  const [period, setPeriod] = useState<Period>("month");
  const [today, setToday] = useState(format(new Date(), "yyyy-MM-dd"));
  const [categories, setCategories] = useState<Category[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setCategories(getCategories());
  }, [refresh]);

  const weekly = useMemo(() => getWeeklySummary(today), [today, refresh]);
  const monthly = useMemo(
    () => getMonthlySummary(format(parseISO(today), "yyyy-MM")),
    [today, refresh],
  );

  const weekBarData = weekly.dailyTotals.map((d) => ({
    name: format(parseISO(d.date), "EEE"),
    amount: d.total,
    fullDate: d.date,
  }));

  const monthLineData = useMemo(() => {
    const start = startOfMonth(parseISO(today));
    const end = endOfMonth(parseISO(today));
    const days = eachDayOfInterval({ start, end });
    const expenses = getExpenses().filter((e) => e.type === "expense");
    return days.map((day) => {
      const ds = format(day, "yyyy-MM-dd");
      const total = expenses
        .filter((e) => e.expenseDate === ds)
        .reduce((s, e) => s + e.amount, 0);
      return { name: format(day, "d"), amount: total };
    });
  }, [today, refresh]);

  const pieData = monthly.categoryBreakdown
    .map((cb) => {
      const cat = categories.find((c) => c.id === cb.categoryId);
      return {
        name: cat?.name || cb.categoryId,
        value: cb.amount,
        color: cat?.color || "#999",
      };
    })
    .filter((d) => d.value > 0);
  const totalPie = pieData.reduce((s, d) => s + d.value, 0);

  // 月度收支对比数据（真实数据）
  const compareData = useMemo(() => {
    const expenses = getExpenses();
    const months: { name: string; income: number; expense: number }[] = [];
    for (let i = 4; i >= 0; i--) {
      const m = subMonths(new Date(), i);
      const ym = format(m, "yyyy-MM");
      const [y, mo] = ym.split("-").map(Number);
      const s = startOfMonth(new Date(y, mo - 1));
      const e = endOfMonth(new Date(y, mo - 1));
      const monthExpenses = expenses.filter((ex) => {
        const ed = parseISO(ex.expenseDate);
        return ed >= s && ed <= e && ex.type === "expense";
      });
      const monthIncome = expenses.filter((ex) => {
        const ed = parseISO(ex.expenseDate);
        return ed >= s && ed <= e && ex.type === "income";
      });
      const expTotal = monthExpenses.reduce((sum, ex) => sum + ex.amount, 0);
      const incTotal = monthIncome.reduce((sum, ex) => sum + ex.amount, 0);
      months.push({
        name: format(m, "M月"),
        income: Math.round(incTotal),
        expense: Math.round(expTotal),
      });
    }
    return months;
  }, [refresh]);

  const yearData = useMemo(() => {
    const expenses = getExpenses().filter((e) => e.type === "expense");
    const months: { name: string; amount: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const m = subMonths(new Date(), i);
      const ym = format(m, "yyyy-MM");
      const [y, mo] = ym.split("-").map(Number);
      const s = startOfMonth(new Date(y, mo - 1));
      const e = endOfMonth(new Date(y, mo - 1));
      const total = expenses
        .filter((ex) => {
          const ed = parseISO(ex.expenseDate);
          return ed >= s && ed <= e;
        })
        .reduce((sum, ex) => sum + ex.amount, 0);
      months.push({ name: format(m, "M月"), amount: total });
    }
    return months;
  }, [refresh]);

  const yearWeeklyData = useMemo(() => {
    const year = parseISO(today).getFullYear();
    const start = new Date(year, 0, 1);
    const expenses = getExpenses().filter((e) => e.type === "expense");

    let current = startOfWeek(start, { weekStartsOn: 1 });
    const weeks: { name: string; label: string; amount: number }[] = [];
    let lastMonth = -1;

    while (current.getFullYear() <= year) {
      if (current.getFullYear() > year && weeks.length > 0) break;

      const ws = format(current, "yyyy-MM-dd");
      const we = format(endOfWeek(current, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const total = expenses
        .filter((ex) => {
          const ed = parseISO(ex.expenseDate);
          return ed >= parseISO(ws) && ed <= parseISO(we);
        })
        .reduce((sum, ex) => sum + ex.amount, 0);

      const month = current.getMonth();
      const isFirst = month !== lastMonth;
      lastMonth = month;

      weeks.push({
        name: ws,
        label: isFirst ? `${month + 1}月` : "",
        amount: total,
      });

      current = addWeeks(current, 1);
    }

    return weeks;
  }, [today, refresh]);

  const yearDailyData = useMemo(() => {
    const year = parseISO(today).getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const days = eachDayOfInterval({ start, end });
    const expenses = getExpenses().filter((e) => e.type === "expense");
    return days.map((day) => {
      const ds = format(day, "yyyy-MM-dd");
      const total = expenses
        .filter((e) => e.expenseDate === ds)
        .reduce((s, e) => s + e.amount, 0);
      return {
        name: ds,
        amount: total,
        label: day.getDate() === 1 ? `${day.getMonth() + 1}月` : "",
      };
    });
  }, [today, refresh]);

  const yearIncomeTotal = useMemo(() => {
    const expenses = getExpenses().filter((e) => {
      const ed = parseISO(e.expenseDate);
      return e.type === "income" && ed >= subMonths(new Date(), 11);
    });
    return expenses.reduce((sum, ex) => sum + ex.amount, 0);
  }, [refresh]);

  const yearPieData = useMemo(() => {
    const expenses = getExpenses().filter((e) => {
      const ed = parseISO(e.expenseDate);
      return e.type === "expense" && ed >= subMonths(new Date(), 11);
    });
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount);
    });
    const result = Array.from(map.entries())
      .map(([categoryId, amount]) => {
        const cat = categories.find((c) => c.id === categoryId);
        return {
          name: cat?.name || categoryId,
          value: amount,
          color: cat?.color || "#999",
        };
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
    return result;
  }, [categories, refresh]);

  const yearTotalPie = yearPieData.reduce((s, d) => s + d.value, 0);

  const yearCompareData = useMemo(() => {
    const expenses = getExpenses();
    const months: { name: string; income: number; expense: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const m = subMonths(new Date(), i);
      const ym = format(m, "yyyy-MM");
      const [y, mo] = ym.split("-").map(Number);
      const s = startOfMonth(new Date(y, mo - 1));
      const e = endOfMonth(new Date(y, mo - 1));
      const monthExpenses = expenses.filter((ex) => {
        const ed = parseISO(ex.expenseDate);
        return ed >= s && ed <= e && ex.type === "expense";
      });
      const monthIncome = expenses.filter((ex) => {
        const ed = parseISO(ex.expenseDate);
        return ed >= s && ed <= e && ex.type === "income";
      });
      const expTotal = monthExpenses.reduce((sum, ex) => sum + ex.amount, 0);
      const incTotal = monthIncome.reduce((sum, ex) => sum + ex.amount, 0);
      months.push({
        name: format(m, "M月"),
        income: Math.round(incTotal),
        expense: Math.round(expTotal),
      });
    }
    return months;
  }, [refresh]);

  const weekIncomeTotal = useMemo(() => {
    const expenses = getExpenses();
    const start = parseISO(weekly.weekStart);
    const end = parseISO(weekly.weekEnd);
    return expenses
      .filter((ex) => {
        const ed = parseISO(ex.expenseDate);
        return ed >= start && ed <= end && ex.type === "income";
      })
      .reduce((sum, ex) => sum + ex.amount, 0);
  }, [weekly, refresh]);

  const weekPieData = useMemo(() => {
    return weekly.categoryBreakdown
      .map((cb) => {
        const cat = categories.find((c) => c.id === cb.categoryId);
        return {
          name: cat?.name || cb.categoryId,
          value: cb.amount,
          color: cat?.color || "#999",
        };
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [weekly, categories]);

  const weekTotalPie = weekPieData.reduce((s, d) => s + d.value, 0);

  const prevWeekly = useMemo(
    () => getWeeklySummary(format(subDays(parseISO(today), 7), "yyyy-MM-dd")),
    [today, refresh],
  );
  const weekDiff = weekly.total - prevWeekly.total;

  const prevMonthly = useMemo(() => {
    const prevMonth = subMonths(parseISO(today), 1);
    return getMonthlySummary(format(prevMonth, "yyyy-MM"));
  }, [today, refresh]);
  const monthDiff = monthly.total - prevMonthly.total;

  const currentYearTotal = yearData.reduce((s, d) => s + d.amount, 0);

  const prevYearTotal = useMemo(() => {
    const expenses = getExpenses().filter((e) => e.type === "expense");
    const now = new Date();
    return expenses
      .filter((ex) => {
        const ed = parseISO(ex.expenseDate);
        return ed >= subMonths(now, 23) && ed < subMonths(now, 11);
      })
      .reduce((sum, ex) => sum + ex.amount, 0);
  }, [refresh]);
  const yearDiff = currentYearTotal - prevYearTotal;

  const monthBudgetAmount =
    monthly.budgetProgress && monthly.budgetProgress > 0
      ? monthly.total / monthly.budgetProgress
      : 0;
  const daysInMonth = parseISO(today).getDate();
  const weekBudgetProgress =
    monthBudgetAmount > 0
      ? weekly.total / ((monthBudgetAmount / daysInMonth) * 7)
      : undefined;
  const yearBudgetProgress =
    monthBudgetAmount > 0
      ? currentYearTotal / (monthBudgetAmount * 12)
      : undefined;

  const summaryTitle =
    period === "week"
      ? "本周支出"
      : period === "month"
        ? "本月支出"
        : "本年支出";
  const summaryTotal =
    period === "week"
      ? weekly.total
      : period === "month"
        ? monthly.total
        : currentYearTotal;
  const summaryDiff =
    period === "week" ? weekDiff : period === "month" ? monthDiff : yearDiff;
  const summaryBudgetProgress =
    period === "week"
      ? weekBudgetProgress
      : period === "month"
        ? monthly.budgetProgress
        : yearBudgetProgress;

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold" style={{ color: "#3D3D3D" }}>
          统计分析
        </h1>
      </div>

      {/* Month Selector + Period Toggle */}
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
          style={{
            backgroundColor: "rgba(245, 240, 232, 0.8)",
            border: "1px solid #E8E4DA",
          }}
        >
          <CalendarDays size={14} className="text-[#8C8678]" />
          <span className="text-[#3D3D3D]">
            {format(parseISO(today), "yyyy年M月")}
          </span>
          <ChevronDown size={14} className="text-[#8C8678]" />
        </button>
        <div
          className="rounded-lg p-0.5 flex"
          style={{
            backgroundColor: "rgba(245, 240, 232, 0.6)",
            border: "1px solid #E8E4DA",
          }}
        >
          {(["week", "month", "year"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
              style={{
                color: period === p ? "#FFF" : "#8C8678",
                backgroundColor: period === p ? "#5A8F7B" : "transparent",
              }}
            >
              {p === "week" ? "周" : p === "month" ? "月" : "年"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div
        className="rounded-xl p-5 shadow-sm"
        style={{
          backgroundImage: "url(/card-2.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm" style={{ color: "#8C8678" }}>
              {summaryTitle}
            </div>
            <div
              className="text-3xl font-bold mt-1"
              style={{ color: "#3D3D3D" }}
            >
              ¥{summaryTotal.toFixed(2)}
            </div>
          </div>
          <div
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: summaryDiff >= 0 ? "#C45C4A12" : "#5A8F7B12",
              color: summaryDiff >= 0 ? "#C45C4A" : "#5A8F7B",
            }}
          >
            {summaryDiff >= 0 ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            {summaryDiff >= 0 ? "+" : ""}
            {summaryDiff.toFixed(0)}
          </div>
        </div>
        {summaryBudgetProgress !== undefined && summaryBudgetProgress > 0 && (
          <div className="mt-3">
            <div
              className="flex justify-between text-xs mb-1"
              style={{ color: "#8C8678" }}
            >
              <span>预算进度</span>
              <span>{(summaryBudgetProgress * 100).toFixed(0)}%</span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "#E8E4DA" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(summaryBudgetProgress * 100, 100)}%`,
                  backgroundColor:
                    summaryBudgetProgress > 1
                      ? "#C45C4A"
                      : summaryBudgetProgress > 0.8
                        ? "#C4954A"
                        : "#5A8F7B",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      {period === "week" && (
        <>
          {/* Expense Trend */}
          <div
            className="rounded-xl p-4 shadow-sm"
            style={{
              backgroundImage: "url(/card-2.png)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-[#5A8F7B]" />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#3D3D3D" }}
                >
                  支出趋势
                </span>
              </div>
              <span className="text-xs text-[#8C8678]">
                本周日均支出 ¥{(weekly.total / 7).toFixed(2)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weekBarData}>
                <defs>
                  <linearGradient
                    id="colorAmountWeek"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#5A8F7B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#5A8F7B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9A9894" }}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `¥${Number(value).toFixed(2)}`,
                    "支出",
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#5A8F7B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAmountWeek)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Category Ranking + Insight */}
          <div className="space-y-3">
            <div
              className="rounded-xl p-4 shadow-sm"
              style={{
                backgroundImage: "url(/card-2.png)",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-[#5A8F7B]" />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#3D3D3D" }}
                >
                  支出分类排行
                </span>
              </div>
              <div className="space-y-2">
                {weekPieData.slice(0, 5).map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-xs text-[#3D3D3D]">{d.name}</span>
                    </div>
                    <span className="text-xs text-[#8C8678]">
                      {((d.value / (weekTotalPie || 1)) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-3 text-xs text-[#5A8F7B] flex items-center gap-0.5">
                查看全部分类 <ChevronRight size={12} />
              </button>
            </div>

            <div
              className="rounded-xl p-4 shadow-sm"
              style={{
                backgroundImage: "url(/card-2.png)",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-[#C4954A]" />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#3D3D3D" }}
                >
                  本周洞察
                </span>
              </div>
              {weekPieData[0] && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src={
                          categories.find((c) => c.name === weekPieData[0].name)
                            ?.iconImg
                        }
                        alt={weekPieData[0].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-[#6B6658]">
                      本周{weekPieData[0].name}支出最高
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8C8678]">
                        本周{weekPieData[0].name}支出
                      </span>
                      <span className="text-[#3D3D3D] font-medium">
                        ¥{weekPieData[0].value.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8678]">日均支出</span>
                      <span className="text-[#3D3D3D] font-medium">
                        ¥{(weekly.total / 7).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {period === "month" && (
        <>
          {/* Expense Trend */}
          <div
            className="rounded-xl p-4 shadow-sm"
            style={{
              backgroundImage: "url(/card-2.png)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-[#5A8F7B]" />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#3D3D3D" }}
                >
                  支出趋势
                </span>
              </div>
              <span className="text-xs text-[#8C8678]">
                本月日均支出 ¥{monthly.dailyAverage.toFixed(2)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthLineData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A8F7B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#5A8F7B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9A9894" }}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `¥${Number(value).toFixed(2)}`,
                    "支出",
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#5A8F7B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Ranking + Monthly Insight */}
          <div className="space-y-3">
            <div
              className="rounded-xl p-4 shadow-sm"
              style={{
                backgroundImage: "url(/card-2.png)",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-[#5A8F7B]" />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#3D3D3D" }}
                >
                  支出分类排行
                </span>
              </div>
              <div className="space-y-2">
                {pieData.slice(0, 5).map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-xs text-[#3D3D3D]">{d.name}</span>
                    </div>
                    <span className="text-xs text-[#8C8678]">
                      {((d.value / (totalPie || 1)) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-3 text-xs text-[#5A8F7B] flex items-center gap-0.5">
                查看全部分类 <ChevronRight size={12} />
              </button>
            </div>

            <div
              className="rounded-xl p-4 shadow-sm"
              style={{
                backgroundImage: "url(/card-2.png)",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-[#C4954A]" />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#3D3D3D" }}
                >
                  本月洞察
                </span>
              </div>
              {pieData[0] && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src={
                          categories.find((c) => c.name === pieData[0].name)
                            ?.iconImg
                        }
                        alt={pieData[0].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-[#6B6658]">
                      本月{pieData[0].name}支出最高
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8C8678]">
                        本月{pieData[0].name}支出
                      </span>
                      <span className="text-[#3D3D3D] font-medium">
                        ¥{pieData[0].value.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8678]">较上月变化</span>
                      <span className="text-[#5A8F7B]">↓ 8.0%</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {period === "year" && (
        <>
          {/* Expense Trend */}
          <div
            className="rounded-xl p-4 shadow-sm"
            style={{
              backgroundImage: "url(/card-2.png)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-[#5A8F7B]" />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#3D3D3D" }}
                >
                  支出趋势
                </span>
              </div>
              <span className="text-xs text-[#8C8678]">
                本年日均支出 ¥{(currentYearTotal / 365).toFixed(2)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={yearDailyData}>
                <defs>
                  <linearGradient
                    id="colorAmountYear"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#5A8F7B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#5A8F7B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9A9894" }}
                  ticks={yearDailyData
                    .filter((d) => d.label)
                    .map((d) => d.name)}
                  tickFormatter={(value: string) => {
                    const item = yearDailyData.find((d) => d.name === value);
                    return item?.label || "";
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9A9894" }}
                />
                <Tooltip
                  formatter={(value: any, name: any, props: any) => {
                    const item = yearDailyData.find(
                      (d) => d.name === props.payload.name,
                    );
                    const dateStr = item
                      ? format(parseISO(item.name), "M月d日")
                      : "";
                    return [`¥${Number(value).toFixed(2)}`, `${dateStr}`];
                  }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#5A8F7B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAmountYear)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Annual Category Ranking + Insight */}
          <div className="space-y-3">
            <div
              className="rounded-xl p-4 shadow-sm"
              style={{
                backgroundImage: "url(/card-2.png)",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-[#5A8F7B]" />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#3D3D3D" }}
                >
                  支出分类排行
                </span>
              </div>
              <div className="space-y-2">
                {yearPieData.slice(0, 5).map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-xs text-[#3D3D3D]">{d.name}</span>
                    </div>
                    <span className="text-xs text-[#8C8678]">
                      {((d.value / (yearTotalPie || 1)) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-3 text-xs text-[#5A8F7B] flex items-center gap-0.5">
                查看全部分类 <ChevronRight size={12} />
              </button>
            </div>

            <div
              className="rounded-xl p-4 shadow-sm"
              style={{
                backgroundImage: "url(/card-2.png)",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-[#C4954A]" />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#3D3D3D" }}
                >
                  年度洞察
                </span>
              </div>
              {yearPieData[0] && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src={
                          categories.find((c) => c.name === yearPieData[0].name)
                            ?.iconImg
                        }
                        alt={yearPieData[0].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-[#6B6658]">
                      年度{yearPieData[0].name}支出最高
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8C8678]">
                        年度{yearPieData[0].name}支出
                      </span>
                      <span className="text-[#3D3D3D] font-medium">
                        ¥{yearPieData[0].value.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8678]">月均支出</span>
                      <span className="text-[#3D3D3D] font-medium">
                        ¥
                        {(
                          yearData.reduce((s, d) => s + d.amount, 0) / 12
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
