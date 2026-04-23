"use client";

import {
  UtensilsCrossed,
  Bus,
  ShoppingBag,
  Gamepad2,
  Home,
  HeartPulse,
  BookOpen,
  MoreHorizontal,
  Zap,
  LucideProps,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  UtensilsCrossed,
  Bus,
  ShoppingBag,
  Gamepad2,
  Home,
  HeartPulse,
  BookOpen,
  MoreHorizontal,
  Zap,
};

export default function CategoryIcon({
  name,
  size = 18,
  ...props
}: { name: string; size?: number } & Omit<LucideProps, "size">) {
  const Icon = iconMap[name] || MoreHorizontal;
  return <Icon size={size} {...props} />;
}
