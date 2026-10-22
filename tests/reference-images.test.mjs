import test from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../app/api/armour-images/route.ts';

test('armour sets without Wiki thumbnails use real representative equipment images', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const params = new URL(url).searchParams;
    assert.ok(params.get('titles').split('|').includes('Cryptbloom top'));
    assert.ok(params.get('titles').split('|').includes('Anima core body of Seren'));
    return Response.json({ query: { redirects: [{ from: 'Trimmed masterwork platebody', to: 'Trimmed masterwork melee platebody' }], pages: {
      1: { title: 'Cryptbloom armour' },
      2: { title: 'Cryptbloom top', thumbnail: { source: 'https://runescape.wiki/images/Cryptbloom_top_detail.png' } },
      3: { title: 'Anima core body of Seren', original: { source: 'https://runescape.wiki/images/Anima_core_body_of_Seren.png' } },
      4: { title: 'Trimmed masterwork melee platebody', thumbnail: { source: 'https://runescape.wiki/images/Trimmed_masterwork_melee_platebody.png' } },
    } } });
  };
  try {
    const payload = await (await GET()).json();
    assert.equal(payload.images['Cryptbloom armour'], 'https://runescape.wiki/images/Cryptbloom_top_detail.png');
    assert.equal(payload.images['Anima core of Seren armour'], 'https://runescape.wiki/images/Anima_core_body_of_Seren.png');
    assert.equal(payload.images['Trimmed masterwork armour'], 'https://runescape.wiki/images/Trimmed_masterwork_melee_platebody.png');
    assert.equal(payload.images['Crystal armour'], undefined);
  } finally { globalThis.fetch = original; }
});
