"use client";

import { useState } from "react";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";
import { getStreakDays, getMonthlyIncome, getExpenses } from "@/lib/data";
import {
  backupDataToLocalFile,
  clearAllData,
  restoreDataFromLocalFile,
  storage,
} from "@/lib/storage";
import {
  AlertTriangle,
  ChevronRight,
  Grid3x3,
  Palette,
  Info,
  Settings,
  Upload,
  FileJson,
} from "lucide-react";
import {
  AssetAccount,
  AssetManagerView,
} from "./profile/AssetManagerView";
import { ProfileMenu, ProfileMenuItem } from "./profile/ProfileMenu";
import { CategoryManagerView } from "./profile/CategoryManagerView";
import { ThemeSettingsView } from "./profile/ThemeSettingsView";
import { AboutUsModal } from "./profile/AboutUsModal";
import { CardFrame } from "./CardFrame";
import { applyTheme, getThemeScheme, type ThemeId } from "@/lib/themes";
import { APP_VERSION } from "@/lib/app-info";

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
  const [resetConfirmStep, setResetConfirmStep] = useState<0 | 1 | 2>(0);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);
  const [nickname, setNickname] = useState(() => {
    const s = storage.getSettings();
    return s.nickname || "青岚";
  });
  const [editingName, setEditingName] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [showAssetManager, setShowAssetManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [assetAccounts, setAssetAccounts] = useState(() => getAssetAccounts());
  const [themeId, setThemeId] = useState(
    () => getThemeScheme(storage.getSettings().themeId).id,
  );
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

  const handleBackupData = async () => {
    if (backupBusy) return;
    setBackupBusy(true);
    const result = await backupDataToLocalFile();
    showToast(result.message, result.success ? "success" : "error");
    setBackupBusy(false);
  };

  const handleRestoreData = async () => {
    if (backupBusy) return;
    setBackupBusy(true);
    const result = await restoreDataFromLocalFile();
    showToast(result.message, result.success ? "success" : "error");
    if (result.success && result.shouldReload) {
      setTimeout(() => window.location.reload(), 800);
      return;
    }
    setBackupBusy(false);
  };

  const handleReset = async () => {
    await clearAllData();
    window.location.reload();
  };

  const handleThemeSelect = (nextThemeId: ThemeId) => {
    setThemeId(nextThemeId);
    storage.setSettings({
      ...storage.getSettings(),
      themeId: nextThemeId,
    });
    applyTheme(nextThemeId);
    showToast("主题已更新");
  };

  const menuItems: ProfileMenuItem[] = [
    {
      icon: FileJson,
      label: "备份数据",
      action: handleBackupData,
      disabled: backupBusy,
    },
    {
      icon: Upload,
      label: "恢复数据",
      action: handleRestoreData,
      disabled: backupBusy,
    },
    {
      icon: Grid3x3,
      label: "分类管理",
      action: () => setShowCategoryManager(true),
    },
    {
      icon: Palette,
      label: "主题设置",
      action: () => setShowThemeSettings(true),
    },
    {
      icon: Info,
      label: "关于我们",
      action: () => setShowAboutUs(true),
    },
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

  if (showCategoryManager) {
    return (
      <CategoryManagerView
        onBack={() => setShowCategoryManager(false)}
      />
    );
  }

  if (showThemeSettings) {
    return (
      <ThemeSettingsView
        selectedThemeId={themeId}
        onBack={() => setShowThemeSettings(false)}
        onSelect={handleThemeSelect}
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
      <CardFrame className="rounded-xl shadow-sm" contentClassName="p-5">
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
      </CardFrame>

      <ProfileMenu
        items={menuItems}
        onReset={() => setResetConfirmStep(1)}
      />

      {/* Version */}
      <div className="text-center py-2">
        <span className="text-[10px] text-[#B5AE9E]">
          MoBill v{APP_VERSION}
        </span>
      </div>

      {resetConfirmStep > 0 && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div
            className="rounded-xl p-5 w-full max-w-xs"
            style={{ backgroundColor: "#FAF8F3" }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(var(--accent-red-rgb), 0.12)" }}
              >
                <AlertTriangle size={18} className="text-[#C45C4A]" />
              </span>
              <div className="text-base font-bold text-[#3D3D3D]">
                {resetConfirmStep === 1 ? "危险操作" : "最终确认"}
              </div>
            </div>
            <p className="text-sm text-[#8C8678] mb-4">
              {resetConfirmStep === 1
                ? "清除后将删除所有记账记录、预算、设置以及主数据文件。此操作风险很高，请谨慎继续。"
                : "这是第二次确认。继续后当前应用数据会被清空，无法在应用内撤销。"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  resetConfirmStep === 1
                    ? setResetConfirmStep(0)
                    : setResetConfirmStep(1)
                }
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#8C8678]"
                style={{ backgroundColor: "#F0EDE5" }}
              >
                {resetConfirmStep === 1 ? "取消" : "返回"}
              </button>
              <button
                onClick={() =>
                  resetConfirmStep === 1
                    ? setResetConfirmStep(2)
                    : handleReset()
                }
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: "#C45C4A" }}
              >
                {resetConfirmStep === 1 ? "继续清除" : "永久清除"}
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

      {showAboutUs && <AboutUsModal onClose={() => setShowAboutUs(false)} />}
    </div>
  );
}
