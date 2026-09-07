type WikiResult = {
  error?: unknown;
  query?: { pages?: Record<string, {
    title?: string;
    missing?: unknown;
    pageprops?: { disambiguation?: string };
    thumbnail?: { source?: string };
    original?: { source?: string };
  }> };
};
const cache = new Map<string, { image: string | null; expires: number }>();
const pending = new Map<string, Promise<string | null>>();

function trustedImage(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'runescape.wiki'
      && url.pathname.startsWith('/images/') ? url.href : null;
  } catch { return null; }
}

async function resolveImage(item: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query', format: 'json', redirects: '1', titles: item,
    prop: 'pageimages|pageprops', ppprop: 'disambiguation',
    piprop: 'thumbnail|original', pithumbsize: '64', pilicense: 'any',
  });
  const response = await fetch(`https://runescape.wiki/api.php?${params}`, {
    headers: { 'User-Agent': 'Ironpath/1.0 (Group Ironman companion; item image lookup)' },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Wiki unavailable');
  const data = await response.json() as WikiResult;
  if (data.error || !data.query?.pages) throw new Error('Invalid Wiki response');
  const page = Object.values(data.query.pages)[0];
  const image = page && !('missing' in page) && page.pageprops?.disambiguation === undefined
    ? trustedImage(page.thumbnail?.source) || trustedImage(page.original?.source) : null;
  // Bound memory and retry missing images sooner than successful resolutions.
  if (cache.size >= 500) cache.delete(cache.keys().next().value!);
  cache.set(item, { image, expires: Date.now() + (image ? 21_600_000 : 300_000) });
  return image;
}

export async function GET(request: Request) {
  const item = (new URL(request.url).searchParams.get('item') || '')
    .replace(/[\u200B-\u200D\uFEFF]/gu, '').replace(/\s+/gu, ' ').trim();
  if (!item || item.length > 100 || (item.includes('|') || item.split('').some((char) => char.charCodeAt(0) < 32))) {
    return Response.json({ error: 'Provide one item name, up to 100 characters.' }, { status: 400 });
  }
  try {
    const saved = cache.get(item);
    let image: string | null;
    if (saved && saved.expires > Date.now()) image = saved.image;
    else {
      let lookup = pending.get(item);
      if (!lookup) {
        if (pending.size >= 20) return Response.json({ image: null }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
        lookup = resolveImage(item).finally(() => pending.delete(item));
        pending.set(item, lookup);
      }
      image = await lookup;
    }
    return Response.json({ image }, { headers: { 'Cache-Control': `public, max-age=${image ? 21600 : 300}` } });
  } catch {
    return Response.json({ image: null }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
