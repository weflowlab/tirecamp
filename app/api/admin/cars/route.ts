import { denyUnlessAdmin } from "@/lib/adminAuth";
import { deleteCarOverride, digitsOnly, getCarsAdmin, newCarCode, saveCarOverride } from "@/lib/carfind";
import { toSizeRow, type CarOverride, type SizeDraft, type TireSizeRow } from "@/lib/carTypes";
import { clean } from "@/lib/store";

/** GET /api/admin/cars?maker=10&year=2024 — 관리자용 차종 목록 (숨김 포함) */
export async function GET(request: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const sp = new URL(request.url).searchParams;
  const maker = digitsOnly(sp.get("maker"));
  const year = digitsOnly(sp.get("year"));
  if (!maker || !year) return Response.json({ cars: [] }, { status: 400 });
  return Response.json({ cars: await getCarsAdmin(maker, year) });
}

/**
 * PUT /api/admin/cars — 차종 저장
 * body: { maker, year, code?(없으면 새 차종), name?, carimg?(""=사진 없음), sizes?: [{front, rear}], hidden?, applyPhotoAllYears? }
 */
export async function PUT(request: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const maker = digitsOnly(clean(body.maker, 8));
  const year = digitsOnly(clean(body.year, 8));
  if (!maker || !year) return Response.json({ ok: false, error: "제조사와 연식을 선택해 주세요." }, { status: 400 });

  let code = digitsOnly(clean(body.code, 8));
  const adding = !code;
  const patch: Omit<CarOverride, "id" | "updatedAt"> = { maker, year, code: code ?? "" };

  if (body.name !== undefined) {
    const name = clean(body.name, 40);
    if (!name) return Response.json({ ok: false, error: "차종 이름을 입력해 주세요." }, { status: 400 });
    patch.name = name;
  }
  if (body.carimg !== undefined) patch.carimg = clean(body.carimg, 300);
  if (body.hidden !== undefined) patch.hidden = body.hidden === true;
  if (Array.isArray(body.sizes)) {
    const rows: TireSizeRow[] = [];
    for (const [i, d] of (body.sizes as SizeDraft[]).entries()) {
      const row = toSizeRow({ front: clean(d?.front, 20), rear: clean(d?.rear, 20) });
      if (!row) return Response.json({ ok: false, error: `${i + 1}번 사이즈를 225/45R18 형식으로 입력해 주세요.` }, { status: 400 });
      rows.push(row);
    }
    patch.sizes = rows;
  }
  if (adding) {
    if (!patch.name) return Response.json({ ok: false, error: "차종 이름을 입력해 주세요." }, { status: 400 });
    if (!patch.sizes?.length) return Response.json({ ok: false, error: "타이어 사이즈를 1개 이상 입력해 주세요." }, { status: 400 });
    code = await newCarCode(maker);
    patch.code = code;
    patch.added = true;
  }
  try {
    const saved = await saveCarOverride(patch, body.applyPhotoAllYears === true);
    return Response.json({ ok: true, item: saved });
  } catch (e) {
    return Response.json({ ok: false, error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}

/** DELETE /api/admin/cars?maker&year&code — 수정 내용 삭제(원본으로 되돌리기). 추가한 차종이면 삭제 */
export async function DELETE(request: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const sp = new URL(request.url).searchParams;
  const maker = digitsOnly(sp.get("maker"));
  const year = digitsOnly(sp.get("year"));
  const code = digitsOnly(sp.get("code"));
  if (!maker || !year || !code) return Response.json({ ok: false }, { status: 400 });
  const ok = await deleteCarOverride(maker, year, code);
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
