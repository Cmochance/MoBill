"use client";

import { useState } from "react";
import { exportToCSV } from "@/lib/data";
import {
  Download,
  Trash2,
  ChevronRight,
  Cloud,
  Grid3x3,
  Bell,
  Palette,
  Info,
  Settings,
} from "lucide-react";

export default function ProfileView() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const csv = exportToCSV();
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `墨禅记账_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.reload();
    }
  };

  const menuItems = [
    { icon: Cloud, label: "数据同步 / 导出", action: handleExport },
    { icon: Grid3x3, label: "分类管理", action: () => {} },
    { icon: Bell, label: "账单提醒", action: () => {} },
    { icon: Palette, label: "主题设置", action: () => {} },
    { icon: Info, label: "关于我们", action: () => {} },
  ];

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* User Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E8E4DA]">
          <img
            src="/topic-1-5.png"
            alt="头像"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#3D3D3D]">青岚</span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: "#C4954A" }}
            >
              VIP
            </span>
          </div>
          <div className="text-xs text-[#8C8678] mt-0.5">已连续记账 128 天</div>
        </div>
        <button className="p-2">
          <Settings size={20} className="text-[#8C8678]" />
        </button>
      </div>

      {/* Asset Overview */}
      <div
        className="rounded-xl p-5 shadow-sm"
        style={{
          backgroundImage: "url(/card-2.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#5A8F7B]">资产概览</span>
          <ChevronRight size={16} className="text-[#D0C8B8]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-[#8C8678]">本月结余</div>
            <div className="text-xl font-bold text-[#C4954A] mt-1">
              ¥5,334.20
            </div>
            <div className="text-[10px] text-[#C45C4A] mt-0.5">
              较上月 +12.6% ↗
            </div>
          </div>
          <div>
            <div className="text-xs text-[#8C8678]">账户总资产</div>
            <div className="text-xl font-bold text-[#5A8F7B] mt-1">
              ¥66,858.30
            </div>
            <div className="text-[10px] text-[#8C8678] mt-0.5">
              净资产 ¥48,210.10
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Card */}
      <div
        className="rounded-xl p-4 shadow-sm flex items-center gap-4"
        style={{
          backgroundImage: "url(/card-2.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
          <img
            src="/topic-1-5.png"
            alt="勋章"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-[#3D3D3D]">精打细算</div>
          <div className="text-xs text-[#8C8678] mt-0.5">本月记账 30 天</div>
          <div className="text-xs text-[#8C8678]">
            超过了 <span className="text-[#C45C4A]">78%</span> 的用户
          </div>
        </div>
        <ChevronRight size={16} className="text-[#D0C8B8]" />
      </div>

      {/* Menu List */}
      <div
        className="rounded-xl shadow-sm overflow-hidden"
        style={{
          backgroundImage: "url(/card-2.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center justify-between px-4 py-3.5 active:bg-[#F5F0E8] transition-colors"
            style={{
              borderBottom:
                index < menuItems.length - 1
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
          onClick={() => setShowResetConfirm(true)}
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

      {showResetConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div
            className="rounded-xl p-5 w-full max-w-xs"
            style={{ backgroundColor: "#FAF8F3" }}
          >
            <div className="text-base font-bold text-[#3D3D3D] mb-2">
              确认清除
            </div>
            <p className="text-sm text-[#8C8678] mb-4">
              此操作将删除所有记账记录和设置，无法恢复。是否继续？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#8C8678]"
                style={{ backgroundColor: "#F0EDE5" }}
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: "#C45C4A" }}
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
