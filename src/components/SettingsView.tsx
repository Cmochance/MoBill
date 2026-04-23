"use client";

import { useState, useEffect } from "react";
import { Category, MonthlyBudget } from "@/lib/types";
import {
  getCategories,
  addCategory,
  deleteCategory,
  setBudget as saveBudget,
  getMonthlyBudget,
  exportToCSV,
} from "@/lib/data";
import { format } from "date-fns";
import { Plus, Trash2, Download, Save } from "lucide-react";
import CategoryIcon from "./CategoryIcon";

const PRESET_COLORS = [
  "#9E7A6E",
  "#6E8A7E",
  "#A89882",
  "#9A8292",
  "#8A7E6E",
  "#6E8A6E",
  "#6E7E8E",
  "#A0A0A0",
  "#8E7A6E",
  "#7A8A7E",
  "#9A8A72",
  "#8E8292",
  "#7E7A6E",
  "#6E7E6E",
  "#5E6E7E",
  "#909090",
];

export default function SettingsView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [budget, setBudget] = useState("");
  const [currentBudget, setCurrentBudget] = useState(0);
  const [refresh, setRefresh] = useState(0);

  const yearMonth = format(new Date(), "yyyy-MM");

  useEffect(() => {
    const cats = getCategories();
    setCategories(cats);
    const b = getMonthlyBudget(yearMonth);
    setCurrentBudget(b);
    setBudget(b > 0 ? b.toString() : "");
  }, [yearMonth, refresh]);

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const cat: Category = {
      id: "cat_" + Date.now(),
      name: newCatName.trim(),
      icon: "ShoppingBag",
      iconImg: "/topic-1-7.png",
      color: newCatColor,
      sortOrder: categories.length,
    };
    addCategory(cat);
    setNewCatName("");
    setShowAddCat(false);
    setRefresh((r) => r + 1);
  };

  const handleDeleteCat = (id: string) => {
    if (
      confirm('确定删除此分类吗？该分类下的支出记录将保留但显示为"未知分类"。')
    ) {
      deleteCategory(id);
      setRefresh((r) => r + 1);
    }
  };

  const handleSaveBudget = () => {
    const num = parseFloat(budget);
    if (isNaN(num) || num < 0) return;
    const b: MonthlyBudget = {
      id: "budget_" + yearMonth,
      yearMonth,
      totalBudget: num,
    };
    saveBudget(b);
    setCurrentBudget(num);
    setRefresh((r) => r + 1);
  };

  const handleExport = () => {
    const csv = exportToCSV();
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `记账导出_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
  };

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      <h1 className="text-lg font-bold" style={{ color: "#1A1A1A" }}>
        设置
      </h1>

      {/* Budget Setting */}
      <div
        className="rounded-lg p-4 shadow-sm"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E3DE" }}
      >
        <div className="text-sm font-medium mb-3" style={{ color: "#1A1A1A" }}>
          月度预算
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: "#9A9894" }}
            >
              ¥
            </span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="设置本月预算"
              className="w-full pl-7 pr-3 py-2.5 rounded-md text-sm outline-none"
              style={{ backgroundColor: "#F8F7F5", color: "#1A1A1A" }}
            />
          </div>
          <button
            onClick={handleSaveBudget}
            className="px-4 py-2.5 text-white rounded-md text-sm font-medium flex items-center gap-1.5 active:scale-95 transition-transform"
            style={{ backgroundColor: "#333333" }}
          >
            <Save size={14} />
            保存
          </button>
        </div>
        {currentBudget > 0 && (
          <div className="mt-2 text-xs" style={{ color: "#9A9894" }}>
            当前预算：¥{currentBudget.toFixed(2)}
          </div>
        )}
      </div>

      {/* Category Management */}
      <div
        className="rounded-lg p-4 shadow-sm"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E3DE" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
            支出分类
          </div>
          <button
            onClick={() => setShowAddCat(!showAddCat)}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded-md"
            style={{ color: "#333333", backgroundColor: "#F0EEEA" }}
          >
            <Plus size={14} />
            新增
          </button>
        </div>

        {showAddCat && (
          <div
            className="rounded-md p-3 mb-3 space-y-3"
            style={{ backgroundColor: "#F8F7F5" }}
          >
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="分类名称"
              className="w-full px-3 py-2 rounded-md text-sm outline-none"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#1A1A1A",
                border: "1px solid #E5E3DE",
              }}
            />
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewCatColor(c)}
                  className="w-6 h-6 rounded-sm transition-transform"
                  style={{
                    backgroundColor: c,
                    outline: newCatColor === c ? "2px solid #333" : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
            <button
              onClick={handleAddCategory}
              disabled={!newCatName.trim()}
              className="w-full py-2 text-white rounded-md text-sm font-medium disabled:opacity-40 active:scale-[0.98] transition-all"
              style={{ backgroundColor: "#333333" }}
            >
              添加分类
            </button>
          </div>
        )}

        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 rounded-md"
              style={{ backgroundColor: "#F8F7F5" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} size={14} />
                </div>
                <span className="text-sm" style={{ color: "#1A1A1A" }}>
                  {cat.name}
                </span>
              </div>
              {!cat.id.startsWith("default_") && (
                <button
                  onClick={() => handleDeleteCat(cat.id)}
                  className="p-1 transition-colors"
                  style={{ color: "#9A9894" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#9E6A5E")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#9A9894")
                  }
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div
        className="rounded-lg p-4 shadow-sm"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E3DE" }}
      >
        <div className="text-sm font-medium mb-3" style={{ color: "#1A1A1A" }}>
          数据管理
        </div>
        <button
          onClick={handleExport}
          className="w-full py-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ backgroundColor: "#F0EEEA", color: "#333333" }}
        >
          <Download size={16} />
          导出 CSV 数据
        </button>
      </div>

      <div className="text-center text-xs py-4" style={{ color: "#B0ADA8" }}>
        Mochan Billing · 本地记账应用
      </div>
    </div>
  );
}
