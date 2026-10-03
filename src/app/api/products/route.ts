import { NextResponse, type NextRequest } from "next/server";
import { getProductsByIds, type ProductCardData } from "@/lib/catalog/products";
import { getProductWhatsAppHref } from "@/lib/whatsapp-server";

export type FavoriteProduct = ProductCardData & { orderHref: string | null };

/** Favoriler sayfası için: ?ids=a,b,c */
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^[a-z0-9]{10,40}$/i.test(id))
    .slice(0, 60);
  const products: FavoriteProduct[] = await Promise.all(
    (await getProductsByIds(ids)).map(async (product) => ({ ...product, orderHref: await getProductWhatsAppHref(product, "order") })),
  );
  return NextResponse.json({ products });
}
