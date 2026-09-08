"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { VEHICLE_TYPES } from "@/lib/reviewTypes";

/**
 * 후기 작성 폼 → POST /api/reviews
 * - 이름 / 차량 유형(드롭다운, 필수) / 차종(선택) / 별점 / 내용
 * - 성공 시 폼 초기화 + router.refresh() 로 목록 갱신
 */
export default function ReviewForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState<(typeof VEHICLE_TYPES)[number]>(VEHICLE_TYPES[0]);
  const [car, setCar] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState(""); // 스팸 방지용 숨김 필드
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim() === "") return setMsg({ ok: false, text: "이름을 입력해 주세요." });
    if (content.trim().length < 5) return setMsg({ ok: false, text: "후기 내용을 5자 이상 입력해 주세요." });

    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, vehicle, car, rating, content, website }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "등록에 실패했습니다.");
      setName("");
      setVehicle(VEHICLE_TYPES[0]);
      setCar("");
      setRating(5);
      setContent("");
      setMsg({ ok: true, text: "후기가 등록되었습니다. 감사합니다." });
      router.refresh();
      /* 새 후기가 맨 위에 붙으므로 페이지 상단으로 (부드럽게) */
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "등록에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="font-sans">
      <div className="grid grid-cols-4 gap-[12px] max-pc:grid-cols-1">
        <Field label="이름" required>
          <input type="text" className="field" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="차량 유형" required>
          <select className="field" value={vehicle} onChange={(e) => setVehicle(e.target.value as (typeof VEHICLE_TYPES)[number])}>
            {VEHICLE_TYPES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="차종">
          <input type="text" className="field" value={car} maxLength={30} placeholder="예: 아반떼 CN7" onChange={(e) => setCar(e.target.value)} />
        </Field>
        <Field label="별점">
          {/* 별 5개 클릭 선택 */}
          <div className="flex h-[44px] items-center gap-[4px] text-[20px]" role="radiogroup" aria-label="별점">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                onClick={() => setRating(n)}
                className={`leading-none transition-colors ${n <= rating ? "text-ink" : "text-line hover:text-faint"}`}
              >
                ★
              </button>
            ))}
            <span className="ml-[8px] text-[12px] text-muted" style={{ fontFamily: "var(--font-num)" }}>
              {rating}/5
            </span>
          </div>
        </Field>
      </div>
      <div className="mt-[12px]">
        <Field label="후기 내용" required>
          <textarea className="field h-[130px]" value={content} maxLength={1000} onChange={(e) => setContent(e.target.value)} />
        </Field>
      </div>
      {/* 스팸 방지: 사람은 채우지 않는 숨김 필드 */}
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="mt-[16px] flex items-center justify-between gap-[12px] max-pc:flex-col max-pc:items-stretch">
        <p className={`text-[12px] ${msg ? (msg.ok ? "text-ink" : "text-[#B3261E]") : "text-muted"}`}>
          {msg ? msg.text : "이름은 가운데 글자가 *로 가려져 표시됩니다."}
        </p>
        <button type="submit" disabled={busy} className="btn-fill">
          {busy ? "등록 중..." : "후기 등록"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-[6px] block text-[12px] tracking-[0.02em] text-muted">
        {label}
        {required && <span className="ml-[2px] text-ink">*</span>}
      </span>
      {children}
    </label>
  );
}
