"use client";

import { useState, useRef } from "react";
import { exportToCSV } from "@/lib/data";
import {
  exportAllData,
  importAllData,
  syncApi,
  clearAllData,
} from "@/lib/storage";
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
  Upload,
  FileJson,
  FolderSync,
  RefreshCw,
} from "lucide-react";

export default function ProfileView() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(
    () => syncApi.getConfig().enabled,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleExportCSV = () => {
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

  const handleExportJSON = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `墨禅记账备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("备份文件已下载");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = importAllData(text);
      if (result.success) {
        showToast(result.message, "success");
        setTimeout(() => window.location.reload(), 800);
      } else {
        showToast(result.message, "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = async () => {
    await clearAllData();
    window.location.reload();
  };

  const toggleSync = async () => {
    const next = !syncEnabled;
    const result = await syncApi.setEnabled(next);
    if (result.success) {
      setSyncEnabled(next);
      showToast(result.message, "success");
      if (next) setTimeout(() => window.location.reload(), 600);
    } else {
      showToast(result.message, "error");
    }
  };

  const handleReloadExternal = async () => {
    const result = await syncApi.reloadFromExternal();
    showToast(result.message, result.success ? "success" : "error");
    if (result.success) setTimeout(() => window.location.reload(), 600);
  };

  const menuItems = [
    { icon: Download, label: "导出 CSV 账单", action: handleExportCSV },
    { icon: FileJson, label: "备份数据 (JSON)", action: handleExportJSON },
    { icon: Upload, label: "恢复数据 (JSON)", action: handleImportClick },
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

      {/* Cloud Sync Card */}
      <div
        className="rounded-xl p-4 shadow-sm"
        style={{
          backgroundImage: "url(/card-2.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[#5A8F7B]" />
            <span className="text-sm font-medium" style={{ color: "#3D3D3D" }}>
              云盘同步
            </span>
          </div>
          <button
            onClick={toggleSync}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{
              backgroundColor: syncEnabled ? "#5A8F7B" : "#D0C8B8",
            }}
          >
            <div
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{
                transform: syncEnabled ? "translateX(20px)" : "translateX(0)",
              }}
            />
          </button>
        </div>

        {syncEnabled ? (
          <>
            <div className="text-xs text-[#8C8678] mb-2">
              数据文件位置：{" "}
              <span className="text-[#5A8F7B] font-medium">
                {syncApi.getExternalPathHint()}
              </span>
            </div>
            <div className="text-xs text-[#8C8678] mb-3 leading-relaxed">
              将该文件夹添加到你的云盘同步目录，即可在多台设备间同步数据。
              每次记账后数据会自动写入该文件。
            </div>
            <button
              onClick={handleReloadExternal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#5A8F7B]"
              style={{ backgroundColor: "rgba(90,143,123,0.08)" }}
            >
              <RefreshCw size={12} />
              从云盘文件重新加载
            </button>
          </>
        ) : (
          <div className="text-xs text-[#8C8678] leading-relaxed">
            开启后，所有数据将保存到手机 Documents/MoBill/data.json，
            你可以将该文件夹加入云盘同步，实现多设备数据互通。
          </div>
        )}
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

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />

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

      {toast && (
        <div className="fixed top-12 left-0 right-0 z-[70] flex justify-center px-4 pointer-events-none">
          <div
            className="px-4 py-2.5 rounded-full text-sm font-medium shadow-lg"
            style={{
              backgroundColor: toast.type === "success" ? "#5A8F7B" : "#C45C4A",
              color: "#FFF",
            }}
          >
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
