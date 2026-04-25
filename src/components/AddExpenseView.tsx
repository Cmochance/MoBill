"use client";

import { useState, useRef } from "react";
import { Expense, MoneyMethod } from "@/lib/types";
import { getCategories, addExpense } from "@/lib/data";
import { format, parseISO } from "date-fns";
import { createRecordId, getCurrentRecordTime } from "@/lib/records";
import { CategorySelector } from "./add-expense/CategorySelector";
import { PaymentMethodPicker } from "./add-expense/PaymentMethodPicker";
import {
  ExpenseCategory,
  INCOME_CATEGORIES,
  PAYMENT_OPTIONS,
} from "./add-expense/options";
import {
  ArrowLeft,
  X,
  Calendar,
  FileText,
  CreditCard,
  ChevronRight,
} from "lucide-react";

function loadExpenseCategories(): ExpenseCategory[] {
  return getCategories().map((c) => ({
    id: c.id,
    name: c.name,
    iconImg: c.iconImg,
    color: c.color,
  }));
}

export default function AddExpenseView({ onBack }: { onBack: () => void }) {
  const [expenseCategories] = useState<ExpenseCategory[]>(
    loadExpenseCategories,
  );
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [recordType, setRecordType] = useState<"expense" | "income">("expense");
  const [moneyMethod, setMoneyMethod] = useState<MoneyMethod>("wechat");
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [page, setPage] = useState(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const defaultSelectedCat =
    recordType === "expense"
      ? expenseCategories[0]?.id
      : INCOME_CATEGORIES[0]?.id;
  const activeSelectedCat = selectedCat || defaultSelectedCat || "";

  const handleRecordTypeChange = (nextType: "expense" | "income") => {
    setRecordType(nextType);
    setSelectedCat(
      nextType === "expense"
        ? expenseCategories[0]?.id || ""
        : INCOME_CATEGORIES[0]?.id || "",
    );
    setPage(0);
  };

  const handleSubmit = () => {
    const num = parseFloat(amount);
    if (!activeSelectedCat || isNaN(num) || num <= 0) return;
    const expense: Expense = {
      id: createRecordId(),
      amount: num,
      categoryId: activeSelectedCat,
      description,
      expenseDate: date,
      expenseTime: getCurrentRecordTime(),
      createdAt: new Date().toISOString(),
      type: recordType,
      paymentMethod: recordType === "expense" ? moneyMethod : undefined,
      incomeMethod: recordType === "income" ? moneyMethod : undefined,
    };
    addExpense(expense);
    setAmount("");
    setDescription("");
    onBack();
  };

  const paymentLabel =
    PAYMENT_OPTIONS.find((p) => p.value === moneyMethod)?.label || "微信";
  const canSubmit = Boolean(activeSelectedCat) && parseFloat(amount) > 0;

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
          onClick={() => handleRecordTypeChange("expense")}
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
          onClick={() => handleRecordTypeChange("income")}
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

      <CategorySelector
        recordType={recordType}
        expenseCategories={expenseCategories}
        selectedCat={activeSelectedCat}
        page={page}
        onSelect={setSelectedCat}
        onPageChange={setPage}
      />

      {/* Details */}
      <div
        className="rounded-xl p-4 shadow-sm space-y-4"
        style={{
          backgroundImage: "url(/card-2.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Date */}
        <div
          className="flex items-center justify-between py-2"
          style={{ borderBottom: "1px solid rgba(232, 228, 218, 0.5)" }}
        >
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-[#8C8678]" />
            <span className="text-sm text-[#3D3D3D]">日期</span>
          </div>
          <button
            onClick={() => dateInputRef.current?.showPicker?.()}
            className="flex items-center gap-1"
          >
            <span className="text-sm text-[#8C8678]">
              {format(parseISO(date), "yyyy年M月d日")}
            </span>
            <ChevronRight size={14} className="text-[#D0C8B8]" />
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="absolute opacity-0 w-0 h-0"
          />
        </div>

        {/* Description */}
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

        {/* Payment / Income Method */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-[#8C8678]" />
            <span className="text-sm text-[#3D3D3D]">
              {recordType === "expense" ? "支付方式" : "入账方式"}
            </span>
          </div>
          <button
            onClick={() => setShowPaymentPicker(true)}
            className="flex items-center gap-1"
          >
            <span className="text-sm text-[#8C8678]">{paymentLabel}</span>
            <ChevronRight size={14} className="text-[#D0C8B8]" />
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3.5 rounded-xl font-semibold text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-white"
        style={{
          background: "linear-gradient(135deg, #C45C4A 0%, #A84432 100%)",
          boxShadow: "0 2px 8px rgba(196, 92, 74, 0.25)",
        }}
      >
        保存
      </button>

      {/* Payment Method Picker */}
      {showPaymentPicker && (
        <PaymentMethodPicker
          title={recordType === "expense" ? "选择支付方式" : "选择入账方式"}
          method={moneyMethod}
          onSelect={(method) => {
            setMoneyMethod(method);
            setShowPaymentPicker(false);
          }}
          onClose={() => setShowPaymentPicker(false)}
        />
      )}
    </div>
  );
}
