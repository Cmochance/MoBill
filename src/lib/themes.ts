export type ThemeId =
  | "mofeng"
  | "songyan"
  | "zhusha"
  | "yuci"
  | "xuanqing";

interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardBorder: string;
  primary: string;
  primaryLight: string;
  accentRed: string;
  accentRedDeep: string;
  accentGold: string;
  textMuted: string;
  textSecondary: string;
  textLight: string;
  surfaceMuted: string;
}

export interface ThemeScheme {
  id: ThemeId;
  name: string;
  description: string;
  colors: ThemeColors;
}

export const DEFAULT_THEME_ID: ThemeId = "mofeng";

export const THEME_SCHEMES: ThemeScheme[] = [
  {
    id: "mofeng",
    name: "墨风",
    description: "松烟墨绿、朱砂与旧纸底色",
    colors: {
      background: "#F5F0E8",
      foreground: "#3D3D3D",
      card: "#FAF8F3",
      cardBorder: "#E8E4DA",
      primary: "#5A8F7B",
      primaryLight: "#E8F0EC",
      accentRed: "#C45C4A",
      accentRedDeep: "#A84432",
      accentGold: "#C4954A",
      textMuted: "#8C8678",
      textSecondary: "#6B6658",
      textLight: "#B5AE9E",
      surfaceMuted: "#F0EDE5",
    },
  },
  {
    id: "songyan",
    name: "松烟",
    description: "青松、赭石与温润米纸",
    colors: {
      background: "#F1EFE7",
      foreground: "#343A35",
      card: "#FBF8F0",
      cardBorder: "#E4DDCE",
      primary: "#3F7F68",
      primaryLight: "#E3EEE8",
      accentRed: "#B8644D",
      accentRedDeep: "#974D3A",
      accentGold: "#B98C43",
      textMuted: "#817B6D",
      textSecondary: "#646154",
      textLight: "#ADA58F",
      surfaceMuted: "#ECE7DC",
    },
  },
  {
    id: "zhusha",
    name: "朱砂",
    description: "朱印、墨褐与淡金宣纸",
    colors: {
      background: "#F4EEE7",
      foreground: "#3E332F",
      card: "#FCF7F0",
      cardBorder: "#E9DCD2",
      primary: "#796A4A",
      primaryLight: "#EEE9DE",
      accentRed: "#B34D42",
      accentRedDeep: "#92382F",
      accentGold: "#C0913D",
      textMuted: "#8C7B70",
      textSecondary: "#6B5D53",
      textLight: "#B8AAA0",
      surfaceMuted: "#EFE6DD",
    },
  },
  {
    id: "yuci",
    name: "雨瓷",
    description: "青瓷、烟雨蓝与暖陶朱",
    colors: {
      background: "#EEF2ED",
      foreground: "#303A3C",
      card: "#F8FAF6",
      cardBorder: "#DCE5DE",
      primary: "#4D7F88",
      primaryLight: "#E2EEF0",
      accentRed: "#B36A58",
      accentRedDeep: "#915243",
      accentGold: "#A9904E",
      textMuted: "#79817A",
      textSecondary: "#5C6866",
      textLight: "#A5ADA5",
      surfaceMuted: "#E8EDE8",
    },
  },
  {
    id: "xuanqing",
    name: "玄青",
    description: "深青、乌金与沉静灰纸",
    colors: {
      background: "#ECEBE3",
      foreground: "#30343A",
      card: "#F8F6EE",
      cardBorder: "#DDD9CB",
      primary: "#4A6B78",
      primaryLight: "#E2EAED",
      accentRed: "#9F5049",
      accentRedDeep: "#813C37",
      accentGold: "#A9884E",
      textMuted: "#7B7B72",
      textSecondary: "#5E635F",
      textLight: "#A4A298",
      surfaceMuted: "#E7E4D8",
    },
  },
];

const THEME_BY_ID = new Map(THEME_SCHEMES.map((theme) => [theme.id, theme]));

function normalizeThemeId(themeId: unknown): ThemeId {
  return typeof themeId === "string" && THEME_BY_ID.has(themeId as ThemeId)
    ? (themeId as ThemeId)
    : DEFAULT_THEME_ID;
}

function hexToRgb(hex: string): string {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return [
    (value >> 16) & 255,
    (value >> 8) & 255,
    value & 255,
  ].join(", ");
}

export function getThemeScheme(themeId: unknown): ThemeScheme {
  return THEME_BY_ID.get(normalizeThemeId(themeId)) ?? THEME_SCHEMES[0];
}

export function applyTheme(themeId: unknown) {
  if (typeof document === "undefined") return;

  const theme = getThemeScheme(themeId);
  const root = document.documentElement;
  root.dataset.theme = theme.id;

  const { colors } = theme;
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--card", colors.card);
  root.style.setProperty("--card-border", colors.cardBorder);
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-light", colors.primaryLight);
  root.style.setProperty("--accent-red", colors.accentRed);
  root.style.setProperty("--accent-red-deep", colors.accentRedDeep);
  root.style.setProperty("--accent-gold", colors.accentGold);
  root.style.setProperty("--text-muted", colors.textMuted);
  root.style.setProperty("--text-secondary", colors.textSecondary);
  root.style.setProperty("--text-light", colors.textLight);
  root.style.setProperty("--surface-muted", colors.surfaceMuted);
  root.style.setProperty("--card-rgb", hexToRgb(colors.card));
  root.style.setProperty("--card-border-rgb", hexToRgb(colors.cardBorder));
  root.style.setProperty("--primary-rgb", hexToRgb(colors.primary));
  root.style.setProperty("--accent-red-rgb", hexToRgb(colors.accentRed));
  root.style.setProperty("--accent-gold-rgb", hexToRgb(colors.accentGold));
}
