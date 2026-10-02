"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { SORT_OPTIONS, type SortKey } from "@/lib/catalog/filters";

/** Masaüstü sıralama seçimi. `hrefs` sunucuda hazırlanır; böylece filtre mantığı tek yerde kalır. */
export function SortSelect({ value, hrefs }: { value: SortKey; hrefs: Record<SortKey, string> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="relative inline-flex items-center gap-2 text-sm text-ink-soft">
      <span>Sırala:</span>
      <select
        value={value}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value as SortKey;
          startTransition(() => router.push(hrefs[next], { scroll: false }));
        }}
        className="h-10 cursor-pointer appearance-none rounded-full border border-line-strong bg-white py-0 pl-4 pr-10 text-sm font-medium text-ink focus:border-ink focus:outline-none disabled:opacity-60"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-ink-muted" aria-hidden="true" />
    </label>
  );
}
