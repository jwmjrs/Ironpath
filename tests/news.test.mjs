import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNews, GET } from '../app/api/news/route.ts';
const item = (title, date, link = 'https://secure.runescape.com/m=news/test') => `<item><title>${title}</title><description><![CDATA[<b>Update</b> &amp; new content &#8217;]]></description><category>Game Updates</category><link>${link}</link><pubDate>${date}</pubDate></item>`;
test('official news parsing preserves text, sorts dates, removes duplicate or unsafe links, and limits headlines', () => {
  const xml = item('Old &amp; good', '1 Oct 2026', 'https://secure.runescape.com/m=news/old') + item('New', '12 Oct 2026') + item('Duplicate', '13 Oct 2026') + item('Unsafe', '14 Oct 2026', 'https://evil.test/news') + item('Invalid date', 'bad', 'https://secure.runescape.com/m=news/bad');
  const articles = parseNews(xml);
  assert.equal(articles.length, 2);
  assert.equal(articles[0].title, 'New');
  assert.equal(articles[1].title, 'Old & good');
  assert.equal(articles[0].summary, 'Update & new content ’');
  assert.equal(parseNews(Array.from({ length: 12 }, (_, i) => item(`Post ${i}`, '12 Oct 2026', `https://secure.runescape.com/m=news/${i}`)).join('')).length, 6);
});
test('news fetch is cached across requests and exposes a timestamp', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async url => { calls++; assert.equal(url, 'https://secure.runescape.com/m=news/latest_news.rss'); return new Response(item('Latest', '12 Oct 2026')); };
  try {
    const first = await (await GET()).json();
    const second = await (await GET()).json();
    assert.equal(first.articles[0].title, 'Latest');
    assert.equal(first.stale, false);
    assert.ok(first.fetchedAt);
    assert.deepEqual(second, first);
    assert.equal(calls, 1);
  } finally { globalThis.fetch = original; }
});
