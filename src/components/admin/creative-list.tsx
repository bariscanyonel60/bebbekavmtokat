import Image from "next/image";
import Link from "next/link";

type CreativeRow = { id: string; title: string; imageUrl: string; meta: string; isActive: boolean };

export function CreativeList({ rows, basePath, emptyText }: { rows: CreativeRow[]; basePath: string; emptyText: string }) {
  if (rows.length === 0) return <p className="rounded-3xl border border-dashed border-line-strong bg-white px-6 py-12 text-center text-sm text-ink-muted">{emptyText}</p>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <li key={row.id}>
          <Link href={`${basePath}/${row.id}`} className="group block overflow-hidden rounded-3xl border border-line bg-white transition hover:border-line-strong">
            <span className="relative block aspect-[16/9] bg-cream">
              <Image src={row.imageUrl} alt="" fill sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 90vw" className="object-cover transition group-hover:scale-[1.02]" unoptimized />
              {!row.isActive ? <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs text-ink-soft">Pasif</span> : null}
            </span>
            <span className="block px-5 py-4">
              <span className="block truncate font-medium text-ink">{row.title}</span>
              <span className="mt-1 block text-xs text-ink-muted">{row.meta}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
