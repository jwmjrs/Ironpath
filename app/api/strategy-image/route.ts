import { trustedWikiImage } from '../../lib/wiki-strategies';

const pending = new Map<string, Promise<Response>>();
async function load(src: string, key: Request) {
  const response = await fetch(src, {
    headers: { 'User-Agent': 'Ironpath/1.0 (cached RS3 strategy artwork)' },
    signal: AbortSignal.timeout(12000), redirect: 'error',
  });
  const type = response.headers.get('Content-Type')?.split(';')[0] || '';
  if (!response.ok || !['image/png', 'image/webp', 'image/jpeg', 'image/gif'].includes(type)) throw new Error('Image unavailable');
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > 2_000_000) throw new Error('Image too large');
  const asset = new Response(bytes, { headers: {
    'Content-Type': type, 'Cache-Control': 'public, max-age=604800',
    'X-Content-Type-Options': 'nosniff',
  } });
  await caches.default.put(key, asset.clone());
  return asset;
}
export async function GET(request: Request) {
  const value = new URL(request.url).searchParams.get('src') || '';
  const src = value.length <= 1500 ? trustedWikiImage(value) : undefined;
  if (!src) return new Response(null, { status: 400 });
  const url = new URL('/api/strategy-image', request.url);
  url.searchParams.set('src', src);
  const key = new Request(url);
  try {
    const saved = await caches.default.match(key);
    if (saved) return saved;
    let lookup = pending.get(src);
    if (!lookup) {
      if (pending.size >= 32) return new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store' } });
      lookup = load(src, key).finally(() => pending.delete(src));
      pending.set(src, lookup);
    }
    return (await lookup).clone();
  } catch {
    return new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
