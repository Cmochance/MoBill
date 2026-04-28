"use client";

import { useState } from "react";
import { Expense, MoneyMethod } from "@/lib/types";
import {
  getCategories,
  addExpense,
  getRecentDescriptions,
  rememberDescription,
} from "@/lib/data";
import { format, parseISO } from "date-fns";
import { createRecordId, getCurrentRecordTime } from "@/lib/records";
import { CategorySelector } from "./add-expense/CategorySelector";
import { DescriptionPicker } from "./add-expense/DescriptionPicker";
import { PaymentMethodPicker } from "./add-expense/PaymentMethodPicker";
import {
  ExpenseCategory,
  INCOME_CATEGORIES,
  PAYMENT_OPTIONS,
} from "./add-expense/options";
import {
  ArrowLeft,
  X,
  CalendarDays,
  FileText,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { CardFrame } from "./CardFrame";
import { DayDatePicker } from "./DayDatePicker";

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
  const [recentDescriptions, setRecentDescriptions] = useState<string[]>(
    getRecentDescriptions,
  );
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [recordType, setRecordType] = useState<"expense" | "income">("expense");
  const [moneyMethod, setMoneyMethod] = useState<MoneyMethod>("wechat");
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDescriptionPicker, setShowDescriptionPicker] = useState(false);
  const [page, setPage] = useState(0);

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
    const trimmedDescription = description.trim();
    const expense: Expense = {
      id: createRecordId(),
      amount: num,
      categoryId: activeSelectedCat,
      description: trimmedDescription,
      expenseDate: date,
      expenseTime: getCurrentRecordTime(),
      createdAt: new Date().toISOString(),
      type: recordType,
      paymentMethod: recordType === "expense" ? moneyMethod : undefined,
      incomeMethod: recordType === "income" ? moneyMethod : undefined,
    };
    addExpense(expense);
    setRecentDescriptions(rememberDescription(trimmedDescription));
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
              recordType === "expense" ? "var(--primary)" : "transparent",
            color: recordType === "expense" ? "#FFF" : "var(--text-muted)",
          }}
        >
          支出
        </button>
        <button
          onClick={() => handleRecordTypeChange("income")}
          className="flex-1 py-2 text-sm font-medium transition-all"
          style={{
            backgroundColor:
              recordType === "income" ? "var(--accent-red)" : "transparent",
            color: recordType === "income" ? "#FFF" : "var(--text-muted)",
          }}
        >
          收入
        </button>
      </div>

      {/* Amount Input */}
      <CardFrame className="rounded-xl shadow-sm" contentClassName="p-5">
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
      </CardFrame>

      <CategorySelector
        recordType={recordType}
        expenseCategories={expenseCategories}
        selectedCat={activeSelectedCat}
        page={page}
        onSelect={setSelectedCat}
        onPageChange={setPage}
      />

      {/* Details */}
      <CardFrame
        className="rounded-xl shadow-sm"
        contentClassName="space-y-4 p-4"
      >
        {/* Date */}
        <div
          className="flex items-center justify-between py-2"
          style={{ borderBottom: "1px solid rgba(232, 228, 218, 0.5)" }}
        >
          <div className="flex items-center gap-3">
            <CalendarDays size={18} className="text-[#8C8678]" />
            <span className="text-sm text-[#3D3D3D]">日期</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            className="flex items-center gap-1"
            aria-expanded={showDatePicker}
            aria-label="选择日期"
          >
            <span className="text-sm text-[#8C8678]">
              {format(parseISO(date), "yyyy年M月d日")}
            </span>
            <ChevronRight size={14} className="text-[#D0C8B8]" />
          </button>
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
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1 pl-4">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="可输入备注..."
              className="min-w-0 flex-1 text-sm text-right bg-transparent outline-none placeholder-[#B5AE9E]"
              style={{ color: "#3D3D3D" }}
            />
            <button
              type="button"
              onClick={() => setShowDescriptionPicker(true)}
              className="rounded-full p-1 transition-colors active:bg-[#E8E4DA]"
              aria-label="选择历史备注"
              aria-expanded={showDescriptionPicker}
            >
              <ChevronRight size={14} className="text-[#D0C8B8]" />
            </button>
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
      </CardFrame>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3.5 rounded-xl font-semibold text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--accent-red) 0%, var(--accent-red-deep) 100%)",
          boxShadow: "0 2px 8px rgba(var(--accent-red-rgb), 0.25)",
        }}
      >
        保存
      </button>

      {/* Date Picker */}
      {showDatePicker && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowDatePicker(false)}
        >
          <div
            className="w-full max-w-md rounded-t-xl p-4 space-y-3"
            style={{ backgroundColor: "#FAF8F3" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-medium text-[#8C8678] text-center">
              选择日期
            </div>
            <DayDatePicker
              value={date}
              onChange={setDate}
              onClose={() => setShowDatePicker(false)}
              variant="plain"
              className="shadow-none"
            />
          </div>
        </div>
      )}

      {/* Description Picker */}
      {showDescriptionPicker && (
        <DescriptionPicker
          descriptions={recentDescriptions}
          currentDescription={description}
          onSelect={(nextDescription) => {
            setDescription(nextDescription);
            setShowDescriptionPicker(false);
          }}
          onClose={() => setShowDescriptionPicker(false)}
        />
      )}

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
