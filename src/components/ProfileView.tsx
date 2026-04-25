"use client";

import { useState, useRef } from "react";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";
import { getStreakDays, getMonthlyIncome, getExpenses } from "@/lib/data";
import {
  exportAllData,
  importAllData,
  syncApi,
  clearAllData,
  storage,
} from "@/lib/storage";
import {
  ChevronRight,
  Grid3x3,
  Bell,
  Palette,
  Info,
  Settings,
  Upload,
  FileJson,
  RefreshCw,
} from "lucide-react";
import {
  AssetAccount,
  AssetManagerView,
} from "./profile/AssetManagerView";
import { ProfileMenu, ProfileMenuItem } from "./profile/ProfileMenu";

const DEFAULT_ASSET_ACCOUNTS: AssetAccount[] = [
  { name: "支付宝", amount: 0 },
  { name: "微信", amount: 0 },
  { name: "银行卡", amount: 0 },
  { name: "现金", amount: 0 },
  { name: "股票基金", amount: 0 },
  { name: "数字人民币", amount: 0 },
  { name: "京东钱包", amount: 0 },
  { name: "其他", amount: 0 },
];

function getAssetAccounts(): AssetAccount[] {
  const s = storage.getSettings();
  const accounts = s.assetAccounts as
    | AssetAccount[]
    | undefined;
  if (!accounts || accounts.length === 0) {
    return DEFAULT_ASSET_ACCOUNTS.map((a) => ({ ...a }));
  }
  return accounts;
}

function saveAssetAccounts(accounts: AssetAccount[]) {
  storage.setSettings({
    ...storage.getSettings(),
    assetAccounts: accounts,
  });
}

export default function ProfileView() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(
    () => syncApi.getConfig().enabled,
  );
  const [nickname, setNickname] = useState(() => {
    const s = storage.getSettings();
    return s.nickname || "青岚";
  });
  const [editingName, setEditingName] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [showAssetManager, setShowAssetManager] = useState(false);
  const [assetAccounts, setAssetAccounts] = useState(() => getAssetAccounts());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streakDays = getStreakDays();

  const today = new Date();
  const thisMonth = format(today, "yyyy-MM");
  const lastMonth = format(subMonths(today, 1), "yyyy-MM");

  const thisMonthIncome = getMonthlyIncome(thisMonth);
  const thisMonthExpenses = getExpenses()
    .filter((e) => {
      const ed = parseISO(e.expenseDate);
      return (
        e.type === "expense" &&
        ed >= startOfMonth(today) &&
        ed <= endOfMonth(today)
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);
  const thisMonthBalance = thisMonthIncome - thisMonthExpenses;

  const lastMonthDate = subMonths(today, 1);
  const lastMonthIncome = getMonthlyIncome(lastMonth);
  const lastMonthExpenses = getExpenses()
    .filter((e) => {
      const ed = parseISO(e.expenseDate);
      return (
        e.type === "expense" &&
        ed >= startOfMonth(lastMonthDate) &&
        ed <= endOfMonth(lastMonthDate)
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);
  const lastMonthBalance = lastMonthIncome - lastMonthExpenses;

  const balanceDiffPct =
    lastMonthBalance !== 0
      ? ((thisMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) *
        100
      : thisMonthBalance > 0
        ? 100
        : 0;

  const totalAssets = assetAccounts.reduce(
    (sum, a) => sum + (a.amount || 0),
    0,
  );

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
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

  const menuItems: ProfileMenuItem[] = [
    { icon: FileJson, label: "备份数据 (JSON)", action: handleExportJSON },
    { icon: Upload, label: "恢复数据 (JSON)", action: handleImportClick },
    { icon: Grid3x3, label: "分类管理", disabled: true },
    { icon: Bell, label: "账单提醒", disabled: true },
    { icon: Palette, label: "主题设置", disabled: true },
    { icon: Info, label: "关于我们", disabled: true },
  ];

  if (showAssetManager) {
    return (
      <AssetManagerView
        accounts={assetAccounts}
        toast={toast}
        onBack={() => setShowAssetManager(false)}
        onAccountsChange={setAssetAccounts}
        onSave={() => {
          saveAssetAccounts(assetAccounts);
          showToast("资产已保存");
          setShowAssetManager(false);
        }}
      />
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* User Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          <img
            src="/topic-1-5.png"
            alt="头像"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {editingName ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  const trimmed = editValue.trim();
                  if (trimmed) {
                    setNickname(trimmed);
                    storage.setSettings({
                      ...storage.getSettings(),
                      nickname: trimmed,
                    });
                  }
                  setEditingName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const trimmed = editValue.trim();
                    if (trimmed) {
                      setNickname(trimmed);
                      storage.setSettings({
                        ...storage.getSettings(),
                        nickname: trimmed,
                      });
                    }
                    setEditingName(false);
                  }
                }}
                autoFocus
                className="text-lg font-bold bg-transparent outline-none border-b border-[#5A8F7B] text-[#3D3D3D] w-32"
              />
            ) : (
              <button
                onClick={() => {
                  setEditValue(nickname);
                  setEditingName(true);
                }}
                className="text-lg font-bold text-[#3D3D3D]"
              >
                {nickname}
              </button>
            )}
          </div>
          <div className="text-xs text-[#8C8678] mt-0.5">
            已连续记账 {streakDays} 天
          </div>
        </div>
        <button className="p-2 cursor-not-allowed opacity-45" disabled>
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
              ¥
              {thisMonthBalance.toLocaleString("zh-CN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              className={`text-[10px] mt-0.5 ${balanceDiffPct >= 0 ? "text-[#C45C4A]" : "text-[#5A8F7B]"}`}
            >
              较上月 {balanceDiffPct >= 0 ? "+" : ""}
              {balanceDiffPct.toFixed(1)}% {balanceDiffPct >= 0 ? "↗" : "↘"}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#8C8678]">账户总资产</div>
            <button
              onClick={() => setShowAssetManager(true)}
              className="text-left"
            >
              <div className="text-xl font-bold text-[#5A8F7B] mt-1">
                ¥
                {totalAssets.toLocaleString("zh-CN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-[10px] text-[#8C8678] mt-0.5">
                点击管理资产
              </div>
            </button>
          </div>
        </div>
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

      <ProfileMenu
        items={menuItems}
        onReset={() => setShowResetConfirm(true)}
      />

      {/* Version */}
      <div className="text-center py-2">
        <span className="text-[10px] text-[#B5AE9E]">MoBill v1.1.2</span>
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
