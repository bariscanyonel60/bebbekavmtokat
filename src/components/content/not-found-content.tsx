import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui/button-styles";

export function NotFoundContent() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center md:py-32">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 max-w-xl font-display text-[2.4rem] leading-[1.05] tracking-tight text-ink md:text-[3.4rem]">Aradığınız sayfayı bulamadık</h1>
      <p className="mt-4 max-w-md text-ink-soft">Sayfa taşınmış ya da kaldırılmış olabilir. Ürünlerimizi keşfetmeye devam edebilir veya arama yapabilirsiniz.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/urunler" className={buttonClass("primary", "lg", "group")}>
          Ürünleri Keşfet
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
        <Link href="/" className={buttonClass("secondary", "lg")}>
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
