import { denyUnlessAdmin } from "@/lib/adminAuth";
import { parseNews } from "@/lib/adminParse";
import { NEWS_FILE, type NewsItem } from "@/lib/news";
import { removeItem, updateItem } from "@/lib/store";

type Ctx = { params: Promise<{ seq: string }> };

/** PATCH /api/admin/news/:seq — 공지 수정 (notice 만 바꾸는 경우 { notice } 만 보내도 됨) */
export async function PATCH(request: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const seq = Number((await params).seq);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  let patch: Partial<NewsItem>;
  if (Object.keys(body).length === 1 && typeof body.notice === "boolean") {
    patch = { notice: body.notice };
  } else {
    const parsed = parseNews(body);
    if (parsed.error) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
    patch = { ...parsed };
    delete (patch as { error?: string }).error;
  }
  const updated = await updateItem<NewsItem>(NEWS_FILE, (n) => n.seq === seq, patch);
  if (!updated) return Response.json({ ok: false, error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  return Response.json({ ok: true, item: updated });
}

/** DELETE /api/admin/news/:seq */
export async function DELETE(_request: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const seq = Number((await params).seq);
  const ok = await removeItem<NewsItem>(NEWS_FILE, (n) => n.seq === seq);
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
