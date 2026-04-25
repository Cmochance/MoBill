"use client";

import { useState } from "react";
import { Category } from "@/lib/types";
import {
  getMonthlySummary,
  getCategories,
  getBudgets,
  setBudget,
} from "@/lib/data";
import { format, parseISO } from "date-fns";
import { ChevronRight, AlertCircle } from "lucide-react";

export default function BudgetView() {
  const [today] = useState(format(new Date(), "yyyy-MM-dd"));
  const [categories] = useState<Category[]>(() => getCategories());
  const monthKey = format(parseISO(today), "yyyy-MM");
  const [budgetInput, setBudgetInput] = useState(
    () =>
      getBudgets()
        .find((budget) => budget.yearMonth === monthKey)
        ?.totalBudget.toString() || "",
  );
  const [, setRefresh] = useState(0);

  const monthSummary = getMonthlySummary(monthKey);
  const budgets = getBudgets();
  const currentBudget =
    budgets.find((b) => b.yearMonth === monthKey)?.totalBudget ?? 0;
  const progress =
    currentBudget > 0
      ? Math.min((monthSummary.total / currentBudget) * 100, 100)
      : 0;
  const isOver = currentBudget > 0 && monthSummary.total > currentBudget;
  const remaining = currentBudget - monthSummary.total;

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      setBudget({
        id: `budget_${monthKey}`,
        yearMonth: monthKey,
        totalBudget: val,
      });
      setRefresh((r) => r + 1);
    }
  };

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold" style={{ color: "#3D3D3D" }}>
          预算管理
        </h1>
      </div>

      {/* Budget Overview Card */}
      <div
        className="relative rounded-xl p-4 pt-8 shadow-sm overflow-hidden"
        style={{
          backgroundImage: "url(/card-1.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          minHeight: "200px",
        }}
      >
        <div className="grid grid-cols-3 gap-2 text-center mt-2">
          <div>
            <div className="text-xs text-[#8C8678]">本月总预算</div>
            <div className="text-xl font-bold text-[#5A8F7B] mt-1">
              ¥
              {currentBudget.toLocaleString("zh-CN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#8C8678]">已使用</div>
            <div className="text-xl font-bold text-[#C45C4A] mt-1">
              ¥
              {monthSummary.total.toLocaleString("zh-CN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#8C8678]">剩余</div>
            <div className="text-xl font-bold text-[#C4954A] mt-1">
              ¥{remaining.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 px-2">
          <div
            className="h-4 rounded-full overflow-hidden relative"
            style={{ backgroundColor: "#E8E4DA" }}
          >
            <div
              className="h-full rounded-full transition-all flex items-center justify-center"
              style={{
                width: `${progress}%`,
                backgroundColor: isOver ? "#C45C4A" : "#5A8F7B",
              }}
            >
              <span className="text-[10px] text-white font-medium">
                {progress.toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-center text-[#8C8678] mt-2">
            已使用 {progress.toFixed(1)}%，
            {isOver ? "预算已超支，请注意控制" : "合理规划，轻松达成预算目标"}
          </p>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="space-y-3">
        {monthSummary.categoryBreakdown
          .sort((a, b) => b.amount - a.amount)
          .map((cb) => {
            const cat = categories.find((c) => c.id === cb.categoryId);
            if (!cat) return null;
            const catBudget = cat.budgetAmount || currentBudget * 0.2;
            const catProgress = Math.min((cb.amount / catBudget) * 100, 100);
            const catOver = cb.amount > catBudget;
            return (
              <div
                key={cb.categoryId}
                className="rounded-xl p-4 shadow-sm flex items-center gap-3"
                style={{
                  backgroundImage: "url(/card-2.png)",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={cat.iconImg}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#3D3D3D]">
                      {cat.name}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        catOver ? "text-[#C45C4A]" : "text-[#5A8F7B]"
                      }`}
                    >
                      {catProgress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8C8678] mt-0.5">
                    已使用 ¥{cb.amount.toFixed(2)} / ¥{catBudget.toFixed(2)}
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden mt-1.5"
                    style={{ backgroundColor: "#E8E4DA" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${catProgress}%`,
                        backgroundColor: catOver ? "#C45C4A" : cat.color,
                      }}
                    />
                  </div>
                  {catOver && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-[#C45C4A]">
                      <AlertCircle size={10} />
                      {cat.name}预算接近上限，建议控制支出
                    </div>
                  )}
                </div>
                <ChevronRight
                  size={16}
                  className="text-[#D0C8B8] flex-shrink-0"
                />
              </div>
            );
          })}
      </div>

      {/* Budget Tip */}
      <div
        className="rounded-xl p-4 shadow-sm flex items-center gap-3"
        style={{
          backgroundImage: "url(/card-2.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-10 h-10 rounded-full bg-[#5A8F7B18] flex items-center justify-center flex-shrink-0">
          <span className="text-lg">💡</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-[#3D3D3D]">预算小贴士</div>
          <div className="text-[10px] text-[#8C8678] mt-0.5">
            合理分配预算，养成记账习惯，让每一分钱都花得更有价值
          </div>
        </div>
        <ChevronRight size={16} className="text-[#D0C8B8]" />
      </div>

      {/* Budget Input */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={budgetInput}
          onChange={(e) => setBudgetInput(e.target.value)}
          placeholder="设置本月总预算"
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: "rgba(245, 240, 232, 0.8)",
            color: "#3D3D3D",
            border: "1px solid #E8E4DA",
          }}
        />
        <button
          onClick={handleSaveBudget}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white active:scale-95 transition-transform"
          style={{ backgroundColor: "#5A8F7B" }}
        >
          保存
        </button>
      </div>
    </div>
  );
}
