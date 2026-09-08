import { denyUnlessAdmin } from "@/lib/adminAuth";
import { extOf, saveUpload } from "@/lib/files";

/**
 * POST /api/admin/upload?dir=popup|news|tire — 이미지 업로드 (multipart, 필드명 file)
 * 저장 위치는 lib/files.ts 가 결정한다 (DB 가 있으면 files 테이블, 없으면 public/uploads/<dir>/).
 * 응답: { url } — 그대로 <img src> 에 쓰는 경로
 */
const DIRS = new Set(["popup", "news", "tire"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;

  const dir = new URL(request.url).searchParams.get("dir") ?? "";
  if (!DIRS.has(dir)) return Response.json({ ok: false, error: "잘못된 업로드 위치입니다." }, { status: 400 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ ok: false, error: "파일이 없습니다." }, { status: 400 });
  if (!extOf(file.type)) return Response.json({ ok: false, error: "JPG, PNG, GIF, WEBP 이미지만 올릴 수 있습니다." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ ok: false, error: "이미지는 5MB 이하로 올려 주세요." }, { status: 400 });

  try {
    const url = await saveUpload(dir, file);
    return Response.json({ ok: true, url });
  } catch (e) {
    return Response.json({ ok: false, error: `저장에 실패했습니다. (${String(e)})` }, { status: 500 });
  }
}
