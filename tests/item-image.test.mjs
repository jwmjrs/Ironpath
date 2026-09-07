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
    return Response.json({ query: { redirects: [{ from: 'Test alias', to: 'Canonical item' }], pages: { 1: {
      title: 'Canonical item', thumbnail: { source: 'https://runescape.wiki/images/Canonical_item.png' },
    } } } });
  };
  try {
    assert.deepEqual(await (await GET(request('Test alias'))).json(), { image: 'https://runescape.wiki/images/Canonical_item.png' });
    await GET(request('Test alias'));
    assert.equal(calls, 1);
    assert.equal((await GET(request('a|b'))).status, 400);
    assert.equal((await GET(request('x'.repeat(101)))).status, 400);
    globalThis.fetch = async () => Response.json({ query: { pages: { 1: { thumbnail: { source: 'https://example.com/not-wiki.png' } } } } });
    assert.deepEqual(await (await GET(request('Unsafe test'))).json(), { image: null });
    globalThis.fetch = async () => Response.json({ query: { pages: { 1: { pageprops: { disambiguation: '' }, thumbnail: { source: 'https://runescape.wiki/images/Other.png' } } } } });
    assert.deepEqual(await (await GET(request('Ambiguous test'))).json(), { image: null });
    globalThis.fetch = async () => new Response('', { status: 503 });
    assert.equal((await GET(request('Retry test'))).status, 503);
    globalThis.fetch = async () => Response.json({ query: { pages: { 1: { original: { source: 'https://runescape.wiki/images/Retry.png' } } } } });
    assert.deepEqual(await (await GET(request('Retry test'))).json(), { image: 'https://runescape.wiki/images/Retry.png' });
  } finally { globalThis.fetch = original; }
});
