"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ImagePlus, Plus } from "lucide-react";
import { addCategory, getCategories } from "@/lib/data";
import { Category } from "@/lib/types";
import {
  CATEGORY_ICON_PRESETS,
  DEFAULT_CATEGORY_ICON_PRESET,
} from "@/lib/category-icons";
import { processCategoryIconFile } from "@/lib/image-processing";
import { CardFrame } from "../CardFrame";

interface CategoryManagerViewProps {
  onBack: () => void;
}

function createCategoryId() {
  const fallback = `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const value = globalThis.crypto?.randomUUID?.() || fallback;
  return `custom-${value.replace(/[^a-zA-Z0-9-]/g, "")}`;
}

export function CategoryManagerView({ onBack }: CategoryManagerViewProps) {
  const [categories, setCategories] = useState<Category[]>(() =>
    getCategories(),
  );
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(
    DEFAULT_CATEGORY_ICON_PRESET.src,
  );
  const [selectedColor, setSelectedColor] = useState(
    DEFAULT_CATEGORY_ICON_PRESET.color,
  );
  const [processingImage, setProcessingImage] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSave = name.trim().length > 0 && !processingImage;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setProcessingImage(true);
    try {
      const iconDataUrl = await processCategoryIconFile(file);
      setSelectedIcon(iconDataUrl);
      showToast("图标已处理");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "图标处理失败", "error");
    } finally {
      setProcessingImage(false);
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (categories.some((category) => category.name === trimmedName)) {
      showToast("分类名称已存在", "error");
      return;
    }

    const nextCategory: Category = {
      id: createCategoryId(),
      name: trimmedName,
      icon: "Image",
      iconImg: selectedIcon,
      color: selectedColor,
      sortOrder:
        categories.reduce(
          (max, category) => Math.max(max, category.sortOrder),
          -1,
        ) + 1,
    };

    addCategory(nextCategory);
    setCategories(getCategories());
    setName("");
    setSelectedIcon(DEFAULT_CATEGORY_ICON_PRESET.src);
    setSelectedColor(DEFAULT_CATEGORY_ICON_PRESET.color);
    showToast("分类已添加");
  };

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-md active:bg-[#F5F0E8] transition-colors"
        >
          <ChevronLeft size={24} className="text-[#3D3D3D]" />
        </button>
        <span className="text-lg font-bold text-[#3D3D3D]">分类管理</span>
        <div className="w-8" />
      </div>

      <CardFrame className="rounded-xl shadow-sm" contentClassName="p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-[#5A8F7B]" />
          <span className="text-sm font-medium text-[#3D3D3D]">当前分类</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 overflow-hidden rounded-full">
                <img
                  src={category.iconImg}
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="max-w-full truncate text-[10px] text-[#6B6658]">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </CardFrame>

      <CardFrame
        className="rounded-xl shadow-sm"
        contentClassName="space-y-4 p-4"
      >
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-[#C4954A]" />
          <span className="text-sm font-medium text-[#3D3D3D]">添加分类</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-full bg-[#F0EDE5]">
            <img
              src={selectedIcon}
              alt="分类图标预览"
              className="h-full w-full object-cover"
            />
          </div>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={8}
            placeholder="分类名称"
            className="min-w-0 flex-1 rounded-xl border border-[#E8E4DA] bg-transparent px-3 py-2 text-sm text-[#3D3D3D] outline-none placeholder-[#B5AE9E] focus:border-[#5A8F7B]"
          />
        </div>

        <div>
          <div className="mb-2 text-xs text-[#8C8678]">预设图标</div>
          <div className="grid grid-cols-7 gap-2">
            {CATEGORY_ICON_PRESETS.map((preset) => {
              const isSelected = selectedIcon === preset.src;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedIcon(preset.src);
                    setSelectedColor(preset.color);
                  }}
                  className="rounded-full p-0.5 transition-all"
                  style={{
                    boxShadow: isSelected
                      ? `0 0 0 2px ${preset.color}`
                      : "none",
                  }}
                  aria-label={preset.label}
                >
                  <span className="block h-9 w-9 overflow-hidden rounded-full">
                    <img
                      src={preset.src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={processingImage}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-[#5A8F7B] disabled:opacity-60"
            style={{ backgroundColor: "rgba(var(--primary-rgb), 0.08)" }}
          >
            <ImagePlus size={16} />
            {processingImage ? "处理中" : "上传图标"}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white disabled:opacity-45"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Plus size={16} />
            添加
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </CardFrame>

      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm text-white shadow-lg ${
            toast.type === "success" ? "bg-[#5A8F7B]" : "bg-[#C45C4A]"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
