'use client';

import { ArrowLeft, Compass, HeartHandshake, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

const themes = new Set(['classic', 'menaphos', 'necromancy', 'infernal-wilderness']);

export default function AboutPage() {
  const [theme, setTheme] = useState('necromancy');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('ironpath-theme');
    if (savedTheme && themes.has(savedTheme)) setTheme(savedTheme);
  }, []);

  return (
    <main className="about-page-shell" data-theme={theme}>
      <article className="about-page-wrap">
        <header className="about-page-hero">
          <a className="about-back-link" href="/"><ArrowLeft size={16} /> Back to Ironpath</a>
          <span className="about-hero-icon"><Compass size={28} /></span>
          <p className="eyebrow">THE IRONPATH STORY</p>
          <h1>Why Ironpath exists.</h1>
          <p>
            Ironpath began as a passion project for Justjay and his friend group when they started Group Ironman accounts together.
          </p>
        </header>

        <section className="about-story-grid">
          <article>
            <HeartHandshake size={20} />
            <h2>Built around a group</h2>
            <p>
              What started as a way to organise progress, routines, and discoveries became a shared home for the practical information the group kept finding while playing RuneScape.
            </p>
          </article>
          <article>
            <Compass size={20} />
            <h2>A useful place to return to</h2>
            <p>
              The goal is a simple one-stop companion: group standings, activity, planning, reference material, and useful routes without losing the human side of playing together.
            </p>
          </article>
          <article>
            <Sparkles size={20} />
            <h2>Community knowledge, thoughtfully organised</h2>
            <p>
              Ironpath is shaped by public community knowledge, including the RuneScape Wiki, The RS Guy, the Optimal Ironman Guide, and the many players who share helpful advice.
            </p>
          </article>
        </section>

        <section className="about-note">
          <h2>Made through real play and iteration</h2>
          <p>
            Feature ideas come from real in-game needs and community testing. AI assists with implementation, research organisation, copy, and iteration; the direction and testing remain human-led.
          </p>
          <p>Ironpath is an unofficial fan project and is not affiliated with Jagex or RuneScape.</p>
        </section>
      </article>
    </main>
  );
}
