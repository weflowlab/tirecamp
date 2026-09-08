import { denyUnlessAdmin } from "@/lib/adminAuth";
import { parseNews } from "@/lib/adminParse";
import { NEWS_FILE, type NewsItem } from "@/lib/news";
import { readList, writeList } from "@/lib/store";

/** POST /api/admin/news — 공지 등록 */
export async function POST(request: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseNews(body);
  if (parsed.error) return Response.json({ ok: false, error: parsed.error }, { status: 400 });

  const list = await readList<NewsItem>(NEWS_FILE);
  const seq = list.reduce((m, n) => Math.max(m, n.seq), 0) + 1;
  const item: NewsItem = {
    seq,
    bcode: "01",
    title: parsed.title!,
    date: parsed.date!,
    views: 0,
    notice: parsed.notice ?? false,
    thumb: parsed.thumb ?? "",
    summary: parsed.summary ?? "",
    content: parsed.content!,
  };
  list.push(item);
  await writeList(NEWS_FILE, list);
  return Response.json({ ok: true, item });
}
