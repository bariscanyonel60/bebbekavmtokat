import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

export function AdminPageHeader({ title, description, backHref, actions }: { title: string; description?: string; backHref?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {backHref ? (
          <Link href={backHref} className="mb-3 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <ChevronLeft className="size-4" aria-hidden="true" /> Geri
          </Link>
        ) : null}
        <h1 className="font-display text-3xl text-ink md:text-[2.2rem]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12 text-center text-sm text-ink-muted">
        {children}
      </td>
    </tr>
  );
}

export const tableClass = "w-full min-w-[40rem] text-left text-sm";
export const thClass = "px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted";
export const tdClass = "px-5 py-3.5 align-middle";
