'use client';
import { useState } from 'react';
import { Users, Search, Copy, Check, Star } from 'lucide-react';

// Names and purposes transcribed from the supplied design reference.
// The mockup is not evidence of live availability or verification.
const directory = [
  { name: 'Star Find', purpose: 'Shooting Stars', category: 'Activities' },
  { name: 'World60Pengs', purpose: 'Penguin Hide & Seek', category: 'Activities' },
  { name: 'Boss Guild', purpose: 'Boss masses and PvM events', category: 'PvM' },
  { name: 'Croesus FC', purpose: 'Croesus team finding', category: 'PvM' },
  { name: 'Fast SC', purpose: 'Stealing Creation', category: 'Minigames' },
];
export default function FriendsChats() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selected, setSelected] = useState(directory[0]);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const filtered = directory.filter(fc => !verifiedOnly && (category === 'All' || fc.category === category) && `${fc.name} ${fc.purpose}`.toLowerCase().includes(query.toLowerCase()));
  const select = (fc: typeof directory[number]) => { setSelected(fc); setCopied(false); setCopyError(''); };
  return <div className="content feature-page friends-refresh">
    <header className="refresh-page-heading"><Users size={32}/><div><p className="eyebrow">Community /</p><h1>Friends Chats</h1><p>Find community chats for activities, skilling, PvM, and more.</p></div></header>
    <p className="directory-notice">Community details and live activity are being verified.</p>
    <div className="directory-toolbar"><label className="route-search"><Search size={16}/><input aria-label="Search Friends Chats" placeholder="Search Friends Chats…" value={query} onChange={e => setQuery(e.target.value)}/></label><div className="guide-tabs">{['All','Activities','Skilling','PvM','Minigames'].map(value => <button key={value} className={category === value ? 'active' : ''} onClick={() => setCategory(value)}>{value}</button>)}</div><label className="verified-toggle"><input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)}/> Verified only</label></div>
    <h2 className="directory-section-title"><Star size={17}/> Featured Friends Chats</h2>
    <div className="directory-featured">{filtered.slice(0,4).map(fc => <button key={fc.name} className={`panel fc-card ${selected.name === fc.name ? 'selected' : ''}`} onClick={() => select(fc)}><Users size={23}/><strong>{fc.name}</strong><span>{fc.purpose}</span><small className="state-badge unverified">Activity Unverified</small></button>)}</div>
    <div className="directory-layout"><section className="panel directory-table"><h2>All Friends Chats</h2><div className="fc-table-head"><span>FC name</span><span>Purpose / Activity</span><span>Category</span><span>Status</span></div>{filtered.map(fc => <button className={`fc-row ${selected.name === fc.name ? 'selected' : ''}`} key={fc.name} onClick={() => select(fc)}><strong>{fc.name}</strong><span>{fc.purpose}</span><span>{fc.category}</span><span className="state-badge unverified">Unverified</span></button>)}{!filtered.length && <p className="directory-empty">{verifiedOnly ? 'No entries have been verified yet.' : 'No chats match these filters.'}</p>}</section>
    <aside className="panel fc-detail"><p className="eyebrow">Chat details</p><Users size={30}/><h2>{selected.name}</h2><p>{selected.purpose}</p><span className="state-badge unverified">Activity Unverified</span><p>Availability and community details are being verified. No live status is claimed.</p><button className="primary-button" onClick={async () => { try { await navigator.clipboard.writeText(selected.name); setCopied(true); } catch { setCopyError('Copy is unavailable. Select the chat name above to copy it manually.'); } }}>{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? 'Copied' : 'Copy FC Name'}</button>{copyError && <output>{copyError}</output>}</aside></div>
  </div>;
}
