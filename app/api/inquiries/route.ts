import type { Inquiry } from "@/lib/inquiries";
import { INQUIRIES_FILE, INQUIRY_TYPES } from "@/lib/inquiries";
import { appendItem, clean, todayKST } from "@/lib/store";

/**
 * POST /api/inquiries — 문의 접수 (data/inquiries.json 에 추가)
 * body: { name, phone, type, car?, content, agree(true), website(스팸 방지, 비어 있어야 함) }
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (clean(body.website, 100) !== "") return Response.json({ ok: true });

  const name = clean(body.name, 20);
  const phone = clean(body.phone, 20).replace(/[^\d-]/g, "");
  const typeRaw = clean(body.type, 20);
  const type = (INQUIRY_TYPES as readonly string[]).includes(typeRaw) ? (typeRaw as Inquiry["type"]) : "기타";
  const car = clean(body.car, 50);
  const content = clean(body.content, 2000);
  const agree = body.agree === true;

  if (!name) return Response.json({ ok: false, error: "이름을 입력해 주세요." }, { status: 400 });
  if (phone.replace(/-/g, "").length < 9) return Response.json({ ok: false, error: "연락처를 정확히 입력해 주세요." }, { status: 400 });
  if (content.length < 5) return Response.json({ ok: false, error: "문의 내용을 5자 이상 입력해 주세요." }, { status: 400 });
  if (!agree) return Response.json({ ok: false, error: "개인정보 수집·이용에 동의해 주세요." }, { status: 400 });

  const item: Inquiry = {
    id: Date.now(),
    name,
    phone,
    type,
    car,
    content,
    date: todayKST(),
    createdAt: new Date().toISOString(),
    status: "new",
  };

  try {
    await appendItem(INQUIRIES_FILE, item);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: `접수에 실패했습니다. (${String(e)})` }, { status: 500 });
  }
}
