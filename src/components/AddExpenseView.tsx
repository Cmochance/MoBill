"use client";

import { useState, useEffect, useRef } from "react";
import { Expense } from "@/lib/types";
import { getCategories, addExpense } from "@/lib/data";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  X,
  Calendar,
  FileText,
  CreditCard,
  ChevronRight,
  Wallet,
  Briefcase,
  ArrowLeftRight,
  Gift,
  TrendingUp,
  Heart,
  RotateCcw,
  CircleDollarSign,
  type LucideProps,
} from "lucide-react";

const PAYMENT_OPTIONS = [
  { value: "wechat" as const, label: "微信" },
  { value: "alipay" as const, label: "支付宝" },
  { value: "bankcard" as const, label: "银行卡" },
  { value: "other" as const, label: "其他" },
];

interface IncomeCategory {
  id: string;
  name: string;
  icon: React.ComponentType<LucideProps>;
  color: string;
}

const INCOME_CATEGORIES: IncomeCategory[] = [
  { id: "salary", name: "工资", icon: Wallet, color: "#5A8F7B" },
  { id: "sidejob", name: "副业", icon: Briefcase, color: "#C4954A" },
  { id: "trade", name: "交易", icon: ArrowLeftRight, color: "#C45C4A" },
  { id: "bonus", name: "奖金", icon: Gift, color: "#7A9AA8" },
  { id: "investment", name: "理财", icon: TrendingUp, color: "#9B6B8A" },
  { id: "redpacket", name: "红包", icon: Heart, color: "#C45C4A" },
  { id: "refund", name: "退款", icon: RotateCcw, color: "#6B7B9B" },
  {
    id: "other_income",
    name: "其他收入",
    icon: CircleDollarSign,
    color: "#8C8678",
  },
];

interface ExpenseCategory {
  id: string;
  name: string;
  iconImg: string;
  color: string;
}

export default function AddExpenseView({ onBack }: { onBack: () => void }) {
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    [],
  );
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [recordType, setRecordType] = useState<"expense" | "income">("expense");
  const [paymentMethod, setPaymentMethod] = useState<
    "wechat" | "alipay" | "bankcard" | "other"
  >("wechat");
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [page, setPage] = useState(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cats = getCategories();
    const mapped = cats.map((c) => ({
      id: c.id,
      name: c.name,
      iconImg: c.iconImg,
      color: c.color,
    }));
    setExpenseCategories(mapped);
    if (recordType === "expense" && mapped.length > 0) {
      setSelectedCat(mapped[0].id);
    } else if (recordType === "income" && INCOME_CATEGORIES.length > 0) {
      setSelectedCat(INCOME_CATEGORIES[0].id);
    }
  }, []);

  // 切换收支类型时重置选中分类
  useEffect(() => {
    if (recordType === "expense" && expenseCategories.length > 0) {
      setSelectedCat(expenseCategories[0].id);
    } else if (recordType === "income" && INCOME_CATEGORIES.length > 0) {
      setSelectedCat(INCOME_CATEGORIES[0].id);
    }
    setPage(0);
  }, [recordType, expenseCategories]);

  const handleSubmit = () => {
    const num = parseFloat(amount);
    if (!selectedCat || isNaN(num) || num <= 0) return;
    const expense: Expense = {
      id: Date.now().toString(),
      amount: num,
      categoryId: selectedCat,
      description,
      expenseDate: date,
      expenseTime: "12:00",
      createdAt: new Date().toISOString(),
      type: recordType,
      paymentMethod: recordType === "expense" ? paymentMethod : undefined,
    };
    addExpense(expense);
    setAmount("");
    setDescription("");
    onBack();
  };

  const catsPerPage = 8;
  const currentCats =
    recordType === "expense" ? expenseCategories : INCOME_CATEGORIES;
  const totalPages = Math.ceil(currentCats.length / catsPerPage);
  const pageCats = currentCats.slice(
    page * catsPerPage,
    (page + 1) * catsPerPage,
  );

  const paymentLabel =
    PAYMENT_OPTIONS.find((p) => p.value === paymentMethod)?.label || "微信";

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
          {recordType === "expense"
            ? pageCats.map((cat) => {
                const ec = cat as ExpenseCategory;
                return (
                  <button
                    key={ec.id}
                    onClick={() => setSelectedCat(ec.id)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-md transition-all"
                  >
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden transition-all"
                      style={{
                        boxShadow:
                          selectedCat === ec.id
                            ? `0 0 0 2px ${ec.color}`
                            : "none",
                      }}
                    >
                      <img
                        src={ec.iconImg}
                        alt={ec.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs" style={{ color: "#555" }}>
                      {ec.name}
                    </span>
                  </button>
                );
              })
            : pageCats.map((cat) => {
                const ic = cat as IncomeCategory;
                const Icon = ic.icon;
                return (
                  <button
                    key={ic.id}
                    onClick={() => setSelectedCat(ic.id)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-md transition-all"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: `${ic.color}18`,
                        boxShadow:
                          selectedCat === ic.id
                            ? `0 0 0 2px ${ic.color}`
                            : "none",
                      }}
                    >
                      <Icon size={22} color={ic.color} strokeWidth={2} />
                    </div>
                    <span className="text-xs" style={{ color: "#555" }}>
                      {ic.name}
                    </span>
                  </button>
                );
              })}
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
        disabled={!selectedCat || !amount}
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
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowPaymentPicker(false)}
        >
          <div
            className="w-full max-w-md rounded-t-xl p-4 space-y-2"
            style={{ backgroundColor: "#FAF8F3" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-medium text-[#8C8678] mb-2 text-center">
              选择支付方式
            </div>
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setPaymentMethod(opt.value);
                  setShowPaymentPicker(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg active:bg-[#F5F0E8] transition-colors"
                style={{
                  backgroundColor:
                    paymentMethod === opt.value
                      ? "rgba(90,143,123,0.08)"
                      : "transparent",
                }}
              >
                <span
                  className="text-sm"
                  style={{
                    color: paymentMethod === opt.value ? "#5A8F7B" : "#3D3D3D",
                    fontWeight: paymentMethod === opt.value ? 600 : 400,
                  }}
                >
                  {opt.label}
                </span>
                {paymentMethod === opt.value && (
                  <div className="w-2 h-2 rounded-full bg-[#5A8F7B]" />
                )}
              </button>
            ))}
            <button
              onClick={() => setShowPaymentPicker(false)}
              className="w-full py-3 mt-2 rounded-lg text-sm font-medium text-[#8C8678]"
              style={{ backgroundColor: "#F0EDE5" }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
