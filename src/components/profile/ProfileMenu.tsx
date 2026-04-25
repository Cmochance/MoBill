"use client";

import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { ChevronRight, Trash2 } from "lucide-react";

export interface ProfileMenuItem {
  icon: ComponentType<LucideProps>;
  label: string;
  action?: () => void;
  disabled?: boolean;
}

interface ProfileMenuProps {
  items: ProfileMenuItem[];
  onReset: () => void;
}

export function ProfileMenu({ items, onReset }: ProfileMenuProps) {
  return (
    <div
      className="rounded-xl shadow-sm overflow-hidden"
      style={{
        backgroundImage: "url(/card-2.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {items.map((item, index) => (
        <button
          key={item.label}
          onClick={item.action}
          disabled={item.disabled}
          className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors ${
            item.disabled
              ? "cursor-not-allowed opacity-45"
              : "active:bg-[#F5F0E8]"
          }`}
          style={{
            borderBottom:
              index < items.length - 1
                ? "1px solid rgba(232, 228, 218, 0.5)"
                : "none",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#5A8F7B18" }}
            >
              <item.icon size={16} className="text-[#5A8F7B]" />
            </div>
            <span className="text-sm text-[#3D3D3D]">{item.label}</span>
          </div>
          <ChevronRight size={16} className="text-[#D0C8B8]" />
        </button>
      ))}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-between px-4 py-3.5 active:bg-[#F5F0E8] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#C45C4A18" }}
          >
            <Trash2 size={16} className="text-[#C45C4A]" />
          </div>
          <span className="text-sm text-[#3D3D3D]">清除所有数据</span>
        </div>
        <ChevronRight size={16} className="text-[#D0C8B8]" />
      </button>
    </div>
  );
}
