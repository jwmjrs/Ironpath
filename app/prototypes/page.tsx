'use client';

import BrandLogo from '../brand-logo';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, ChevronRight, Crosshair, Gem, Shield, Skull, Sparkles, Swords, TrendingUp } from 'lucide-react';
import ReferenceImage from '../reference-image';
import artwork from '../data/prototype-images.json';
import drops from '../data/drop-item-images.json';
import './prototypes.css';
import BossStrategies from './boss-strategies';
import bossDirectory from '../data/rs3-bosses.json';
const wiki = (name: string) => `https://runescape.wiki/w/${encodeURIComponent(name.replaceAll(' ', '_'))}`;
const images = artwork as Record<string, { src: string }>;
const dropImages = drops as Record<string, { src: string }>;
function ItemImage({ name, large = false }: { name: string; large?: boolean }) { return <ReferenceImage src={images[name]?.src || dropImages[name.toLowerCase()]?.src} title={name} alt={name} className={large ? 'proto-portrait' : 'proto-item-image'} fallback={<Gem size={large ? 64 : 24} />} />; }
const bosses = [
  { name: "K'ril Tsutsaroth", subtitle: 'God Wars Dungeon · Zamorak', rewards: ['Hood of subjugation','Garb of subjugation','Gown of subjugation','Gloves of subjugation','Boots of subjugation','Ward of subjugation','Zamorakian spear','Steam battlestaff','Zamorak hilt','Severed hoof'], note: 'Earn Subjugation equipment for Magic, or reserve pieces for your Necromancy crafting plans.' },
  { name: 'King Black Dragon', subtitle: 'Wilderness entrance · private lair', rewards: ['Draconic visage','Dragon 2-handed sword','King Black Dragon head','King Black Dragon scale'], note: 'A place to begin recording kills, personal milestones, and notable finds.' },
  { name: 'Queen Black Dragon', subtitle: 'Grotworm Lair · solo encounter', rewards: ['Royal frame','Royal sight','Royal torsion spring','Royal bolt stabiliser','Draconic visage'], note: 'Gather the Royal crossbow components for a self-earned Ranged upgrade.' },
];
type Activity = { player: string; date: string; text: string; details: string };
type Evidence = Activity & { key: string; boss: string; count: number };
function BossJournal() {
  const [bossIndex, setBossIndex] = useState(0), [account, setAccount] = useState('Justjay btw');
  const [customBoss,setCustomBoss]=useState<(typeof bosses)[number]|null>(null);
  const [bossView,setBossView]=useState('Strategies');
  const [bossFilter, setBossFilter] = useState(''), [bossCategory, setBossCategory] = useState('All bosses');
  const categories = ['All bosses', ...new Set(bossDirectory.bosses.map(entry => entry.category))];
  const normalize = (value: string) => value.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9]/g, '');
  const visibleBosses = bossDirectory.bosses.filter(entry => (bossCategory === 'All bosses' || entry.category === bossCategory) && normalize(`${entry.name} ${entry.location}`).includes(normalize(bossFilter)));
  function chooseBoss(entry: (typeof bossDirectory.bosses)[number]) {
    const index = bosses.findIndex(candidate => candidate.name === entry.name);
    if (index >= 0) { setBossIndex(index); setCustomBoss(null); }
    else setCustomBoss({ name: entry.name, subtitle: `${entry.category} · ${entry.location}`, rewards: [], note: 'Explore this boss’s mechanics, equipment recommendations, and strategy from a cached Wiki guide, where a dedicated guide is available.' });
    setBossView('Strategies');
  }
  const [example, setExample] = useState(true), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const [review, setReview] = useState<Evidence[]>([]), [journal, setJournal] = useState<Evidence[]>([]);
  const [collection, setCollection] = useState<Record<string, boolean | null>>({ 'Hood of subjugation': true, 'Gown of subjugation': true, 'Ward of subjugation': true });
  const [kills, setKills] = useState<Record<string,string>>({ "K'ril Tsutsaroth": '312' }), [best, setBest] = useState<Record<string,string>>({ "K'ril Tsutsaroth": '02:14' });
  const [notes, setNotes] = useState<Record<string,string>>({});
  const boss = customBoss || bosses[bossIndex], found = boss.rewards.filter(name => collection[name] === true).length;
  const events = journal.filter(event => event.boss === boss.name);
  async function importActivity() {
    const player = account.trim();
    if (!player || player.length > 20) { setMessage('Enter a RuneScape name, up to 20 characters.'); return; }
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`/api/activities?player=${encodeURIComponent(player)}`);
      if (!response.ok) throw new Error('The public activity feed could not be loaded.');
      const data = await response.json() as { activities: Activity[]; members: { available: boolean; reason?: string }[] };
      if (!data.members[0]?.available) throw new Error(data.members[0]?.reason || 'The RuneMetrics profile is unavailable.');
      const matches = data.activities.flatMap(activity => {
        const matched = bosses.find(candidate => activity.text.toLowerCase().includes(candidate.name.toLowerCase()));
        if (!matched || !/\bkilled\b/i.test(activity.text)) return [];
        const count = Number(activity.text.match(/killed\s+(\d+)/i)?.[1] || 1);
        return [{ ...activity, boss: matched.name, count, key: `${player.toLowerCase()}:${activity.date}:${activity.text}:${activity.details}` }];
      });
      if (example) { setCollection({}); setKills({}); setBest({}); setExample(false); setJournal([]); }
      setReview(matches.filter(event => !journal.some(existing => existing.key === event.key)));
      setMessage(matches.length ? `${matches.length} recent boss events found for ${player}. Review them below.` : 'No matching boss events in the latest public activities. This does not mean you have no boss kills.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Import unavailable.'); }
    finally { setBusy(false); }
  }
  function accept() {
    setJournal(current => [...current, ...review.filter(event => !current.some(existing => existing.key === event.key))]);
    if (review.length) setBossIndex(bosses.findIndex(candidate => candidate.name === review[0].boss));
    setReview([]); setMessage('Events added to this preview journal. Lifetime kills and collection slots still need confirmation.');
  }
  return <>
    <div className="proto-heading"><div><p className="proto-kicker">YOUR HUNTS, YOUR STORY</p><h1>Boss journal <span>& collection log</span></h1><p>A visual record of the fights, the finds, and the next item worth chasing.</p></div><span className="proto-badge">{example ? 'Example account' : 'Public activity + your preview entries'}</span></div>
    <div className="proto-boss-layout"><aside className="proto-panel proto-boss-list" aria-label="Boss directory">
      <div className="proto-directory-heading"><h2>Bosses</h2><span>{bossDirectory.bosses.length}</span></div>
      <div className="proto-directory-filters"><label htmlFor="boss-directory-filter">Search bosses<input id="boss-directory-filter" type="search" placeholder="Name or dungeon…" value={bossFilter} onChange={event=>setBossFilter(event.target.value)}/></label><label htmlFor="boss-directory-category">Category<select id="boss-directory-category" value={bossCategory} onChange={event=>setBossCategory(event.target.value)}>{categories.map(category=><option key={category}>{category}</option>)}</select></label></div>
      <p className="proto-directory-count" role="status">{visibleBosses.length} {visibleBosses.length===1?'entry':'entries'} · A–Z</p>
      <nav className="proto-directory-entries" aria-label="Bosses">{visibleBosses.map(candidate=><button key={candidate.name} aria-pressed={boss.name===candidate.name} className={boss.name===candidate.name?'selected':''} onClick={()=>chooseBoss(candidate)}>{images[candidate.name]?<ItemImage name={candidate.name}/>:<Skull className="proto-directory-icon" size={22} aria-hidden="true"/>}<span><strong>{candidate.name}</strong><small>{candidate.category}</small></span><ChevronRight size={14} aria-hidden="true"/></button>)}{!visibleBosses.length&&<p className="proto-muted">No bosses match. Try another name or category.</p>}</nav>
      <div className="proto-directory-footer"><a href={bossDirectory.source} target="_blank" rel="noreferrer">RuneScape Wiki directory <ArrowUpRight size={12}/></a><p>Includes quest, Dungeoneering, and historical encounters. Collection slots currently cover three preview journals.</p></div>
    </aside>
    <div className="proto-stack"><section className="proto-panel proto-boss-hero"><div><p className="proto-kicker">{boss.subtitle}</p><h2>{boss.name}</h2><p>{boss.note}</p><a href={wiki(boss.name)} target="_blank" rel="noreferrer">Boss reference <ArrowUpRight size={14}/></a></div><ItemImage name={boss.name} large/></section>
    <nav className="proto-boss-view-tabs" aria-label="Boss details">{["Strategies","Collection log","Journal"].map(view=><button key={view} className={bossView===view?"selected":""} onClick={()=>setBossView(view)}>{view}</button>)}</nav>
    {bossView==="Strategies"&&<BossStrategies name={boss.name}/>}
    {bossView==="Collection log"&&<><div className="proto-metrics"><div><span>Confirmed featured rewards</span><strong>{found}<small> / {boss.rewards.length}</small></strong></div><label><span>Lifetime kills · manual</span><input type="number" min="0" value={kills[boss.name]||''} placeholder="Unconfirmed" onChange={e=>setKills({...kills,[boss.name]:e.target.value})}/></label><label><span>Best time · manual</span><input value={best[boss.name]||''} placeholder="mm:ss" pattern="[0-9]+:[0-5][0-9]" onChange={e=>setBest({...best,[boss.name]:e.target.value})}/></label></div>
    <section className="proto-panel"><div className="proto-section-title"><div><p className="proto-kicker">THE REWARD WALL</p><h2>Every slot has a story.</h2></div><small>Tap a slot to confirm it</small></div><div className="proto-collection">{!boss.rewards.length&&<p className="proto-muted">Collection slots for this boss are not in the prototype catalogue yet. Its strategy guide is available in the Strategies tab.</p>}{boss.rewards.map(name=><button key={name} className={collection[name]===true?'owned':collection[name]===false?'missing':'unconfirmed'} onClick={()=>setCollection({...collection,[name]:collection[name]===true?false:collection[name]===false?null:true})} aria-label={`${name}: ${collection[name]===true?'obtained':collection[name]===false?'not obtained':'unconfirmed'}; change status`}><ItemImage name={name}/><strong>{name}</strong><span>{collection[name]===true?<><Check size={12}/> Obtained</>:collection[name]===false?'Not obtained':'Unconfirmed'}</span></button>)}</div><p className="proto-muted">Collection ownership is personal. A group member’s drop does not complete your own collection slot.</p></section>
    </>}
    {bossView==="Journal"&&<section className="proto-panel"><div className="proto-section-title"><div><p className="proto-kicker">PUBLIC RUNEMETRICS ACTIVITY</p><h2>Bring your recent hunts in.</h2></div></div><div className="proto-import"><label><span>RuneScape name</span><input value={account} maxLength={20} onChange={e=>setAccount(e.target.value)}/></label><button className="proto-primary" disabled={busy} onClick={importActivity}>{busy?'Checking public profile…':'Preview activity import'}</button></div><p className="proto-muted">Imports recent kill events for these bosses. The feed is a recent window, not a lifetime total. No password is required.</p>{message&&<p className="proto-message" role="status">{message}</p>}{review.length>0&&<div className="proto-review">{review.map(event=><div key={event.key}><span><strong>{event.text}</strong><small>{event.player} · {event.date} UTC</small></span><span>+{event.count} observed</span></div>)}<button className="proto-primary" onClick={accept}>Add {review.length} events to preview journal</button></div>}
    <div className="proto-journal">{events.map(event=><div key={event.key}><Skull size={18}/><span><strong>{event.text}</strong><small>{event.date} UTC · RuneMetrics event</small></span></div>)}{!events.length&&<p className="proto-muted">{example?'Example journal: 312 kills and 02:14 are design examples, not imported records.':'No imported events for this boss in this preview yet.'}</p>}</div><label className="proto-note"><span>Hunt notes</span><textarea value={notes[boss.name]||''} placeholder="Loadout, mechanics to practise, or supplies for next time…" onChange={e=>setNotes({...notes,[boss.name]:e.target.value})}/></label></section>}</div></div>
  </>;
}
type Player = { name: string; overall: { level:number; xp:number }; skills: { name:string; level:number; xp:number }[] };
type Snapshot = { capturedAt:string; totalLevel:number; totalXp:number; players:Player[] };
const compact = (n:number) => Math.abs(n)>=1e6?`${(n/1e6).toFixed(2)}M`:Math.abs(n)>=1000?`${(n/1000).toFixed(1)}K`:n.toLocaleString();
function ProgressOverTime() {
  const [history,setHistory]=useState<Snapshot[]>([]), [loading,setLoading]=useState(true), [error,setError]=useState('');
  const [member,setMember]=useState('Group'), [period,setPeriod]=useState(30), [metric,setMetric]=useState<'xp'|'level'>('xp');
  const [group,setGroup]=useState('Dumb Idiots'),[size,setSize]=useState(4),[mode,setMode]=useState('regular');
  async function load() { setLoading(true);setError('');try {const response=await fetch(`/api/hiscores/history?group=${encodeURIComponent(group)}&size=${size}&competitive=${mode==='competitive'}`);if(!response.ok)throw new Error('Saved snapshots could not be loaded.');const data=await response.json() as {snapshots:Snapshot[]};setHistory(data.snapshots||[]);setMember('Group');}catch(e){setError(e instanceof Error?e.message:'History unavailable');}finally{setLoading(false);} }
  useEffect(()=>{void load();},[]);
  const roster=history.at(-1)?.players.map(player=>player.name)||[];
  const series=useMemo(()=>{
    const start=Date.now()-period*86_400_000;
    return history.filter(snapshot=>Date.parse(snapshot.capturedAt)>=start).flatMap(snapshot=>{
      const players=member==='Group'?roster.map(name=>snapshot.players.find(p=>p.name===name)): [snapshot.players.find(p=>p.name===member)];
      if(!players.length||players.some(p=>!p))return [];
      return [{snapshot,time:Date.parse(snapshot.capturedAt),value:players.reduce((sum,p)=>sum+(metric==='xp'?p!.overall.xp:p!.overall.level),0)}];
    });
  },[history,member,period,metric]);
  const first=series[0],last=series.at(-1),gain=first&&last?last.value-first.value:0;
  const width=900,height=250,pad=30; const maxGain=Math.max(1,...series.map(point=>point.value-(first?.value||0))),minGain=Math.min(0,...series.map(point=>point.value-(first?.value||0)));
  const coords=series.map(point=>({x:pad+(point.time-(first?.time||0))/Math.max(1,(last?.time||0)-(first?.time||0))*(width-pad*2),y:height-pad-(point.value-(first?.value||0)-minGain)/(maxGain-minGain)*(height-pad*2),...point}));
  const gains=roster.map(name=>{const before=first?.snapshot.players.find(p=>p.name===name),after=last?.snapshot.players.find(p=>p.name===name);return {name,gain:before&&after?after.overall.xp-before.overall.xp:null};}).sort((a,b)=>(b.gain||0)-(a.gain||0));
  const skills=last?.snapshot.players.filter(p=>member==='Group'||p.name===member).flatMap(p=>p.skills.map(skill=>{const previous=first?.snapshot.players.find(old=>old.name===p.name)?.skills.find(old=>old.name===skill.name);return {name:skill.name,gain:previous?skill.xp-previous.xp:0};}))||[];
  const skillGains=Object.entries(skills.reduce((out,skill)=>({...out,[skill.name]:(out[skill.name]||0)+skill.gain}),{} as Record<string,number>)).sort((a,b)=>b[1]-a[1]).slice(0,5);
  return <><div className="proto-heading"><div><p className="proto-kicker">THE JOURNEY ADDS UP</p><h1>Progress <span>over time</span></h1><p>See the gains your group has made between recorded play sessions.</p></div><span className="proto-badge live">Saved Ironpath snapshots</span></div>
  <section className="proto-panel proto-progress-controls"><label><span>Group</span><input value={group} onChange={e=>setGroup(e.target.value)} /></label><label><span>Group size</span><select value={size} onChange={e=>setSize(Number(e.target.value))}>{[2,3,4,5].map(n=><option key={n} value={n}>{n} members</option>)}</select></label><label><span>Mode</span><select value={mode} onChange={e=>setMode(e.target.value)}><option value="regular">Regular</option><option value="competitive">Competitive</option></select></label><button className="proto-primary" onClick={load} disabled={loading}>{loading?'Loading snapshots…':'Load group history'}</button></section>
  {error&&<p className="proto-message" role="alert">{error}</p>}
  <section className="proto-panel proto-chart-panel"><div className="proto-section-title"><div><p className="proto-kicker">{member==='Group'?'YOUR CURRENT ROSTER':member.toUpperCase()}</p><h2>{metric==='xp'?'XP earned between snapshots':'Total-level change'}</h2></div><div className="proto-chart-filters"><label><span className="proto-sr">Member</span><select value={member} onChange={e=>setMember(e.target.value)}><option>Group</option>{roster.map(name=><option key={name}>{name}</option>)}</select></label><div className="proto-segment" aria-label="History range">{[7,30,90].map(days=><button key={days} className={period===days?'selected':''} onClick={()=>setPeriod(days)}>{days} days</button>)}</div></div></div>
  <div className="proto-chart-summary"><strong>{gain>=0?'+':''}{compact(gain)} <small>{metric==='xp'?'XP':'levels'}</small></strong><div className="proto-segment" aria-label="Progress metric"><button className={metric==='xp'?'selected':''} onClick={()=>setMetric('xp')}>XP</button><button className={metric==='level'?'selected':''} onClick={()=>setMetric('level')}>Levels</button></div></div>
  {series.length>=2?<><svg className="proto-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${member}: ${gain.toLocaleString()} ${metric==='xp'?'XP':'levels'} change between ${series.length} recorded snapshots`}><defs><linearGradient id="proto-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b8a3f7" stopOpacity=".22"/><stop offset="1" stopColor="#b8a3f7" stopOpacity="0"/></linearGradient></defs>{[0,1,2,3].map(n=><line key={n} x1={pad} x2={width-pad} y1={pad+n*(height-pad*2)/3} y2={pad+n*(height-pad*2)/3} stroke="#262830"/>)}<polygon points={`${coords[0].x},${height-pad} ${coords.map(p=>`${p.x},${p.y}`).join(' ')} ${coords.at(-1)!.x},${height-pad}`} fill="url(#proto-fill)"/><polyline points={coords.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#b8a3f7" strokeWidth="3" strokeLinejoin="round"/>{coords.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="4" fill="#87dce0"><title>{new Date(p.time).toLocaleString()}: {p.value.toLocaleString()} {metric==='xp'?'XP':'total levels'}</title></circle>)}</svg><div className="proto-chart-axis"><span>{new Date(first!.time).toLocaleDateString()}</span><span>{new Date(last!.time).toLocaleDateString()}</span></div></>:<div className="proto-empty"><TrendingUp size={32}/><h3>{loading?'Loading your journey…':'More snapshots needed'}</h3><p>Two matching snapshots in this range are needed to show a change. Try a longer range or refresh your group on the dashboard over time.</p></div>}
  <p className="proto-muted">{series.length} matching snapshots · {first&&last?`${((last.time-first.time)/86_400_000).toFixed(1)} days of recorded coverage`:'No coverage yet'}. Points are saved observations, not continuous daily tracking. Missing members are not counted as zero.</p></section>
  <div className="proto-progress-bottom"><section className="proto-panel"><p className="proto-kicker">GROUP MOMENTUM</p><h2>Everyone’s contribution</h2>{gains.map((p,i)=><div className="proto-rank" key={p.name}><span className="proto-rank-number">0{i+1}</span><strong>{p.name}</strong><span>{p.gain===null?'No baseline':`${p.gain>=0?'+':''}${compact(p.gain)} XP`}</span></div>)}</section><section className="proto-panel"><p className="proto-kicker">WHERE THE GAINS HAPPENED</p><h2>Skills on the move</h2>{skillGains.map(([name,value])=><div className="proto-skill-gain" key={name}><div><strong>{name}</strong><span>{value>=0?'+':''}{compact(value)} XP</span></div><div className="proto-track"><i style={{width:`${Math.max(0,value)/Math.max(1,skillGains[0]?.[1]||1)*100}%`}}/></div></div>)}</section></div></>;
}

type Gear = { name:string; kind:'Weapon'|'Armour'; gate:string; source:string; description:string; steps:string[] };
const gearRoutes:Record<string,Gear[]> = {
  Necromancy: [
    {name:'Death guard (tier 70)',kind:'Weapon',gate:'70 Necromancy',source:'Craft · Kili tasks',description:'Upgrade your own Death guard through Kili’s equipment progression. Weapon upgrades are available alongside the tank route.',steps:['Complete the appropriate Kili task','Gather ritual and crafting materials','Craft the weapon upgrade']},
    {name:'Death guard (tier 90)',kind:'Weapon',gate:'90 Necromancy',source:'Craft · Kili tasks',description:'Work through Kili’s higher-tier tasks and craft the T90 weapon. Power armour is not required to follow the weapon upgrade path.',steps:['Complete the tier-90 Kili task','Prepare the required ritual materials','Upgrade the Death guard and skull lantern']},
    {name:'Deathwarden robe top (tier 80)',kind:'Armour',gate:'80 Defence + Necromancy',source:'Craft · Tank route',description:'Build a durable tank loadout from your existing Deathwarden equipment and Kili’s tank-armour tasks.',steps:['Complete the relevant Kili tank task','Gather the upgrade materials','Craft your Deathwarden upgrade']},
    {name:'Deathdealer robe top (tier 70)',kind:'Armour',gate:'70 Defence + Necromancy',source:'Craft · Hermod drop',description:'A power-armour branch earned with Hermodic plates and ritual materials. The top upgrades from the T60 Deathwarden top after Kili’s Knowledge V (power).',steps:["Complete Kili’s Knowledge V (power)",'Earn a Hermodic plate and gather ritual materials','Craft the Deathdealer robe top']},
  ],
  Magic: [
    {name:'Guthix staff',kind:'Weapon',gate:'60 Magic',source:'Mage Arena reward',description:'Earn a useful early Magic weapon and special attack through the Mage Arena.',steps:['Prepare for the Mage Arena','Complete the arena requirements','Claim your Guthix staff']},
    {name:'Vanquish',kind:'Weapon',gate:'75 Magic · 150 quest points',source:'Quest-point reward',description:'Claim the switchable quest-point weapon from May’s Quest Caravan. The same weapon supports Magic, Melee, and Ranged.',steps:['Earn 150 quest points','Claim Vanquish at May’s Quest Caravan','Choose the combat form you need']},
    {name:'Wand of the Cywir elders',kind:'Weapon',gate:'85 Magic · T90 accuracy / T80 damage',source:'Boss drop · Helwyr',description:'Earn the wand from Helwyr, then plan a compatible off-hand for a dual-wield Magic setup.',steps:['Prepare your Helwyr setup','Earn the wand from Helwyr','Plan your off-hand and augmentation']},
    {name:'Garb of subjugation',kind:'Armour',gate:'70 Defence',source:"Boss drop · K’ril",description:'Earn the body piece from K’ril Tsutsaroth or his bodyguards. Reserve pieces separately if they are needed for ritual crafting.',steps:['Prepare your God Wars Dungeon trip','Earn the Garb of subjugation','Confirm the piece is reserved for this loadout']},
  ],
  Melee: [
    {name:'Vanquish',kind:'Weapon',gate:'75 Attack · 150 quest points',source:'Quest-point reward',description:'A self-earned weapon option from May’s Quest Caravan while you work toward higher-tier drops.',steps:['Earn 150 quest points','Claim Vanquish','Select its Melee form']},
    {name:'Chaotic maul',kind:'Weapon',gate:'80 Attack + Dungeoneering',source:'200,000 Dungeoneering tokens',description:'Spend earned Dungeoneering tokens on a T80 two-handed weapon. This is a token route, rather than a boss-drop route.',steps:['Reach the required levels','Earn 200,000 Dungeoneering tokens','Claim the maul from the rewards shop']},
    {name:'Drygore rapier',kind:'Weapon',gate:'90 Attack',source:'Boss drop · Kalphite King',description:'A T90 main-hand goal earned at Kalphite King. Track an appropriate off-hand as a separate upgrade.',steps:['Prepare for Kalphite King','Earn the Drygore rapier','Plan the off-hand and perks']},
    {name:'Bandos chestplate',kind:'Armour',gate:'70 Defence',source:'Boss drop · General Graardor',description:'A power-armour body piece earned through God Wars Dungeon.',steps:['Prepare for General Graardor','Earn the chestplate','Confirm ownership for your loadout']},
  ],
  Ranged: [
    {name:'Crystal bow',kind:'Weapon',gate:'70 Ranged + 50 Agility',source:'Quest route · Roving Elves',description:'Follow the Roving Elves reward route and plan how to recharge your crystal equipment.',steps:['Complete the quest requirements','Earn the bow through Roving Elves','Plan your crystal recharges']},
    {name:'Royal crossbow',kind:'Weapon',gate:'80 Ranged',source:'Craft · Queen Black Dragon drops',description:'Earn all four Royal crossbow components, assemble the weapon with Thurgo, and complete its forging step at Queen Black Dragon.',steps:['Gather all four QBD components','Assemble the crossbow with Thurgo','Forge it at Queen Black Dragon']},
    {name:'Ascension crossbow',kind:'Weapon',gate:'90 Ranged',source:'Craft · Legiones drops',description:'Bring all six Ascension signets, a dragon crossbow, and 100 Ascension shards to Ocellus. Track the components individually.',steps:['Earn Ascension signets I–VI','Gather a dragon crossbow and 100 shards','Ask Ocellus to create the crossbow']},
    {name:'Armadyl chestplate',kind:'Armour',gate:'70 Defence',source:"Boss drop · Kree’arra",description:'A self-earned Ranged power-armour body piece from God Wars Dungeon.',steps:["Prepare for Kree’arra",'Earn the chestplate','Confirm ownership for this loadout']},
  ],
};
function GearTracker() {
  const [style,setStyle]=useState('Necromancy'),[branch,setBranch]=useState('Tank'),[selected,setSelected]=useState('Death guard (tier 90)');
  const [owned,setOwned]=useState<Record<string,boolean>>({'Death guard (tier 70)':true,'Skull lantern (tier 70)':true,'Deathwarden robe top (tier 70)':true});
  const [checks,setChecks]=useState<Record<string,boolean>>({});
  const routes=gearRoutes[style].filter(route=>style!=='Necromancy'||route.kind==='Weapon'||(branch==='Tank'?route.name.startsWith('Deathwarden'):route.name.startsWith('Deathdealer')));
  const target=routes.find(route=>route.name===selected)||routes[0];
  const completed=target.steps.filter((_,i)=>checks[`${target.name}:${i}`]).length;
  const equipment=style==='Necromancy'?['Death guard (tier 70)','Skull lantern (tier 70)','Deathwarden robe top (tier 70)']:[routes.find(route=>route.kind==='Weapon')!.name,routes.find(route=>route.kind==='Armour')!.name];
  return <><div className="proto-heading"><div><p className="proto-kicker">RS3 IRONMAN · EARN YOUR NEXT UPGRADE</p><h1>Gear <span>progression</span></h1><p>Your equipment, its acquisition path, and the steps between here and your next upgrade.</p></div><span className="proto-badge">Example loadout · manual ownership</span></div>
  <div className="proto-style-tabs" aria-label="Combat style">{Object.keys(gearRoutes).map(name=><button key={name} className={style===name?'selected':''} onClick={()=>{setStyle(name);setSelected(gearRoutes[name][0].name);}}>{name==='Necromancy'?<Skull size={17}/>:name==='Melee'?<Swords size={17}/>:name==='Ranged'?<Crosshair size={17}/>:<Sparkles size={17}/>} {name}</button>)}</div>
  <div className="proto-gear-layout"><aside className="proto-panel proto-loadout"><p className="proto-kicker">YOUR CURRENT KIT</p><h2>{style} loadout</h2><div className="proto-loadout-mark"><Shield size={68} strokeWidth={1}/></div>{equipment.map((name,i)=><button key={name} className={owned[name]?'owned':''} onClick={()=>setOwned({...owned,[name]:!owned[name]})} aria-pressed={Boolean(owned[name])}><ItemImage name={name}/><span><small>{style==='Necromancy'?['Main hand','Off hand','Body'][i]:i===0?'Weapon':'Body'}</small><strong>{name}</strong><small>{owned[name]?'Owned · preview confirmation':'Ownership unconfirmed'}</small></span>{owned[name]&&<Check size={16}/>}</button>)}<p className="proto-muted">These are design examples, not imported equipment. Tap to try ownership tracking.</p><div className="proto-tip"><Gem size={18}/><p>Augmentation and perks would be tracked separately from owning the base item.</p></div></aside>
  <div className="proto-stack"><section className="proto-panel"><div className="proto-section-title"><div><p className="proto-kicker">CHOOSE HOW YOU EARN IT</p><h2>A route built for Ironman.</h2></div>{style==='Necromancy'&&<div className="proto-segment" aria-label="Necromancy armour branch">{['Tank','Power'].map(name=><button key={name} className={branch===name?'selected':''} onClick={()=>{setBranch(name);setSelected(name==='Tank'?'Deathwarden robe top (tier 80)':'Deathdealer robe top (tier 70)');}}>{name}</button>)}</div>}</div><p className="proto-muted">Curated starter routes for exploring the design. A finished tracker would cover more tiers, accessories, alternatives, and full material lists.</p><div className="proto-gear-routes">{routes.map(route=><button key={route.name} className={target.name===route.name?'selected':''} onClick={()=>setSelected(route.name)}><ItemImage name={route.name}/><span><small>{route.kind} · {route.source}</small><strong>{route.name}</strong><small>{route.gate}</small></span><ChevronRight size={18}/></button>)}</div></section>
  <section className="proto-panel proto-upgrade"><div className="proto-upgrade-title"><ItemImage name={target.name}/><div><p className="proto-kicker">YOUR NEXT TARGET</p><h2>{target.name}</h2><span className="proto-badge">{target.source}</span></div></div><p>{target.description}</p><div className="proto-gate"><Shield size={17}/><span>{target.gate}</span><small>Requirement shown · readiness unconfirmed</small></div><div className="proto-section-title"><h3>Your acquisition checklist</h3><small>{completed} / {target.steps.length} steps</small></div>{target.steps.map((step,i)=><label className="proto-check" key={step}><input type="checkbox" checked={Boolean(checks[`${target.name}:${i}`])} onChange={e=>setChecks({...checks,[`${target.name}:${i}`]:e.target.checked})}/><span>{step}</span></label>)}<div className="proto-upgrade-actions"><button className={owned[target.name]?'proto-secondary':'proto-primary'} onClick={()=>setOwned({...owned,[target.name]:!owned[target.name]})}>{owned[target.name]?<><Check size={15}/> Owned in preview · undo</>:'Confirm item owned in preview'}</button><a href={wiki(target.name==='Vanquish'?'Vanquish (weapon)':target.name)} target="_blank" rel="noreferrer">Check full requirements <ArrowUpRight size={14}/></a></div><p className="proto-muted">Owning a drop, reserving it for crafting, and equipping it are different states. The finished tracker should record each explicitly.</p></section></div></div></>;
}
export default function Prototypes() {
  const [tab,setTab]=useState('Boss journal');
  return <main className="ip-proto"><header className="proto-header"><a href="/" className="proto-back"><ArrowLeft size={15}/> Ironpath home</a><a href="/" className="proto-brand"><BrandLogo subtitle="Group Ironman companion" /></a><span className="proto-design-badge">DESIGN LAB</span></header><div className="proto-intro"><span>Explore the next chapter</span><p>Three interactive feature concepts. Journal and gear changes stay in this preview and reset on reload; progress charts use existing saved snapshots.</p></div><nav className="proto-tabs" aria-label="Feature prototypes">{['Boss journal','Progress over time','Gear tracker'].map((name,index)=><button key={name} className={tab===name?'selected':''} aria-current={tab===name?'page':undefined} onClick={()=>{setTab(name);window.scrollTo({top:0,behavior:'instant'});}}>{index===0?<Skull size={18}/>:index===1?<TrendingUp size={18}/>:<Shield size={18}/>} {name}</button>)}</nav><div className="proto-content">{tab==='Boss journal'?<BossJournal/>:tab==='Progress over time'?<ProgressOverTime/>:<GearTracker/>}</div><footer className="proto-footer">Ironpath design lab · RS3 Ironman concepts · Item and boss artwork © Jagex, via RuneScape Wiki</footer></main>;
}
