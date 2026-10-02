import type { ReactNode } from "react";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar, Header } from "@/components/layout/header";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#icerik" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-ivory">
        İçeriğe geç
      </a>
      <AnnouncementBar />
      <Header />
      <main id="icerik">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <OrganizationJsonLd />
    </>
  );
}
