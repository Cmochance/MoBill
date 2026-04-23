"use client";

import { useState, useEffect } from "react";
import { Expense, Category } from "@/lib/types";
import { getCategories, addExpense } from "@/lib/data";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  X,
  Calendar,
  FileText,
  CreditCard,
  ChevronRight,
} from "lucide-react";

export default function AddExpenseView({ onBack }: { onBack: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState(format(new Date(), "HH:mm"));
  const [recordType, setRecordType] = useState<"expense" | "income">("expense");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const cats = getCategories();
    setCategories(cats);
    if (cats.length > 0) setSelectedCat(cats[0].id);
  }, []);

  const handleSubmit = () => {
    const num = parseFloat(amount);
    if (!selectedCat || isNaN(num) || num <= 0) return;
    const expense: Expense = {
      id: Date.now().toString(),
      amount: num,
      categoryId: selectedCat,
      description,
      expenseDate: date,
      expenseTime: time,
      createdAt: new Date().toISOString(),
      type: recordType,
    };
    addExpense(expense);
    setAmount("");
    setDescription("");
    onBack();
  };

  const catsPerPage = 8;
  const totalPages = Math.ceil(categories.length / catsPerPage);
  const pageCats = categories.slice(
    page * catsPerPage,
    (page + 1) * catsPerPage,
  );

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-md hover:bg-[#F5F0E8] transition-colors"
        >
          <ArrowLeft size={20} style={{ color: "#555" }} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[#C4954A]">◇</span>
          <h1 className="text-lg font-bold" style={{ color: "#3D3D3D" }}>
            记一笔
          </h1>
          <span className="text-[#C4954A]">◇</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Type Toggle */}
      <div
        className="flex rounded-lg overflow-hidden"
        style={{
          backgroundColor: "rgba(245, 240, 232, 0.6)",
          border: "1px solid #E8E4DA",
        }}
      >
        <button
          onClick={() => setRecordType("expense")}
          className="flex-1 py-2 text-sm font-medium transition-all"
          style={{
            backgroundColor:
              recordType === "expense" ? "#5A8F7B" : "transparent",
            color: recordType === "expense" ? "#FFF" : "#8C8678",
          }}
        >
          支出
        </button>
        <button
          onClick={() => setRecordType("income")}
          className="flex-1 py-2 text-sm font-medium transition-all"
          style={{
            backgroundColor:
              recordType === "income" ? "#C45C4A" : "transparent",
            color: recordType === "income" ? "#FFF" : "#8C8678",
          }}
        >
          收入
        </button>
      </div>

      {/* Amount Input */}
      <div
        className="rounded-xl p-5 shadow-sm"
        style={{
          backgroundImage: "url(/card-2.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex items-baseline gap-1">
          <span className="text-2xl" style={{ color: "#3D3D3D" }}>
            ¥
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="text-4xl font-bold bg-transparent outline-none w-full placeholder-[#D0C8B8]"
            style={{ color: "#3D3D3D" }}
            autoFocus
          />
          {amount && (
            <button onClick={() => setAmount("")}>
              <X size={20} className="text-[#B5AE9E]" />
            </button>
          )}
        </div>
        <div className="text-xs text-[#8C8678] mt-2">
          {recordType === "expense" ? "添加一笔支出" : "添加一笔收入"}
        </div>
      </div>

      {/* Category Selector */}
      <div
        className="rounded-xl p-4 shadow-sm"
        style={{
          backgroundImage: "url(/card-2.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="grid grid-cols-4 gap-3">
          {pageCats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-md transition-all"
            >
              <div
                className="w-12 h-12 rounded-full overflow-hidden transition-all"
                style={{
                  boxShadow:
                    selectedCat === cat.id ? `0 0 0 2px ${cat.color}` : "none",
                }}
              >
                <img
                  src={cat.iconImgDark || cat.iconImg}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs" style={{ color: "#555" }}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: page === i ? "#5A8F7B" : "#D0C8B8",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div
        className="rounded-xl p-4 shadow-sm space-y-4"
        style={{
          backgroundImage: "url(/card-2.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="flex items-center justify-between py-2"
          style={{ borderBottom: "1px solid rgba(232, 228, 218, 0.5)" }}
        >
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-[#8C8678]" />
            <span className="text-sm text-[#3D3D3D]">日期</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-[#8C8678]">
              {format(parseISO(date), "yyyy年M月d日")}
            </span>
            <ChevronRight size={14} className="text-[#D0C8B8]" />
          </div>
        </div>
        <div
          className="flex items-center justify-between py-2"
          style={{ borderBottom: "1px solid rgba(232, 228, 218, 0.5)" }}
        >
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-[#8C8678]" />
            <span className="text-sm text-[#3D3D3D]">备注</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="可输入备注..."
              className="text-sm text-right bg-transparent outline-none placeholder-[#B5AE9E]"
              style={{ color: "#3D3D3D" }}
            />
            <ChevronRight size={14} className="text-[#D0C8B8]" />
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-[#8C8678]" />
            <span className="text-sm text-[#3D3D3D]">支付方式</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-[#8C8678]">微信支付</span>
            <ChevronRight size={14} className="text-[#D0C8B8]" />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!selectedCat || !amount}
        className="w-full py-3.5 rounded-xl font-semibold text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-white"
        style={{
          background: "linear-gradient(135deg, #C45C4A 0%, #A84432 100%)",
          boxShadow: "0 2px 8px rgba(196, 92, 74, 0.25)",
        }}
      >
        保存
      </button>
    </div>
  );
}
