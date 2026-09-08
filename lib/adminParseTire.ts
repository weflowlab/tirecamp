import { clean } from "@/lib/store";
import { BRANDS } from "@/lib/tireSizeOptions";
import { TIRE_LEVELS, TIRE_TYPES, type TirePrice, type TireRecord } from "@/lib/tireTypes";
import { normalizeSize } from "@/lib/sizelistQuery";

/*
 * 관리자 타이어 API 요청 본문 검증/정리 (서버 전용)
 */

const BRAND_NAME = new Map(BRANDS.map((b) => [b.code, b.name]));

/** 제품 폼 → TireRecord (seq/scores/sortOrder 는 base 에서 유지) */
export function parseTire(body: Record<string, unknown>, base: TireRecord): TireRecord | { error: string } {
  const model = clean(body.model, 60);
  const brandCode = clean(body.brandCode, 4);
  const brandName = clean(body.brandName, 30) || BRAND_NAME.get(brandCode) || "";
  if (!model) return { error: "모델명을 입력해 주세요." };
  if (!brandName) return { error: "브랜드를 선택해 주세요." };
  const typeCode = clean(body.typeCode, 4);
  const levelCode = clean(body.levelCode, 4);
  const images = Array.isArray(body.images) ? (body.images as unknown[]).map((v) => clean(v, 300)).filter(Boolean).slice(0, 12) : base.images;
  return {
    ...base,
    brandCode,
    brandName,
    model,
    image: clean(body.image, 300),
    images,
    typeLabel: clean(body.typeLabel, 30) || TIRE_TYPES.find((t) => t.code === typeCode)?.name || "",
    levelLabel: clean(body.levelLabel, 30) || TIRE_LEVELS.find((l) => l.code === levelCode)?.name || "",
    typeCode,
    levelCode,
    tagline: clean(body.tagline, 120),
    desc: clean(body.desc, 2000),
    descHtml: clean(body.descHtml, 2000),
    speedRating: clean(body.speedRating, 40),
    treadwear: clean(body.treadwear, 10),
    priceRange: clean(body.priceRange, 40),
    visible: body.visible !== false,
  };
}

const num = (v: unknown) => Math.max(0, Math.min(99_999_999, Math.round(Number(String(v ?? "").replace(/[^\d.]/g, "")) || 0)));

/** 가격 행 목록 → TirePrice[] (id 가 비면 새로 발급) */
export function parsePrices(raw: unknown, seq: string): TirePrice[] | { error: string } {
  if (!Array.isArray(raw)) return { error: "잘못된 요청입니다." };
  const out: TirePrice[] = [];
  const seen = new Set<string>();
  for (const [i, r] of (raw as Record<string, unknown>[]).entries()) {
    const size = normalizeSize(clean(r?.size, 20));
    if (!/^\d{7}$/.test(size)) return { error: `${i + 1}번 행의 사이즈를 225/45R18 형식으로 입력해 주세요.` };
    const salePrice = num(r?.salePrice);
    if (salePrice <= 0) return { error: `${i + 1}번 행(${size})의 할인가를 입력해 주세요.` };
    const marketPrice = num(r?.marketPrice) || salePrice;
    const cashPrice = num(r?.cashPrice) || salePrice;
    let id = clean(r?.id, 40).replace(/[^A-Za-z0-9_-]/g, "");
    if (!id || seen.has(id)) id = `p${Date.now().toString(36)}${i.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
    seen.add(id);
    out.push({
      id,
      size,
      tireSeq: seq,
      speedGrade: clean(r?.speedGrade, 4).toUpperCase(),
      marketPrice,
      salePrice,
      cashPrice,
      comment: clean(r?.comment, 60),
      strength: clean(r?.strength, 40),
      isBest: r?.isBest === true,
      visible: r?.visible !== false,
    });
  }
  return out;
}
