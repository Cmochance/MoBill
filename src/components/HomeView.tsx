"use client";

import { useState, useEffect, useMemo } from "react";
import { Expense, Category } from "@/lib/types";
import {
  getMonthlySummary,
  getRecentExpenses,
  getCategories,
  getExpenses,
  deleteExpense,
} from "@/lib/data";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
} from "date-fns";
import {
  Search,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function HomeView({ onAdd }: { onAdd: () => void }) {
  const [today, setToday] = useState(format(new Date(), "yyyy-MM-dd"));
  const [refresh, setRefresh] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories(getCategories());
  }, [refresh]);

  const monthSummary = useMemo(
    () => getMonthlySummary(format(parseISO(today), "yyyy-MM")),
    [today, refresh],
  );
  const recent = useMemo(() => getRecentExpenses(6), [refresh]);

  // Mock income based on expenses for UI display
  const income = useMemo(() => {
    const prevMonth = format(subMonths(parseISO(today), 1), "yyyy-MM");
    const prev = getMonthlySummary(prevMonth);
    return monthSummary.total * 2.63 + prev.total * 0.1;
  }, [monthSummary.total, today, refresh]);
  const balance = income - monthSummary.total;
  const prevMonth = useMemo(
    () => getMonthlySummary(format(subMonths(parseISO(today), 1), "yyyy-MM")),
    [today, refresh],
  );
  const balanceChange =
    prevMonth.total > 0
      ? ((balance - prevMonth.total * 1.6) / (prevMonth.total * 1.6)) * 100
      : 12.6;

  const handleDelete = (id: string) => {
    if (confirm("确定删除这笔记录吗？")) {
      deleteExpense(id);
      setRefresh((r) => r + 1);
    }
  };

  const getCat = (id: string) => categories.find((c) => c.id === id);

  // Line chart data - monthly trend
  const lineData = useMemo(() => {
    const start = startOfMonth(parseISO(today));
    const end = endOfMonth(parseISO(today));
    const days = eachDayOfInterval({ start, end });
    const expenses = getExpenses();
    return days.map((day) => {
      const ds = format(day, "yyyy-MM-dd");
      const total = expenses
        .filter((e) => e.expenseDate === ds && e.type === "expense")
        .reduce((s, e) => s + e.amount, 0);
      return { name: format(day, "d"), amount: total };
    });
  }, [today, refresh]);

  // Pie chart data - category breakdown
  const pieData = useMemo(() => {
    return monthSummary.categoryBreakdown
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
  }, [monthSummary, categories]);

  const totalPie = pieData.reduce((s, d) => s + d.value, 0);
  const topCategory = pieData[0];

  const displayMonth = format(parseISO(today), "yyyy年M月");

  return (
    <div className="relative">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-[#3D3D3D]">今日记账</span>
            <ChevronDown size={16} className="text-[#8C8678]" />
          </div>
          <div className="flex items-center gap-3">
            <button
              className="p-1.5 rounded-full"
              style={{
                backgroundColor: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(4px)",
              }}
            >
              <Search size={18} className="text-[#5A8F7B]" />
            </button>
            <button
              className="p-1.5 rounded-full relative"
              style={{
                backgroundColor: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(4px)",
              }}
            >
              <CalendarDays size={18} className="text-[#5A8F7B]" />
              <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C45C4A]" />
            </button>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1 text-sm text-[#6B6658]">
          <span>{displayMonth}</span>
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Content */}
      <div className="px-3 space-y-3 relative z-10">
        {/* Monthly Overview Card */}
        <div
          className="relative rounded-xl p-4 pt-8 shadow-sm overflow-hidden"
          style={{
            backgroundImage: "url(/card-1.png)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            minHeight: "180px",
          }}
        >
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div>
              <div className="text-xs text-[#8C8678]">本月支出</div>
              <div className="text-xl font-bold text-[#5A8F7B] mt-1">
                ¥
                {monthSummary.total.toLocaleString("zh-CN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-[10px] text-[#B5AE9E] mt-0.5">
                日均支出 ¥{monthSummary.dailyAverage.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#8C8678]">本月收入</div>
              <div className="text-xl font-bold text-[#C45C4A] mt-1">
                ¥
                {income.toLocaleString("zh-CN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-[10px] text-[#B5AE9E] mt-0.5">
                日均收入 ¥{(income / 30).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#8C8678]">结余</div>
              <div className="text-xl font-bold text-[#C4954A] mt-1">
                ¥
                {balance.toLocaleString("zh-CN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-[10px] text-[#C4954A] mt-0.5 flex items-center justify-center gap-0.5">
                较上月 {balanceChange >= 0 ? "+" : ""}
                {balanceChange.toFixed(1)}%
                <TrendingUp size={10} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Line Chart */}
          <div
            className="rounded-xl p-3 shadow-sm"
            style={{
              backgroundImage: "url(/card-2.png)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#3D3D3D]">
                支出趋势
              </span>
              <button
                className="flex items-center gap-0.5 text-[10px] text-[#8C8678] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(240, 237, 229, 0.6)" }}
              >
                按日 <ChevronDown size={10} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={lineData}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: "#B5AE9E" }}
                  interval={6}
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
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#5A8F7B"
                  strokeWidth={1.5}
                  dot={false}
                  fillOpacity={0.1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div
            className="rounded-xl p-3 shadow-sm"
            style={{
              backgroundImage: "url(/card-2.png)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="text-xs font-medium text-[#3D3D3D] mb-1">
              支出分类占比
            </div>
            <div className="flex items-center">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={100}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={42}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {topCategory && (
                  <div className="text-center -mt-1">
                    <div className="text-sm font-bold text-[#3D3D3D]">
                      {((topCategory.value / totalPie) * 100).toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-[#8C8678]">
                      {topCategory.name}
                    </div>
                  </div>
                )}
              </div>
              <div
                className="w-[1px] h-16 mx-1"
                style={{ backgroundColor: "#E8E4DA" }}
              />
              <div className="flex-1 space-y-1.5">
                {pieData.slice(0, 5).map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-[10px] text-[#6B6658]">
                        {d.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8C8678]">
                      {((d.value / totalPie) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Common Categories */}
        <div
          className="rounded-xl p-4 shadow-sm"
          style={{
            backgroundImage: "url(/card-2.png)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#3D3D3D]">常用分类</span>
            <button className="text-xs text-[#8C8678]">编辑</button>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={onAdd}
                className="flex flex-col items-center gap-1 transition-transform active:scale-90"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={cat.iconImg}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] text-[#6B6658]">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Records */}
        <div
          className="rounded-xl p-4 shadow-sm"
          style={{
            backgroundImage: "url(/card-2.png)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#3D3D3D]">最近记录</span>
            <button className="text-xs text-[#8C8678] flex items-center gap-0.5">
              查看全部 <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recent.length === 0 && (
              <div className="text-center text-sm py-6 text-[#B5AE9E]">
                还没有记录，快去记一笔吧！
              </div>
            )}
            {recent.map((exp) => {
              const cat = getCat(exp.categoryId);
              const isIncome = exp.type === "income";
              const displayAmount = Math.abs(exp.amount);
              return (
                <div key={exp.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden">
                      <img
                        src={cat?.iconImg || "/topic-1-1.png"}
                        alt={cat?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#3D3D3D]">
                        {exp.description || cat?.name}
                      </div>
                      <div className="text-[10px] text-[#B5AE9E]">
                        {exp.description ? cat?.name + " " : ""}
                        {exp.expenseDate === format(new Date(), "yyyy-MM-dd")
                          ? "今天"
                          : exp.expenseDate ===
                              format(
                                new Date(Date.now() - 86400000),
                                "yyyy-MM-dd",
                              )
                            ? "昨天"
                            : exp.expenseDate}{" "}
                        {exp.expenseTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isIncome ? "text-[#C45C4A]" : "text-[#5A8F7B]"
                      }`}
                    >
                      {isIncome ? "+" : "-"}¥{displayAmount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-[#D0C8B8] hover:text-[#C45C4A] transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
