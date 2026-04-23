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

  // Mock income/expense comparison data
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
      // Mock income if no real income data
      const finalIncome =
        incTotal > 0 ? incTotal : expTotal * 1.5 + Math.random() * 2000;
      months.push({
        name: format(m, "M月"),
        income: Math.round(finalIncome),
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

  const prevWeekly = useMemo(
    () => getWeeklySummary(format(subDays(parseISO(today), 7), "yyyy-MM-dd")),
    [today, refresh],
  );
  const weekDiff = weekly.total - prevWeekly.total;

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
              {period === "week"
                ? "本周支出"
                : period === "month"
                  ? "本月支出"
                  : "近一年支出"}
            </div>
            <div
              className="text-3xl font-bold mt-1"
              style={{ color: "#3D3D3D" }}
            >
              ¥
              {(period === "week"
                ? weekly.total
                : period === "month"
                  ? monthly.total
                  : yearData.reduce((s, d) => s + d.amount, 0)
              ).toFixed(2)}
            </div>
          </div>
          {period === "week" && (
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: weekDiff >= 0 ? "#C45C4A12" : "#5A8F7B12",
                color: weekDiff >= 0 ? "#C45C4A" : "#5A8F7B",
              }}
            >
              {weekDiff >= 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              {weekDiff >= 0 ? "+" : ""}
              {weekDiff.toFixed(0)}
            </div>
          )}
        </div>
        {period === "month" && monthly.budgetProgress !== undefined && (
          <div className="mt-3">
            <div
              className="flex justify-between text-xs mb-1"
              style={{ color: "#8C8678" }}
            >
              <span>预算进度</span>
              <span>{(monthly.budgetProgress * 100).toFixed(0)}%</span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "#E8E4DA" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(monthly.budgetProgress * 100, 100)}%`,
                  backgroundColor:
                    monthly.budgetProgress > 1
                      ? "#C45C4A"
                      : monthly.budgetProgress > 0.8
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
        <div
          className="rounded-xl p-4 shadow-sm"
          style={{
            backgroundImage: "url(/card-2.png)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            className="text-sm font-medium mb-3"
            style={{ color: "#3D3D3D" }}
          >
            每日支出
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekBarData}>
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
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#5A8F7B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
                日均支出 ¥{monthly.dailyAverage.toFixed(2)}
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

          {/* Income vs Expense */}
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
                <div className="w-1 h-4 rounded-full bg-[#C45C4A]" />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#3D3D3D" }}
                >
                  收支对比
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#5A8F7B]" />
                  <span className="text-[10px] text-[#8C8678]">收入</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#C45C4A]" />
                  <span className="text-[10px] text-[#8C8678]">支出</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={compareData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9A9894" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9A9894" }}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `¥${Number(value).toFixed(2)}`,
                    name === "income" ? "收入" : "支出",
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="income" radius={[3, 3, 0, 0]} fill="#5A8F7B" />
                <Bar dataKey="expense" radius={[3, 3, 0, 0]} fill="#C45C4A" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Ranking + Monthly Insight */}
          <div className="grid grid-cols-2 gap-3">
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
        <div
          className="rounded-xl p-4 shadow-sm"
          style={{
            backgroundImage: "url(/card-2.png)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            className="text-sm font-medium mb-3"
            style={{ color: "#3D3D3D" }}
          >
            年度走势
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={yearData}>
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
              <Bar dataKey="amount" radius={[3, 3, 0, 0]} fill="#5A8F7B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
