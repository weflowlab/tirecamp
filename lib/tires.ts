import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { ensureSchema, getSql, hasDb } from "@/lib/db";
import type { Tinfo } from "@/lib/tinfo";
import type { TireList } from "@/lib/tprodintro";
import type { TireNote } from "@/lib/tireDetail";
import type { TireItem } from "@/lib/sizelistQuery";
import { formatSize } from "@/lib/sizelistQuery";
import { discountText, priceRangeOf, speedTitle, stripHtml, TIRE_LEVELS, TIRE_TYPES, type TirePrice, type TireRecord } from "@/lib/tireTypes";

/*
 * 타이어 제품/가격 저장소 (서버 전용)
 * - DATABASE_URL 이 있으면 Postgres tires / tire_prices 테이블. 비어 있으면 아래 정적 JSON 을 1회 옮겨 심는다.
 * - 없으면 정적 JSON 읽기 전용 (data/tinfo.json + tprodintro.json + tireNotes.json + sizelist/*.json) — 관리자 수정 불가.
 * - 공개 페이지(타이어소개 / 사이즈 검색 / 상세)는 모두 여기서 읽는다.
 */

/* ---------- 정적 JSON → 레코드 (파일 모드 + DB 초기 적재 공용) ---------- */

const DATA = path.join(process.cwd(), "data");

async function readJson<T>(rel: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA, rel), "utf8")) as T;
  } catch {
    return fallback;
  }
}

const TYPE_CODE_BY_LABEL = new Map(TIRE_TYPES.map((t) => [t.name, t.code]));
const LEVEL_CODE_BY_LABEL = new Map(TIRE_LEVELS.map((l) => [l.name, l.code]));

async function loadFromFiles(): Promise<{ tires: TireRecord[]; prices: TirePrice[] }> {
  const [tinfo, intro, notes] = await Promise.all([
    readJson<Record<string, Tinfo>>("tinfo.json", {}),
    readJson<TireList>("tprodintro.json", { total: 0, perPage: 32, items: [] }),
    readJson<Record<string, TireNote>>("tireNotes.json", {}),
  ]);
  const introBySeq = new Map(intro.items.map((i) => [i.seq, i]));

  const tires: TireRecord[] = Object.values(tinfo)
    .filter((t) => t.model)
    .map((t, idx) => {
      const it = introBySeq.get(t.seq);
      const [typeFromTl, levelFromTl] = (t.typeLevel || "").split("/").map((s) => s.trim());
      const typeLabel = it?.typeLabel || typeFromTl || "";
      const levelLabel = it?.levelLabel || levelFromTl || "";
      return {
        seq: t.seq,
        brandCode: it?.brandCode ?? "",
        brandName: t.brandName || it?.brandName || "",
        model: t.model,
        image: t.image || it?.image || "",
        images: [],
        typeLabel,
        levelLabel,
        typeCode: it?.typeCode ?? TYPE_CODE_BY_LABEL.get(typeLabel) ?? "",
        levelCode: it?.levelCode ?? LEVEL_CODE_BY_LABEL.get(levelLabel) ?? "",
        tagline: notes[t.seq]?.tagline ?? "",
        desc: notes[t.seq]?.desc ?? "",
        descHtml: t.descHtml,
        speedRating: t.speedRating,
        treadwear: t.treadwear,
        priceRange: it?.price || t.priceRange,
        scores: t.scores,
        visible: true,
        sortOrder: idx,
        updatedAt: "",
      };
    });

  const prices: TirePrice[] = [];
  let files: string[] = [];
  try {
    files = (await fs.readdir(path.join(DATA, "sizelist"))).filter((f) => /^\d{7}\.json$/.test(f));
  } catch {}
  for (const f of files) {
    const d = await readJson<{ size: string; tires: TireItem[] }>(`sizelist/${f}`, { size: f.slice(0, 7), tires: [] });
    for (const t of d.tires ?? []) {
      prices.push({
        id: t.fseq,
        size: d.size,
        tireSeq: t.tinfoseq,
        speedGrade: t.front.speedGrade,
        marketPrice: t.front.marketPrice,
        salePrice: t.front.salePrice,
        cashPrice: t.front.cashPrice,
        comment: t.comment,
        strength: t.strength,
        isBest: t.isBest,
        visible: true,
      });
    }
  }
  return { tires, prices };
}

/* 파일 모드는 프로세스 수명 동안 1회만 읽는다 */
let fileCache: Promise<{ tires: TireRecord[]; prices: TirePrice[] }> | null = null;
function fromFiles() {
  if (!fileCache) fileCache = loadFromFiles();
  return fileCache;
}

/* ---------- DB ---------- */

type TireRow = {
  seq: string;
  brand_code: string;
  brand_name: string;
  model: string;
  image: string;
  images: unknown;
  type_label: string;
  level_label: string;
  type_code: string;
  level_code: string;
  tagline: string;
  note_desc: string;
  desc_html: string;
  speed_rating: string;
  treadwear: string;
  price_range: string;
  scores: unknown;
  visible: boolean;
  sort_order: number;
  updated_at: string;
};

type PriceRow = {
  id: string;
  size: string;
  tire_seq: string;
  speed_grade: string;
  market_price: number;
  sale_price: number;
  cash_price: number;
  comment: string;
  strength: string;
  is_best: boolean;
  visible: boolean;
};

function rowToTire(r: TireRow): TireRecord {
  return {
    seq: r.seq,
    brandCode: r.brand_code ?? "",
    brandName: r.brand_name ?? "",
    model: r.model ?? "",
    image: r.image ?? "",
    images: Array.isArray(r.images) ? (r.images as string[]) : [],
    typeLabel: r.type_label ?? "",
    levelLabel: r.level_label ?? "",
    typeCode: r.type_code ?? "",
    levelCode: r.level_code ?? "",
    tagline: r.tagline ?? "",
    desc: r.note_desc ?? "",
    descHtml: r.desc_html ?? "",
    speedRating: r.speed_rating ?? "",
    treadwear: r.treadwear ?? "",
    priceRange: r.price_range ?? "",
    scores: Array.isArray(r.scores) ? (r.scores as TireRecord["scores"]) : [],
    visible: r.visible !== false,
    sortOrder: Number(r.sort_order ?? 0),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : "",
  };
}

function tireToRow(t: TireRecord): Omit<TireRow, "updated_at"> {
  return {
    seq: t.seq,
    brand_code: t.brandCode,
    brand_name: t.brandName,
    model: t.model,
    image: t.image,
    images: t.images,
    type_label: t.typeLabel,
    level_label: t.levelLabel,
    type_code: t.typeCode,
    level_code: t.levelCode,
    tagline: t.tagline,
    note_desc: t.desc,
    desc_html: t.descHtml,
    speed_rating: t.speedRating,
    treadwear: t.treadwear,
    price_range: t.priceRange,
    scores: t.scores,
    visible: t.visible,
    sort_order: t.sortOrder,
  };
}

function rowToPrice(r: PriceRow): TirePrice {
  return {
    id: r.id,
    size: r.size,
    tireSeq: r.tire_seq,
    speedGrade: r.speed_grade ?? "",
    marketPrice: Number(r.market_price ?? 0),
    salePrice: Number(r.sale_price ?? 0),
    cashPrice: Number(r.cash_price ?? 0),
    comment: r.comment ?? "",
    strength: r.strength ?? "",
    isBest: !!r.is_best,
    visible: r.visible !== false,
  };
}

function priceToRow(p: TirePrice): PriceRow {
  return {
    id: p.id,
    size: p.size,
    tire_seq: p.tireSeq,
    speed_grade: p.speedGrade,
    market_price: p.marketPrice,
    sale_price: p.salePrice,
    cash_price: p.cashPrice,
    comment: p.comment,
    strength: p.strength,
    is_best: p.isBest,
    visible: p.visible,
  };
}

/* INSERT 컬럼 목록 (updated_at 은 DEFAULT now() 에 맡긴다 — recordset 의 NULL 이 들어가면 NOT NULL 위반) */
const TIRE_COLS =
  "seq, brand_code, brand_name, model, image, images, type_label, level_label, type_code, level_code, tagline, note_desc, desc_html, speed_rating, treadwear, price_range, scores, visible, sort_order";
const PRICE_COLS = "id, size, tire_seq, speed_grade, market_price, sale_price, cash_price, comment, strength, is_best, visible";

/* 테이블이 비어 있으면 정적 JSON 을 옮겨 심는다 (프로세스당 1회 확인) */
let seeded: Promise<void> | null = null;
function ensureSeeded(): Promise<void> {
  if (seeded) return seeded;
  seeded = (async () => {
    await ensureSchema();
    const sql = getSql();
    const [{ n }] = (await sql`SELECT count(*)::int AS n FROM tires`) as { n: number }[];
    if (n > 0) return;
    const { tires, prices } = await loadFromFiles();
    for (let i = 0; i < tires.length; i += 50) {
      const chunk = JSON.stringify(tires.slice(i, i + 50).map(tireToRow));
      await sql.query(`INSERT INTO tires (${TIRE_COLS}) SELECT ${TIRE_COLS} FROM jsonb_populate_recordset(NULL::tires, $1::jsonb) ON CONFLICT (seq) DO NOTHING`, [chunk]);
    }
    for (let i = 0; i < prices.length; i += 300) {
      const chunk = JSON.stringify(prices.slice(i, i + 300).map(priceToRow));
      await sql.query(`INSERT INTO tire_prices (${PRICE_COLS}) SELECT ${PRICE_COLS} FROM jsonb_populate_recordset(NULL::tire_prices, $1::jsonb) ON CONFLICT (id) DO NOTHING`, [chunk]);
    }
  })().catch((e) => {
    seeded = null;
    throw e;
  });
  return seeded;
}

/*
 * 캐시는 "요청 1건 안에서만" (React cache). 프로세스 전역 캐시를 두면 개발 서버에서 API 라우트와 페이지가
 * 서로 다른 모듈 인스턴스를 갖게 되어, 관리자에서 고친 뒤에도 페이지가 옛 값을 보여준다.
 */
export function invalidateTireCache() {
  /* 요청 단위 캐시라 비울 것이 없다 (호출부 호환용) */
}

/* ---------- 읽기 ---------- */

const loadAllTires = cache(async (): Promise<TireRecord[]> => {
  if (!hasDb()) return (await fromFiles()).tires;
  await ensureSeeded();
  const rows = (await getSql()`SELECT * FROM tires ORDER BY sort_order ASC, seq::int ASC`) as TireRow[];
  return rows.map(rowToTire);
});

/** 전체 타이어 (관리자는 숨김 포함, 공개 페이지는 visible 만) — sortOrder, seq 순 */
export async function getTires(includeHidden = false): Promise<TireRecord[]> {
  const list = await loadAllTires();
  return includeHidden ? list : list.filter((t) => t.visible);
}

export async function getTire(seq: string, includeHidden = false): Promise<TireRecord | undefined> {
  return (await getTires(includeHidden)).find((t) => t.seq === seq);
}

export async function getTireMap(includeHidden = false): Promise<Map<string, TireRecord>> {
  return new Map((await getTires(includeHidden)).map((t) => [t.seq, t]));
}

/** 타이어별 가격 행 전체 (관리자 목록/가격대 계산용, 요청당 1회 조회) */
export const getAllPrices = cache(async (): Promise<Map<string, TirePrice[]>> => {
  let prices: TirePrice[];
  if (!hasDb()) {
    prices = (await fromFiles()).prices;
  } else {
    await ensureSeeded();
    const rows = (await getSql()`SELECT * FROM tire_prices ORDER BY size ASC, sale_price ASC`) as PriceRow[];
    prices = rows.map(rowToPrice);
  }
  const map = new Map<string, TirePrice[]>();
  for (const p of prices) (map.get(p.tireSeq) ?? map.set(p.tireSeq, []).get(p.tireSeq)!).push(p);
  return map;
});

/** 특정 타이어의 가격 행 (사이즈순) */
export async function getTirePrices(seq: string): Promise<TirePrice[]> {
  return (await getAllPrices()).get(seq) ?? [];
}

/** 표시용 가격대: 노출 중인 가격 행이 있으면 자동 계산, 없으면 저장된 문구 */
export async function getPriceRanges(): Promise<Map<string, string>> {
  const all = await getAllPrices();
  const out = new Map<string, string>();
  for (const [seq, list] of all) out.set(seq, priceRangeOf(list.filter((p) => p.visible)));
  return out;
}

export async function displayPriceRange(t: TireRecord, ranges?: Map<string, string>): Promise<string> {
  const r = ranges ?? (await getPriceRanges());
  return r.get(t.seq) || t.priceRange;
}

/** 가격 행 + 제품 → 검색 결과 카드 (lib/sizelist.ts 가 사용) */
export function toTireItem(p: TirePrice, t: TireRecord): TireItem {
  const size = formatSize(p.size);
  return {
    tinfoseq: t.seq,
    brand: t.brandName,
    model: t.model,
    desc: stripHtml(t.descHtml),
    comment: p.comment,
    strength: p.strength,
    imageUrl: t.image,
    isBest: p.isBest,
    bestSection: false,
    calcId: `${p.id}${p.id}`,
    fseq: p.id,
    rseq: p.id,
    front: {
      size,
      speedGrade: p.speedGrade,
      speedTitle: speedTitle(p.speedGrade),
      marketPrice: p.marketPrice,
      salePrice: p.salePrice,
      cashPrice: p.cashPrice,
      discountText: discountText(p.marketPrice, p.salePrice),
      defaultQty: 4,
    },
    rear: null,
  };
}

/** 사이즈 코드(7자리)의 검색 결과 카드 (노출 중인 제품/가격만) */
export async function getSizeCards(code: string): Promise<TireItem[]> {
  if (!/^\d{7}$/.test(code)) return [];
  const tires = await getTireMap();
  let prices: TirePrice[];
  if (!hasDb()) {
    prices = (await fromFiles()).prices.filter((p) => p.size === code);
  } else {
    await ensureSeeded();
    const rows = (await getSql()`SELECT * FROM tire_prices WHERE size = ${code} AND visible = true`) as PriceRow[];
    prices = rows.map(rowToPrice);
  }
  const out: TireItem[] = [];
  for (const p of prices) {
    const t = tires.get(p.tireSeq);
    if (t && p.visible) out.push(toTireItem(p, t));
  }
  return out;
}

/* ---------- 쓰기 (관리자, DB 필요) ---------- */

function requireDb() {
  if (!hasDb()) throw new Error("타이어 정보를 수정하려면 DATABASE_URL 이 필요합니다.");
}

export async function saveTire(t: TireRecord): Promise<void> {
  requireDb();
  await ensureSeeded();
  const row = JSON.stringify([tireToRow(t)]);
  await getSql().query(
    `INSERT INTO tires (${TIRE_COLS}) SELECT ${TIRE_COLS} FROM jsonb_populate_recordset(NULL::tires, $1::jsonb)
    ON CONFLICT (seq) DO UPDATE SET
      brand_code = EXCLUDED.brand_code, brand_name = EXCLUDED.brand_name, model = EXCLUDED.model,
      image = EXCLUDED.image, images = EXCLUDED.images, type_label = EXCLUDED.type_label, level_label = EXCLUDED.level_label,
      type_code = EXCLUDED.type_code, level_code = EXCLUDED.level_code, tagline = EXCLUDED.tagline, note_desc = EXCLUDED.note_desc,
      desc_html = EXCLUDED.desc_html, speed_rating = EXCLUDED.speed_rating, treadwear = EXCLUDED.treadwear,
      price_range = EXCLUDED.price_range, scores = EXCLUDED.scores, visible = EXCLUDED.visible, sort_order = EXCLUDED.sort_order,
      updated_at = now()`,
    [row],
  );
  invalidateTireCache();
}

export async function nextTireSeq(): Promise<string> {
  const list = await getTires(true);
  return String(list.reduce((m, t) => Math.max(m, Number(t.seq) || 0), 1000) + 1);
}

export async function deleteTire(seq: string): Promise<boolean> {
  requireDb();
  await ensureSeeded();
  const sql = getSql();
  await sql`DELETE FROM tire_prices WHERE tire_seq = ${seq}`;
  const rows = await sql`DELETE FROM tires WHERE seq = ${seq} RETURNING seq`;
  invalidateTireCache();
  return rows.length > 0;
}

/** 가격 행 일괄 저장 (upsert) + 삭제 */
export async function savePrices(seq: string, items: TirePrice[], deleted: string[]): Promise<void> {
  requireDb();
  await ensureSeeded();
  const sql = getSql();
  if (deleted.length) await sql`DELETE FROM tire_prices WHERE tire_seq = ${seq} AND id = ANY(${deleted}::text[])`;
  if (items.length) {
    const rows = JSON.stringify(items.map((p) => priceToRow({ ...p, tireSeq: seq })));
    await sql.query(
      `INSERT INTO tire_prices (${PRICE_COLS}) SELECT ${PRICE_COLS} FROM jsonb_populate_recordset(NULL::tire_prices, $1::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        size = EXCLUDED.size, speed_grade = EXCLUDED.speed_grade, market_price = EXCLUDED.market_price, sale_price = EXCLUDED.sale_price,
        cash_price = EXCLUDED.cash_price, comment = EXCLUDED.comment, strength = EXCLUDED.strength, is_best = EXCLUDED.is_best,
        visible = EXCLUDED.visible, updated_at = now()`,
      [rows],
    );
  }
  invalidateTireCache();
}
