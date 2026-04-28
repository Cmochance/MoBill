"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DayDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  className?: string;
  variant?: "framed" | "plain";
}

function parseDateValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseISO(value) : new Date();
}

export function DayDatePicker({
  value,
  onChange,
  onClose,
  className = "",
  variant = "framed",
}: DayDatePickerProps) {
  const today = new Date();
  const selectedDate = parseDateValue(value);
  const isPlain = variant === "plain";
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(selectedDate),
  );

  const monthStart = startOfMonth(visibleMonth);
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 }),
  });

  const selectDate = (day: Date) => {
    onChange(format(day, "yyyy-MM-dd"));
    onClose?.();
  };

  const selectToday = () => {
    onChange(format(today, "yyyy-MM-dd"));
    onClose?.();
  };

  return (
    <div
      className={`rounded-xl px-3 py-3 ${isPlain ? "" : "shadow-sm"} ${className}`}
      style={{
        backgroundColor: isPlain ? "transparent" : "rgba(255, 253, 249, 0.72)",
        border: isPlain ? "1px solid transparent" : "1px solid #E8E4DA",
      }}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
          className="rounded-full p-1.5 text-[#6B6658] transition-colors active:bg-[#E8E4DA]"
          aria-label="上个月"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-sm font-semibold text-[#3D3D3D]">
          {format(monthStart, "yyyy年MM月")}
        </div>
        <button
          type="button"
          onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
          className="rounded-full p-1.5 text-[#6B6658] transition-colors active:bg-[#E8E4DA]"
          aria-label="下个月"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-medium text-[#8C8678]">
        {["日", "一", "二", "三", "四", "五", "六"].map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={format(day, "yyyy-MM-dd")}
              type="button"
              onClick={() => selectDate(day)}
              className="h-8 rounded-lg text-sm font-semibold transition-colors"
              style={{
                color: isSelected
                  ? "#FFF"
                  : isCurrentMonth
                    ? "#3D3D3D"
                    : "#B5AE9E",
                backgroundColor: isSelected
                  ? "#5A8F7B"
                  : isToday
                    ? "rgba(196, 149, 74, 0.12)"
                    : "transparent",
                border: isSelected
                  ? "1px solid #C4954A"
                  : isToday
                    ? "1px solid rgba(196, 149, 74, 0.4)"
                    : "1px solid transparent",
              }}
              aria-label={format(day, "yyyy年MM月dd日")}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-3 py-1 text-xs font-medium text-[#8C8678] transition-colors active:bg-[#E8E4DA]"
        >
          收起
        </button>
        <button
          type="button"
          onClick={selectToday}
          className="rounded-full px-3 py-1 text-xs font-semibold text-[#5A8F7B] transition-colors active:bg-[#E8E4DA]"
        >
          今天
        </button>
      </div>
    </div>
  );
}
