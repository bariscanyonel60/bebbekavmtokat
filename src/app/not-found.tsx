import type { Metadata } from "next";
import { NotFoundContent } from "@/components/content/not-found-content";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = { title: "Sayfa bulunamadı", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
