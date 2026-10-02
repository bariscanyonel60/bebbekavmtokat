"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, Search, X } from "lucide-react";

type SearchResponse = {
  products: { id: string; name: string; slug: string; image: string | null; brand: string | null; category: string | null }[];
  categories: { name: string; slug: string; parent: string | null }[];
  brands: { name: string; slug: string }[];
};

const EMPTY: SearchResponse = { products: [], categories: [], brands: [] };
const DEBOUNCE_MS = 250;

export function SearchOverlay({ popularSearches }: { popularSearches: string[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (response.ok) setResults((await response.json()) as SearchResponse);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setResults(EMPTY);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const open = () => {
    dialogRef.current?.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const close = () => dialogRef.current?.close();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    close();
    router.push(`/urunler?q=${encodeURIComponent(term)}`);
  };

  const term = query.trim();
  const shown = term.length >= 2 ? results : EMPTY;
  const hasResults = shown.products.length + shown.categories.length + shown.brands.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex size-10 items-center justify-center gap-2.5 rounded-full text-sm text-ink-soft transition-colors hover:bg-cream hover:text-ink md:h-11 md:w-auto md:border md:border-line md:bg-white/70 md:px-4 md:hover:border-line-strong md:hover:bg-white xl:pr-5"
        aria-label="Ürün ara"
      >
        <Search className="size-[1.1rem]" aria-hidden="true" />
        <span className="hidden xl:inline" aria-hidden="true">Ne aramıştınız?</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Ürün arama"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/30 backdrop:backdrop-blur-[2px] md:h-auto"
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className="h-full animate-fade-in bg-ivory shadow-lift md:h-auto md:rounded-b-3xl">
          <div className="container-page py-5 md:py-8">
            <form onSubmit={submit} role="search" className="flex items-center gap-3">
              <label htmlFor="site-search" className="sr-only">
                Ürün, kategori veya marka ara
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
                <input
                  ref={inputRef}
                  id="site-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ne aramıştınız?"
                  autoComplete="off"
                  enterKeyHint="search"
                  className="h-14 w-full rounded-full border border-line-strong bg-white pl-14 pr-12 text-base text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-ink md:h-16 md:text-lg"
                />
                {loading ? <Loader2 className="absolute right-5 top-1/2 size-5 -translate-y-1/2 animate-spin text-ink-muted" aria-hidden="true" /> : null}
              </div>
              <button type="button" onClick={close} className="grid size-12 shrink-0 place-items-center rounded-full hover:bg-cream" aria-label="Aramayı kapat">
                <X className="size-5" aria-hidden="true" />
              </button>
            </form>

            <div className="mt-6 max-h-[calc(100dvh-8rem)] overflow-y-auto pb-6 md:max-h-[60vh]" aria-live="polite">
              {term.length < 2 ? (
                <div>
                  <p className="eyebrow mb-3">Popüler aramalar</p>
                  <ul className="flex flex-wrap gap-2">
                    {popularSearches.map((item) => (
                      <li key={item}>
                        <button type="button" onClick={() => setQuery(item)} className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink">
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : !hasResults && !loading ? (
                <p className="py-6 text-ink-soft">
                  “{term}” için sonuç bulunamadı. Farklı bir kelime deneyebilir veya WhatsApp&apos;tan bize sorabilirsiniz.
                </p>
              ) : (
                <div className="grid gap-8 md:grid-cols-[1fr_260px]">
                  <div>
                    {shown.products.length ? <p className="eyebrow mb-3">Ürünler</p> : null}
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {shown.products.map((product) => (
                        <li key={product.id}>
                          <Link href={`/urun/${product.slug}`} onClick={close} className="flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-cream">
                            <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                              {product.image ? <Image src={product.image} alt="" fill sizes="64px" className="object-cover" /> : null}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[0.92rem] font-medium text-ink">{product.name}</span>
                              <span className="mt-0.5 block truncate text-xs text-ink-muted">
                                {[product.brand, product.category].filter(Boolean).join(" · ")}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {shown.products.length ? (
                      <Link href={`/urunler?q=${encodeURIComponent(term)}`} onClick={close} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:underline">
                        Tüm sonuçları gör <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                  <div className="space-y-6">
                    {shown.categories.length ? (
                      <div>
                        <p className="eyebrow mb-3">Kategoriler</p>
                        <ul className="space-y-1">
                          {shown.categories.map((category) => (
                            <li key={category.slug}>
                              <Link href={`/kategori/${category.slug}`} onClick={close} className="block rounded-lg py-1.5 text-sm text-ink-soft hover:text-ink">
                                {category.name}
                                {category.parent ? <span className="text-ink-muted"> · {category.parent}</span> : null}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {shown.brands.length ? (
                      <div>
                        <p className="eyebrow mb-3">Markalar</p>
                        <ul className="flex flex-wrap gap-2">
                          {shown.brands.map((brand) => (
                            <li key={brand.slug}>
                              <Link href={`/marka/${brand.slug}`} onClick={close} className="inline-block rounded-full border border-line bg-white px-3.5 py-1.5 text-sm hover:border-ink">
                                {brand.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
