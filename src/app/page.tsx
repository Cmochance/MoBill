"use client";

import { useState } from "react";
import { ViewTab } from "@/lib/types";
import HomeView from "@/components/HomeView";
import AddExpenseView from "@/components/AddExpenseView";
import StatsView from "@/components/StatsView";
import BudgetView from "@/components/BudgetView";
import ProfileView from "@/components/ProfileView";
import { Landmark, BarChart3, Wallet, User } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ViewTab>("home");

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
      <div className="pb-24">{renderView()}</div>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 glass-card-strong"
      >
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
    </main>
  );
}
