"use client";

import { useState, useEffect } from "react";
import { ViewTab } from "@/lib/types";
import HomeView from "@/components/HomeView";
import AddExpenseView from "@/components/AddExpenseView";
import StatsView from "@/components/StatsView";
import BudgetView from "@/components/BudgetView";
import ProfileView from "@/components/ProfileView";
import { CategoryManagerView } from "@/components/profile/CategoryManagerView";
import {
  initStorage,
  LOCAL_BACKUP_ERROR_EVENT,
  resolveLocalDataConflict,
  storage,
  type LocalDataConflict,
} from "@/lib/storage";
import { applyTheme } from "@/lib/themes";
import { Landmark, BarChart3, Wallet, User } from "lucide-react";

type AppView = ViewTab | "categoryManager";

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppView>("home");
  const [storageReady, setStorageReady] = useState(false);
  const [backupError, setBackupError] = useState("");
  const [dataConflict, setDataConflict] = useState<LocalDataConflict | null>(
    null,
  );
  const [resolvingConflict, setResolvingConflict] = useState(false);

  useEffect(() => {
    let cancelled = false;

    initStorage()
      .then((result) => {
        if (!cancelled) {
          applyTheme(storage.getSettings().themeId);
          setDataConflict(result.conflict);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setStorageReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let toastTimer: ReturnType<typeof setTimeout> | null = null;
    const handleBackupError = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      setBackupError(detail?.message || "本机备份失败，请检查存储权限");
      if (toastTimer) {
        clearTimeout(toastTimer);
      }
      toastTimer = setTimeout(() => setBackupError(""), 3000);
    };

    window.addEventListener(LOCAL_BACKUP_ERROR_EVENT, handleBackupError);
    return () => {
      window.removeEventListener(LOCAL_BACKUP_ERROR_EVENT, handleBackupError);
      if (toastTimer) {
        clearTimeout(toastTimer);
      }
    };
  }, []);

  const handleResolveDataConflict = async (importFile: boolean) => {
    if (!dataConflict) return;
    setResolvingConflict(true);
    const result = await resolveLocalDataConflict(
      dataConflict,
      importFile ? "import-file" : "keep-app",
    );
    if (result.success) {
      if (result.shouldReload) {
        window.location.reload();
        return;
      }
      setDataConflict(null);
      setBackupError("");
    } else {
      setBackupError(result.message);
    }
    setResolvingConflict(false);
  };

  const renderView = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeView
            onAdd={() => setActiveTab("add")}
            onEditCategories={() => setActiveTab("categoryManager")}
          />
        );
      case "add":
        return <AddExpenseView onBack={() => setActiveTab("home")} />;
      case "categoryManager":
        return (
          <CategoryManagerView onBack={() => setActiveTab("home")} />
        );
      case "stats":
        return <StatsView />;
      case "calendar":
        return <BudgetView />;
      case "settings":
        return <ProfileView />;
      default:
        return (
          <HomeView
            onAdd={() => setActiveTab("add")}
            onEditCategories={() => setActiveTab("categoryManager")}
          />
        );
    }
  };

  const mainTabs = [
    { id: "home" as ViewTab, label: "首页", icon: Landmark },
    { id: "stats" as ViewTab, label: "统计", icon: BarChart3 },
    { id: "calendar" as ViewTab, label: "预算", icon: Wallet },
    { id: "settings" as ViewTab, label: "我的", icon: User },
  ];

  return (
    <main
      className="relative mx-auto min-h-screen max-w-md"
      style={{ backgroundColor: "transparent" }}
    >
      {!storageReady ? (
        <div className="min-h-screen flex items-center justify-center px-4 text-sm text-[#8C8678]">
          正在加载数据...
        </div>
      ) : (
        <>
          <div className="pb-24">{renderView()}</div>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 glass-card-strong">
            <div className="relative flex items-center justify-around py-2">
              {mainTabs.slice(0, 2).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-lg transition-all"
                    style={{
                      color: isActive ? "var(--primary)" : "var(--text-light)",
                    }}
                  >
                    <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[11px] font-medium">{tab.label}</span>
                  </button>
                );
              })}

              {/* Center Floating Button */}
              <button
                onClick={() => setActiveTab("add")}
                className="relative -mt-8 flex flex-col items-center justify-center w-16 h-16 overflow-hidden rounded-full active:scale-95 transition-transform"
              >
                <img
                  src="/record.png"
                  alt="记一笔"
                  className="h-full w-full rounded-full object-cover"
                />
              </button>

              {mainTabs.slice(2).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-lg transition-all"
                    style={{
                      color: isActive ? "var(--primary)" : "var(--text-light)",
                    }}
                  >
                    <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[11px] font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="h-[env(safe-area-inset-bottom)]" />
          </nav>
        </>
      )}
      {dataConflict && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(45, 39, 31, 0.42)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5 shadow-xl"
            style={{
              backgroundColor: "#FAF8F3",
              border: "1px solid rgba(196,149,74,0.28)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="h-4 w-1 rounded-full bg-[#C4954A]" />
              <h2 className="text-base font-bold text-[#3D3D3D]">
                检测到本地数据不一致
              </h2>
            </div>
            <p className="text-sm leading-6 text-[#8C8678]">
              Documents/MoBill/data.json 与应用内数据不同。是否导入本地数据？
              选择前会自动把将被覆盖的一侧保存为 backup-日期 文件。
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => handleResolveDataConflict(false)}
                disabled={resolvingConflict}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-[#8C8678] disabled:opacity-60"
                style={{ backgroundColor: "#F0EDE5" }}
              >
                否，保留应用数据
              </button>
              <button
                onClick={() => handleResolveDataConflict(true)}
                disabled={resolvingConflict}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white disabled:opacity-60"
                style={{ backgroundColor: "var(--primary)" }}
              >
                是，导入本地数据
              </button>
            </div>
          </div>
        </div>
      )}
      {backupError && (
        <div className="fixed top-12 left-0 right-0 z-[80] flex justify-center px-4 pointer-events-none">
          <div className="px-4 py-2.5 rounded-full text-sm font-medium shadow-lg bg-[#C45C4A] text-white">
            {backupError}
          </div>
        </div>
      )}
    </main>
  );
}
