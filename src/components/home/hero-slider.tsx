"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { buttonClass } from "@/components/ui/button-styles";
import { cx } from "@/lib/cx";

type ImgProps = { src: string; srcSet?: string; sizes?: string; width?: number; height?: number };

export type HeroSlideView = {
  id: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
  alt: string;
  desktop: ImgProps;
  mobile: ImgProps;
  primaryCtaLabel: string | null;
  primaryCtaHref: string | null;
  showWhatsappCta: boolean;
};

const INTERVAL_MS = 7000;

export function HeroSlider({ slides, whatsappHref }: { slides: HeroSlideView[]; whatsappHref: string | null }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || userPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => go(index + 1), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [index, paused, userPaused, count, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Öne çıkan koleksiyonlar"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        const end = event.changedTouches[0]?.clientX;
        if (start === null || end === undefined) return;
        if (Math.abs(end - start) > 50) go(index + (end < start ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div className="relative grid">
        {slides.map((slide, slideIndex) => {
          const isActive = slideIndex === index;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} / ${count}`}
              aria-hidden={!isActive}
              inert={!isActive}
              className={cx(
                "col-start-1 row-start-1 transition-opacity duration-1000 ease-(--ease-soft)",
                isActive ? "z-10 opacity-100" : "z-0 opacity-0",
              )}
            >
              <div className="relative lg:h-[min(84vh,850px)] lg:min-h-[600px]">
                <picture>
                  <source media="(min-width: 1024px)" srcSet={slide.desktop.srcSet} sizes="100vw" />
                  <img
                    {...slide.mobile}
                    alt={slide.alt}
                    loading={slideIndex === 0 ? "eager" : "lazy"}
                    fetchPriority={slideIndex === 0 ? "high" : "auto"}
                    decoding="async"
                    className="aspect-[4/3.6] w-full object-cover object-[72%_center] sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full lg:object-center"
                  />
                </picture>
                <div className="hidden lg:absolute lg:inset-0 lg:block lg:bg-gradient-to-r lg:from-ivory/85 lg:via-ivory/35 lg:to-transparent" aria-hidden="true" />

                <div className="lg:absolute lg:inset-0 lg:flex lg:items-center">
                  <div className="container-page">
                    <div className={cx("max-w-xl py-8 lg:py-0", isActive && "animate-fade-up")}>
                      {slide.eyebrow ? <p className="eyebrow mb-4 text-sage-deep">{slide.eyebrow}</p> : null}
                      <h2 className="font-display text-[2.35rem] leading-[1.04] tracking-[-0.015em] text-ink sm:text-5xl lg:text-[4.1rem]">
                        {slide.title}
                      </h2>
                      {slide.description ? (
                        <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-ink-soft lg:text-lg">{slide.description}</p>
                      ) : null}
                      <div className="mt-8 flex flex-wrap gap-3">
                        {slide.primaryCtaHref ? (
                          <Link href={slide.primaryCtaHref} className={buttonClass("primary", "lg", "group")}>
                            {slide.primaryCtaLabel || "Ürünleri Keşfet"}
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                          </Link>
                        ) : null}
                        {slide.showWhatsappCta && whatsappHref ? (
                          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "lg")}>
                            <WhatsAppIcon className="size-[1.1rem] text-wa" />
                            WhatsApp&apos;tan Bilgi Al
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 ? (
        <div className="container-page relative z-20 lg:absolute lg:inset-x-0 lg:bottom-8">
          <div className="flex items-center gap-3 pb-2 lg:pb-0">
            <div className="flex items-center gap-2">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(slideIndex)}
                  aria-label={`${slideIndex + 1}. slayta git`}
                  aria-current={slideIndex === index}
                  className="group grid h-8 place-items-center"
                >
                  <span className={cx("block h-1 rounded-full transition-all duration-500", slideIndex === index ? "w-10 bg-ink" : "w-5 bg-ink/25 group-hover:bg-ink/50")} />
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => setUserPaused((value) => !value)} className="grid size-10 place-items-center rounded-full border border-line-strong bg-ivory/80 backdrop-blur hover:bg-white" aria-label={userPaused ? "Otomatik geçişi başlat" : "Otomatik geçişi durdur"}>
                {userPaused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              </button>
              <button type="button" onClick={() => go(index - 1)} className="grid size-10 place-items-center rounded-full border border-line-strong bg-ivory/80 backdrop-blur hover:bg-white" aria-label="Önceki slayt">
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => go(index + 1)} className="grid size-10 place-items-center rounded-full border border-line-strong bg-ivory/80 backdrop-blur hover:bg-white" aria-label="Sonraki slayt">
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
