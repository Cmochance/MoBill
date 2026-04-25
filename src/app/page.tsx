"use client";

import { useState, useEffect } from "react";
import { ViewTab } from "@/lib/types";
import HomeView from "@/components/HomeView";
import AddExpenseView from "@/components/AddExpenseView";
import StatsView from "@/components/StatsView";
import BudgetView from "@/components/BudgetView";
import ProfileView from "@/components/ProfileView";
import { EXTERNAL_SYNC_ERROR_EVENT, initStorage } from "@/lib/storage";
import { Landmark, BarChart3, Wallet, User } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ViewTab>("home");
  const [storageReady, setStorageReady] = useState(false);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    let cancelled = false;

    initStorage()
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
    const handleSyncError = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      setSyncError(detail?.message || "外部同步失败，请检查存储权限");
      if (toastTimer) {
        clearTimeout(toastTimer);
      }
      toastTimer = setTimeout(() => setSyncError(""), 3000);
    };

    window.addEventListener(EXTERNAL_SYNC_ERROR_EVENT, handleSyncError);
    return () => {
      window.removeEventListener(EXTERNAL_SYNC_ERROR_EVENT, handleSyncError);
      if (toastTimer) {
        clearTimeout(toastTimer);
      }
    };
  }, []);

  const renderView = () => {
    switch (activeTab) {
      case "home":
        return <HomeView onAdd={() => setActiveTab("add")} />;
      case "add":
        return <AddExpenseView onBack={() => setActiveTab("home")} />;
      case "stats":
        return <StatsView />;
      case "calendar":
        return <BudgetView />;
      case "settings":
        return <ProfileView />;
      default:
        return <HomeView onAdd={() => setActiveTab("add")} />;
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
      className="min-h-screen max-w-md mx-auto relative"
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
                    style={{ color: isActive ? "#5A8F7B" : "#B5AE9E" }}
                  >
                    <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[11px] font-medium">{tab.label}</span>
                  </button>
                );
              })}

              {/* Center Floating Button */}
              <button
                onClick={() => setActiveTab("add")}
                className="relative -mt-8 flex flex-col items-center justify-center w-16 h-16 rounded-full active:scale-95 transition-transform"
              >
                <img
                  src="/record.png"
                  alt="记一笔"
                  className="w-full h-full object-contain"
                />
              </button>

              {mainTabs.slice(2).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-lg transition-all"
                    style={{ color: isActive ? "#5A8F7B" : "#B5AE9E" }}
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
      {syncError && (
        <div className="fixed top-12 left-0 right-0 z-[80] flex justify-center px-4 pointer-events-none">
          <div className="px-4 py-2.5 rounded-full text-sm font-medium shadow-lg bg-[#C45C4A] text-white">
            {syncError}
          </div>
        </div>
      )}
    </main>
  );
}
