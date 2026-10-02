"use client";

import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";
import { ArrowDown, ArrowUp, GripVertical, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { useFieldError } from "@/components/admin/admin-form";
import { uploadImages } from "@/components/admin/upload-client";
import { cx } from "@/lib/cx";

export type ProductImageInput = { url: string; alt: string; width: number | null; height: number | null; isPrimary: boolean };

/** Çoklu ürün görseli: yükleme, sürükle-bırak sıralama, klavye ile sıralama, kapak seçimi ve alt metin. */
export function ProductImagesField({ defaultValue }: { defaultValue: ProductImageInput[] }) {
  const [images, setImages] = useState<ProductImageInput[]>(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fieldError = useFieldError("images");

  const withPrimary = (list: ProductImageInput[]) => (list.length && !list.some((image) => image.isPrimary) ? list.map((image, index) => ({ ...image, isPrimary: index === 0 })) : list);

  const addFiles = async (files: FileList | File[]) => {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      const uploads = await uploadImages(files);
      setImages((current) => withPrimary([...current, ...uploads.map((upload) => ({ ...upload, alt: "", isPrimary: false }))]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    setImages((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const onItemDrop = (event: DragEvent, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    if (dragIndex !== null) move(dragIndex, index);
    setDragIndex(null);
  };

  const onZoneDrop = (event: DragEvent) => {
    event.preventDefault();
    setDropActive(false);
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  };

  return (
    <div>
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <div
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes("Files")) {
            event.preventDefault();
            setDropActive(true);
          }
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={onZoneDrop}
        className={cx("rounded-2xl border border-dashed p-4 transition-colors", dropActive ? "border-sage-deep bg-sage-soft/60" : "border-line-strong bg-cream/40")}
      >
        {images.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <li
                key={image.url}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => setDragIndex(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => onItemDrop(event, index)}
                className={cx("overflow-hidden rounded-xl border bg-white", image.isPrimary ? "border-sage-deep ring-1 ring-sage-deep" : "border-line", dragIndex === index && "opacity-50")}
              >
                <div className="relative aspect-square bg-cream">
                  <Image src={image.url} alt="" fill sizes="200px" unoptimized className="object-cover" />
                  <span className="absolute left-2 top-2 grid size-7 cursor-grab place-items-center rounded-full bg-white/90 text-ink-muted" aria-hidden="true">
                    <GripVertical className="size-4" />
                  </span>
                  {image.isPrimary ? <span className="absolute right-2 top-2 rounded-full bg-sage-deep px-2 py-0.5 text-[0.65rem] font-semibold text-white">KAPAK</span> : null}
                </div>
                <div className="space-y-2 p-2.5">
                  <input
                    value={image.alt}
                    onChange={(event) => setImages((current) => current.map((item, i) => (i === index ? { ...item, alt: event.target.value } : item)))}
                    placeholder="Alt metin (erişilebilirlik)"
                    aria-label={`${index + 1}. görsel alt metni`}
                    className="h-9 w-full rounded-lg border border-line-strong px-2.5 text-xs focus:border-ink focus:outline-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} className="grid size-8 place-items-center rounded-lg hover:bg-cream disabled:opacity-30" aria-label="Sola taşı">
                        <ArrowUp className="size-3.5 -rotate-90" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => move(index, index + 1)} disabled={index === images.length - 1} className="grid size-8 place-items-center rounded-lg hover:bg-cream disabled:opacity-30" aria-label="Sağa taşı">
                        <ArrowDown className="size-3.5 -rotate-90" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => setImages((current) => current.map((item, i) => ({ ...item, isPrimary: i === index })))}
                        className={cx("grid size-8 place-items-center rounded-lg hover:bg-cream", image.isPrimary && "text-sage-deep")}
                        aria-label="Kapak görseli yap"
                        aria-pressed={image.isPrimary}
                      >
                        <Star className={cx("size-3.5", image.isPrimary && "fill-current")} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setImages((current) => withPrimary(current.filter((_, i) => i !== index)))}
                        className="grid size-8 place-items-center rounded-lg text-rose-deep hover:bg-peach-soft"
                        aria-label="Görseli kaldır"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className={cx("flex w-full flex-col items-center justify-center gap-2 rounded-xl py-8 text-sm text-ink-soft hover:text-ink", images.length > 0 && "mt-3 py-5")}
        >
          {busy ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-5" aria-hidden="true" />}
          {busy ? "Yükleniyor…" : "Görsel ekleyin veya buraya sürükleyin (JPG, PNG, WebP, AVIF · en fazla 8 MB)"}
        </button>
      </div>
      {error || fieldError ? <p className="mt-2 text-xs text-rose-deep">{error || fieldError}</p> : <p className="mt-2 text-xs text-ink-muted">Sıralamak için sürükleyin; yıldız simgesi kapak görselini belirler.</p>}
      <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" tabIndex={-1} onChange={(event) => event.target.files && addFiles(event.target.files)} />
    </div>
  );
}
