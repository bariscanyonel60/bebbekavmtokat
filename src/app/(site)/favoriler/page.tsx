import type { Metadata } from "next";
import { FavoritesList } from "@/components/product/favorites-list";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: "Favorilerim | Bebbek AVM", description: "Favorilere eklediğiniz ürünler.", path: "/favoriler", noIndex: true });
}

export default function FavoritesPage() {
  return (
    <div className="container-page pb-8 pt-6 md:pt-8">
      <Breadcrumbs items={[{ name: "Favorilerim", href: "/favoriler" }]} />
      <h1 className="mb-8 mt-6 font-display text-[2.2rem] leading-[1.05] tracking-tight text-ink md:text-[3.2rem]">Favorilerim</h1>
      <FavoritesList />
    </div>
  );
}
