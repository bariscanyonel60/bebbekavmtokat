import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp" | "whatsapp-soft" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-(--ease-soft) disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-brand-blue text-white hover:bg-brand-blue-deep shadow-soft",
  secondary: "border border-line-strong bg-white/70 text-ink hover:border-ink hover:bg-white",
  ghost: "text-ink hover:bg-cream",
  whatsapp: "bg-wa text-white hover:bg-[#175a42] shadow-soft",
  "whatsapp-soft": "border border-wa/20 bg-wa-soft text-wa hover:border-wa/40 hover:bg-[#d7e9e0]",
  light: "bg-ivory text-ink hover:bg-white shadow-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-7 text-[0.95rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string): string {
  return cx(base, variants[variant], sizes[size], className);
}
