export interface CategoryIconPreset {
  id: string;
  label: string;
  src: string;
  color: string;
}

export const CATEGORY_ICON_PRESETS: CategoryIconPreset[] = [
  { id: "topic-1-1", label: "药葫", src: "/topic-1-1.png", color: "#8B6B5B" },
  { id: "topic-1-2", label: "书卷", src: "/topic-1-2.png", color: "#6B7B9B" },
  { id: "topic-1-3", label: "车马", src: "/topic-1-3.png", color: "#C4954A" },
  { id: "topic-1-4", label: "屋舍", src: "/topic-1-4.png", color: "#7A9AA8" },
  { id: "topic-1-5", label: "雅集", src: "/topic-1-5.png", color: "#9B6B8A" },
  { id: "topic-1-6", label: "饮食", src: "/topic-1-6.png", color: "#5A8F7B" },
  { id: "topic-1-7", label: "市集", src: "/topic-1-7.png", color: "#C45C4A" },
  { id: "topic-1-8", label: "灯火", src: "/topic-1-8.png", color: "#8C7B6B" },
  { id: "topic-2-1", label: "锦囊", src: "/topic-2-1.png", color: "#B36A58" },
  { id: "topic-2-2", label: "闲章", src: "/topic-2-2.png", color: "#A9904E" },
  { id: "topic-2-3", label: "食盒", src: "/topic-2-3.png", color: "#3F7F68" },
  { id: "topic-2-4", label: "行舟", src: "/topic-2-4.png", color: "#4D7F88" },
  { id: "topic-2-5", label: "钱袋", src: "/topic-2-5.png", color: "#A9884E" },
  { id: "topic-2-6", label: "琴棋", src: "/topic-2-6.png", color: "#8F6582" },
];

export const DEFAULT_CATEGORY_ICON_PRESET = CATEGORY_ICON_PRESETS[0];
