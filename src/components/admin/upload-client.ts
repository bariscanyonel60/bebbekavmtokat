export type UploadedImage = { url: string; width: number | null; height: number | null };

export async function uploadImages(files: FileList | File[]): Promise<UploadedImage[]> {
  const body = new FormData();
  for (const file of Array.from(files)) body.append("file", file);
  const response = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await response.json()) as { uploads?: UploadedImage[]; error?: string };
  if (!response.ok || !data.uploads) throw new Error(data.error || "Yükleme başarısız.");
  return data.uploads;
}
