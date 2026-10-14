'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Newspaper, RefreshCw } from 'lucide-react';
import type { NewsItem } from './api/news/route';
type Feed = { articles: NewsItem[]; fetchedAt: string; stale: boolean };
export default function RuneScapeNews() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  async function load(signal?: AbortSignal) {
    setLoading(true); setFailed(false);
    try {
      const response = await fetch('/api/news', { signal });
      if (!response.ok) throw new Error('News unavailable');
      setFeed(await response.json());
    } catch { if (!signal?.aborted) setFailed(true); }
    finally { if (!signal?.aborted) setLoading(false); }
  }
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    const timer = setInterval(() => void load(controller.signal), 900_000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);
  return <section className="panel rs-news" aria-labelledby="rs-news-title">
    <div className="rs-news-heading"><div><p className="eyebrow"><Newspaper size={15} /> Across Gielinor</p><h2 id="rs-news-title">Latest RuneScape news</h2><p>Updates, announcements, and what’s coming next.</p></div>
      <a className="rs-news-all" href="https://secure.runescape.com/m=news" target="_blank" rel="noreferrer">All news <ArrowUpRight size={16} /></a></div>
    {loading && !feed && <p className="rs-news-status" role="status">Gathering the latest from Jagex…</p>}
    {feed && <div className="rs-news-grid">{feed.articles.map((article, index) => <a className="rs-news-card" href={article.url} key={article.url} target="_blank" rel="noreferrer">
      <div className="rs-news-meta"><span>{index === 0 ? 'Latest · ' : ''}{article.category}</span><time dateTime={article.date}>{new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time></div>
      <h3>{article.title}</h3><p>{article.summary}</p><span className="rs-news-read">Read on RuneScape <ArrowUpRight size={14} /></span></a>)}</div>}
    <div className="rs-news-footer"><span>{failed ? 'News is temporarily unavailable.' : feed?.stale ? 'Showing the last available headlines.' : 'From the official RuneScape news feed · refreshes every 15 minutes'}</span>
      <button type="button" className="secondary-button" disabled={loading} onClick={() => void load()}><RefreshCw size={14} /> {loading ? 'Loading' : 'Refresh news'}</button></div>
  </section>;
}
