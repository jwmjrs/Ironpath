'use client';

import { BookOpen, Boxes, CalendarCheck2, Check, ChevronRight, CircleDot, Clock3, Coins, Crown, Dumbbell, ExternalLink, Gem, LayoutDashboard, Leaf, ListChecks, Plus, RefreshCw, Search, Shield, Sparkles, Trash2, Trophy, Users } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import progressData from './data/efficient-progress.json';

const tasks = [
  { title: 'Complete The Restless Ghost', scope: 'All members', done: 3, total: 4 },
  { title: 'The Provider of Misthalin', scope: 'Any member', done: 1, total: 1 },
  { title: 'Reach 200 total quest points', scope: 'Combined', done: 164, total: 200 },
];
const nav = [[LayoutDashboard, 'Overview'], [Trophy, 'HiScores'], [Boxes, 'Group Hub'], [CalendarCheck2, 'Repeatables'], [BookOpen, 'Ironman Guide'], [ListChecks, 'Efficient Progress']] as const;
const themes = [
  ['classic','Classic Gielinor'], ['ember','Wilderness Ember'], ['zaros','Arcane Zaros'],
  ['seren','Prifddinas Crystal'], ['morytania','Morytania Marsh'], ['fremennik','Fremennik Frost'],
  ['menaphos','Menaphos Sun'], ['falador','Falador Steel'], ['karamja','Karamja Jungle'], ['necromancy','Necromancy Ritual'],
] as const;
type Theme = typeof themes[number][0];
function isTheme(value:string|null): value is Theme { return themes.some(([id]) => id === value); }

const repeatables = {
  Daily: [
    ['Daily Challenges', 'Three skill challenges', 'High XP'],
    ['Nemi Forest', 'Mining, Farming, Prayer & Dungeoneering', '10 min'],
    ['Jack of Trades', 'Complete the aura skill circuit', 'XP book'],
    ['Sinkholes', 'Two Dungeoneering games', 'Timed'],
    ['Player-owned ports', 'Voyages, visitors and resources', 'Passive'],
  ],
  Weekly: [
    ['Soul Reaper', 'Earn up to 300 Reaper points', 'Bossing'],
    ['Penguin Hide and Seek', 'Spot the weekly penguins', 'Flexible XP'],
    ['Tears of Guthix', 'Train your lowest skill', 'Quest'],
    ['Meg at Player-owned Ports', 'Answer Meg and claim the chest', '5 min'],
    ['Agoroth', 'Two encounters for bonus XP', 'Combat'],
    ['Aquarium decorations', 'Collect oysters, kelp and seaweed', 'Weekly since 2026'],
  ],
  Monthly: [
    ['Troll Invasion', 'Defend Burthorpe and claim an XP book', 'Combat'],
    ['God Statues', 'Build four statues across Gielinor', 'Construction'],
    ['Giant Oyster', 'Feed, check and open the oyster', 'Fishing'],
    ['Effigy Incubator', 'Complete the monthly Anachronia activity', 'High level'],
  ],
} as const;

type HiscoreSkill = { name: string; rank: number; level: number; xp: number };
type HiscorePlayer = { name: string; overall: HiscoreSkill | null; skills: HiscoreSkill[] };
type HiscoreResult = { group: string; mode: string; size: number; totalLevel: number; totalXp: number; players: HiscorePlayer[]; refreshedAt: string; sourceUrl: string; cached?: boolean; stale?: boolean; warning?: string };
type GroupActivity = { player:string; date:string; timestamp:number; text:string; details:string };
type ActivityMember = { name:string; available:boolean; reason?:string };
type SharedItem = { id:string; name:string; detail:string; owner:string; quantity:string; done:boolean };
type WorkspaceData = { version:number; efficient:Record<string,boolean>; repeatables:Record<string,boolean>; unlocks:Record<string,boolean>; journey:Record<string,boolean>; supplies:SharedItem[]; shops:Record<string,boolean>; pvm:Record<string,boolean>; farming:Record<string,boolean>; kingdom:Record<string,string|boolean>; updatedBy:string };
type Workspace = { id:string; token:string; name:string; data:WorkspaceData; updatedAt:number };
const emptyWorkspaceData: WorkspaceData = { version:1,efficient:{},repeatables:{},unlocks:{},journey:{},supplies:[],shops:{},pvm:{},farming:{},kingdom:{},updatedBy:'' };

export default function Home() {
  const [active, setActive] = useState('Overview');
  const [theme, setTheme] = useState<Theme>('classic');
  const [groupData, setGroupData] = useState<HiscoreResult | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  useEffect(() => { try { setGroupData(JSON.parse(window.localStorage.getItem('ironpath-hiscore-result') || 'null')); const savedTheme = window.localStorage.getItem('ironpath-theme'); if (isTheme(savedTheme)) setTheme(savedTheme); const savedWorkspace = JSON.parse(window.localStorage.getItem('ironpath-workspace') || 'null'); if (savedWorkspace?.id && savedWorkspace?.token) fetch('/api/workspace',{headers:{'x-ironpath-workspace':savedWorkspace.id,'x-ironpath-token':savedWorkspace.token}}).then(response=>response.ok?response.json() as Promise<Omit<Workspace,'token'>>:null).then(remote=>remote&&setWorkspace({ ...remote, token:savedWorkspace.token, data:{...emptyWorkspaceData,...remote.data} })).catch(()=>{}); if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{}); } catch { /* ignore */ } }, []);
  function changeTheme(value: Theme) { setTheme(value); window.localStorage.setItem('ironpath-theme', value); }
  function updateWorkspace<K extends keyof WorkspaceData>(key: K, value: WorkspaceData[K]) { if (!workspace) return; const next = { ...workspace, data:{ ...workspace.data, [key]:value }, updatedAt:Date.now() }; setWorkspace(next); fetch('/api/workspace',{method:'PUT',headers:{'content-type':'application/json','x-ironpath-workspace':workspace.id,'x-ironpath-token':workspace.token},body:JSON.stringify({name:workspace.name,data:next.data})}).catch(()=>{}); }
  const views: Record<string, React.ReactNode> = {
    Overview: <Overview groupData={groupData} goTo={setActive} />,
    HiScores: <HiScoresView result={groupData} setResult={setGroupData} />,
    'Group Hub': <GroupHubView groupData={groupData} workspace={workspace} setWorkspace={setWorkspace} updateWorkspace={updateWorkspace} />,
    Repeatables: <RepeatablesView shared={workspace?.data.repeatables} setShared={value=>updateWorkspace('repeatables',value)} />,
    'Ironman Guide': <IronmanGuideView shared={workspace?.data.unlocks} setShared={value=>updateWorkspace('unlocks',value)} />,
    'Efficient Progress': <EfficientProgressView groupData={groupData} shared={workspace?.data.efficient} setShared={value=>updateWorkspace('efficient',value)} />,
  };
  return <main className="min-h-screen bg-background text-foreground" data-theme={theme}>
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark"><Shield size={20} strokeWidth={1.8} /></div>
        <nav aria-label="Primary navigation">{nav.map(([Icon, label]) => <button key={label} className={active === label ? 'nav-button active' : 'nav-button'} onClick={() => setActive(label)} aria-label={label}><Icon size={18} strokeWidth={1.7} /><span>{label}</span></button>)}</nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">Group Ironman command center</p><h1>Ironpath</h1></div>
          <div className="top-actions"><label className="theme-control"><span>Theme</span><select value={theme} onChange={event => changeTheme(event.target.value as Theme)} aria-label="Choose color theme">{themes.map(([id,label]) => <option value={id} key={id}>{label}</option>)}</select></label><div className="status-chip"><CircleDot size={14} /> {active}</div></div>
        </header>
        {views[active]}
        <footer className="app-credit"><span>By <strong>Justjay</strong></span><i aria-hidden="true"/><span>AI-assisted development</span><i aria-hidden="true"/><span>For the community</span><i aria-hidden="true"/><a href="/privacy">Privacy &amp; data</a><i aria-hidden="true"/><span className="legal-note">Unofficial · Not affiliated with Jagex</span></footer>
      </section>
    </div>
  </main>;
}

function Overview({ groupData, goTo }: { groupData: HiscoreResult | null; goTo: (view: string) => void }) {
  const roster = groupData?.players || [];
  if (!groupData) return <ConnectGroup goTo={goTo} />;
  return <div className="content">
          <section className="welcome-row">
            <div><p className="date-line">GROUP COMMAND CENTER</p><h2>{groupData.group}</h2><p>Your live roster and local planning ledger are ready.</p></div>
            <div className="status-chip"><CircleDot size={14} /> {groupData.mode} GIM · {groupData.size} members</div>
          </section>
          <section className="journey-banner">
            <div className="journey-emblem"><Crown size={25} strokeWidth={1.5} /></div>
            <div className="journey-copy"><p className="eyebrow">Guided progression</p><h3>Efficient Progress</h3><p>Follow the ordered Ironman route and find training methods for every skill.</p></div>
            <div className="journey-progress"><div className="progress-label"><span>229 progression steps</span><strong>Ready</strong></div><div className="progress-track"><span style={{ width: '18%' }} /></div></div>
            <button className="primary-button" onClick={() => goTo('Efficient Progress')}>Open guide <ChevronRight size={16} /></button>
          </section>
          <div className="dashboard-grid">
            <section className="panel members-panel">
              <div className="panel-heading"><div><p className="eyebrow">The fellowship</p><h3>Group members</h3></div><button className="text-button" onClick={() => goTo('HiScores')}>View HiScores <ChevronRight size={14} /></button></div>
              <div className="member-list">{roster.map((member, index) => <article className="member-row" key={member.name}>
                <span className="member-rank">{String(index + 1).padStart(2, '0')}</span><div className="member-avatar" style={{ '--avatar': ['#d7a84d','#62a6a0','#b86250','#7e9660','#8876a1'][index] } as React.CSSProperties}>{member.name.slice(0,2).toUpperCase()}</div>
                <div className="member-name"><strong>{member.name}</strong><span>Group member</span></div><div className="member-stat"><span>Total level</span><strong>{member.overall?.level.toLocaleString() || '—'}</strong></div><div className="member-stat gain"><span>Total XP</span><strong>{compactNumber(member.overall?.xp || 0)}</strong></div>
              </article>)}</div>
            </section>
            <aside className="panel focus-panel">
              <div className="panel-heading"><div><p className="eyebrow">This week</p><h3>Group focus</h3></div><Sparkles size={18} className="muted-icon" /></div>
              <div className="focus-card"><div className="focus-icon"><Gem size={20} /></div><div><strong>Follow the efficient route</strong><p>Use the progression guide to choose the next useful group unlock.</p></div></div>
              <div className="mini-stats"><div><strong>{groupData.size}</strong><span>Members</span></div><div><strong>{compactNumber(groupData.totalXp)}</strong><span>Total XP</span></div><div><strong>{groupData.totalLevel.toLocaleString()}</strong><span>Total level</span></div></div>
              <button className="secondary-button" onClick={() => goTo('Efficient Progress')}><ListChecks size={16} /> Open efficient progress</button>
            </aside>
            <section className="panel tasks-panel">
              <div className="panel-heading"><div><p className="eyebrow">Starter milestones</p><h3>Progress suggestions</h3></div><button className="text-button" onClick={() => goTo('Efficient Progress')}>Open route <ChevronRight size={14} /></button></div>
              <div className="task-list">{tasks.map(task => { const complete = task.done === task.total; return <article className="task-row" key={task.title}><div className={complete ? 'task-check complete' : 'task-check'}>{complete ? <Check size={14} /> : <span />}</div><div className="task-copy"><strong>{task.title}</strong><span>{task.scope}</span></div><div className="task-meter"><div><span style={{ width: `${(task.done / task.total) * 100}%` }} /></div><strong>{task.done}/{task.total}</strong></div></article>; })}</div>
            </section>
            <aside className="panel storage-panel">
              <div className="panel-heading"><div><p className="eyebrow">Guided route</p><h3>Efficient Progress</h3></div><BookOpen size={18} className="muted-icon" /></div>
              <div className="storage-visual"><ListChecks size={28} /><span>229 ordered progression steps</span></div><button className="secondary-button" onClick={() => goTo('Efficient Progress')}>Open progression guide</button>
            </aside>
          </div>
  </div>;
}

function HiScoresView({ result, setResult }: { result: HiscoreResult | null; setResult: (value: HiscoreResult | null) => void }) {
  const [group, setGroup] = useState('');
  const [size, setSize] = useState('4');
  const [competitive, setCompetitive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [activityMembers, setActivityMembers] = useState<ActivityMember[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityMember, setActivityMember] = useState('all');

  useEffect(() => {
    const saved = window.localStorage.getItem('ironpath-hiscore-group');
    if (!saved) return;
    try { const value = JSON.parse(saved); setGroup(value.group || ''); setSize(value.size || '4'); setCompetitive(Boolean(value.competitive)); } catch { /* ignore invalid local preference */ }
  }, []);

  useEffect(() => {
    if (!result) { setActivities([]); setActivityMembers([]); setActivityMember('all'); return; }
    setActivityMember('all');
    const query = result.players.map(player => `player=${encodeURIComponent(player.name)}`).join('&');
    setActivityLoading(true);
    fetch(`/api/activities?${query}`)
      .then(response => response.ok ? response.json() : { activities:[],members:[] })
      .then((data: { activities?:GroupActivity[];members?:ActivityMember[] }) => { setActivities(data.activities || []); setActivityMembers(data.members || []); })
      .catch(() => { setActivities([]); setActivityMembers([]); })
      .finally(() => setActivityLoading(false));
  }, [result]);

  const visibleActivities = (activityMember === 'all' ? activities : activities.filter(activity => activity.player === activityMember)).slice(0,40);

  async function refresh(event?: FormEvent) {
    event?.preventDefault();
    if (!group.trim()) { setError('Enter your exact RuneScape group name.'); return; }
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/hiscores?group=${encodeURIComponent(group)}&size=${size}&competitive=${competitive}`);
      const data = await response.json() as HiscoreResult & { error?:string };
      if (!response.ok) throw new Error(data.error || 'Unable to retrieve this group.');
      setResult(data);
      window.localStorage.setItem('ironpath-hiscore-group', JSON.stringify({ group, size, competitive }));
      window.localStorage.setItem('ironpath-hiscore-result', JSON.stringify(data));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to refresh HiScores.'); }
    finally { setLoading(false); }
  }

  return <div className="content feature-page">
    <section className="feature-heading">
      <div><p className="date-line">LIVE FROM RUNESCAPE</p><h2>Group HiScores</h2><p>Look up your team, refresh every member, and compare progress in one place.</p></div>
      {result && <div className="status-chip"><CircleDot size={14} /> Refreshed {new Date(result.refreshedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>}
    </section>
    <form className="lookup-panel panel" onSubmit={refresh}>
      <label className="field group-field"><span>Group name</span><input value={group} onChange={event => setGroup(event.target.value)} placeholder="Enter exact group name" /></label>
      <label className="field"><span>Group size</span><select value={size} onChange={event => setSize(event.target.value)}><option value="2">2 members</option><option value="3">3 members</option><option value="4">4 members</option><option value="5">5 members</option></select></label>
      <label className="mode-toggle"><input type="checkbox" checked={competitive} onChange={event => setCompetitive(event.target.checked)} /><span><strong>Competitive</strong><small>Strict group-only rules</small></span></label>
      <button className="primary-button lookup-button" disabled={loading}>{loading ? <RefreshCw className="spin" size={16} /> : <Search size={16} />}{loading ? 'Refreshing…' : 'Look up group'}</button>
    </form>
    {error && <div className="error-banner">{error}</div>}
    {result?.warning && <div className="warning-banner">{result.warning}</div>}
    {!result && !error && <section className="empty-state"><Trophy size={32} /><h3>Your group ledger starts here</h3><p>Enter the exact group name, current size, and mode used on the official HiScores.</p></section>}
    {result && <>
      <section className="hiscore-summary">
        <div className="panel summary-main"><p className="eyebrow">{result.mode} group · {result.size} members</p><h3>{result.group}</h3><a href={result.sourceUrl} target="_blank" rel="noreferrer">Official HiScores <ExternalLink size={12} /></a></div>
        <div className="panel summary-stat"><span>Combined level</span><strong>{result.totalLevel.toLocaleString()}</strong></div>
        <div className="panel summary-stat"><span>Combined XP</span><strong>{compactNumber(result.totalXp)}</strong></div>
        <button className="panel refresh-card" onClick={() => refresh()} disabled={loading}><RefreshCw className={loading ? 'spin' : ''} size={20} /><span>Refresh stats</span></button>
      </section>
      <section className="panel hiscore-table-panel">
        <div className="panel-heading"><div><p className="eyebrow">Current roster</p><h3>Member standings</h3></div><span className="source-note">Position ranks members by total XP within this group</span></div>
        <div className="hiscore-table"><div className="hiscore-row table-head"><span>Member</span><span>Total level</span><span>Total XP</span><span>Group position</span><span>Top skill</span></div>{[...result.players].sort((a,b)=>(b.overall?.xp||0)-(a.overall?.xp||0)).map((player, position) => {
          const top = [...player.skills].sort((a,b) => b.xp - a.xp)[0];
          const expanded = expandedMember === player.name;
          const statistics = player.overall ? [player.overall, ...player.skills] : player.skills;
          return <section className={expanded ? 'score-entry expanded' : 'score-entry'} key={player.name}><button className="hiscore-row clickable" onClick={() => setExpandedMember(expanded ? null : player.name)} aria-expanded={expanded}><div className="score-member"><span>{player.name.slice(0,2).toUpperCase()}</span><strong>{player.name}</strong></div><strong>{player.overall?.level.toLocaleString() || '—'}</strong><span>{compactNumber(player.overall?.xp || 0)}</span><span>#{position + 1} of {result.players.length}</span><span className="top-skill-cell">{top ? `${top.name} ${top.level}` : 'Stats unavailable'}<ChevronRight size={14} /></span></button>{expanded && <div className="skill-drawer"><div className="skill-drawer-head"><div><p className="eyebrow">Individual statistics</p><h3>{player.name}</h3></div><span>{statistics.length} ranked skills</span></div><div className="skill-grid"><div className="skill-grid-head"><span>Skill</span><span>Level</span><span>XP</span><span>Rank</span></div>{statistics.map(skill => <div className="skill-stat-row" key={skill.name}><strong>{skill.name}</strong><span>{skill.level.toLocaleString()}</span><span>{skill.xp.toLocaleString()}</span><span>{skill.rank > 0 ? `#${skill.rank.toLocaleString()}` : '—'}</span></div>)}</div></div>}</section>;
        })}</div>
      </section>
      <section className="panel activity-panel">
        <div className="panel-heading"><div><p className="eyebrow">Adventurer's Log</p><h3>Group milestones</h3></div><a className="source-note source-link-inline" href="https://runescape.wiki/w/Application_programming_interface" target="_blank" rel="noreferrer">RuneMetrics API reference <ExternalLink size={12}/></a></div>
        <div className="activity-controls"><label><span>Showing activity for</span><select value={activityMember} onChange={event => setActivityMember(event.target.value)}><option value="all">All members ({activities.length})</option>{activityMembers.map(member => <option value={member.name} key={member.name}>{member.name} ({activities.filter(activity => activity.player === member.name).length})</option>)}</select></label><div className="activity-member-status">{activityMembers.map(member => <span className={member.available ? 'available' : 'unavailable'} key={member.name}><i/>{member.name}{!member.available && <small>{member.reason}</small>}</span>)}</div></div>
        {activityLoading ? <div className="small-empty"><RefreshCw className="spin" size={22}/><h3>Gathering group milestones</h3><p>Checking every member's public RuneMetrics activity log. Temporary failures are retried automatically.</p></div> : visibleActivities.length ? <div className="activity-feed">{visibleActivities.map((activity,index) => <article key={`${activity.player}-${activity.timestamp}-${index}`}><div className="activity-avatar">{activity.player.slice(0,2).toUpperCase()}</div><div className="activity-copy"><div><strong>{activity.text}</strong><span>{activity.player}</span></div><p>{activity.details}</p></div><time dateTime={new Date(activity.timestamp).toISOString()}>{activity.date}</time></article>)}</div> : <div className="small-empty"><Clock3 size={22}/><h3>No public milestones found</h3><p>{activityMember === 'all' ? 'Members must set their RuneMetrics profile and online status to public for activities to appear.' : `No recent public activities were returned for ${activityMember}.`}</p></div>}
      </section>
    </>}
  </div>;
}

function ConnectGroup({ goTo }: { goTo: (view: string) => void }) {
  return <div className="content feature-page"><section className="connect-card panel"><div className="journey-emblem"><Shield size={24} /></div><p className="eyebrow">First-time setup</p><h2>Connect your Group Ironman team</h2><p>Look up your official RuneScape group once. Ironpath will use that roster and its live totals throughout the entire app.</p><button className="primary-button" onClick={() => goTo('HiScores')}><Search size={15} /> Look up my group</button></section></div>;
}

const ironmanUnlocks = [
  { stage:'Early', name:'High Level Alchemy', requirement:'55 Magic · 44 Runecrafting recommended', value:'Turns salvage and spare drops into the coins needed for shops, instances, Summoning and kingdom upkeep.', link:'https://runescape.wiki/w/High_Level_Alchemy' },
  { stage:'Early', name:'Bonecrusher', requirement:'21 Dungeoneering · 34,000 tokens', value:'Automatically buries eligible bones, adding passive Prayer experience to combat and Slayer.', link:'https://runescape.wiki/w/Bonecrusher' },
  { stage:'Early', name:'War’s Retreat teleport', requirement:'10 total boss kills', value:'Provides a free, fast teleport to a bank, altar and boss portals—one of the best account-wide travel upgrades.', link:'https://runescape.wiki/w/War%27s_Retreat' },
  { stage:'Early', name:'Giant Oyster', requirement:'Beneath Cursed Tides', value:'Unlocks a useful monthly source of Fishing and Farming experience with a reward chest.', link:'https://runescape.wiki/w/Giant_Oyster' },
  { stage:'Mid', name:'Managing Miscellania', requirement:'Throne of Miscellania · Royal Trouble', value:'Converts daily coins into steady logs, herbs, seeds or fish—valuable supplies that are otherwise slow to gather.', link:'https://runescape.wiki/w/Managing_Miscellania' },
  { stage:'Mid', name:'Invention', requirement:'80 Crafting · Divination · Smithing', value:'Unlocks augmentation, equipment experience, useful machines and perks that transform both skilling and combat.', link:'https://runescape.wiki/w/Invention' },
  { stage:'Mid', name:'Ancient Curses', requirement:'The Temple at Senntisten', value:'Unlocks the Curse prayer book and establishes the foundation for higher-level combat and sustain.', link:'https://runescape.wiki/w/Ancient_Curses' },
  { stage:'Mid', name:'Prifddinas', requirement:'Plague’s End · level 75 requirements', value:'Opens the elf city’s training methods, shops, crystal equipment, convenient teleports and skilling services.', link:'https://runescape.wiki/w/Prifddinas' },
  { stage:'Mid', name:'Augmentable Sunspear', requirement:'River of Blood', value:'A reusable all-style weapon that works especially well for Vyres and early Invention equipment training.', link:'https://runescape.wiki/w/Sunspear_(melee)' },
  { stage:'Late', name:'City of Senntisten spells', requirement:'City of Senntisten', value:'Adds powerful Ancient Magicks options including Animate Dead, Smoke Cloud, Incite Fear and Exsanguinate.', link:'https://runescape.wiki/w/City_of_Senntisten' },
  { stage:'Late', name:'Extinction rewards', requirement:'Extinction', value:'Unlocks Dream of Iaia and major passive utility, including the passive Ring of Vigour effect.', link:'https://runescape.wiki/w/Extinction' },
  { stage:'Late', name:'Player-owned Ports', requirement:'90 in a supporting skill', value:'Provides long-term voyages for trade goods used in high-level armour, scrimshaws and other account upgrades.', link:'https://runescape.wiki/w/Player-owned_port' },
] as const;

const ironmanPrinciples = [
  ['Quest before grinding','Quest rewards skip slow early levels and unlock efficient travel, bosses, spellbooks and supply sources.'],
  ['Protect future supplies','Bank herbs, seeds, logs, gems, secondary ingredients and useful salvage. Today’s spare item is often tomorrow’s unlock requirement.'],
  ['Spend lamps deliberately','Herblore is commonly the best default because ingredients gate training. Change course when a specific unlock needs another slow skill.'],
  ['Build recurring income','Shop stocks, kingdom resources, Player-owned Farm and repeatable activities reduce the need for emergency gathering later.'],
  ['Share roles within the group','Group Ironmen can trade internally. Specialising early goals and sharing tools or rare drops can avoid duplicated grinds.'],
  ['Keep cash flowing','No Grand Exchange means alchemy, shops, Slayer drops and activity rewards matter more. Keep enough coins for upkeep and unlock costs.'],
] as const;

function IronmanGuideView({ shared, setShared }: { shared?:Record<string,boolean>; setShared:(value:Record<string,boolean>)=>void }) {
  const [stage, setStage] = useState<'All' | 'Early' | 'Mid' | 'Late'>('All');
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  useEffect(() => { if (shared) setUnlocked(shared); else try { setUnlocked(JSON.parse(window.localStorage.getItem('ironpath-unlocks') || '{}')); } catch { /* ignore */ } }, [shared]);
  function toggle(name: string) { setUnlocked(current => { const next = { ...current, [name]: !current[name] }; if (shared) setShared(next); else window.localStorage.setItem('ironpath-unlocks', JSON.stringify(next)); return next; }); }
  const visible = ironmanUnlocks.filter(item => stage === 'All' || item.stage === stage);
  const done = ironmanUnlocks.filter(item => unlocked[item.name]).length;
  return <div className="content feature-page ironman-page">
    <section className="feature-heading"><div><p className="date-line">SELF-SUFFICIENT PROGRESSION</p><h2>Ironman Guide</h2><p>High-value unlocks, resource habits and practical priorities for RuneScape 3 Ironmen and groups.</p></div><div className="status-chip"><Check size={15}/>{done} of {ironmanUnlocks.length} unlocks</div></section>
    <section className="ironman-basics panel"><div><p className="eyebrow">The core rule</p><h3>Source it yourself. Share it with your group.</h3><p>Ironmen cannot rely on the Grand Exchange or unrestricted outside trading. Group Ironmen can share items within their team, making coordination one of the mode’s strongest advantages.</p></div><Shield size={42}/></section>
    <div className="unlock-toolbar"><div className="period-tabs">{(['All','Early','Mid','Late'] as const).map(value => <button key={value} className={stage === value ? 'active' : ''} onClick={() => setStage(value)}><span>{value}</span><strong>{value === 'All' ? ironmanUnlocks.length : ironmanUnlocks.filter(item => item.stage === value).length}</strong></button>)}</div></div>
    <section className="unlock-grid">{visible.map(item => <article className={unlocked[item.name] ? 'panel unlock-card done' : 'panel unlock-card'} key={item.name}><div className="unlock-card-head"><button className="route-check" onClick={() => toggle(item.name)} aria-label={`Mark ${item.name} ${unlocked[item.name] ? 'locked' : 'unlocked'}`}>{unlocked[item.name] && <Check size={15}/>}</button><span className={`stage-badge ${item.stage.toLowerCase()}`}>{item.stage}</span><a href={item.link} target="_blank" rel="noreferrer" aria-label={`Open ${item.name} on the RuneScape Wiki`}><ExternalLink size={15}/></a></div><h3>{item.name}</h3><strong>{item.requirement}</strong><p>{item.value}</p></article>)}</section>
    <section className="panel principles-panel"><div className="panel-heading"><div><p className="eyebrow">Mode-specific advice</p><h3>Habits that compound over time</h3></div></div><div className="principle-grid">{ironmanPrinciples.map(([title, detail],index) => <article key={title}><span>{String(index + 1).padStart(2,'0')}</span><div><strong>{title}</strong><p>{detail}</p></div></article>)}</div></section>
    <p className="guide-credit"><BookOpen size={14}/> Guidance is summarized from the <a href="https://runescape.wiki/w/Ironman_Mode/Strategies" target="_blank" rel="noreferrer">RuneScape Wiki Ironman strategies</a> and <a href="https://runescape.wiki/w/Guide_to_useful_items_and_unlocks" target="_blank" rel="noreferrer">useful unlocks guide</a>.</p>
  </div>;
}

function EfficientProgressView({ groupData, shared, setShared }: { groupData: HiscoreResult | null; shared?:Record<string,boolean>; setShared:(value:Record<string,boolean>)=>void }) {
  const [view, setView] = useState<'Roadmap' | 'Training'>('Roadmap');
  const [sectionId, setSectionId] = useState(progressData.progression[0].id);
  const [skill, setSkill] = useState('agility');
  const [member, setMember] = useState(groupData?.players[0]?.name || '');
  const [query, setQuery] = useState('');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  useEffect(() => { if (shared) setCompleted(shared); else try { setCompleted(JSON.parse(window.localStorage.getItem('ironpath-efficient-progress') || '{}')); } catch { /* ignore */ } }, [shared]);
  const allRows = progressData.progression.flatMap(section => section.rows);
  const completedCount = allRows.filter(row => completed[row.id]).length;
  const activeSection = progressData.progression.find(section => section.id === sectionId) || progressData.progression[0];
  const visibleRows = activeSection.rows.filter(row => `${row.title} ${'notes' in row ? row.notes || '' : ''}`.toLowerCase().includes(query.toLowerCase()));
  const skills = Object.keys(progressData.training).sort();
  const selectedPlayer = groupData?.players.find(player => player.name === member);
  const currentLevel = selectedPlayer?.skills.find(value => value.name.toLowerCase() === skill)?.level;
  const methods = progressData.training[skill as keyof typeof progressData.training];
  function toggle(id: string) { setCompleted(current => { const next = { ...current, [id]: !current[id] }; if (shared) setShared(next); else window.localStorage.setItem('ironpath-efficient-progress', JSON.stringify(next)); return next; }); }
  return <div className="content feature-page efficient-page">
    <section className="feature-heading">
      <div><p className="date-line">IRONMAN PROGRESSION</p><h2>Efficient Progress</h2><p>Follow the ordered Ironman pathway or find the best training method for your current levels.</p></div>
      <a className="source-link" href={progressData.source.wiki} target="_blank" rel="noreferrer">View Wiki source <ExternalLink size={13}/></a>
    </section>
    <section className="efficient-overview">
      <div className="panel progress-card"><div className="ring" style={{ '--value': `${(completedCount / allRows.length) * 360}deg` } as React.CSSProperties}><span>{Math.round((completedCount / allRows.length) * 100)}%</span></div><div><p className="eyebrow">Local checklist</p><h3>{completedCount} of {allRows.length} complete</h3><p>Your progress is saved on this device.</p></div></div>
      <div className="guide-tabs"><button className={view === 'Roadmap' ? 'active' : ''} onClick={() => setView('Roadmap')}><ListChecks size={16}/><span>Progression roadmap</span></button><button className={view === 'Training' ? 'active' : ''} onClick={() => setView('Training')}><Dumbbell size={16}/><span>Skill training</span></button></div>
    </section>
    {view === 'Roadmap' ? <div className="roadmap-layout">
      <aside className="phase-list panel"><p className="eyebrow">Route phases</p>{progressData.progression.map(section => { const done = section.rows.filter(row => completed[row.id]).length; return <button key={section.id} className={section.id === activeSection.id ? 'active' : ''} onClick={() => setSectionId(section.id)}><span><strong>{section.title}</strong><small>{section.rows.length} steps</small></span><em>{done}/{section.rows.length}</em></button>; })}</aside>
      <section className="panel route-panel"><div className="route-toolbar"><div><p className="eyebrow">Current phase</p><h3>{activeSection.title}</h3></div><label className="route-search"><Search size={14}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filter this phase" /></label></div>
        <div className="route-list">{visibleRows.map((row, index) => <article className={completed[row.id] ? 'route-row done' : 'route-row'} key={row.id}><button className="route-check" onClick={() => toggle(row.id)} aria-label={`Mark ${row.title} ${completed[row.id] ? 'incomplete' : 'complete'}`}>{completed[row.id] && <Check size={14}/>}</button><span className="route-number">{String(index + 1).padStart(2, '0')}</span><div><strong>{row.title}</strong>{'notes' in row && row.notes && <p>{row.notes}</p>}</div><span className="route-type">{row.type}</span>{row.type === 'quest' && 'questName' in row && row.questName ? <a href={`https://runescape.wiki/w/${encodeURIComponent(row.questName.replaceAll(' ', '_'))}/Quick_guide`} target="_blank" rel="noreferrer" aria-label={`Open ${row.title} quick guide`}><ExternalLink size={14}/></a> : <span/>}</article>)}</div>
      </section>
    </div> : <section className="training-layout">
      <div className="panel training-controls"><div><p className="eyebrow">Training lookup</p><h3>Choose a skill</h3></div><label className="field"><span>Skill</span><select value={skill} onChange={event => setSkill(event.target.value)}>{skills.map(value => <option value={value} key={value}>{titleCase(value)}</option>)}</select></label>{groupData && <label className="field"><span>Use member level</span><select value={member} onChange={event => setMember(event.target.value)}>{groupData.players.map(player => <option key={player.name}>{player.name}</option>)}</select></label>}<div className="level-chip"><span>Current level</span><strong>{currentLevel ?? '—'}</strong></div></div>
      <div className="method-grid">{methods.map((method, index) => { const current = currentLevel !== undefined && currentLevel >= method.start && currentLevel <= method.end; return <article className={current ? 'panel method-card current' : 'panel method-card'} key={`${skill}-${method.start}-${method.end}-${index}`}><div><span className="level-range">Levels {method.start}–{method.end}</span>{current && <span className="current-tag">Current</span>}</div><p>{method.desc}</p>{method.link && <a href={method.link} target="_blank" rel="noreferrer">RuneScape Wiki <ExternalLink size={12}/></a>}</article>; })}</div>
    </section>}
    <p className="guide-credit"><BookOpen size={14}/> Progression and training data adapted from the <a href={progressData.source.wiki} target="_blank" rel="noreferrer">RuneScape Wiki source</a>. Guide data retrieved {progressData.source.retrieved}.</p>
  </div>;
}

const journeyTiers = [
  ['Tier 0','Unlock Group Storage with 30 spaces','Collect group armour, reach the opening total-level target, and complete Cook’s Assistant as a team.'],
  ['Tier 1','Add 20 Group Storage spaces','Build early quest points and complete the opening Misthalin journey requirements.'],
  ['Tier 2','Early team progression','Advance the group’s combined skills, quests and introductory combat achievements.'],
  ['Tier 3','Develop shared specialisms','Complete the next set of skilling, questing and combat milestones as a team.'],
  ['Tier 4','Add 20 Group Storage spaces','Reach the fourth journey achievement tier and expand shared capacity.'],
  ['Tier 5','Mid-game foundation','Progress the group into established quest lines, bosses and higher skill thresholds.'],
  ['Tier 6','Broaden account access','Complete more advanced group achievements and area unlock requirements.'],
  ['Tier 7','Advanced team goals','Coordinate late-mid-game quests, skills and combat achievements.'],
  ['Tier 8','Add 20 Group Storage spaces','Complete the eighth tier and unlock another major storage expansion.'],
  ['Tier 9','End-game preparation','Push the group’s high-level skilling, quest and boss requirements.'],
  ['Tier 10','Add final 10 Storage spaces','Complete the final Journey tier and finish the evolving group armour progression.'],
] as const;
const shopRuns = [
  ['Runes','Zaff, Aubury, Void Knight and rune shops','Magic, alchemy and vis wax supplies'],
  ['Herblore supplies','Taverley, Prifddinas and Granny Rowan','Vials, bomb vials and useful secondaries'],
  ['Slayer stock','Every Slayer master, including Burthorpe stock','Broad arrowheads, insulated boots and gem packs'],
  ['Invention disassembly','White Knight Armoury, Betty, Lowe and Ali Morrisane','Cheap common and uncommon components'],
  ['Summoning','Taverley and Amlodd','Spirit shards and pouch ingredients'],
  ['Construction','Sawmill, Fort Forinthry and Prifddinas','Planks, limestone and bolts of cloth'],
] as const;
const pvmMilestones = [
  ['War’s Retreat teleport','10 total boss kills'],['Altar of War','200 boss kills'],['Adrenaline crystal','1,000 boss kills'],['Reaper points for hydrix','Complete regular Soul Reaper assignments'],['Entry-level GWD1 gear','Target useful power armour and components'],['Necromancy T70–T90 tasks','Complete Kili upgrade paths'],['Invention-ready combat set','Augment weapon, body and legs'],['Overloads','Reach or boost to 96 Herblore'],['Curses and prayer sustain','Temple at Senntisten plus a Prayer training plan'],['Group boss roles','Assign damage, support and supply responsibilities'],
] as const;
const estateTasks = [
  ['Player-owned Farm','Set breeding pairs and bean targets'],['Herb runs','Choose priority herbs and seed sources'],['Secondary ingredients','Track white berries, potato cactus, limpwurt and fungi'],['Kingdom approval','Keep approval near 100%'],['Kingdom treasury','Maintain sufficient coins for collection cycles'],['Kingdom allocation','Choose herbs, hardwood, maples or fish'],['Player-owned Ports','Send voyages and prioritise story progress'],['Trade goods','Track bones, spices, chi, lacquer and plate'],['Water filtration','Claim passive Fort Forinthry rewards'],
] as const;
const inventionSources = [
  ['Precise','Broad arrows, bows and ranged-shop equipment','Weapon and tool perks'],['Precious','Slayer rings','Scavenging and equipment siphons'],['Powerful','Insulated boots, battlestaves and terrorbird pouches','Augmentors and useful devices'],['Simple','Maple or acadia logs, divine energy products','Divine charges and devices'],['Dextrous','Shortbows, claws and ranged armour','Equipment siphons and rod-o-matics'],['Enhancing','Slayer rings','Augmentors'],['Protective','White Knight armour, smithed armour and dragonhide','Armour gizmos'],['Historic','Venator artefacts and archaeology materials','Ancient gizmos and early ancient perks'],['Vintage','Completed high-level archaeology artefacts','Crackling, Relentless and Fortune combinations'],['Fortunate','Clue-scroll fortunate items','Alchemical onyx and hydrix products'],
] as const;

function GroupHubView({ groupData, workspace, setWorkspace, updateWorkspace }: { groupData:HiscoreResult|null; workspace:Workspace|null; setWorkspace:(value:Workspace|null)=>void; updateWorkspace:<K extends keyof WorkspaceData>(key:K,value:WorkspaceData[K])=>void }) {
  const [tab,setTab] = useState<'Overview'|'Journey'|'Supplies'|'Shops'|'Invention'|'PvM'|'Estate'>('Overview');
  const [name,setName] = useState(groupData?.group || ''); const [code,setCode] = useState(''); const [error,setError] = useState(''); const [loading,setLoading] = useState(false);
  const [supplyName,setSupplyName] = useState(''); const [quantity,setQuantity] = useState(''); const [owner,setOwner] = useState(''); const [purpose,setPurpose] = useState(''); const [componentQuery,setComponentQuery] = useState('');
  async function createWorkspace() { setLoading(true);setError(''); try { const response=await fetch('/api/workspace',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:name||groupData?.group||'My Ironman Group'})}); const value=await response.json(); if(!response.ok) throw new Error(value.error); const next={...value,data:{...emptyWorkspaceData,...value.data}}; setWorkspace(next); window.localStorage.setItem('ironpath-workspace',JSON.stringify({id:next.id,token:next.token})); } catch(reason){setError(reason instanceof Error?reason.message:'Unable to create workspace.');} finally{setLoading(false);} }
  async function joinWorkspace() { const [id,token]=code.trim().split('.'); if(!id||!token){setError('Paste the complete workspace key.');return;} setLoading(true);setError(''); try { const response=await fetch('/api/workspace',{headers:{'x-ironpath-workspace':id,'x-ironpath-token':token}}); const value=await response.json(); if(!response.ok) throw new Error(value.error); const next={...value,token,data:{...emptyWorkspaceData,...value.data}};setWorkspace(next);window.localStorage.setItem('ironpath-workspace',JSON.stringify({id,token}));}catch(reason){setError(reason instanceof Error?reason.message:'Unable to join workspace.');}finally{setLoading(false);} }
  if(!workspace) return <div className="content feature-page"><section className="feature-heading"><div><p className="date-line">SHARED TEAM DATA</p><h2>Group Hub</h2><p>Create one workspace for your team or join using a key shared by another member.</p></div></section><div className="workspace-connect-grid"><section className="panel hub-connect"><Users size={30}/><h3>Create a group workspace</h3><p>This stores Journey, supplies, shops, PvM and estate progress online for the whole team.</p><label className="field"><span>Workspace name</span><input value={name} onChange={event=>setName(event.target.value)} placeholder="Your group name"/></label><button className="primary-button" onClick={createWorkspace} disabled={loading}>Create workspace</button></section><section className="panel hub-connect"><Boxes size={30}/><h3>Join an existing workspace</h3><p>Ask a group member for the workspace key, then paste it below.</p><label className="field"><span>Workspace key</span><input value={code} onChange={event=>setCode(event.target.value)} placeholder="workspace.token"/></label><button className="secondary-button" onClick={joinWorkspace} disabled={loading}>Join workspace</button></section></div>{error&&<div className="error-banner">{error}</div>}</div>;
  const data=workspace.data; const journeyDone=Object.values(data.journey).filter(Boolean).length; const shopDone=Object.values(data.shops).filter(Boolean).length; const pvmDone=Object.values(data.pvm).filter(Boolean).length;
  const highest=(skill:string)=>Math.max(0,...(groupData?.players.flatMap(player=>player.skills.filter(value=>value.name.toLowerCase()===skill.toLowerCase()).map(value=>value.level))||[]));
  const nextUnlocks=[['Invention',Math.min(highest('Crafting'),highest('Divination'),highest('Smithing')),80],['Overloads',highest('Herblore'),96],['Player-owned Ports',Math.max(...['Agility','Construction','Cooking','Divination','Dungeoneering','Fishing','Herblore','Hunter','Prayer','Runecrafting','Slayer','Thieving'].map(highest)),90]].sort((a,b)=>(a[2] as number-a[1] as number)-(b[2] as number-b[1] as number));
  function toggleRecord(key:'journey'|'shops'|'pvm'|'farming',id:string){updateWorkspace(key,{...data[key],[id]:!data[key][id]});}
  function addSupply(event:FormEvent){event.preventDefault();if(!supplyName.trim())return;updateWorkspace('supplies',[...data.supplies,{id:crypto.randomUUID(),name:supplyName.trim(),detail:purpose.trim(),owner:owner.trim()||'Unassigned',quantity:quantity.trim()||'—',done:false}]);setSupplyName('');setQuantity('');setOwner('');setPurpose('');}
  const shareCode=`${workspace.id}.${workspace.token}`;
  return <div className="content feature-page group-hub"><section className="feature-heading"><div><p className="date-line">SHARED TEAM DATA</p><h2>{workspace.name}</h2><p>One synchronized operations board for your Group Ironman team.</p></div><div className="hub-share"><button className="secondary-button" onClick={()=>navigator.clipboard.writeText(shareCode)}>Copy workspace key</button><button className="text-button" onClick={()=>{localStorage.removeItem('ironpath-workspace');setWorkspace(null)}}>Leave</button></div></section><div className="hub-tabs">{(['Overview','Journey','Supplies','Shops','Invention','PvM','Estate'] as const).map(value=><button key={value} className={tab===value?'active':''} onClick={()=>setTab(value)}>{value}</button>)}</div>
    {tab==='Overview'&&<><section className="hub-stat-grid"><article className="panel"><span>Journey tiers</span><strong>{journeyDone}/{journeyTiers.length}</strong></article><article className="panel"><span>Supply requests</span><strong>{data.supplies.filter(item=>!item.done).length}</strong></article><article className="panel"><span>Shop run</span><strong>{shopDone}/{shopRuns.length}</strong></article><article className="panel"><span>PvM milestones</span><strong>{pvmDone}/{pvmMilestones.length}</strong></article></section><section className="panel next-unlocks"><div className="panel-heading"><div><p className="eyebrow">Based on group HiScores</p><h3>Closest major unlocks</h3></div></div>{groupData?nextUnlocks.map(([unlock,current,target])=><article key={String(unlock)}><div><strong>{unlock}</strong><span>Best qualifying level {current} / {target}</span></div><div className="progress-track"><span style={{width:`${Math.min(100,(Number(current)/Number(target))*100)}%`}}/></div></article>):<p className="hub-note">Look up your group in HiScores to calculate level-based recommendations.</p>}</section></>}
    {tab==='Journey'&&<section className="panel hub-list-panel"><div className="panel-heading"><div><p className="eyebrow">Official GIM progression</p><h3>Journey tiers</h3></div><a className="source-link" href="https://runescape.wiki/w/Group_Ironman_Mode/Strategies#Journey_tiers" target="_blank" rel="noreferrer">Requirements source <ExternalLink size={13}/></a></div>{journeyTiers.map(([tier,reward,detail])=><article className={data.journey[tier]?'hub-check-row done':'hub-check-row'} key={tier}><button className="route-check" onClick={()=>toggleRecord('journey',tier)}>{data.journey[tier]&&<Check size={14}/>}</button><div><strong>{tier} · {reward}</strong><p>{detail}</p></div></article>)}</section>}
    {tab==='Supplies'&&<><form className="panel supply-form" onSubmit={addSupply}><label className="field"><span>Item or resource</span><input value={supplyName} onChange={e=>setSupplyName(e.target.value)} placeholder="Pure essence"/></label><label className="field"><span>Quantity</span><input value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="2,000"/></label><label className="field"><span>Owner</span><select value={owner} onChange={e=>setOwner(e.target.value)}><option value="">Unassigned</option>{groupData?.players.map(player=><option key={player.name}>{player.name}</option>)}</select></label><label className="field"><span>Purpose</span><input value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="Necrotic runes"/></label><button className="primary-button"><Plus size={16}/>Add</button></form><section className="panel hub-list-panel">{data.supplies.length?data.supplies.map(item=><article className={item.done?'supply-row done':'supply-row'} key={item.id}><button className="route-check" onClick={()=>updateWorkspace('supplies',data.supplies.map(value=>value.id===item.id?{...value,done:!value.done}:value))}>{item.done&&<Check size={14}/>}</button><div><strong>{item.name}</strong><p>{item.detail||'No purpose noted'}</p></div><span>{item.quantity}</span><span>{item.owner}</span><button className="delete-button" onClick={()=>updateWorkspace('supplies',data.supplies.filter(value=>value.id!==item.id))}><Trash2 size={15}/></button></article>):<div className="small-empty"><Boxes size={26}/><h3>No supply requests</h3><p>Add the first resource your group needs.</p></div>}</section></>}
    {tab==='Shops'&&<section className="panel hub-list-panel"><div className="panel-heading"><div><p className="eyebrow">Ironman stock planner</p><h3>Shop run</h3></div></div>{shopRuns.map(([name,locations,use])=><article className={data.shops[name]?'hub-check-row done':'hub-check-row'} key={name}><button className="route-check" onClick={()=>toggleRecord('shops',name)}>{data.shops[name]&&<Check size={14}/>}</button><div><strong>{name}</strong><p>{locations} · {use}</p></div></article>)}</section>}
    {tab==='Invention'&&<section><div className="panel invention-search"><div><p className="eyebrow">Ironman component lookup</p><h3>What should I disassemble?</h3></div><label className="route-search"><Search size={15}/><input value={componentQuery} onChange={e=>setComponentQuery(e.target.value)} placeholder="Search components or uses"/></label></div><div className="method-grid">{inventionSources.filter(row=>row.join(' ').toLowerCase().includes(componentQuery.toLowerCase())).map(([component,sources,use])=><article className="panel method-card" key={component}><span className="level-range">{component} components</span><p>{sources}</p><strong>{use}</strong></article>)}</div></section>}
    {tab==='PvM'&&<section className="panel hub-list-panel"><div className="panel-heading"><div><p className="eyebrow">Combat readiness</p><h3>PvM progression</h3></div></div>{pvmMilestones.map(([name,detail])=><article className={data.pvm[name]?'hub-check-row done':'hub-check-row'} key={name}><button className="route-check" onClick={()=>toggleRecord('pvm',name)}>{data.pvm[name]&&<Check size={14}/>}</button><div><strong>{name}</strong><p>{detail}</p></div></article>)}</section>}
    {tab==='Estate'&&<><section className="estate-summary"><article className="panel"><Leaf size={22}/><span>Farm and Herblore</span><strong>{estateTasks.slice(0,3).filter(([name])=>data.farming[name]).length}/3</strong></article><article className="panel"><Coins size={22}/><span>Kingdom and passive resources</span><strong>{estateTasks.slice(3).filter(([name])=>data.farming[name]).length}/{estateTasks.length-3}</strong></article></section><section className="panel hub-list-panel">{estateTasks.map(([name,detail])=><article className={data.farming[name]?'hub-check-row done':'hub-check-row'} key={name}><button className="route-check" onClick={()=>toggleRecord('farming',name)}>{data.farming[name]&&<Check size={14}/>}</button><div><strong>{name}</strong><p>{detail}</p></div></article>)}</section></>}
  </div>;
}

function RepeatablesView({ shared, setShared }: { shared?:Record<string,boolean>; setShared:(value:Record<string,boolean>)=>void }) {
  const [period, setPeriod] = useState<keyof typeof repeatables>('Daily');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  useEffect(() => { if (shared) setCompleted(shared); else try { setCompleted(JSON.parse(window.localStorage.getItem('ironpath-repeatables') || '{}')); } catch { /* ignore */ } }, [shared]);
  function persist(next:Record<string,boolean>) { setCompleted(next); if (shared) setShared(next); else window.localStorage.setItem('ironpath-repeatables',JSON.stringify(next)); }
  function toggle(name: string) { persist({ ...completed, [name]:!completed[name] }); }
  const list = repeatables[period];
  const done = list.filter(([name]) => completed[name]).length;

  return <div className="content feature-page">
    <section className="feature-heading">
      <div><p className="date-line">ROUTINE PLANNER</p><h2>Repeatables</h2><p>Keep your daily, weekly, and monthly Ironman routines visible without letting them run your game.</p></div>
      <div className="reset-card"><Clock3 size={16} /><div><span>Next {period.toLowerCase()} reset</span><strong>{resetLabel(period)}</strong></div></div>
    </section>
    <section className="repeatable-overview">
      <div className="panel repeatable-progress"><div className="ring" style={{ '--value': `${(done / list.length) * 360}deg` } as React.CSSProperties}><span>{done}/{list.length}</span></div><div><p className="eyebrow">Current cycle</p><h3>{period} checklist</h3><p>{list.length - done} activities remaining</p></div></div>
      <div className="repeatable-period-tabs" aria-label="Repeatable period">{(['Daily','Weekly','Monthly'] as const).map(tab => {
        const complete = repeatables[tab].filter(([name]) => completed[name]).length;
        const total = repeatables[tab].length;
        return <button key={tab} onClick={() => setPeriod(tab)} className={period === tab ? 'active' : ''} aria-pressed={period === tab}>
          <span className="period-copy"><strong>{tab}</strong><small>{complete === total ? 'Complete' : `${total - complete} remaining`}</small></span>
          <span className="period-count"><strong>{complete}</strong><em>/ {total}</em></span>
          <span className="period-meter" aria-hidden="true"><i style={{width:`${(complete/total)*100}%`}}/></span>
        </button>;
      })}</div>
    </section>
    <section className="panel repeatable-list-panel">
      <div className="panel-heading"><div><p className="eyebrow">{period} activities</p><h3>Ironman checklist</h3></div><button className="text-button" onClick={() => { const next = { ...completed }; list.forEach(([name]) => delete next[name]); persist(next); }}>Clear cycle</button></div>
      <div className="repeatable-list">{list.map(([name, description, tag]) => <button className={completed[name] ? 'repeatable-row done' : 'repeatable-row'} key={name} onClick={() => toggle(name)}><span className="repeat-check">{completed[name] && <Check size={14} />}</span><span className="repeat-copy"><strong>{name}</strong><small>{description}</small></span><span className="repeat-tag">{tag}</span><ChevronRight size={15} /></button>)}</div>
    </section>
    <p className="update-note"><Sparkles size={14} /> Updated for the March 2026 DailyScape overhaul. Removed and uncapped former dailies are intentionally excluded.</p>
  </div>;
}

function compactNumber(value: number) { return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(value); }
function titleCase(value: string) { return value.replace(/\b\w/g, letter => letter.toUpperCase()); }
function resetLabel(period: keyof typeof repeatables) {
  const now = new Date(); const next = new Date(now);
  if (period === 'Daily') next.setUTCDate(next.getUTCDate() + 1), next.setUTCHours(0,0,0,0);
  else if (period === 'Weekly') { const days = (10 - next.getUTCDay()) % 7 || 7; next.setUTCDate(next.getUTCDate() + days); next.setUTCHours(0,0,0,0); }
  else next.setUTCMonth(next.getUTCMonth() + 1, 1), next.setUTCHours(0,0,0,0);
  const hours = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 3600000));
  return hours > 48 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${Math.floor(((next.getTime() - now.getTime()) % 3600000) / 60000)}m`;
}
