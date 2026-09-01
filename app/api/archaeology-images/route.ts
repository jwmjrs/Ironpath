import { archaeologyCollectors } from '../../data/archaeology-collectors';

type WikiPage = { title?: string; thumbnail?: { source?: string } };
type ImageResponse = { query?: { pages?: Record<string, WikiPage> } };

const cache = new Map<string, { expires: number; image?: string }>();

async function imageForTitle(title: string) {
  const existing = cache.get(title);
  if (existing && existing.expires > Date.now()) return existing.image;
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    redirects: '1',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '96',
    titles: title,
  });
  const response = await fetch(`https://runescape.wiki/api.php?${params}`, {
    headers: { 'user-agent': 'Ironpath/1.0 (Group Ironman companion)' },
  });
  if (!response.ok) throw new Error('RuneScape Wiki request failed');
  const data = (await response.json()) as ImageResponse;
  const page = Object.values(data.query?.pages || {})[0];
  const image = page?.thumbnail?.source;
  cache.set(title, { image, expires: Date.now() + 21_600_000 });
  return image;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = url.searchParams.get('titles');
  const titles = requested
    ? requested.split('|').filter(Boolean).slice(0, 120)
    : url.searchParams.get('kind') === 'collectors'
      ? archaeologyCollectors.map((collector) => collector.name)
      : [];
  if (!titles.length) return Response.json({ images: {} });
  const entries = await Promise.all(
    titles.map(async (title) => {
      try {
        return [title, await imageForTitle(title)] as const;
      } catch {
        return [title, undefined] as const;
      }
    }),
  );
  const images = entries.reduce<Record<string, string>>((all, [title, image]) => {
    if (image) all[title] = image;
    return all;
  }, {});
  return Response.json({ images }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
