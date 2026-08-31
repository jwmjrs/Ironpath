'use client';

import { ArrowLeft, ChevronRight, CircleHelp, ShieldCheck, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';

const questions = [
  ['Does Ironpath change anything in RuneScape?', 'No. Ironpath is an unofficial companion site. It reads public-facing information where available and keeps its planning features separate from the game.'],
  ['Do all group members need to use it?', 'No. One person can use it for planning, or a group can share a workspace for checklists and archive entries.'],
  ['Why might activity or drop information be missing?', 'These sections rely on each member’s public RuneMetrics data. Availability depends on each player’s privacy settings and on the information returned by the service.'],
  ['Is Ironpath affiliated with Jagex?', 'No. Ironpath is a community project and is not affiliated with or endorsed by Jagex.'],
];

const themes = new Set(['necromancy', 'classic', 'gielinor', 'prifddinas', 'kharidian', 'wilderness', 'saradomin', 'zamorak']);

export default function FaqPage() {
  const [theme, setTheme] = useState('necromancy');
  useEffect(() => {
    const saved = window.localStorage.getItem('ironpath-theme');
    if (saved && themes.has(saved)) setTheme(saved);
  }, []);

  return <main className="faq-page-shell" data-theme={theme}>
    <article className="faq-page-wrap">
      <header className="faq-page-hero">
        <a className="faq-back-link" href="/"><ArrowLeft size={16}/> Back to Ironpath</a>
        <div className="faq-hero-copy">
          <span className="faq-hero-icon"><CircleHelp size={27}/></span>
          <div><p className="eyebrow">IRONPATH REFERENCE</p><h1>Questions, answered.</h1><p>A short guide to what Ironpath does, how group data is used, and where a result may be unavailable.</p></div>
        </div>
      </header>
      <section className="faq-quick-grid" aria-label="Quick answers">
        <article><UsersRound size={19}/><strong>Built for groups</strong><span>Use it solo or share planning with your fellow Ironmen.</span></article>
        <article><ShieldCheck size={19}/><strong>Unofficial companion</strong><span>Ironpath is community-made and separate from RuneScape.</span></article>
      </section>
      <section className="faq-question-panel" aria-labelledby="faq-heading">
        <div className="faq-panel-heading"><div><p className="eyebrow">COMMON QUESTIONS</p><h2 id="faq-heading">The helpful details.</h2></div><span>{questions.length} answers</span></div>
        <div className="faq-list">
          {questions.map(([question, answer]) => <details key={question}>
            <summary><span>{question}</span><ChevronRight size={18}/></summary>
            <p>{answer}</p>
          </details>)}
        </div>
      </section>
      <p className="faq-page-note">Still unsure? Check the privacy and data page for how local preferences and shared workspaces are handled.</p>
    </article>
  </main>;
}
