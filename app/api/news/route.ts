export type NewsItem = { title: string; summary: string; category: string; url: string; date: string };
const FEED = 'https://secure.runescape.com/m=news/latest_news.rss';
let cached: { articles: NewsItem[]; fetchedAt: string; expires: number } | null = null;
let pending: Promise<{ articles: NewsItem[]; fetchedAt: string; expires: number }> | null = null;

function text(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity: string) => {
      if (entity.startsWith('#')) {
        const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
      }
      return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" } as Record<string, string>)[entity.toLowerCase()] || '';
    }).replace(/\s+/g, ' ').trim();
}
export function parseNews(xml: string): NewsItem[] {
  const articles: NewsItem[] = [];
  for (const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const field = (name: string) => text(match[1].match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1] || '');
    try {
      const url = new URL(field('link'));
      const date = Date.parse(field('pubDate'));
      if (url.protocol !== 'https:' || url.hostname !== 'secure.runescape.com' || !url.pathname.startsWith('/m=news/') || !Number.isFinite(date)) continue;
      const title = field('title');
      if (!title || articles.some(article => article.url === url.href)) continue;
      const summary = field('description');
      articles.push({ title, summary: summary.length > 180 ? `${summary.slice(0, 177).trimEnd()}…` : summary,
        category: field('category') || 'RuneScape', url: url.href, date: new Date(date).toISOString() });
    } catch { /* Ignore malformed feed entries. */ }
  }
  return articles.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 6);
}
async function refresh() {
  const response = await fetch(FEED, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'Ironpath/1.0 (RuneScape news reader)' } });
  if (!response.ok) throw new Error('News feed unavailable');
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > 1_000_000) throw new Error('Feed too large');
  const articles = parseNews(new TextDecoder('windows-1252').decode(bytes));
  if (!articles.length) throw new Error('Empty news feed');
  return { articles, fetchedAt: new Date().toISOString(), expires: Date.now() + 900_000 };
}
export async function GET() {
  try {
    if (!cached || cached.expires < Date.now()) {
      pending ||= refresh().finally(() => { pending = null; });
      cached = await pending;
    }
    return Response.json({ articles: cached.articles, fetchedAt: cached.fetchedAt, stale: false },
      { headers: { 'Cache-Control': 'public, max-age=900' } });
  } catch {
    if (cached) return Response.json({ articles: cached.articles, fetchedAt: cached.fetchedAt, stale: true },
      { headers: { 'Cache-Control': 'no-store' } });
    return Response.json({ error: 'RuneScape news is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
