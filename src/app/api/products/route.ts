import { NextResponse, type NextRequest } from "next/server";
import { getProductsByIds } from "@/lib/catalog/products";

/** Favoriler sayfası için: ?ids=a,b,c */
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^[a-z0-9]{10,40}$/i.test(id))
    .slice(0, 60);
  const products = await getProductsByIds(ids);
  return NextResponse.json({ products });
}
