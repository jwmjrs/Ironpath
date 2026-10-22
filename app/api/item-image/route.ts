type WikiResult = {
  error?: unknown;
  query?: { pages?: Record<string, {
    title?: string;
    missing?: unknown;
    pageprops?: { disambiguation?: string };
    thumbnail?: { source?: string };
    original?: { source?: string };
    imageinfo?: { url?: string }[];
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
  const aliases: Record<string, string> = {
    'pristine bagrada rex egg': 'Pristine Bagrada rex egg',
    'pristine corbicula rex egg': 'Pristine Corbicula rex egg',
    'pristine pavosaurus rex egg': 'Pristine Pavosaurus rex egg',
    'crystal triskelion fragment': 'Crystal triskelion fragment 1',
    "baby yaga's house": "Baby Yaga's House pet",
  };
  const title = aliases[item.toLowerCase()] || item.charAt(0).toUpperCase() + item.slice(1);
  // Inventory files depict the actual dropped item, rather than article detail renders.
  const fileParams = new URLSearchParams({ action: 'query', format: 'json', redirects: '1',
    titles: `File:${title}.png`, prop: 'imageinfo', iiprop: 'url' });
  const fileResponse = await fetch(`https://runescape.wiki/api.php?${fileParams}`, {
    headers: { 'User-Agent': 'Ironpath/1.0 (Group Ironman companion; item image lookup)' },
    signal: AbortSignal.timeout(8000),
  });
  if (!fileResponse.ok) throw new Error('Wiki unavailable');
  const fileData = await fileResponse.json() as WikiResult;
  const filePage = Object.values(fileData.query?.pages || {})[0];
  const inventoryImage = trustedImage(filePage?.imageinfo?.[0]?.url);
  if (inventoryImage) {
    if (cache.size >= 500) cache.delete(cache.keys().next().value!);
    cache.set(item, { image: inventoryImage, expires: Date.now() + 21_600_000 });
    return inventoryImage;
  }
  const params = new URLSearchParams({
    action: 'query', format: 'json', redirects: '1', titles: title,
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
    if (new URL(request.url).searchParams.get('asset') === '1') {
      if (!image) return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
      const asset = await fetch(image, { signal: AbortSignal.timeout(12000),
        headers: { 'User-Agent': 'Ironpath/1.0 (Group Ironman companion; item artwork)' } });
      const type = asset.headers.get('Content-Type')?.split(';')[0] || '';
      if (!asset.ok || !['image/png', 'image/webp', 'image/jpeg', 'image/gif'].includes(type)) throw new Error('Image unavailable');
      const bytes = await asset.arrayBuffer();
      if (bytes.byteLength > 2_000_000) throw new Error('Image too large');
      return new Response(bytes, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=21600',
        'X-Content-Type-Options': 'nosniff' } });
    }
    // Deliver from our own origin: browsers no longer depend on third-party image access.
    return Response.json({ image: image ? `/api/item-image?item=${encodeURIComponent(item)}&asset=1` : null },
      { headers: { 'Cache-Control': `public, max-age=${image ? 21600 : 300}` } });
  } catch {
    return Response.json({ image: null }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
