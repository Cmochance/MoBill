"use client";

import { ChevronLeft, Check } from "lucide-react";
import {
  DEFAULT_THEME_ID,
  THEME_SCHEMES,
  ThemeId,
  getThemeScheme,
} from "@/lib/themes";
import { CardFrame } from "../CardFrame";

interface ThemeSettingsViewProps {
  selectedThemeId?: string;
  onBack: () => void;
  onSelect: (themeId: ThemeId) => void;
}

export function ThemeSettingsView({
  selectedThemeId,
  onBack,
  onSelect,
}: ThemeSettingsViewProps) {
  const activeTheme = getThemeScheme(selectedThemeId);

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-md active:bg-[#F5F0E8] transition-colors"
        >
          <ChevronLeft size={24} className="text-[#3D3D3D]" />
        </button>
        <span className="text-lg font-bold text-[#3D3D3D]">主题设置</span>
        <div className="w-8" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {THEME_SCHEMES.map((theme) => {
          const isSelected =
            activeTheme.id === theme.id ||
            (!selectedThemeId && theme.id === DEFAULT_THEME_ID);
          return (
            <button
              key={theme.id}
              onClick={() => onSelect(theme.id)}
              className="text-left active:scale-[0.98] transition-transform"
            >
              <CardFrame
                className={`rounded-xl shadow-sm ${
                  isSelected ? "ring-2 ring-[var(--primary)]" : ""
                }`}
                contentClassName="p-3 min-h-[132px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {[
                        theme.colors.primary,
                        theme.colors.accentRed,
                        theme.colors.accentGold,
                      ].map((color) => (
                        <span
                          key={color}
                          className="h-5 w-5 rounded-full border border-white/70 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    {isSelected && (
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-sm font-semibold text-[#3D3D3D]">
                    {theme.name}
                  </div>
                  <div className="mt-1 text-[11px] leading-5 text-[#8C8678]">
                    {theme.description}
                  </div>
                </div>
                <div
                  className="mt-3 h-2 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accentGold}, ${theme.colors.accentRed})`,
                  }}
                />
              </CardFrame>
            </button>
          );
        })}
      </div>
    </div>
  );
}
