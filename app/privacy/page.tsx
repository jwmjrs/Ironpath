'use client';

import { ArrowLeft, Database, Eye, KeyRound, ShieldCheck, SlidersHorizontal, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';

const themes = new Set(['necromancy', 'classic', 'gielinor', 'prifddinas', 'kharidian', 'wilderness', 'saradomin', 'zamorak']);
const privacySections = [
  { icon: SlidersHorizontal, title:'On this device', detail:'Your chosen theme, recent HiScores result, lookup preferences, and private workspace access key stay in your browser. Clearing this site’s data removes those local copies.', note:'You control these local preferences.' },
  { icon: UsersRound, title:'Shared with your group', detail:'Shared checklists, supplies, milestones, workspace name, and saved HiScores snapshots are kept for the workspace so the people with its key can collaborate.', note:'Keep personal or sensitive information out of these fields.' },
  { icon: Eye, title:'RuneScape lookups', detail:'Refreshing HiScores or quest access sends the group name and public RuneScape names through Ironpath to the RuneScape HiScores and RuneMetrics services. Results may be cached briefly for reliability.', note:'Only public-facing character data is requested.' },
  { icon: KeyRound, title:'Your workspace key', detail:'The workspace key works like a password: anyone who has it can view and edit that workspace. The server retains only a one-way hash of its secret portion.', note:'Share it only with the group members you trust.' },
  { icon: Database, title:'Analytics and hosting', detail:'Ironpath does not use advertising trackers or sell personal data. Standard hosting security logs may temporarily contain technical request information, such as an IP address.', note:'No profiles are built for advertising or sale.' },
];

export default function PrivacyPage() {
  const [theme, setTheme] = useState('necromancy');
  useEffect(() => { const saved = window.localStorage.getItem('ironpath-theme'); if (saved && themes.has(saved)) setTheme(saved); }, []);
  return <main className="privacy-page-shell" data-theme={theme}>
    <article className="privacy-page-wrap">
      <header className="privacy-page-hero"><a className="privacy-back-link" href="/"><ArrowLeft size={16}/> Back to Ironpath</a><div className="privacy-hero-copy"><span className="privacy-hero-icon"><ShieldCheck size={27}/></span><div><p className="eyebrow">IRONPATH REFERENCE</p><h1>Privacy, clearly.</h1><p>A straightforward guide to what Ironpath keeps locally, what a shared workspace stores, and how public RuneScape lookups are used.</p></div></div></header>
      <section className="privacy-promise-grid" aria-label="Privacy at a glance"><article><ShieldCheck size={19}/><strong>No advertising trackers</strong><span>Ironpath does not sell personal data or build advertising profiles.</span></article><article><KeyRound size={19}/><strong>Group-controlled access</strong><span>Your workspace key decides who can see and edit shared planning.</span></article></section>
      <section className="privacy-detail-panel" aria-labelledby="privacy-heading"><div className="privacy-panel-heading"><div><p className="eyebrow">THE DETAILS</p><h2 id="privacy-heading">Where your information lives.</h2></div><span>{privacySections.length} topics</span></div><div className="privacy-detail-list">{privacySections.map(({ icon: Icon, title, detail, note }) => <article key={title}><span className="privacy-detail-icon"><Icon size={19}/></span><div><h3>{title}</h3><p>{detail}</p><small>{note}</small></div></article>)}</div></section>
      <section className="privacy-control-note"><SlidersHorizontal size={18}/><div><strong>Your control</strong><p>You can leave a workspace from the Dashboard and clear Ironpath site data from your browser at any time. Server-side deletion and recovery controls will be added before a wider public release.</p></div></section>
    </article>
  </main>;
}
