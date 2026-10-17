'use client';

import { ArrowLeft, Compass, HeartHandshake, Sparkles } from 'lucide-react';
export default function AboutPage() {
  return (
    <main className="about-page-shell">
      <article className="about-page-wrap">
        <header className="about-page-hero">
          <a className="about-back-link" href="/"><ArrowLeft size={16} /> Back to Ironpath</a>
          <img className="about-brand" src="/ironpath-zaros-wordmark.png" alt="Ironpath" />
          <p className="eyebrow">THE IRONPATH STORY</p>
          <h1>A project shaped by the group.</h1>
          <p>
            Ironpath began as a passion project for Justjay and his Group Ironman partners when they started their accounts together.
          </p>
        </header>

        <section className="about-story-grid">
          <article>
            <HeartHandshake size={20} />
            <h2>Built around a group</h2>
            <p>
              What started as a way to organise progress, routines, and discoveries became a shared home for the practical information the group kept finding while playing RuneScape. Features and ideas have been carefully bounced around the group, then tested against one simple question: is this genuinely useful, or does it only sound useful on paper?
            </p>
          </article>
          <article>
            <Compass size={20} />
            <h2>A useful place to return to</h2>
            <p>
              The goal is a simple one-stop companion: group standings, activity, planning, reference material, and useful routes, built around the things the group actually needs while playing, rather than a generic checklist.
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
            Ironpath is shaped by real in-game needs, group discussion, and repeated testing. The direction remains human-led: if something does not make a play session easier or more enjoyable for the group, it is reconsidered. AI assists with implementation, research organisation, copy, and iteration.
          </p>
          <p>Ironpath is an unofficial fan project and is not affiliated with Jagex or RuneScape.</p>
        </section>
      </article>
    </main>
  );
}
