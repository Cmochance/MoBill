"use client";

import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";

export interface CategoryDatum {
  name: string;
  value: number;
  color: string;
}

interface SummaryCardProps {
  title: string;
  total: number;
  diff: number;
  budgetProgress?: number;
}

export function SummaryCard({
  title,
  total,
  diff,
  budgetProgress,
}: SummaryCardProps) {
  return (
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
            {title}
          </div>
          <div className="text-3xl font-bold mt-1 text-[#3D3D3D]">
            ¥{total.toFixed(2)}
          </div>
        </div>
        <div
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{
            backgroundColor: diff >= 0 ? "#C45C4A12" : "#5A8F7B12",
            color: diff >= 0 ? "#C45C4A" : "#5A8F7B",
          }}
        >
          {diff >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {diff >= 0 ? "+" : ""}
          {diff.toFixed(0)}
        </div>
      </div>
      {budgetProgress !== undefined && budgetProgress > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1 text-[#8C8678]">
            <span>预算进度</span>
            <span>{(budgetProgress * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-[#E8E4DA]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(budgetProgress * 100, 100)}%`,
                backgroundColor:
                  budgetProgress > 1
                    ? "#C45C4A"
                    : budgetProgress > 0.8
                      ? "#C4954A"
                      : "#5A8F7B",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryRankingCardProps {
  title: string;
  data: CategoryDatum[];
  total: number;
}

export function CategoryRankingCard({
  title,
  data,
  total,
}: CategoryRankingCardProps) {
  return (
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
        <span className="text-sm font-medium text-[#3D3D3D]">{title}</span>
      </div>
      <div className="space-y-2">
        {data.slice(0, 5).map((d) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs text-[#3D3D3D]">{d.name}</span>
            </div>
            <span className="text-xs text-[#8C8678]">
              {((d.value / (total || 1)) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
      <button
        disabled
        className="mt-3 text-xs text-[#9D9688] flex items-center gap-0.5 cursor-not-allowed opacity-55"
      >
        查看全部分类 <ChevronRight size={12} />
      </button>
    </div>
  );
}

interface InsightCardProps {
  title: string;
  categoryName?: string;
  categoryIcon?: string;
  primaryLabel?: string;
  primaryValue?: number;
  secondaryLabel?: string;
  secondaryValue?: string;
}

export function InsightCard({
  title,
  categoryName,
  categoryIcon,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
}: InsightCardProps) {
  return (
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
        <span className="text-sm font-medium text-[#3D3D3D]">{title}</span>
      </div>
      {categoryName && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src={categoryIcon || "/topic-1-1.png"}
                alt={categoryName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-[#6B6658]">{categoryName}</span>
          </div>
          <div className="space-y-1 text-xs">
            {primaryLabel && primaryValue !== undefined && (
              <div className="flex justify-between">
                <span className="text-[#8C8678]">{primaryLabel}</span>
                <span className="text-[#3D3D3D] font-medium">
                  ¥{primaryValue.toFixed(2)}
                </span>
              </div>
            )}
            {secondaryLabel && secondaryValue && (
              <div className="flex justify-between">
                <span className="text-[#8C8678]">{secondaryLabel}</span>
                <span className="text-[#3D3D3D] font-medium">
                  {secondaryValue}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
