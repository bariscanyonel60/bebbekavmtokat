import Image from "next/image";
import Link from "next/link";
import { cx } from "@/lib/cx";

type LogoProps = { logoUrl?: string; siteName: string; className?: string; tone?: "dark" | "light" };

/** Gerçek logo admin panelinden yüklenene kadar metin tabanlı geçici işaret gösterilir. */
export function Logo({ logoUrl, siteName, className, tone = "dark" }: LogoProps) {
  return (
    <Link href="/" className={cx("inline-flex items-center", className)} aria-label={`${siteName} ana sayfa`}>
      {logoUrl ? (
        <Image src={logoUrl} alt={siteName} width={873} height={294} sizes="(min-width: 1024px) 190px, (min-width: 768px) 166px, 131px" className="h-11 w-auto md:h-14 lg:h-16" preload />
      ) : (
        <span className={cx("flex items-center gap-2.5", tone === "light" ? "text-ivory" : "text-ink")}>
          <span
            aria-hidden="true"
            className={cx(
              "grid size-9 place-items-center rounded-full border text-[0.6rem] font-semibold tracking-[0.2em]",
              tone === "light" ? "border-ivory/40" : "border-line-strong bg-cream",
            )}
          >
            LOGO
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl tracking-tight md:text-[1.4rem]">{siteName}</span>
            <span className={cx("mt-1 text-[0.6rem] uppercase tracking-[0.24em]", tone === "light" ? "text-ivory/70" : "text-ink-muted")}>
              Bebek & Çocuk
            </span>
          </span>
        </span>
      )}
    </Link>
  );
}
