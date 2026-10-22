// Refresh source snapshots only. Review changes before editing the curated checklist.
import { readFile, writeFile } from 'node:fs/promises';
const directory = new URL('../app/data/wiki-repeatables/', import.meta.url);
const manifestUrl = new URL('manifest.json', directory);
const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
const endpoint = new URL('https://runescape.wiki/api.php');
endpoint.search = new URLSearchParams({ action: 'query', prop: 'revisions', rvprop: 'ids|timestamp|content', rvslots: 'main', titles: manifest.sources.map(source => source.title).join('|'), format: 'json', formatversion: '2' });
const response = await fetch(endpoint, { headers: { 'User-Agent': 'Ironpath/0.1 (local repeatable-activity reference refresh)' } });
if (!response.ok) throw new Error(`Wiki returned ${response.status}`);
const payload = await response.json();
if (payload.error) throw new Error(payload.error.info);
// Validate the whole response before replacing any source files.
const updates = manifest.sources.map(source => {
  const page = payload.query?.pages?.find(page => page.title === source.title);
  const revision = page?.revisions?.[0];
  const content = revision?.slots?.main?.content;
  if (!revision?.revid || !content) throw new Error(`Missing revision for ${source.title}`);
  return { source, revision, content };
});
for (const { source, revision, content } of updates) {
  await writeFile(new URL(source.file, directory), content);
  source.revisionId = revision.revid;
  source.revisionTimestamp = revision.timestamp;
  source.permalink = `https://runescape.wiki/w/Special:PermanentLink/${revision.revid}`;
}
manifest.fetchedOn = new Date().toISOString().slice(0, 10);
// checkedOn records the last human-reviewed checklist, not just a successful fetch.
await writeFile(manifestUrl, JSON.stringify(manifest, null, 2) + '\n');
console.log('Wiki snapshots refreshed. Review the diff, update repeatable-activities.json, then set checkedOn after verification.');
