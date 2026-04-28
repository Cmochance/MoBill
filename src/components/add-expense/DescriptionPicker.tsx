"use client";

interface DescriptionPickerProps {
  descriptions: string[];
  currentDescription: string;
  onSelect: (description: string) => void;
  onClose: () => void;
}

export function DescriptionPicker({
  descriptions,
  currentDescription,
  onSelect,
  onClose,
}: DescriptionPickerProps) {
  const current = currentDescription.trim();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-xl p-4 space-y-2"
        style={{ backgroundColor: "#FAF8F3" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-sm font-medium text-[#8C8678] mb-2 text-center">
          选择备注
        </div>
        {descriptions.length > 0 ? (
          descriptions.map((description) => {
            const isSelected = description === current;

            return (
              <button
                key={description}
                type="button"
                onClick={() => onSelect(description)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg active:bg-[#F5F0E8] transition-colors"
                style={{
                  backgroundColor: isSelected
                    ? "rgba(90,143,123,0.08)"
                    : "transparent",
                }}
              >
                <span
                  className="min-w-0 flex-1 truncate text-left text-sm"
                  style={{
                    color: isSelected ? "#5A8F7B" : "#3D3D3D",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {description}
                </span>
                {isSelected && (
                  <div className="h-2 w-2 shrink-0 rounded-full bg-[#5A8F7B]" />
                )}
              </button>
            );
          })
        ) : (
          <div className="px-4 py-6 text-center text-sm text-[#8C8678]">
            暂无历史备注
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 mt-2 rounded-lg text-sm font-medium text-[#8C8678]"
          style={{ backgroundColor: "#F0EDE5" }}
        >
          取消
        </button>
      </div>
    </div>
  );
}
