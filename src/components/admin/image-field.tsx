"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useFieldError } from "@/components/admin/admin-form";
import { uploadImages } from "@/components/admin/upload-client";

type ImageFieldProps = { name: string; label: string; defaultValue?: string | null; hint?: string; required?: boolean; aspect?: string };

export function ImageField({ name, label, defaultValue, hint, required, aspect = "aspect-[16/9]" }: ImageFieldProps) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fieldError = useFieldError(name);
  const error = uploadError || fieldError;

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setUploadError(null);
    try {
      const [uploaded] = await uploadImages([files[0]]);
      setUrl(uploaded.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const isPreviewable = (url.startsWith("/") && !url.startsWith("//")) || url.startsWith("https://res.cloudinary.com/");

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-rose-deep"> *</span> : null}
      </label>
      <div className="mt-1.5 grid gap-3 sm:grid-cols-[10rem_1fr]">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`relative grid ${aspect} w-full place-items-center overflow-hidden rounded-xl border border-dashed border-line-strong bg-cream/60 text-ink-muted transition hover:border-ink`}
          aria-label={`${label} yükle`}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : url && isPreviewable ? (
            <Image src={url} alt="" fill sizes="160px" unoptimized className="object-cover" />
          ) : (
            <ImagePlus className="size-5" aria-hidden="true" />
          )}
        </button>
        <div className="space-y-2">
          <input
            id={id}
            name={name}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required={required}
            placeholder="/images/... veya https://..."
            aria-invalid={error ? true : undefined}
            className="h-11 w-full rounded-xl border border-line-strong bg-white px-4 text-sm focus:border-ink focus:outline-none aria-[invalid=true]:border-rose-deep"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="h-9 rounded-full border border-line-strong px-4 text-xs font-medium hover:border-ink">
              Bilgisayardan yükle
            </button>
            {url ? (
              <button type="button" onClick={() => setUrl("")} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs text-rose-deep hover:bg-peach-soft">
                <Trash2 className="size-3.5" aria-hidden="true" /> Kaldır
              </button>
            ) : null}
          </div>
          {error ? <p className="text-xs text-rose-deep">{error}</p> : hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" tabIndex={-1} onChange={(event) => onFiles(event.target.files)} />
    </div>
  );
}
