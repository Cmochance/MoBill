"use client";

import { useState } from "react";
import { Category } from "@/lib/types";
import type { Expense } from "@/lib/types";
import {
  getMonthlySummary,
  getMonthlyIncome,
  getCategories,
  getExpenses,
  deleteExpense,
} from "@/lib/data";
import { getRecordCategoryName, sortRecordsByTimeDesc } from "@/lib/records";
import {
  format,
  parseISO,
  eachDayOfInterval,
  subMonths,
  subDays,
  endOfWeek,
  startOfWeek,
} from "date-fns";
import {
  Search,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { XAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";
import { CardFrame } from "./CardFrame";
import { DayDatePicker } from "./DayDatePicker";

type RecordRange = "day" | "month" | "year";

const RECORD_RANGE_OPTIONS: Array<{ value: RecordRange; label: string }> = [
  { value: "day", label: "日" },
  { value: "month", label: "月" },
  { value: "year", label: "年" },
];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
const WEEKDAY_AXIS_LABELS = ["一", "二", "三", "四", "五", "六", "日"];
const YEARS_PER_PAGE = 12;

export default function HomeView({
  onAdd,
  onEditCategories,
}: {
  onAdd: () => void;
  onEditCategories: () => void;
}) {
  const today = format(new Date(), "yyyy-MM-dd");
  const todayDate = parseISO(today);
  const currentYear = Number(format(todayDate, "yyyy"));
  const yesterday = format(subDays(parseISO(today), 1), "yyyy-MM-dd");
  const [, setRefresh] = useState(0);
  const [categories] = useState<Category[]>(() => getCategories());
  const [showRecordPanel, setShowRecordPanel] = useState(false);
  const [openRecordPicker, setOpenRecordPicker] = useState<RecordRange | null>(
    null,
  );
  const [visibleMonthYear, setVisibleMonthYear] = useState(currentYear);
  const [visibleYearStart, setVisibleYearStart] = useState(
    Math.floor(currentYear / 10) * 10,
  );
  const [recordRange, setRecordRange] = useState<RecordRange>("day");
  const [selectedDay, setSelectedDay] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(
    format(parseISO(today), "yyyy-MM"),
  );
  const [selectedYear, setSelectedYear] = useState(
    format(parseISO(today), "yyyy"),
  );
  const monthSummary = getMonthlySummary(format(parseISO(today), "yyyy-MM"));
  const allRecords = getExpenses();
  const todayRecords = sortRecordsByTimeDesc(
    allRecords.filter((record) => record.expenseDate === today),
  );
  const filteredPanelRecords = sortRecordsByTimeDesc(
    allRecords.filter((record) => {
      if (recordRange === "day") {
        return record.expenseDate === selectedDay;
      }
      if (recordRange === "month") {
        return record.expenseDate.startsWith(`${selectedMonth}-`);
      }
      return selectedYear
        ? record.expenseDate.startsWith(`${selectedYear}-`)
        : false;
    }),
  );

  // 真实收入、支出、结余计算
  const income = getMonthlyIncome(format(parseISO(today), "yyyy-MM"));
  const expenseTotal = monthSummary.total;
  const balance = income - expenseTotal;
  const prevMonthStr = format(subMonths(parseISO(today), 1), "yyyy-MM");
  const prevIncome = getMonthlyIncome(prevMonthStr);
  const prevExpense = getMonthlySummary(prevMonthStr);
  const prevBalance = prevIncome - prevExpense.total;
  const balanceChange =
    prevBalance !== 0
      ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100
      : 0;

  const handleDelete = (id: string) => {
    if (confirm("确定删除这笔记录吗？")) {
      deleteExpense(id);
      setRefresh((r) => r + 1);
    }
  };

  const getCat = (id: string) => categories.find((c) => c.id === id);
  const getRecordDateLabel = (record: Expense) => {
    if (record.expenseDate === today) return "今天";
    if (record.expenseDate === yesterday) return "昨天";
    return record.expenseDate;
  };

  const renderRecordList = (
    records: Expense[],
    emptyText: string,
    showDate: boolean,
  ) => (
    <div className="space-y-3">
      {records.length === 0 && (
        <div className="text-center text-sm py-6 text-[#B5AE9E]">
          {emptyText}
        </div>
      )}
      {records.map((exp) => {
        const cat = getCat(exp.categoryId);
        const isIncome = exp.type === "income";
        const categoryName = getRecordCategoryName(exp, categories);
        const displayAmount = Math.abs(exp.amount);
        return (
          <div key={exp.id} className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
                <img
                  src={cat?.iconImg || "/topic-1-1.png"}
                  alt={cat?.name || categoryName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-[#3D3D3D]">
                  {exp.description || categoryName}
                </div>
                <div className="text-[10px] text-[#B5AE9E]">
                  {exp.description ? categoryName + " " : ""}
                  {showDate ? `${getRecordDateLabel(exp)} ` : ""}
                  {exp.expenseTime}
                </div>
              </div>
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  isIncome ? "text-[#C45C4A]" : "text-[#5A8F7B]"
                }`}
              >
                {isIncome ? "+" : "-"}¥{displayAmount.toFixed(2)}
              </span>
              <button
                onClick={() => handleDelete(exp.id)}
                className="text-[#D0C8B8] transition-colors hover:text-[#C45C4A]"
                aria-label="删除记录"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const recordRangeLabel =
    recordRange === "day" ? "选择日期" : recordRange === "month" ? "选择月份" : "选择年份";
  const displaySelectedDay = /^\d{4}-\d{2}-\d{2}$/.test(selectedDay)
    ? format(parseISO(selectedDay), "yyyy年MM月dd日")
    : "";
  const displaySelectedMonth = /^\d{4}-\d{2}$/.test(selectedMonth)
    ? `${selectedMonth.slice(5, 7)}/${selectedMonth.slice(0, 4)}`
    : "";
  const displaySelectedYear = /^\d{4}$/.test(selectedYear)
    ? `${selectedYear}年`
    : "";
  const currentMonth = format(todayDate, "yyyy-MM");
  const selectedMonthYear = /^\d{4}-\d{2}$/.test(selectedMonth)
    ? Number(selectedMonth.slice(0, 4))
    : currentYear;
  const selectedMonthNumber = /^\d{4}-\d{2}$/.test(selectedMonth)
    ? Number(selectedMonth.slice(5, 7))
    : Number(format(todayDate, "MM"));
  const selectedYearNumber = /^\d{4}$/.test(selectedYear)
    ? Number(selectedYear)
    : currentYear;
  const visibleYears = Array.from(
    { length: YEARS_PER_PAGE },
    (_, index) => visibleYearStart + index,
  );
  const selectPanelMonth = (month: number) => {
    setSelectedMonth(`${visibleMonthYear}-${String(month).padStart(2, "0")}`);
    setOpenRecordPicker(null);
  };
  const selectCurrentMonthForPanel = () => {
    setSelectedMonth(currentMonth);
    setVisibleMonthYear(currentYear);
    setOpenRecordPicker(null);
  };
  const selectPanelYear = (year: number) => {
    setSelectedYear(String(year));
    setOpenRecordPicker(null);
  };
  const selectCurrentYearForPanel = () => {
    setSelectedYear(String(currentYear));
    setVisibleYearStart(Math.floor(currentYear / 10) * 10);
    setOpenRecordPicker(null);
  };

  // Line chart data - current week trend
  const lineData = (() => {
    const start = startOfWeek(todayDate, { weekStartsOn: 1 });
    const end = endOfWeek(todayDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    return days.map((day, index) => {
      const ds = format(day, "yyyy-MM-dd");
      const total = allRecords
        .filter((e) => e.expenseDate === ds && e.type === "expense")
        .reduce((s, e) => s + e.amount, 0);
      return { name: WEEKDAY_AXIS_LABELS[index], amount: total };
    });
  })();

  // Pie chart data - category breakdown
  const pieData = monthSummary.categoryBreakdown
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

  const totalPie = pieData.reduce((s, d) => s + d.value, 0);

  const displayDate = format(parseISO(today), "yyyy年M月d日");

  return (
    <div className="relative">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-end justify-between">
          <div className="flex min-w-0 items-end gap-3">
            <span className="brand-title text-xl font-bold leading-none text-[#3D3D3D]">
              墨风记账
            </span>
            <span className="whitespace-nowrap text-sm leading-none text-[#6B6658]">
              {displayDate}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled
              className="p-1.5 rounded-full cursor-not-allowed opacity-45"
              style={{
                backgroundColor: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(4px)",
              }}
              aria-label="搜索暂未开放"
            >
              <Search size={18} className="text-[#5A8F7B]" />
            </button>
            <button
              onClick={() => setShowRecordPanel(true)}
              className="p-1.5 rounded-full relative active:scale-95 transition-transform"
              style={{
                backgroundColor: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(4px)",
              }}
              aria-label="打开最近记录"
            >
              <CalendarDays size={18} className="text-[#5A8F7B]" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 space-y-3 relative z-10">
        {/* Monthly Overview Card */}
        <CardFrame
          variant="card-1"
          className="rounded-xl shadow-sm"
          contentClassName="p-4 pt-8"
          style={{ minHeight: "180px" }}
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
        </CardFrame>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Line Chart */}
          <CardFrame className="rounded-xl shadow-sm" contentClassName="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#3D3D3D]">
                本周支出趋势
              </span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient
                    id="homeTrendColor"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: "#B5AE9E" }}
                  interval={0}
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
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--primary)"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#homeTrendColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardFrame>

          {/* Category Breakdown */}
          <CardFrame className="rounded-xl shadow-sm" contentClassName="p-3">
            <div className="text-xs font-medium text-[#3D3D3D] mb-2">
              支出占比
            </div>
            <div className="space-y-2">
              {pieData.slice(0, 6).map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-xs text-[#6B6658]">{d.name}</span>
                  </div>
                  <span className="text-xs text-[#8C8678]">
                    {((d.value / totalPie) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardFrame>
        </div>

        {/* Common Categories */}
        <CardFrame className="rounded-xl shadow-sm" contentClassName="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#3D3D3D]">常用分类</span>
            <button
              onClick={onEditCategories}
              className="text-xs text-[#9D9688] transition-colors active:text-[#5A8F7B]"
            >
              编辑
            </button>
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
        </CardFrame>

        {/* Today Ledger */}
        <CardFrame className="rounded-xl shadow-sm" contentClassName="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#3D3D3D]">今日账本</span>
          </div>
          {renderRecordList(todayRecords, "今天还没有记录，快去记一笔吧！", false)}
        </CardFrame>
      </div>

      {showRecordPanel && (
        <div className="fixed inset-0 z-[80] mx-auto max-w-md bg-[#F5F0E8]">
          <CardFrame
            className="h-full rounded-none shadow-xl"
            contentClassName="flex h-full flex-col px-4 pb-6 pt-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-[#3D3D3D]">最近记录</div>
              </div>
              <button
                onClick={() => {
                  setShowRecordPanel(false);
                  setOpenRecordPicker(null);
                }}
                className="rounded-full p-2 text-[#8C8678] active:bg-[#F5F0E8]"
                aria-label="关闭最近记录"
              >
                <X size={20} />
              </button>
            </div>

            <div
              className="mt-4 flex rounded-lg p-0.5"
              style={{
                backgroundColor: "rgba(245, 240, 232, 0.68)",
                border: "1px solid #E8E4DA",
              }}
            >
              {RECORD_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setRecordRange(option.value);
                    setOpenRecordPicker(null);
                  }}
                  className="flex-1 rounded-md py-1.5 text-xs font-medium transition-colors"
                  style={{
                    color: recordRange === option.value ? "#FFF" : "#8C8678",
                    backgroundColor:
                      recordRange === option.value ? "#5A8F7B" : "transparent",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div
              className="mt-3 flex items-center justify-between rounded-lg px-3 py-2"
              style={{
                backgroundColor: "rgba(245, 240, 232, 0.62)",
                border: "1px solid #E8E4DA",
              }}
            >
              <span className="text-xs text-[#8C8678]">{recordRangeLabel}</span>
              {recordRange === "day" && (
                <button
                  type="button"
                  onClick={() => {
                    setOpenRecordPicker((picker) =>
                      picker === "day" ? null : "day",
                    );
                  }}
                  className="flex items-center gap-2 rounded-full px-2 py-1 text-sm font-medium text-[#3D3D3D] transition-colors active:bg-[#E8E4DA]"
                  aria-label="选择日期"
                  aria-expanded={openRecordPicker === "day"}
                >
                  <span>{displaySelectedDay}</span>
                  <CalendarDays size={18} className="text-[#3D3D3D]" />
                </button>
              )}
              {recordRange === "month" && (
                <button
                  type="button"
                  onClick={() => {
                    setVisibleMonthYear(selectedMonthYear);
                    setOpenRecordPicker((picker) =>
                      picker === "month" ? null : "month",
                    );
                  }}
                  className="flex items-center gap-2 rounded-full px-2 py-1 text-sm font-medium text-[#3D3D3D] transition-colors active:bg-[#E8E4DA]"
                  aria-label="选择月份"
                  aria-expanded={openRecordPicker === "month"}
                >
                  <span>{displaySelectedMonth}</span>
                  <CalendarDays size={18} className="text-[#3D3D3D]" />
                </button>
              )}
              {recordRange === "year" && (
                <button
                  type="button"
                  onClick={() => {
                    setVisibleYearStart(Math.floor(selectedYearNumber / 10) * 10);
                    setOpenRecordPicker((picker) =>
                      picker === "year" ? null : "year",
                    );
                  }}
                  className="flex items-center gap-2 rounded-full px-2 py-1 text-sm font-medium text-[#3D3D3D] transition-colors active:bg-[#E8E4DA]"
                  aria-label="选择年份"
                  aria-expanded={openRecordPicker === "year"}
                >
                  <span>{displaySelectedYear}</span>
                  <CalendarDays size={18} className="text-[#3D3D3D]" />
                </button>
              )}
            </div>

            {recordRange === "day" && openRecordPicker === "day" && (
              <DayDatePicker
                value={selectedDay}
                onChange={setSelectedDay}
                onClose={() => setOpenRecordPicker(null)}
                className="mt-3"
              />
            )}

            {recordRange === "month" && openRecordPicker === "month" && (
              <div
                className="mt-3 rounded-xl px-3 py-3 shadow-sm"
                style={{
                  backgroundColor: "rgba(255, 253, 249, 0.72)",
                  border: "1px solid #E8E4DA",
                }}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setVisibleMonthYear((year) => year - 1)}
                    className="rounded-full p-1.5 text-[#6B6658] transition-colors active:bg-[#E8E4DA]"
                    aria-label="上一年"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="text-sm font-semibold text-[#3D3D3D]">
                    {visibleMonthYear}年
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisibleMonthYear((year) => year + 1)}
                    className="rounded-full p-1.5 text-[#6B6658] transition-colors active:bg-[#E8E4DA]"
                    aria-label="下一年"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  {MONTH_OPTIONS.map((month) => {
                    const monthValue = `${visibleMonthYear}-${String(
                      month,
                    ).padStart(2, "0")}`;
                    const isSelected =
                      visibleMonthYear === selectedMonthYear &&
                      month === selectedMonthNumber;
                    const isCurrent = monthValue === currentMonth;

                    return (
                      <button
                        key={monthValue}
                        type="button"
                        onClick={() => selectPanelMonth(month)}
                        className="h-9 rounded-lg text-sm font-semibold transition-colors"
                        style={{
                          color: isSelected ? "#FFF" : "#3D3D3D",
                          backgroundColor: isSelected
                            ? "#5A8F7B"
                            : isCurrent
                              ? "rgba(196, 149, 74, 0.12)"
                              : "transparent",
                          border: isSelected
                            ? "1px solid #C4954A"
                            : isCurrent
                              ? "1px solid rgba(196, 149, 74, 0.4)"
                              : "1px solid transparent",
                        }}
                        aria-label={`${visibleMonthYear}年${String(
                          month,
                        ).padStart(2, "0")}月`}
                      >
                        {String(month).padStart(2, "0")}月
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setOpenRecordPicker(null)}
                    className="rounded-full px-3 py-1 text-xs font-medium text-[#8C8678] transition-colors active:bg-[#E8E4DA]"
                  >
                    收起
                  </button>
                  <button
                    type="button"
                    onClick={selectCurrentMonthForPanel}
                    className="rounded-full px-3 py-1 text-xs font-semibold text-[#5A8F7B] transition-colors active:bg-[#E8E4DA]"
                  >
                    本月
                  </button>
                </div>
              </div>
            )}

            {recordRange === "year" && openRecordPicker === "year" && (
              <div
                className="mt-3 rounded-xl px-3 py-3 shadow-sm"
                style={{
                  backgroundColor: "rgba(255, 253, 249, 0.72)",
                  border: "1px solid #E8E4DA",
                }}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleYearStart((start) => start - YEARS_PER_PAGE)
                    }
                    className="rounded-full p-1.5 text-[#6B6658] transition-colors active:bg-[#E8E4DA]"
                    aria-label="上一组年份"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="text-sm font-semibold text-[#3D3D3D]">
                    {visibleYearStart}-{visibleYearStart + YEARS_PER_PAGE - 1}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleYearStart((start) => start + YEARS_PER_PAGE)
                    }
                    className="rounded-full p-1.5 text-[#6B6658] transition-colors active:bg-[#E8E4DA]"
                    aria-label="下一组年份"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  {visibleYears.map((year) => {
                    const isSelected = year === selectedYearNumber;
                    const isCurrent = year === currentYear;

                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => selectPanelYear(year)}
                        className="h-9 rounded-lg text-sm font-semibold transition-colors"
                        style={{
                          color: isSelected ? "#FFF" : "#3D3D3D",
                          backgroundColor: isSelected
                            ? "#5A8F7B"
                            : isCurrent
                              ? "rgba(196, 149, 74, 0.12)"
                              : "transparent",
                          border: isSelected
                            ? "1px solid #C4954A"
                            : isCurrent
                              ? "1px solid rgba(196, 149, 74, 0.4)"
                              : "1px solid transparent",
                        }}
                        aria-label={`${year}年`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setOpenRecordPicker(null)}
                    className="rounded-full px-3 py-1 text-xs font-medium text-[#8C8678] transition-colors active:bg-[#E8E4DA]"
                  >
                    收起
                  </button>
                  <button
                    type="button"
                    onClick={selectCurrentYearForPanel}
                    className="rounded-full px-3 py-1 text-xs font-semibold text-[#5A8F7B] transition-colors active:bg-[#E8E4DA]"
                  >
                    今年
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 no-scrollbar">
              {renderRecordList(
                filteredPanelRecords,
                "当前范围内还没有记录",
                true,
              )}
            </div>
          </CardFrame>
        </div>
      )}
    </div>
  );
}
