import { readUpload } from "@/lib/files";

/** GET /api/files/:id — DB 에 저장된 업로드 이미지 서빙 (공개, 오래 캐시) */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9-]{1,60}$/.test(id)) return new Response("Not found", { status: 404 });
  const file = await readUpload(id).catch(() => null);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: { "Content-Type": file.mime, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
