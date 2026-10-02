"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Expand, ImageOff, X } from "lucide-react";
import { cx } from "@/lib/cx";

export type GalleryImage = { url: string; alt: string; width: number | null; height: number | null };

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const count = images.length;

  const goTo = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const next = (index + count) % count;
      setActive(next);
      const track = trackRef.current;
      if (track) track.scrollTo({ left: track.clientWidth * next, behavior });
    },
    [count],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(Math.round(track.scrollLeft / track.clientWidth)));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onZoomMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setZoom({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
  };

  if (count === 0) {
    return (
      <div className="grid aspect-square place-items-center rounded-3xl bg-cream text-ink-muted">
        <ImageOff className="size-10" aria-hidden="true" />
        <span className="sr-only">Bu ürün için görsel bulunmuyor</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row" aria-roledescription="galeri" aria-label={`${productName} görselleri`}>
      {count > 1 ? (
        <ul className="no-scrollbar flex gap-2.5 overflow-x-auto lg:max-h-[42rem] lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-y-auto">
          {images.map((image, index) => (
            <li key={image.url} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(index)}
                aria-label={`${index + 1}. görseli göster`}
                aria-current={index === active ? "true" : undefined}
                className={cx(
                  "relative block size-16 overflow-hidden rounded-xl bg-cream ring-offset-2 ring-offset-ivory transition md:size-20",
                  index === active ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative min-w-0 flex-1">
        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-3xl bg-cream lg:overflow-hidden"
          tabIndex={0}
          aria-label="Ürün görselleri; ok tuşlarıyla gezinebilirsiniz"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") goTo(active + 1);
            if (event.key === "ArrowLeft") goTo(active - 1);
          }}
        >
          {images.map((image, index) => (
            <div
              key={image.url}
              className="relative aspect-square w-full shrink-0 snap-center overflow-hidden lg:cursor-zoom-in"
              onPointerMove={index === active ? onZoomMove : undefined}
              onPointerLeave={() => setZoom(null)}
              onClick={() => dialogRef.current?.showModal()}
              aria-hidden={index !== active}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 1280px) 46vw, (min-width: 1024px) 50vw, 100vw"
                preload={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                className="object-cover transition-transform duration-200 ease-out"
                style={index === active && zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </div>
          ))}
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              className="absolute left-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:bg-white lg:grid"
              aria-label="Önceki görsel"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              className="absolute right-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:bg-white lg:grid"
              aria-label="Sonraki görsel"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            <p className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur lg:hidden" aria-live="polite">
              {active + 1} / {count}
            </p>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:bg-white"
          aria-label="Görseli tam ekran aç"
        >
          <Expand className="size-[1.1rem]" aria-hidden="true" />
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${productName} tam ekran görsel`}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-ink/95 p-0 text-ivory backdrop:bg-ink/80"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") goTo(active + 1, "instant");
          if (event.key === "ArrowLeft") goTo(active - 1, "instant");
        }}
      >
        <div className="relative flex h-full items-center justify-center p-4 md:p-12">
          <div className="relative h-full w-full">
            <Image src={images[active].url} alt={images[active].alt} fill sizes="100vw" className="object-contain" />
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label="Tam ekranı kapat"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={() => goTo(active - 1, "instant")}
                className="absolute left-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                aria-label="Önceki görsel"
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => goTo(active + 1, "instant")}
                className="absolute right-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                aria-label="Sonraki görsel"
              >
                <ChevronRight className="size-6" aria-hidden="true" />
              </button>
              <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-ivory/80">
                {active + 1} / {count}
              </p>
            </>
          ) : null}
        </div>
      </dialog>
    </div>
  );
}
