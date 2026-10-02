import type { ReactNode } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { applyChange, filterHref, hasActiveFilters, serializeFilters, type FilterState } from "@/lib/catalog/filters";
import type { CategoryOption } from "@/lib/catalog/listing";
import type { Facets, FacetOption } from "@/lib/catalog/products";
import { cx } from "@/lib/cx";
import { formatPrice } from "@/lib/format";

type FilterPanelProps = {
  basePath: string;
  state: FilterState;
  facets: Facets;
  categoryOptions: CategoryOption[];
  hideCampaignToggle?: boolean;
};

function FilterGroup({ title, children, open = true }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-line py-5 first:pt-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-lg leading-none text-ink-muted transition-transform group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="pt-4">{children}</div>
    </details>
  );
}

function OptionLink({ href, label, count, active, colorHex }: { href: string; label: string; count?: number; active: boolean; colorHex?: string | null }) {
  return (
    <Link
      href={href}
      scroll={false}
      rel="nofollow"
      aria-current={active ? "true" : undefined}
      className="group/opt flex min-h-9 items-center gap-3 rounded-lg py-1 text-sm text-ink-soft transition-colors hover:text-ink"
    >
      {colorHex ? (
        <span
          className={cx("grid size-5 shrink-0 place-items-center rounded-full ring-1 ring-line-strong ring-offset-2 ring-offset-ivory", active && "ring-2 ring-ink")}
          style={{ backgroundColor: colorHex }}
          aria-hidden="true"
        />
      ) : (
        <span
          className={cx(
            "grid size-[1.1rem] shrink-0 place-items-center rounded-[5px] border transition-colors",
            active ? "border-ink bg-ink text-ivory" : "border-line-strong bg-white group-hover/opt:border-ink-muted",
          )}
          aria-hidden="true"
        >
          {active ? <Check className="size-3" strokeWidth={3} /> : null}
        </span>
      )}
      <span className={cx("flex-1", active && "font-medium text-ink")}>{label}</span>
      {count !== undefined ? <span className="text-xs text-ink-muted">{count}</span> : null}
    </Link>
  );
}

function hiddenInputs(state: FilterState) {
  const query = serializeFilters(applyChange(state, { type: "clearPrice" }));
  return [...new URLSearchParams(query.slice(1)).entries()].map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />);
}

export function FilterPanel({ basePath, state, facets, categoryOptions, hideCampaignToggle = false }: FilterPanelProps) {
  const visibleBrands = facets.brands.filter((brand) => brand.count > 0 || state.brands.includes(brand.slug));
  const attributeOptions = (options: FacetOption[], key: string) =>
    options.filter((option) => option.count > 0 || (state.attributes[key] ?? []).includes(option.slug));

  return (
    <div>
      {hasActiveFilters(state) ? (
        <div className="mb-5 flex items-center justify-between border-b border-line pb-5">
          <span className="text-sm font-semibold text-ink">Seçili filtreler</span>
          <Link href={filterHref(basePath, state, { type: "clearAll" })} scroll={false} rel="nofollow" className="inline-flex items-center gap-1 text-sm text-rose-deep hover:underline">
            <X className="size-3.5" aria-hidden="true" />
            Temizle
          </Link>
        </div>
      ) : null}

      {categoryOptions.length ? (
        <FilterGroup title="Kategori">
          <ul className="space-y-0.5">
            {categoryOptions.map((option) => (
              <li key={option.slug}>
                <OptionLink
                  href={filterHref(basePath, state, { type: "category", value: option.slug })}
                  label={option.label}
                  active={state.categories.includes(option.slug)}
                />
              </li>
            ))}
          </ul>
        </FilterGroup>
      ) : null}

      {visibleBrands.length ? (
        <FilterGroup title="Marka">
          <ul className="space-y-0.5">
            {visibleBrands.map((brand) => (
              <li key={brand.slug}>
                <OptionLink
                  href={filterHref(basePath, state, { type: "brand", value: brand.slug })}
                  label={brand.label}
                  count={brand.count}
                  active={state.brands.includes(brand.slug)}
                />
              </li>
            ))}
          </ul>
        </FilterGroup>
      ) : null}

      {facets.attributes.map((facet) => {
        const options = attributeOptions(facet.options, facet.slug);
        if (!options.length) return null;
        const isColor = facet.type === "COLOR";
        return (
          <FilterGroup key={facet.slug} title={facet.name} open={Boolean(state.attributes[facet.slug]) || facets.attributes.indexOf(facet) < 3}>
            <ul className={isColor ? "grid grid-cols-2 gap-x-3" : "space-y-0.5"}>
              {options.map((option) => (
                <li key={option.slug}>
                  <OptionLink
                    href={filterHref(basePath, state, { type: "attribute", key: facet.slug, value: option.slug })}
                    label={option.label}
                    count={option.count}
                    colorHex={isColor ? option.colorHex || "#d8cdbd" : undefined}
                    active={(state.attributes[facet.slug] ?? []).includes(option.slug)}
                  />
                </li>
              ))}
            </ul>
          </FilterGroup>
        );
      })}

      {facets.priceRange ? (
        <FilterGroup title="Fiyat Aralığı">
          <form action={basePath} method="get" className="space-y-3">
            {hiddenInputs(state)}
            <div className="flex items-center gap-2">
              <label className="flex-1">
                <span className="sr-only">En düşük fiyat</span>
                <input
                  type="number"
                  name="min"
                  inputMode="numeric"
                  min={0}
                  defaultValue={state.minPrice ?? ""}
                  placeholder={formatPrice(facets.priceRange.min)}
                  className="h-11 w-full rounded-xl border border-line-strong bg-white px-3 text-sm placeholder:text-ink-muted focus:border-ink focus:outline-none"
                />
              </label>
              <span className="text-ink-muted" aria-hidden="true">
                –
              </span>
              <label className="flex-1">
                <span className="sr-only">En yüksek fiyat</span>
                <input
                  type="number"
                  name="max"
                  inputMode="numeric"
                  min={0}
                  defaultValue={state.maxPrice ?? ""}
                  placeholder={formatPrice(facets.priceRange.max)}
                  className="h-11 w-full rounded-xl border border-line-strong bg-white px-3 text-sm placeholder:text-ink-muted focus:border-ink focus:outline-none"
                />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="h-10 rounded-full bg-ink px-5 text-sm font-medium text-ivory transition-colors hover:bg-ink-soft">
                Uygula
              </button>
              {state.minPrice !== null || state.maxPrice !== null ? (
                <Link href={filterHref(basePath, state, { type: "clearPrice" })} scroll={false} rel="nofollow" className="text-sm text-ink-soft hover:text-ink hover:underline">
                  Fiyatı sıfırla
                </Link>
              ) : null}
            </div>
          </form>
        </FilterGroup>
      ) : null}

      <FilterGroup title="Durum">
        <ul className="space-y-0.5">
          <li>
            <OptionLink href={filterHref(basePath, state, { type: "flag", key: "inStock" })} label="Stokta olanlar" active={state.inStock} />
          </li>
          {hideCampaignToggle ? null : (
            <li>
              <OptionLink href={filterHref(basePath, state, { type: "flag", key: "campaign" })} label="Kampanyalı ürünler" active={state.campaign} />
            </li>
          )}
          <li>
            <OptionLink href={filterHref(basePath, state, { type: "flag", key: "isNew" })} label="Yeni gelenler" active={state.isNew} />
          </li>
        </ul>
      </FilterGroup>
    </div>
  );
}

/** Aktif filtreleri, tek tıkla kaldırılabilen etiketler olarak gösterir. */
export function ActiveFilterChips({ basePath, state, facets, categoryOptions }: Omit<FilterPanelProps, "hideCampaignToggle">) {
  const chips: { label: string; href: string }[] = [];
  for (const slug of state.categories) {
    const option = categoryOptions.find((item) => item.slug === slug);
    if (option) chips.push({ label: option.label, href: filterHref(basePath, state, { type: "category", value: slug }) });
  }
  for (const slug of state.brands) {
    const brand = facets.brands.find((item) => item.slug === slug);
    chips.push({ label: brand?.label ?? slug, href: filterHref(basePath, state, { type: "brand", value: slug }) });
  }
  for (const [key, values] of Object.entries(state.attributes)) {
    const facet = facets.attributes.find((item) => item.slug === key);
    for (const value of values) {
      const option = facet?.options.find((item) => item.slug === value);
      chips.push({ label: option ? `${facet?.name}: ${option.label}` : value, href: filterHref(basePath, state, { type: "attribute", key, value }) });
    }
  }
  if (state.minPrice !== null || state.maxPrice !== null) {
    const label = [state.minPrice !== null ? formatPrice(state.minPrice) : "", state.maxPrice !== null ? formatPrice(state.maxPrice) : ""].join(" – ");
    chips.push({ label, href: filterHref(basePath, state, { type: "clearPrice" }) });
  }
  if (state.inStock) chips.push({ label: "Stokta olanlar", href: filterHref(basePath, state, { type: "flag", key: "inStock" }) });
  if (state.campaign) chips.push({ label: "Kampanyalı", href: filterHref(basePath, state, { type: "flag", key: "campaign" }) });
  if (state.isNew) chips.push({ label: "Yeni gelenler", href: filterHref(basePath, state, { type: "flag", key: "isNew" }) });

  if (!chips.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Aktif filtreler">
      {chips.map((chip) => (
        <li key={chip.href}>
          <Link
            href={chip.href}
            scroll={false}
            rel="nofollow"
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-cream px-3 text-xs font-medium text-ink transition-colors hover:bg-sand"
          >
            {chip.label}
            <X className="size-3" aria-hidden="true" />
            <span className="sr-only">filtresini kaldır</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
