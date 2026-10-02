import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth/session";
import { saveImageUpload } from "@/lib/uploads";

export async function POST(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });

  const form = await request.formData();
  const files = form.getAll("file").filter((value): value is File => value instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "Dosya seçilmedi." }, { status: 400 });
  if (files.length > 12) return NextResponse.json({ error: "Tek seferde en fazla 12 görsel yüklenebilir." }, { status: 400 });

  try {
    const uploads = [];
    for (const file of files) uploads.push(await saveImageUpload(file));
    return NextResponse.json({ uploads });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Yükleme başarısız." }, { status: 400 });
  }
}
