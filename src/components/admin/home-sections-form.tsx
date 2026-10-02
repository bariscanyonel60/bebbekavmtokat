"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import type { ActionState } from "@/lib/admin/form";

export type HomeSectionRow = { key: string; label: string; title: string; subtitle: string; isActive: boolean };

/** Hero ve banner bölümlerinin içerikleri kendi sayfalarından yönetilir; burada yalnızca sıra ve görünürlük ayarlanır. */
const NO_TEXT_KEYS = new Set(["hero", "banner-primary", "banner-secondary", "split-banners"]);

export function HomeSectionsForm({ action, sections }: { action: (prev: ActionState, form: FormData) => Promise<ActionState>; sections: HomeSectionRow[] }) {
  const [rows, setRows] = useState(sections);

  function move(index: number, delta: number) {
    setRows((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <AdminForm action={action} submitLabel="Düzeni Kaydet">
      <ol className="space-y-3">
        {rows.map((row, index) => (
          <li key={row.key} className="rounded-3xl border border-line bg-white p-4 md:p-5">
            <input type="hidden" name="order" value={row.key} />
            <div className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cream text-xs font-semibold text-ink-soft">{index + 1}</span>
              <span className="min-w-0 flex-1 font-medium text-ink">{row.label}</span>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" name={`active:${row.key}`} defaultChecked={row.isActive} className="size-4 accent-[var(--color-sage-deep)]" />
                Görünür
              </label>
              <div className="flex">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-cream hover:text-ink disabled:opacity-30" aria-label={`${row.label} yukarı taşı`}>
                  <ArrowUp className="size-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-cream hover:text-ink disabled:opacity-30" aria-label={`${row.label} aşağı taşı`}>
                  <ArrowDown className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            {NO_TEXT_KEYS.has(row.key) ? (
              <>
                <input type="hidden" name={`title:${row.key}`} value={row.title} />
                <input type="hidden" name={`subtitle:${row.key}`} value={row.subtitle} />
              </>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="block text-xs text-ink-muted">
                  Başlık
                  <input name={`title:${row.key}`} defaultValue={row.title} maxLength={190} className="mt-1 h-10 w-full rounded-xl border border-line-strong bg-white px-3 text-sm text-ink focus:border-ink focus:outline-none" />
                </label>
                <label className="block text-xs text-ink-muted">
                  Alt başlık
                  <input name={`subtitle:${row.key}`} defaultValue={row.subtitle} maxLength={500} className="mt-1 h-10 w-full rounded-xl border border-line-strong bg-white px-3 text-sm text-ink focus:border-ink focus:outline-none" />
                </label>
              </div>
            )}
          </li>
        ))}
      </ol>
    </AdminForm>
  );
}
