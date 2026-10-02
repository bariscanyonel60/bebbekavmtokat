"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";

export type VariantOption = { id: string; name: string; colorHex: string | null; available: boolean };

/** Renk/seçenek bilgisini gösterir; seçim yalnızca bilgilendirme amaçlıdır (sepet yok). */
export function VariantPicker({ variants }: { variants: VariantOption[] }) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id);
  const selected = variants.find((variant) => variant.id === selectedId);
  const hasColors = variants.some((variant) => variant.colorHex);

  return (
    <fieldset>
      <legend className="text-sm text-ink-soft">
        {hasColors ? "Renk" : "Seçenek"}: <span className="font-medium text-ink">{selected?.name}</span>
        {selected && !selected.available ? <span className="ml-2 text-rose-deep">(stok için danışın)</span> : null}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          return (
            <label
              key={variant.id}
              className={cx(
                "relative cursor-pointer transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-sage-deep",
                variant.colorHex
                  ? cx("size-10 rounded-full ring-1 ring-line-strong ring-offset-[3px] ring-offset-ivory", isSelected && "ring-2 ring-ink")
                  : cx("inline-flex h-10 items-center rounded-full border px-4 text-sm", isSelected ? "border-ink bg-ink text-ivory" : "border-line-strong hover:border-ink"),
                !variant.available && "opacity-50",
              )}
              style={variant.colorHex ? { backgroundColor: variant.colorHex } : undefined}
            >
              <input
                type="radio"
                name="variant"
                value={variant.id}
                checked={isSelected}
                onChange={() => setSelectedId(variant.id)}
                className="sr-only"
              />
              {variant.colorHex ? <span className="sr-only">{variant.name}</span> : variant.name}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
