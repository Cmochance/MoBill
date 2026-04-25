"use client";

import {
  ExpenseCategory,
  INCOME_CATEGORIES,
  IncomeCategory,
} from "./options";

interface CategorySelectorProps {
  recordType: "expense" | "income";
  expenseCategories: ExpenseCategory[];
  selectedCat: string;
  page: number;
  onSelect: (id: string) => void;
  onPageChange: (page: number) => void;
}

const CATS_PER_PAGE = 8;

export function CategorySelector({
  recordType,
  expenseCategories,
  selectedCat,
  page,
  onSelect,
  onPageChange,
}: CategorySelectorProps) {
  const categories =
    recordType === "expense" ? expenseCategories : INCOME_CATEGORIES;
  const totalPages = Math.ceil(categories.length / CATS_PER_PAGE);
  const pageCats = categories.slice(
    page * CATS_PER_PAGE,
    (page + 1) * CATS_PER_PAGE,
  );

  return (
    <div
      className="rounded-xl p-4 shadow-sm"
      style={{
        backgroundImage: "url(/card-2.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="grid grid-cols-4 gap-3">
        {recordType === "expense"
          ? (pageCats as ExpenseCategory[]).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-md transition-all"
              >
                <div
                  className="w-12 h-12 rounded-full overflow-hidden transition-all"
                  style={{
                    boxShadow:
                      selectedCat === cat.id
                        ? `0 0 0 2px ${cat.color}`
                        : "none",
                  }}
                >
                  <img
                    src={cat.iconImg}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs" style={{ color: "#555" }}>
                  {cat.name}
                </span>
              </button>
            ))
          : (pageCats as IncomeCategory[]).map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-md transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: `${cat.color}18`,
                      boxShadow:
                        selectedCat === cat.id
                          ? `0 0 0 2px ${cat.color}`
                          : "none",
                    }}
                  >
                    <Icon size={22} color={cat.color} strokeWidth={2} />
                  </div>
                  <span className="text-xs" style={{ color: "#555" }}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: page === i ? "#5A8F7B" : "#D0C8B8",
              }}
              aria-label={`第 ${i + 1} 页分类`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
