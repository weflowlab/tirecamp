import { detectAppSource, detectDevice, isBot, normalizeSource, recordPageView, setDuration } from "@/lib/analytics";
import { clean } from "@/lib/store";

/**
 * POST /api/track — 방문자 통계 수집 (공개, 인증 없음)
 * - body.type === "duration": 체류시간·스크롤 갱신 { id, durationMs, maxScroll }
 * - 그 외: 새 페이지뷰 { sessionId, path, referrer, utmSource, utmMedium, utmCampaign } → { id }
 */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") || "";
  if (isBot(ua)) return Response.json({ ok: true, skipped: "bot" });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (body.type === "duration" && typeof body.id === "string") {
    const ms = Math.max(0, Math.min(Number(body.durationMs) || 0, 60 * 60 * 1000));
    const scroll = body.maxScroll != null ? Math.max(0, Math.min(Math.round(Number(body.maxScroll)) || 0, 100)) : undefined;
    await setDuration(body.id, ms, scroll).catch(() => {});
    return Response.json({ ok: true });
  }

  const sessionId = clean(body.sessionId, 60);
  const path = clean(body.path, 200);
  if (!sessionId || !path || path.startsWith("/admin")) return Response.json({ ok: false }, { status: 400 });

  const referrer = clean(body.referrer, 500);
  const host = request.headers.get("host") || "";
  const utmSource = clean(body.utmSource, 40).toLowerCase();
  const source = utmSource || detectAppSource(ua) || normalizeSource(referrer, host);

  try {
    const id = await recordPageView({
      sessionId,
      path,
      referrer,
      source,
      medium: clean(body.utmMedium, 40).toLowerCase(),
      campaign: clean(body.utmCampaign, 100),
      device: detectDevice(ua),
    });
    return Response.json({ id });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
