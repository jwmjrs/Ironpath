import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('efficient progression data is complete and source labels are neutral', async () => {
  const text = await readFile(new URL('app/data/efficient-progress.json', root), 'utf8');
  const data = JSON.parse(text);
  const rows = data.progression.flatMap(part => part.rows);
  assert.equal(rows.length, 229);
  assert.equal(Object.keys(data.training).length, 29);
  assert.doesNotMatch(text, /The RS Guide|thersguide/i);
  assert.ok(data.source.wiki.startsWith('https://runescape.wiki/'));
});

test('installable app and public-facing policy files exist', async () => {
  const manifest = JSON.parse(await readFile(new URL('public/manifest.webmanifest', root), 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/');
  const privacy = await readFile(new URL('app/privacy/page.tsx', root), 'utf8');
  assert.match(privacy, /not affiliated with.*Jagex/i);
  const headers = await readFile(new URL('public/_headers', root), 'utf8');
  assert.match(headers, /X-Content-Type-Options: nosniff/);
});
