import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  ArrowLeftRight,
  Briefcase,
  CircleDollarSign,
  Gift,
  Heart,
  RotateCcw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { MoneyMethod } from "@/lib/types";

export const PAYMENT_OPTIONS: Array<{ value: MoneyMethod; label: string }> = [
  { value: "wechat", label: "微信" },
  { value: "alipay", label: "支付宝" },
  { value: "bankcard", label: "银行卡" },
  { value: "other", label: "其他" },
];

export interface IncomeCategory {
  id: string;
  name: string;
  icon: ComponentType<LucideProps>;
  color: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  iconImg: string;
  color: string;
}

export const INCOME_CATEGORIES: IncomeCategory[] = [
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
