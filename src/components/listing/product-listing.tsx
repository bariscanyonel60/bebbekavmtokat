import Link from "next/link";
import { Check, SearchX } from "lucide-react";
import { ActiveFilterChips, FilterPanel } from "@/components/listing/filter-panel";
import { ListingDrawer } from "@/components/listing/listing-drawer";
import { Pagination } from "@/components/listing/pagination";
import { SortSelect } from "@/components/listing/sort-select";
import { ProductGrid } from "@/components/product/product-card";
import { buttonClass } from "@/components/ui/button-styles";
import { filterHref, SORT_OPTIONS, type FilterState, type SortKey } from "@/lib/catalog/filters";
import type { ListingData } from "@/lib/catalog/listing";
import { cx } from "@/lib/cx";

type ProductListingProps = {
  basePath: string;
  data: ListingData;
  hideCampaignToggle?: boolean;
};

function activeCount(state: FilterState): number {
  return (
    state.brands.length +
    state.categories.length +
    Object.values(state.attributes).reduce((sum, values) => sum + values.length, 0) +
    Number(state.inStock) +
    Number(state.campaign) +
    Number(state.isNew)
  );
}

export function ProductListing({ basePath, data, hideCampaignToggle = false }: ProductListingProps) {
  const { state, result, facets, categoryOptions } = data;
  const sortHrefs = Object.fromEntries(
    SORT_OPTIONS.map((option) => [option.value, filterHref(basePath, state, { type: "sort", value: option.value })]),
  ) as Record<SortKey, string>;
  const panel = <FilterPanel basePath={basePath} state={state} facets={facets} categoryOptions={categoryOptions} hideCampaignToggle={hideCampaignToggle} />;
  const filters = activeCount(state);

  return (
    <div className="container-page pb-24">
      <div className="sticky top-16 z-30 -mx-5 mb-6 flex divide-x divide-line border-y border-line bg-ivory/95 backdrop-blur md:-mx-8 lg:hidden">
        <ListingDrawer
          kind="filter"
          title="Filtrele"
          label="FİLTRELE"
          badge={filters}
          confirmLabel={`${result.total} ürünü göster`}
        >
          {panel}
        </ListingDrawer>
        <ListingDrawer kind="sort" title="Sırala" label="SIRALA">
          <ul className="divide-y divide-line">
            {SORT_OPTIONS.map((option) => (
              <li key={option.value}>
                <Link href={sortHrefs[option.value]} scroll={false} rel="nofollow" className="flex items-center justify-between py-4 text-[0.95rem]">
                  <span className={cx(option.value === state.sort && "font-semibold")}>{option.label}</span>
                  {option.value === state.sort ? <Check className="size-4" aria-hidden="true" /> : null}
                </Link>
              </li>
            ))}
          </ul>
        </ListingDrawer>
      </div>

      <div className="lg:grid lg:grid-cols-[17rem_1fr] lg:gap-12 xl:grid-cols-[18rem_1fr]">
        <aside aria-label="Filtreler" className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto pb-8 pr-2">{panel}</div>
        </aside>

        <div id="urun-listesi" className="min-w-0 scroll-mt-32">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-ink-soft" aria-live="polite">
              <span className="font-semibold text-ink">{result.total}</span> ürün listeleniyor
            </p>
            <div className="hidden lg:block">
              <SortSelect value={state.sort} hrefs={sortHrefs} />
            </div>
          </div>
          <div className="mb-6 empty:hidden">
            <ActiveFilterChips basePath={basePath} state={state} facets={facets} categoryOptions={categoryOptions} />
          </div>

          {result.items.length ? (
            <ProductGrid products={result.items} eagerCount={4} columns="listing" />
          ) : (
            <div className="flex flex-col items-center rounded-3xl bg-cream/70 px-6 py-16 text-center">
              <SearchX className="size-9 text-ink-muted" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl text-ink">Aradığınız kriterlere uygun ürün bulunamadı</h2>
              <p className="mt-2 max-w-md text-sm text-ink-soft">Filtreleri azaltmayı deneyebilir ya da aradığınız ürün için WhatsApp üzerinden bize ulaşabilirsiniz.</p>
              <Link href={filterHref(basePath, state, { type: "clearAll" })} className={buttonClass("secondary", "md", "mt-6")}>
                Filtreleri temizle
              </Link>
            </div>
          )}

          <Pagination basePath={basePath} state={state} pageCount={result.pageCount} />
        </div>
      </div>
    </div>
  );
}
