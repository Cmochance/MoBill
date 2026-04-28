"use client";

import { useState, useMemo } from "react";
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
} from "date-fns";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { ChevronDown, CalendarDays } from "lucide-react";
import {
  CategoryRankingCard,
  InsightCard,
  SummaryCard,
} from "./stats/StatsCards";
import { CardFrame } from "./CardFrame";

type Period = "week" | "month" | "year";

export default function StatsView() {
  const [period, setPeriod] = useState<Period>("week");
  const today = format(new Date(), "yyyy-MM-dd");
  const [categories] = useState<Category[]>(() => getCategories());

  const weekly = useMemo(() => getWeeklySummary(today), [today]);
  const monthly = useMemo(
    () => getMonthlySummary(format(parseISO(today), "yyyy-MM")),
    [today],
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
  }, [today]);

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
  }, []);

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
  }, [today]);

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
  }, [categories]);

  const yearTotalPie = yearPieData.reduce((s, d) => s + d.value, 0);

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
    [today],
  );
  const weekDiff = weekly.total - prevWeekly.total;

  const prevMonthly = useMemo(() => {
    const prevMonth = subMonths(parseISO(today), 1);
    return getMonthlySummary(format(prevMonth, "yyyy-MM"));
  }, [today]);
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
  }, []);
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
          disabled
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-not-allowed opacity-60"
          style={{
            backgroundColor: "rgba(245, 240, 232, 0.8)",
            border: "1px solid #E8E4DA",
          }}
          aria-label="月份选择暂未开放"
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

      <SummaryCard
        title={summaryTitle}
        total={summaryTotal}
        diff={summaryDiff}
        budgetProgress={summaryBudgetProgress}
      />

      {/* Charts */}
      {period === "week" && (
        <>
          {/* Expense Trend */}
          <CardFrame className="rounded-xl shadow-sm" contentClassName="p-4">
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
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
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
                  formatter={(value: unknown) => [
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
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAmountWeek)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardFrame>

          {/* Weekly Category Ranking + Insight */}
          <div className="space-y-3">
            <CategoryRankingCard
              title="支出分类排行"
              data={weekPieData}
              total={weekTotalPie}
            />
            <InsightCard
              title="本周洞察"
              categoryName={
                weekPieData[0] ? `本周${weekPieData[0].name}支出最高` : undefined
              }
              categoryIcon={
                categories.find((c) => c.name === weekPieData[0]?.name)?.iconImg
              }
              primaryLabel={
                weekPieData[0]
                  ? `本周${weekPieData[0].name}支出`
                  : undefined
              }
              primaryValue={weekPieData[0]?.value}
              secondaryLabel="日均支出"
              secondaryValue={`¥${(weekly.total / 7).toFixed(2)}`}
            />
          </div>
        </>
      )}

      {period === "month" && (
        <>
          {/* Expense Trend */}
          <CardFrame className="rounded-xl shadow-sm" contentClassName="p-4">
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
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
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
                  formatter={(value: unknown) => [
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
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardFrame>

          {/* Category Ranking + Monthly Insight */}
          <div className="space-y-3">
            <CategoryRankingCard
              title="支出分类排行"
              data={pieData}
              total={totalPie}
            />
            <InsightCard
              title="本月洞察"
              categoryName={
                pieData[0] ? `本月${pieData[0].name}支出最高` : undefined
              }
              categoryIcon={
                categories.find((c) => c.name === pieData[0]?.name)?.iconImg
              }
              primaryLabel={
                pieData[0] ? `本月${pieData[0].name}支出` : undefined
              }
              primaryValue={pieData[0]?.value}
              secondaryLabel="较上月变化"
              secondaryValue="↓ 8.0%"
            />
          </div>
        </>
      )}

      {period === "year" && (
        <>
          {/* Expense Trend */}
          <CardFrame className="rounded-xl shadow-sm" contentClassName="p-4">
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
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
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
                  formatter={(
                    value: unknown,
                    _name: unknown,
                    props: { payload?: { name?: string } },
                  ) => {
                    const item = yearDailyData.find(
                      (d) => d.name === props.payload?.name,
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
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAmountYear)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardFrame>

          {/* Annual Category Ranking + Insight */}
          <div className="space-y-3">
            <CategoryRankingCard
              title="支出分类排行"
              data={yearPieData}
              total={yearTotalPie}
            />
            <InsightCard
              title="年度洞察"
              categoryName={
                yearPieData[0]
                  ? `年度${yearPieData[0].name}支出最高`
                  : undefined
              }
              categoryIcon={
                categories.find((c) => c.name === yearPieData[0]?.name)?.iconImg
              }
              primaryLabel={
                yearPieData[0]
                  ? `年度${yearPieData[0].name}支出`
                  : undefined
              }
              primaryValue={yearPieData[0]?.value}
              secondaryLabel="月均支出"
              secondaryValue={`¥${(
                yearData.reduce((s, d) => s + d.amount, 0) / 12
              ).toFixed(2)}`}
            />
          </div>
        </>
      )}
    </div>
  );
}
