"use client";

import { ChevronLeft, Wallet } from "lucide-react";

export interface AssetAccount {
  name: string;
  amount: number;
}

interface AssetManagerViewProps {
  accounts: AssetAccount[];
  toast: { msg: string; type: "success" | "error" } | null;
  onBack: () => void;
  onAccountsChange: (accounts: AssetAccount[]) => void;
  onSave: () => void;
}

export function AssetManagerView({
  accounts,
  toast,
  onBack,
  onAccountsChange,
  onSave,
}: AssetManagerViewProps) {
  const totalAssets = accounts.reduce((sum, a) => sum + (a.amount || 0), 0);

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-[#3D3D3D]" />
        </button>
        <span className="text-lg font-bold text-[#3D3D3D]">资产管理</span>
      </div>

      <div
        className="rounded-xl shadow-sm overflow-hidden"
        style={{
          backgroundImage: "url(/card-2.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        {accounts.map((account, index) => (
          <div
            key={account.name}
            className="flex items-center justify-between px-4 py-3.5"
            style={{
              borderBottom:
                index < accounts.length - 1
                  ? "1px solid rgba(232, 228, 218, 0.5)"
                  : "none",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#5A8F7B18" }}
              >
                <Wallet size={16} className="text-[#5A8F7B]" />
              </div>
              <span className="text-sm text-[#3D3D3D]">{account.name}</span>
            </div>
            <input
              type="number"
              value={account.amount || ""}
              onChange={(e) => {
                const val = e.target.value;
                const next = [...accounts];
                next[index] = {
                  ...next[index],
                  amount: val ? parseFloat(val) : 0,
                };
                onAccountsChange(next);
              }}
              placeholder="0.00"
              className="text-right text-sm font-medium text-[#3D3D3D] bg-transparent outline-none w-24"
            />
          </div>
        ))}
      </div>

      <div
        className="rounded-xl p-4 shadow-sm flex items-center justify-between"
        style={{
          backgroundImage: "url(/card-2.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div>
          <div className="text-xs text-[#8C8678]">总资产</div>
          <div className="text-xl font-bold text-[#5A8F7B] mt-0.5">
            ¥
            {totalAssets.toLocaleString("zh-CN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <button
          onClick={onSave}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: "#5A8F7B" }}
        >
          保存
        </button>
      </div>

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
