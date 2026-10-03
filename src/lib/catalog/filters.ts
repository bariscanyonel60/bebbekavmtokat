export const SORT_OPTIONS = [
  { value: "recommended", label: "Önerilen" },
  { value: "newest", label: "En Yeniler" },
  { value: "name", label: "İsme Göre (A-Z)" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export type FilterState = {
  q: string;
  brands: string[];
  categories: string[];
  attributes: Record<string, string[]>;
  inStock: boolean;
  campaign: boolean;
  isNew: boolean;
  sort: SortKey;
  page: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

const RESERVED_KEYS = new Set(["q", "brand", "cat", "stock", "campaign", "new", "sort", "page"]);
const SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function list(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return [...new Set(raw.split(",").map((part) => part.trim()).filter((part) => SLUG_PATTERN.test(part)))];
}

function toNumber(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function isSortKey(value: string): value is SortKey {
  return SORT_OPTIONS.some((option) => option.value === value);
}

/** URL query → filtre durumu. Bilinmeyen anahtarlar, izin verilen özellik slug'larıyla eşleşirse dinamik filtre olarak alınır. */
export function parseFilters(params: RawSearchParams, allowedAttributeSlugs: string[] = []): FilterState {
  const attributes: Record<string, string[]> = {};
  const allowed = new Set(allowedAttributeSlugs);
  for (const [key, value] of Object.entries(params)) {
    if (RESERVED_KEYS.has(key) || !allowed.has(key)) continue;
    const values = list(value);
    if (values.length > 0) attributes[key] = values;
  }

  const sort = first(params.sort);
  const page = Math.max(1, Math.floor(toNumber(first(params.page)) ?? 1));

  return {
    q: first(params.q).trim().slice(0, 80),
    brands: list(params.brand),
    categories: list(params.cat),
    attributes,
    inStock: first(params.stock) === "var",
    campaign: first(params.campaign) === "1",
    isNew: first(params.new) === "1",
    sort: isSortKey(sort) ? sort : "recommended",
    page,
  };
}

export function serializeFilters(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.categories.length) params.set("cat", state.categories.join(","));
  if (state.brands.length) params.set("brand", state.brands.join(","));
  for (const [key, values] of Object.entries(state.attributes)) {
    if (values.length) params.set(key, values.join(","));
  }
  if (state.inStock) params.set("stock", "var");
  if (state.campaign) params.set("campaign", "1");
  if (state.isNew) params.set("new", "1");
  if (state.sort !== "recommended") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function hasActiveFilters(state: FilterState): boolean {
  return (
    state.brands.length > 0 ||
    state.categories.length > 0 ||
    Object.keys(state.attributes).length > 0 ||
    state.inStock ||
    state.campaign ||
    state.isNew ||
    state.q.length > 0
  );
}

function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export type FilterChange =
  | { type: "brand"; value: string }
  | { type: "category"; value: string }
  | { type: "attribute"; key: string; value: string }
  | { type: "flag"; key: "inStock" | "campaign" | "isNew" }
  | { type: "sort"; value: SortKey }
  | { type: "page"; value: number }
  | { type: "clearAll" };

export function applyChange(state: FilterState, change: FilterChange): FilterState {
  const next: FilterState = { ...state, attributes: { ...state.attributes }, page: 1 };
  switch (change.type) {
    case "brand":
      next.brands = toggle(state.brands, change.value);
      break;
    case "category":
      next.categories = toggle(state.categories, change.value);
      break;
    case "attribute": {
      const values = toggle(state.attributes[change.key] ?? [], change.value);
      if (values.length) next.attributes[change.key] = values;
      else delete next.attributes[change.key];
      break;
    }
    case "flag":
      next[change.key] = !state[change.key];
      break;
    case "sort":
      next.sort = change.value;
      break;
    case "page":
      next.page = change.value;
      break;
    case "clearAll":
      return { ...next, q: state.q, brands: [], categories: [], attributes: {}, inStock: false, campaign: false, isNew: false };
    default: {
      const exhaustive: never = change;
      return exhaustive;
    }
  }
  return next;
}

export function filterHref(basePath: string, state: FilterState, change: FilterChange): string {
  return `${basePath}${serializeFilters(applyChange(state, change))}`;
}
