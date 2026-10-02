import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s | Bebbek AVM Yönetim" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-[#f6f3ee] text-ink">{children}</div>;
}
