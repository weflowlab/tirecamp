import { denyUnlessAdmin } from "@/lib/adminAuth";
import { FAQ_FILE, type Faq } from "@/lib/faq";
import { clean, writeList } from "@/lib/store";

/**
 * PUT /api/admin/faq — 목록 전체 교체 { items: [{ q, a }] }
 * (순서 변경·추가·삭제를 한 번에 저장하므로 전체 교체가 가장 단순하다)
 */
export async function PUT(request: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as { items?: unknown };
  if (!Array.isArray(body.items)) return Response.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });

  const items: Faq[] = [];
  for (const raw of body.items as Record<string, unknown>[]) {
    const q = clean(raw?.q, 200);
    const a = clean(raw?.a, 2000);
    if (!q || !a) return Response.json({ ok: false, error: "질문과 답변을 모두 입력해 주세요." }, { status: 400 });
    items.push({ q, a });
  }
  if (items.length > 100) return Response.json({ ok: false, error: "FAQ 는 100개까지 등록할 수 있습니다." }, { status: 400 });

  await writeList(FAQ_FILE, items);
  return Response.json({ ok: true, items });
}
