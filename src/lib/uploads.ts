import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

type ImageKind = { ext: "jpg" | "png" | "webp" | "avif"; mime: string };
export type UploadResult = { url: string; width: number | null; height: number | null };

/** Uzantıya/MIME'a güvenmeden dosya imzasından görsel türünü belirler. SVG bilinçli olarak desteklenmez. */
function detectImage(bytes: Uint8Array): ImageKind | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return { ext: "png", mime: "image/png" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { ext: "webp", mime: "image/webp" };
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return { ext: "avif", mime: "image/avif" };
  return null;
}

export function getUploadDir(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || ".data/uploads");
}

export const MEDIA_MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

export function uploadTarget(): "cloudinary" | "local" {
  return cloudinaryConfig() ? "cloudinary" : "local";
}

async function uploadToCloudinary(bytes: Uint8Array, kind: ImageKind, config: NonNullable<ReturnType<typeof cloudinaryConfig>>): Promise<UploadResult> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "bebbek";
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${config.apiSecret}`).digest("hex");
  const body = new FormData();
  body.set("file", new Blob([Buffer.from(bytes)], { type: kind.mime }));
  body.set("api_key", config.apiKey);
  body.set("timestamp", timestamp);
  body.set("folder", folder);
  body.set("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, { method: "POST", body });
  if (!response.ok) throw new Error("Görsel Cloudinary'ye yüklenemedi.");
  const data = (await response.json()) as { secure_url: string; width?: number; height?: number };
  return { url: data.secure_url, width: data.width ?? null, height: data.height ?? null };
}

async function uploadToDisk(bytes: Uint8Array, kind: ImageKind): Promise<UploadResult> {
  const now = new Date();
  const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const name = `${randomBytes(12).toString("hex")}.${kind.ext}`;
  const dir = path.join(getUploadDir(), folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return { url: `/media/${folder}/${name}`, width: null, height: null };
}

export async function saveImageUpload(file: File): Promise<UploadResult> {
  if (file.size === 0) throw new Error("Dosya boş.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Görsel en fazla 8 MB olabilir.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = detectImage(bytes);
  if (!kind) throw new Error("Yalnızca JPG, PNG, WebP veya AVIF görseller yüklenebilir.");
  const cloudinary = cloudinaryConfig();
  return cloudinary ? uploadToCloudinary(bytes, kind, cloudinary) : uploadToDisk(bytes, kind);
}
