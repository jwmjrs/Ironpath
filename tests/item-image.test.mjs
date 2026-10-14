import test from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../app/api/item-image/route.ts';

const request = (item) => new Request(`http://localhost/api/item-image?item=${encodeURIComponent(item)}`);
test('Wiki lookup resolves redirected pages, caches results, and rejects unsafe or ambiguous images', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls++;
    assert.equal(new URL(url).hostname, 'runescape.wiki');
    assert.equal(new URL(url).searchParams.get('redirects'), '1');
    if (new URL(url).searchParams.get('prop') === 'imageinfo') return Response.json({ query: { pages: { '-1': { missing: '' } } } });
    return Response.json({ query: { redirects: [{ from: 'Test alias', to: 'Canonical item' }], pages: { 1: {
      title: 'Canonical item', thumbnail: { source: 'https://runescape.wiki/images/Canonical_item.png' },
    } } } });
  };
  try {
    assert.deepEqual(await (await GET(request('Test alias'))).json(), { image: '/api/item-image?item=Test%20alias&asset=1' });
    await GET(request('Test alias'));
    assert.equal(calls, 2);
    assert.equal((await GET(request('a|b'))).status, 400);
    assert.equal((await GET(request('x'.repeat(101)))).status, 400);
    globalThis.fetch = async () => Response.json({ query: { pages: { 1: { thumbnail: { source: 'https://example.com/not-wiki.png' } } } } });
    assert.deepEqual(await (await GET(request('Unsafe test'))).json(), { image: null });
    globalThis.fetch = async () => Response.json({ query: { pages: { 1: { pageprops: { disambiguation: '' }, thumbnail: { source: 'https://runescape.wiki/images/Other.png' } } } } });
    assert.deepEqual(await (await GET(request('Ambiguous test'))).json(), { image: null });
    globalThis.fetch = async () => new Response('', { status: 503 });
    assert.equal((await GET(request('Retry test'))).status, 503);
    globalThis.fetch = async () => Response.json({ query: { pages: { 1: { original: { source: 'https://runescape.wiki/images/Retry.png' } } } } });
    assert.deepEqual(await (await GET(request('Retry test'))).json(), { image: '/api/item-image?item=Retry%20test&asset=1' });
  } finally { globalThis.fetch = original; }
});

test('inventory artwork is delivered as same-origin image bytes and ambiguous drop aliases use the correct subject', async () => {
  const original = globalThis.fetch;
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  globalThis.fetch = async url => {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/images/')) return new Response(png, { headers: { 'Content-Type': 'image/png' } });
    assert.equal(parsed.searchParams.get('titles'), 'File:Pristine Bagrada rex egg.png');
    return Response.json({ query: { pages: { 1: { imageinfo: [{ url: 'https://runescape.wiki/images/Pristine_Bagrada_rex_egg.png' }] } } } });
  };
  try {
    const response = await GET(new Request('http://localhost/api/item-image?item=Pristine%20Bagrada%20Rex%20egg&asset=1'));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Content-Type'), 'image/png');
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), png);
    globalThis.fetch = async () => new Response('<html>blocked</html>', { headers: { 'Content-Type': 'text/html' } });
    assert.equal((await GET(new Request('http://localhost/api/item-image?item=Pristine%20Bagrada%20Rex%20egg&asset=1'))).status, 503);
  } finally { globalThis.fetch = original; }
});
