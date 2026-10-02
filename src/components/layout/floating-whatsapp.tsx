import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { getSettings, isTrue } from "@/lib/settings";
import { getGeneralWhatsAppHref } from "@/lib/whatsapp-server";

/** Ürün detayında mobil sticky CTA zaten olduğu için orada globals.css'teki `[data-sticky-cta]` kuralıyla gizlenir. */
export async function FloatingWhatsApp() {
  const settings = await getSettings();
  if (!isTrue(settings.whatsappFloatingActive)) return null;
  const href = await getGeneralWhatsAppHref();
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-floating-wa
      className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 inline-flex size-13 items-center justify-center gap-2 rounded-full bg-wa text-white shadow-lift transition-[width,background-color] duration-300 hover:bg-[#175a42] md:bottom-6 md:right-6 md:size-auto md:h-13 md:px-5"
      aria-label="WhatsApp destek hattı"
    >
      <WhatsAppIcon className="size-6 md:size-5" />
      <span className="hidden text-sm font-medium md:inline">Bize Yazın</span>
    </a>
  );
}
