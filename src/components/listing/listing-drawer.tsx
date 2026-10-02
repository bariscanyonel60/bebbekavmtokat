"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowDownUp, SlidersHorizontal, X } from "lucide-react";
import { buttonClass } from "@/components/ui/button-styles";
import { cx } from "@/lib/cx";

type ListingDrawerProps = {
  kind: "filter" | "sort";
  title: string;
  label: string;
  badge?: number;
  confirmLabel?: string;
  children: ReactNode;
};

/** Mobilde filtre ve sıralama panellerini açan alt sayfa (sheet). URL değişince kendiliğinden kapanır. */
export function ListingDrawer({ kind, title, label, badge = 0, confirmLabel, children }: ListingDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const query = useSearchParams().toString();

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname, query]);

  const Icon = kind === "filter" ? SlidersHorizontal : ArrowDownUp;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex h-12 flex-1 items-center justify-center gap-2 text-[0.8rem] font-semibold tracking-[0.12em] text-ink"
      >
        <Icon className="size-4" aria-hidden="true" />
        {label}
        {badge > 0 ? <span className="grid size-5 place-items-center rounded-full bg-ink text-[0.65rem] tracking-normal text-ivory">{badge}</span> : null}
      </button>
      <dialog
        ref={dialogRef}
        aria-label={title}
        className={cx(
          "m-0 mt-auto max-h-[88dvh] w-full max-w-none rounded-t-3xl bg-ivory p-0 text-ink backdrop:bg-ink/35 open:animate-fade-up",
          kind === "filter" && "h-[88dvh]",
        )}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
            <p className="font-display text-xl">{title}</p>
            <button type="button" onClick={() => dialogRef.current?.close()} className="grid size-10 place-items-center rounded-full hover:bg-cream" aria-label="Kapat">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {confirmLabel ? (
            <div className="shrink-0 border-t border-line p-4">
              <button type="button" onClick={() => dialogRef.current?.close()} className={buttonClass("primary", "lg", "w-full")}>
                {confirmLabel}
              </button>
            </div>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
