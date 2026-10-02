import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getUploadDir, MEDIA_MIME } from "@/lib/uploads";

const SEGMENT = /^[a-z0-9-]+(\.[a-z0-9]+)?$/i;

/** Cloudinary yapılandırılmadığında admin'den yüklenen görselleri yerel diskten sunar. */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const segments = (await params).path;
  if (!segments.length || !segments.every((segment) => SEGMENT.test(segment))) return new NextResponse(null, { status: 404 });

  const root = getUploadDir();
  const filePath = path.resolve(root, ...segments);
  if (!filePath.startsWith(root + path.sep)) return new NextResponse(null, { status: 404 });

  const mime = MEDIA_MIME[path.extname(filePath).slice(1).toLowerCase()];
  if (!mime) return new NextResponse(null, { status: 404 });

  try {
    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
