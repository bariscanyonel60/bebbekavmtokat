import Link from "next/link";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { buttonClass } from "@/components/ui/button-styles";

type WhatsAppLinkProps = {
  href: string | null;
  label: string;
  variant?: "whatsapp" | "whatsapp-soft" | "secondary" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
  intent?: "info" | "order" | "general";
};

/** WhatsApp numarası ayarlanmamışsa iletişim sayfasına düşer; böylece CTA hiçbir zaman kırık link olmaz. */
export function WhatsAppLink({ href, label, variant = "whatsapp", size = "md", className, intent = "general" }: WhatsAppLinkProps) {
  const classes = buttonClass(variant, size, className);
  if (!href) {
    return (
      <Link href="/iletisim" className={classes}>
        <WhatsAppIcon className="size-[1.1rem]" />
        {label}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes} data-wa-intent={intent}>
      <WhatsAppIcon className="size-[1.1rem]" />
      {label}
      <span className="sr-only"> (WhatsApp yeni sekmede açılır)</span>
    </a>
  );
}
