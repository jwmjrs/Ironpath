export const metadata = {
  title: 'Privacy & Data — Ironpath',
  description: 'How Ironpath stores and uses Group Ironman planning data.',
};

export default function PrivacyPage() {
  return <main className="privacy-page">
    <article className="privacy-card">
      <p className="eyebrow">IRONPATH</p>
      <h1>Privacy &amp; data</h1>
      <p className="privacy-lead">Ironpath is an unofficial community companion. It is not affiliated with, endorsed by, or connected to Jagex.</p>
      <section><h2>What stays on your device</h2><p>Your selected theme, most recent HiScores result, lookup preferences, and private workspace access key are stored in your browser. Clearing site data removes these local copies.</p></section>
      <section><h2>What is stored for your group</h2><p>Shared checklists, supplies, milestones, workspace name, and saved HiScores snapshots are stored in the site database so members using the same workspace key can collaborate. Do not put sensitive personal information in these fields.</p></section>
      <section><h2>RuneScape lookups</h2><p>When you refresh HiScores, the group name and public RuneScape names are sent through Ironpath to the official RuneScape HiScores service. Results are cached briefly to improve reliability and reduce requests.</p></section>
      <section><h2>Your workspace key</h2><p>The workspace key acts like a password: anyone who has it can view and edit that workspace. Share it only with your group. Ironpath stores only a one-way hash of the secret portion on the server.</p></section>
      <section><h2>Analytics and sales</h2><p>Ironpath does not include advertising trackers and does not sell personal data. Normal hosting security logs may temporarily contain technical request information such as an IP address.</p></section>
      <section><h2>Control</h2><p>You can leave a workspace from Group Hub and clear Ironpath site data in your browser. A future account system may add server-side workspace deletion and recovery controls before a wider public release.</p></section>
      <a className="primary-button privacy-back" href="/">Return to Ironpath</a>
    </article>
  </main>;
}
