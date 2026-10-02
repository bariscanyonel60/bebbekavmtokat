import { NextResponse, type NextRequest } from "next/server";
import { getCategoryIndex } from "@/lib/catalog/categories";
import { buildSearchWhere } from "@/lib/catalog/products";
import { db } from "@/lib/db";
import { normalizeText, searchTokens } from "@/lib/text";

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 80);
  const tokens = searchTokens(query);
  if (tokens.length === 0 || query.trim().length < 2) {
    return NextResponse.json({ products: [], categories: [], brands: [] });
  }

  const [products, index, brands] = await Promise.all([
    db.product.findMany({
      where: { isActive: true, AND: buildSearchWhere(query) },
      orderBy: [{ isFeatured: "desc" }, { isBestSeller: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        brand: { select: { name: true } },
        primaryCategory: { select: { name: true } },
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true } },
      },
    }),
    getCategoryIndex(),
    db.brand.findMany({ where: { isActive: true }, select: { name: true, slug: true } }),
  ]);

  const matches = (name: string) => {
    const normalized = normalizeText(name);
    return tokens.every((token) => normalized.includes(token));
  };

  const categories = [...index.byId.values()]
    .filter((category) => matches(category.name))
    .slice(0, 6)
    .map((category) => ({
      name: category.name,
      slug: category.slug,
      parent: category.parentId ? (index.byId.get(category.parentId)?.name ?? null) : null,
    }));

  return NextResponse.json(
    {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0]?.url ?? null,
        brand: product.brand?.name ?? null,
        category: product.primaryCategory?.name ?? null,
      })),
      categories,
      brands: brands.filter((brand) => matches(brand.name)).slice(0, 6),
    },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
