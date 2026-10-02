import type { BannerPlacement, TextTheme } from "@prisma/client";

export const PLACEMENT_LABELS: Record<BannerPlacement, string> = {
  HOME_PRIMARY: "Ana sayfa – Banner #1 (geniş)",
  HOME_SECONDARY: "Ana sayfa – Banner #2 (geniş)",
  HOME_SPLIT: "Ana sayfa – İkili banner",
  MEGA_MENU: "Mega menü görseli",
};

export const TEXT_THEME_LABELS: Record<TextTheme, string> = {
  DARK: "Koyu yazı (açık görseller için)",
  LIGHT: "Açık yazı (koyu görseller için)",
};

export function toOptions<K extends string>(labels: Record<K, string>): { value: K; label: string }[] {
  return (Object.keys(labels) as K[]).map((value) => ({ value, label: labels[value] }));
}
