import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const root = new URL('../app/data/', import.meta.url);
const activities = JSON.parse(await readFile(new URL('repeatable-activities.json', root), 'utf8'));
const manifest = JSON.parse(await readFile(new URL('wiki-repeatables/manifest.json', root), 'utf8'));

test('removed and untimed activities cannot reappear in timed checklists', async () => {
  const names = Object.values(activities).flat().map(([name]) => name);
  for (const { name } of manifest.excluded) assert.ok(!names.includes(name), name);
  assert.ok(!names.includes('Jack of Trades'));
  const cache = await readFile(new URL('wiki-repeatables/guthixian-cache.wikitext', root), 'utf8');
  assert.match(cache, /frequency = Every 800 divine memories deposited/);
  assert.match(cache, /reset = N\/A/);
});

test('Wiki snapshots retain revision provenance and curated rows remain valid', async () => {
  for (const source of manifest.sources) {
    assert.ok(source.revisionId > 0);
    assert.ok(source.permalink.endsWith(String(source.revisionId)));
    assert.ok((await readFile(new URL(`wiki-repeatables/${source.file}`, root), 'utf8')).length > 0);
  }
  const rows = Object.values(activities).flat();
  assert.equal(new Set(rows.map(([name]) => name)).size, rows.length);
  for (const row of rows) assert.ok(row.length === 3 && row.every(value => typeof value === 'string' && value.trim()));
  assert.ok(activities.Weekly.some(([name]) => name === 'Soul Reaper'));
  assert.ok(activities.Weekly.some(([name]) => name === 'Razmire building stock'));
  assert.ok(activities.Daily.some(([name]) => name === 'Assist System'));
});
