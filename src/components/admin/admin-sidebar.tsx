"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  ExternalLink,
  FolderTree,
  Gauge,
  House,
  Images,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Search,
  Settings,
  X,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { cx } from "@/lib/cx";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: Gauge },
  { href: "/admin/urunler", label: "Ürünler", Icon: Package },
  { href: "/admin/kategoriler", label: "Kategoriler", Icon: FolderTree },
  { href: "/admin/markalar", label: "Markalar", Icon: Building2 },
  { href: "/admin/hero", label: "Hero Slider", Icon: Images },
  { href: "/admin/bannerlar", label: "Bannerlar", Icon: LayoutTemplate },
  { href: "/admin/ana-sayfa", label: "Ana Sayfa", Icon: House },
  { href: "/admin/ayarlar/whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { href: "/admin/ayarlar/iletisim", label: "İletişim", Icon: Phone },
  { href: "/admin/ayarlar/seo", label: "SEO", Icon: Search },
  { href: "/admin/ayarlar/site", label: "Site Ayarları", Icon: Settings },
];

export function AdminSidebar({ userName, logoutAction }: { userName: string; logoutAction: () => Promise<void> }) {
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (value: boolean) => setOpenedAt(value ? pathname : null);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full hover:bg-cream" aria-label="Menüyü aç">
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <span className="font-display text-lg">Bebbek AVM</span>
        <span className="size-10" aria-hidden="true" />
      </div>
      {open ? <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" /> : null}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Yönetim menüsü"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/admin" className="font-display text-xl text-ink">
            Bebbek AVM
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-cream lg:hidden" aria-label="Menüyü kapat">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={cx(
                    "flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors",
                    isActive(href) ? "bg-ink font-medium text-ivory" : "text-ink-soft hover:bg-cream hover:text-ink",
                  )}
                >
                  {label === "WhatsApp" ? <WhatsAppIcon className="size-4" /> : <Icon className="size-4" aria-hidden="true" />}
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-1 border-t border-line p-3">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-ink-soft hover:bg-cream hover:text-ink">
            <ExternalLink className="size-4" aria-hidden="true" /> Siteyi görüntüle
          </a>
          <form action={logoutAction}>
            <button type="submit" className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-ink-soft hover:bg-cream hover:text-ink">
              <LogOut className="size-4" aria-hidden="true" /> Çıkış yap
            </button>
          </form>
          <p className="truncate px-3 pt-1 text-xs text-ink-muted">{userName}</p>
        </div>
      </aside>
    </>
  );
}
