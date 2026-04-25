"use client";

import type { MoneyMethod } from "@/lib/types";
import { PAYMENT_OPTIONS } from "./options";

interface PaymentMethodPickerProps {
  title: string;
  method: MoneyMethod;
  onSelect: (method: MoneyMethod) => void;
  onClose: () => void;
}

export function PaymentMethodPicker({
  title,
  method,
  onSelect,
  onClose,
}: PaymentMethodPickerProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-xl p-4 space-y-2"
        style={{ backgroundColor: "#FAF8F3" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-sm font-medium text-[#8C8678] mb-2 text-center">
          {title}
        </div>
        {PAYMENT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg active:bg-[#F5F0E8] transition-colors"
            style={{
              backgroundColor:
                method === opt.value ? "rgba(90,143,123,0.08)" : "transparent",
            }}
          >
            <span
              className="text-sm"
              style={{
                color: method === opt.value ? "#5A8F7B" : "#3D3D3D",
                fontWeight: method === opt.value ? 600 : 400,
              }}
            >
              {opt.label}
            </span>
            {method === opt.value && (
              <div className="w-2 h-2 rounded-full bg-[#5A8F7B]" />
            )}
          </button>
        ))}
        <button
          onClick={onClose}
          className="w-full py-3 mt-2 rounded-lg text-sm font-medium text-[#8C8678]"
          style={{ backgroundColor: "#F0EDE5" }}
        >
          取消
        </button>
      </div>
    </div>
  );
}
