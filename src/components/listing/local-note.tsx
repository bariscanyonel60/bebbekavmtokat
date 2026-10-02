import Link from "next/link";
import { MapPin } from "lucide-react";
import { WhatsAppLink } from "@/components/whatsapp/whatsapp-link";
import { fullAddress } from "@/lib/local-seo";
import { getSettings } from "@/lib/settings";
import { getGeneralWhatsAppHref } from "@/lib/whatsapp-server";

/** Kategori/marka listelerinin altında mağazanın şehrini ve adresini anan kısa yerel bilgi bloğu. */
export async function LocalNote({ subject }: { subject: string }) {
  const [settings, waHref] = await Promise.all([getSettings(), getGeneralWhatsAppHref()]);
  const address = fullAddress(settings);
  if (!settings.cityLocative || !address) return null;

  return (
    <section aria-labelledby="local-note" className="container-page pt-16 md:pt-20">
      <div className="rounded-3xl border border-line bg-white/60 p-6 md:flex md:items-center md:justify-between md:gap-10 md:p-8">
        <div className="max-w-3xl">
          <h2 id="local-note" className="font-display text-[1.6rem] leading-tight text-ink md:text-[1.9rem]">
            {settings.cityLocative} {subject}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-[0.95rem]">
            {subject} modellerini {settings.siteName} mağazamızda yakından görebilir, ekibimizden birebir bilgi alabilirsiniz. Güncel stok ve
            fiyat için WhatsApp&apos;tan yazmanız yeterli.
          </p>
          <p className="mt-4 flex items-start gap-2 text-sm text-ink">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand-pink" aria-hidden="true" />
            <Link href="/iletisim" className="hover:underline">
              {address}
            </Link>
          </p>
        </div>
        <WhatsAppLink href={waHref} label="WhatsApp'tan Sorun" className="mt-6 md:mt-0 md:shrink-0" />
      </div>
    </section>
  );
}
