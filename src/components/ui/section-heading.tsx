import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cx } from "@/lib/cx";

type SectionHeadingProps = {
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
  id?: string;
};

export function SectionHeading({ eyebrow, title, subtitle, href, linkLabel = "Tümünü Gör", align = "left", id }: SectionHeadingProps) {
  return (
    <div className={cx("mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between", align === "center" && "md:flex-col md:items-center text-center")}>
      <div className={cx("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h2 id={id} className="font-display text-[1.85rem] leading-[1.1] tracking-tight text-ink md:text-[2.6rem]">
          {title}
        </h2>
        {subtitle ? <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft md:text-base">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-ink underline-offset-4 hover:underline">
          {linkLabel}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
