'use client';

import { BookOpen, Boxes, CalendarCheck2, Check, ChevronRight, CircleDot, Clock3, Coins, Crown, Dice5, Dumbbell, ExternalLink, Gem, LayoutDashboard, Leaf, ListChecks, Medal, Plus, RefreshCw, Search, Shield, Sparkles, Trash2, Trophy, Users, Wrench } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import progressData from './data/efficient-progress.json';
import { ironTasks, type IronTask } from './data/random-tasks';

const milestoneCandidates = [
  { id:'part1-002-the-blood-pact', title:'Complete The Blood Pact', detail:'Start the route with an early quest and useful combat rewards.', scope:'Personal', skills:[] },
  { id:'part1-003-the-restless-ghost', title:'Complete The Restless Ghost', detail:'Quick quest points and an early progression requirement.', scope:'Personal', skills:[] },
  { id:'part1-004-cook-s-assistant', title:"Complete Cook's Assistant", detail:'A fast early quest and a foundation for the group route.', scope:'Personal', skills:[] },
  { id:'part1-006-complete-the-archaeology-tutorial-at-the-varrock-dig-site-and-activate-the-font-of-life-relic', title:'Complete the Archaeology tutorial', detail:'Unlock the Font of Life relic and an early source of progress.', scope:'Personal', skills:[] },
  { id:'part1-007-necromancy', title:'Complete Necromancy!', detail:'Pick up early Necromancer gear and establish a combat style.', scope:'Personal', skills:[] },
  { id:'part1-010-druidic-ritual', title:'Complete Druidic Ritual', detail:'Unlock Herblore for supplies and future quest requirements.', scope:'Personal', skills:[] },
  { id:'part1-011-wolf-whistle', title:'Unlock Summoning through Wolf Whistle', detail:'Open an essential Ironman combat and utility skill.', scope:'Personal', skills:[] },
  { id:'skill-mining-20', title:'Reach Mining level 20', detail:'A useful early gathering milestone for ores and quest preparation.', scope:'Personal', skills:[['Mining',20]] },
  { id:'skill-crafting-20', title:'Reach Crafting level 20', detail:'Build toward self-made gear, jewellery and key unlocks.', scope:'Personal', skills:[['Crafting',20]] },
  { id:'skill-divination-20', title:'Reach Divination level 20', detail:'Begin building toward Guthixian Cache and future Invention.', scope:'Personal', skills:[['Divination',20]] },
  { id:'group-mining-40', title:'Have a member reach Mining level 40', detail:'Assign the closest member and build the group’s ore supply.', scope:'Group', skills:[['Mining',40]] },
  { id:'group-crafting-40', title:'Have a member reach Crafting level 40', detail:'Set up a crafter for early equipment and jewellery needs.', scope:'Group', skills:[['Crafting',40]] },
] as const;
const nav = [[LayoutDashboard, 'Overview'], [Trophy, 'Dashboard'], [CalendarCheck2, 'Repeatables'], [Dice5, 'Task Generator']] as const;
const themes = [
  ['necromancy','Necromancy'], ['classic','Classic'], ['gielinor','Gielinor'], ['prifddinas','Prifddinas'], ['kharidian','Kharidian'], ['wilderness','Wilderness'], ['saradomin','Saradomin'], ['zamorak','Zamorak'],
] as const;
type Theme = typeof themes[number][0];
function isTheme(value:string|null): value is Theme { return themes.some(([id]) => id === value); }

const repeatables = {
  Daily: [
    ['Daily Challenges', 'Three skill challenges', 'High XP'],
    ['Nemi Forest', 'Mining, Farming, Prayer & Dungeoneering', '10 min'],
    ['Jack of Trades', 'Complete the aura skill circuit', 'XP book'],
    ['Guthixian Cache', 'Claim up to two Divination games', 'Timed'],
    ['Sinkholes', 'Two Dungeoneering games', 'Timed'],
    ['Big Chinchompa', 'Two Hunter games and competence points', 'Hunter'],
    ['Supply run', 'Turn supplies in to Quercy', 'Skilling XP'],
    ['Wild jade vine', 'Slay or prune the Karamja vine', 'Farming'],
    ['Book of Char', 'Use Char’s daily Firemaking training', 'Firemaking'],
    ['Trinks’ Tasks', 'Complete Mazcab tasks for reputation', 'Reputation'],
    ['Soul obelisks', 'Claim Menaphos reputation and XP', 'Menaphos'],
    ['Arc contracts', 'Complete an Arc contract', 'Chimes'],
    ['Heart of Gielinor bounties', 'Complete Feng’s daily bounties', 'Reputation'],
    ['Runesphere rune dust', 'Hand in up to 1,000 rune dust', 'Runecrafting'],
    ['Player-owned Farm', 'Check animals, produce and beans', 'Farming'],
    ['Player-owned ports', 'Voyages, visitors and resources', 'Passive'],
    ['Anachronia base camp', 'Send out management and check rewards', 'Anachronia'],
    ['Gorajo hoardstalker', 'Claim a daily Dungeoneering card', 'Dungeoneering'],
    ['Explorer’s ring casts', 'Use daily alchemy, superheat and other casts', 'Free casts'],
    ['Lumbridge food hamper', 'Claim food from the castle cook', 'Supplies'],
    ['Desert achievement claims', 'Collect merchant and amulet rewards', 'Supplies'],
    ['Arc free supplies', 'Claim Rosie’s supplies and island resources', 'The Arc'],
    ['Fixate casts', 'Use three free Archaeology Fixates', 'Archaeology'],
    ['Kingdom collection', 'Collect and reassign Miscellania workers', 'Resources'],
    ['Robin bone exchange', 'Turn bones into bonemeal and slime', 'Prayer'],
    ['Wythien exchange', 'Trade crystal motherlode shards', 'Prifddinas'],
    ['Razmire olive oil', 'Restock olive oil in Mort’ton', 'Herblore'],
  ],
  Weekly: [
    ['Soul Reaper', 'Earn up to 300 Reaper points', 'Bossing'],
    ['Penguin Hide and Seek', 'Spot the weekly penguins', 'Flexible XP'],
    ['Tears of Guthix', 'Train your lowest skill', 'Quest'],
    ['Meg at Player-owned Ports', 'Answer Meg and claim the chest', '5 min'],
    ['Agoroth', 'Two encounters for bonus XP', 'Combat'],
    ['Big Top Bonanza', 'Complete the travelling circus event', 'Skill XP'],
    ['Skeletal horror', 'Kill it for Slayer, Prayer and a clue', 'Weekly boss'],
    ['Hanky points', 'Claim Buyers and Cellars Thieving XP', 'Thieving'],
    ['Clan Citadel capping', 'Cap for XP and clan resources', 'Clan'],
    ['Familiarisation', 'Choose charm enhancer or ingredients', 'Summoning'],
    ['A Barmaid’s Tip', 'Follow up on a Player-owned Port tip', 'Ports'],
    ['Thalmund’s Wares', 'Check the weekly Necromancy stock', 'Necromancy'],
    ['Broken Home replay', 'Replay for a large XP lamp', 'Quest'],
    ['Sliske’s Endgame replay', 'Claim weekly replay rewards', 'Quest'],
    ['Rush of Blood', 'Complete the Slayer gauntlet', 'Slayer'],
    ['Dimension of Disaster replay', 'Earn silver pennies', 'Quest'],
    ['Shattered Worlds challenge', 'Complete a weekly challenge', 'Combat'],
    ['Memory of Nomad', 'Replay the weekly Nomad encounter', 'Combat'],
    ['Champion refights', 'Refight unlocked champions', 'Combat'],
    ['Wisps of the Grove', 'Weekly Farming and Hunter event', 'Skilling'],
    ['Herby Werby', 'Trade herbs for Herblore experience', 'Herblore'],
    ['Advance Time', 'Use the weekly high-level Magic spell', 'Magic'],
    ['Water filtration system', 'Collect before its storage caps', 'Fort Forinthry'],
    ['Achievement resource claims', 'Collect cactus, fruit, flax, essence and sand', 'Supplies'],
    ['Razmire plank claim', 'Claim noted planks from Mort’ton', 'Construction'],
    ['Aquarium decorations', 'Collect oysters, kelp and seaweed', 'Weekly'],
    ['Coeden’s logs', 'Claim your accumulated high-tier logs', 'Woodcutting'],
    ['Eli Bacon', 'Claim raw bacon or a spirit pig', 'Supplies'],
    ['Lupe’s Soul Supplies', 'Collect free Necromancy supplies', 'Necromancy'],
    ['Weekly shop packs', 'Check yak hides, meat, seaweed, vials and runes', 'Shop run'],
    ['Bandit Duty Free', 'Check Construction, ritual and seed stock', 'Shop run'],
    ['Culinaromancer’s Chest', 'Check food and cooking ingredients', 'Shop run'],
    ['Black Marketeer', 'Buy available port resources', 'Ports'],
  ],
  Monthly: [
    ['Troll Invasion', 'Defend Burthorpe and claim an XP book', 'Combat'],
    ['God Statues', 'Build four statues across Gielinor', 'Construction'],
    ['Giant Oyster', 'Feed, check and open the oyster', 'Fishing'],
    ['Effigy Incubator', 'Power effigies for lamps or stars', 'High level'],
    ['Marketplace free items', 'Claim the monthly Marketplace items', 'Claim'],
    ['Crystal tree blossom', 'Harvest accumulated Prifddinas blossoms', 'Farming'],
  ],
} as const;

type HiscoreSkill = { name: string; rank: number; level: number; xp: number };
type HiscorePlayer = { name: string; overall: HiscoreSkill | null; skills: HiscoreSkill[] };
type HiscoreResult = { group: string; mode: string; size: number; totalLevel: number; totalXp: number; players: HiscorePlayer[]; refreshedAt: string; sourceUrl: string; cached?: boolean; stale?: boolean; warning?: string };
type GroupActivity = { player:string; date:string; timestamp:number; text:string; details:string };
type ActivityMember = { name:string; available:boolean; stale?:boolean; reason?:string };
type FamiliarReference = { level:number; name:string; special:string; boost:string; ability:string; charm?:string; shards?:string; tertiary?:string };
type QuestSyncResult = { player:string; quests:Array<{ title:string; status:string; completed:boolean }>; refreshedAt:string; cached?:boolean };
type SharedItem = { id:string; name:string; detail:string; owner:string; quantity:string; done:boolean };
type WorkspaceData = { version:number; efficient:Record<string,boolean>; repeatables:Record<string,boolean>; unlocks:Record<string,boolean>; journey:Record<string,boolean>; supplies:SharedItem[]; shops:Record<string,boolean>; pvm:Record<string,boolean>; farming:Record<string,boolean>; kingdom:Record<string,string|boolean>; updatedBy:string };
type Workspace = { id:string; token:string; name:string; data:WorkspaceData; updatedAt:number };
function normalQuestTitle(value:string) { return value.normalize('NFKD').replace(/[’‘`]/gu, "'").toLowerCase().replace(/[^a-z0-9]+/gu, ' ').trim(); }
const emptyWorkspaceData: WorkspaceData = { version:1,efficient:{},repeatables:{},unlocks:{},journey:{},supplies:[],shops:{},pvm:{},farming:{},kingdom:{},updatedBy:'' };
const repeatableRequirements: Record<string,{ skills?:Array<[string,number]>; quests?:string[]; manual?:string }> = {
  'Wild jade vine':{ quests:['Back to my Roots'] }, 'Book of Char':{ quests:["The Firemaker's Curse"] }, 'Soul obelisks':{ quests:['The Jack of Spades'] }, 'Arc contracts':{ quests:['Impressing the Locals'] }, 'Player-owned ports':{ skills:[['Agility',90]], manual:'Player-owned Ports access' },
  'Anachronia base camp':{ manual:'Anachronia access' }, 'Gorajo hoardstalker':{ manual:'Prifddinas access' }, 'Fixate casts':{ skills:[['Archaeology',99]], manual:'Master archaeologist outfit' }, 'Skeletal horror':{ manual:'Rag and Bone Man wish lists' }, 'Tears of Guthix':{ quests:['Tears of Guthix'] }, 'Hanky points':{ quests:['Buyers and Cellars'] },
  'A Barmaid’s Tip':{ manual:'Ports adventurer unlocked' }, 'Thalmund’s Wares':{ quests:['Kili Row'] }, 'Agoroth':{ quests:['A Shadow over Ashdale'] }, 'Rush of Blood':{ skills:[['Slayer',85]], quests:["Plague's End"] }, 'Herby Werby':{ manual:'Anachronia access' }, 'Advance Time':{ skills:[['Magic',93]] },
  'Water filtration system':{ skills:[['Construction',20]], manual:'Water filtration system built' }, 'Giant Oyster':{ quests:['Beneath Cursed Tides'] }, 'Effigy Incubator':{ skills:[['Invention',85]], quests:['Desperate Measures'] }, 'Crystal tree blossom':{ skills:[['Farming',94]], manual:'Crystal tree planted' },
};
const manualRepeatableUnlocks = ['Player-owned Ports access','Anachronia access','Prifddinas access','Master archaeologist outfit','Rag and Bone Man wish lists','Ports adventurer unlocked','Water filtration system built','Crystal tree planted'];
const repeatableGuidance: Record<string,{ summary:string; tip?:string; link?:string }> = {
  'Meg at Player-owned Ports': {
    summary:'Meg appears at Player-owned Ports with three adventure questions. The advice you choose determines the quality of the treasure chest she brings back on her next visit.',
    tip:'Use the Meg answer reference before confirming the first answer: its quality is carried through her remaining questions. Better advice can improve the lamp tier inside the chest; backing out before finishing lets you start her dialogue over.',
    link:'https://runescape.wiki/w/Meg',
  },
  'Tears of Guthix': { summary:'Spend the weekly visit collecting tears from the moving streams. Experience is awarded to the character’s lowest eligible skill.', link:'https://runescape.wiki/w/Tears_of_Guthix' },
  'Soul Reaper': { summary:'Choose and complete a Reaper Assignment for Reaper points. The best choice depends on your group’s current boss access and kill comfort.', link:'https://runescape.wiki/w/Soul_Reaper' },
  'Penguin Hide and Seek': { summary:'Locate the weekly penguins, then cash in the points for experience in a skill you choose.', link:'https://runescape.wiki/w/Penguin_Hide_and_Seek' },
};

const herbCrops = [[9,'Guam'],[14,'Marrentill'],[19,'Tarromin'],[26,'Harralander'],[32,'Ranarr'],[38,'Toadflax'],[44,'Irit'],[50,'Avantoe'],[56,'Kwuarm'],[62,'Snapdragon'],[67,'Cadantine'],[73,'Lantadyme'],[79,'Dwarf weed'],[85,'Torstol'],[91,'Fellstalk']] as const;
const treeCrops = [[15,'Oak'],[30,'Willow'],[45,'Maple'],[60,'Yew'],[75,'Magic']] as const;
const fruitCrops = [[27,'Apple'],[33,'Banana'],[39,'Orange'],[42,'Curry'],[51,'Pineapple'],[57,'Papaya'],[68,'Palm'],[101,'Ciku'],[107,'Guarana'],[113,'Carambola']] as const;

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [active, setActive] = useState('Overview');
  const [theme, setTheme] = useState<Theme>('necromancy');
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [groupData, setGroupData] = useState<HiscoreResult | null>(null);
  const [preferredMember, setPreferredMember] = useState('');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  useEffect(() => { try { setGroupData(JSON.parse(window.localStorage.getItem('ironpath-hiscore-result') || 'null')); const savedTheme = window.localStorage.getItem('ironpath-theme'); if (isTheme(savedTheme)) setTheme(savedTheme); const savedWorkspace = JSON.parse(window.localStorage.getItem('ironpath-workspace') || 'null'); if (savedWorkspace?.id && savedWorkspace?.token) fetch('/api/workspace',{headers:{'x-ironpath-workspace':savedWorkspace.id,'x-ironpath-token':savedWorkspace.token}}).then(response=>response.ok?response.json() as Promise<Omit<Workspace,'token'>>:null).then(remote=>remote&&setWorkspace({ ...remote, token:savedWorkspace.token, data:{...emptyWorkspaceData,...remote.data} })).catch(()=>{}); if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{}); } catch { /* ignore */ } }, []);
  useEffect(() => { if (!groupData?.players.length) return; const saved = window.localStorage.getItem('ironpath-preferred-member'); setPreferredMember(current => groupData.players.some(player => player.name === current) ? current : groupData.players.some(player => player.name === saved) ? saved! : groupData.players[0].name); }, [groupData]);
  function changeTheme(value: Theme) { setTheme(value); window.localStorage.setItem('ironpath-theme', value); }
  function choosePreferredMember(name:string) { setPreferredMember(name); window.localStorage.setItem('ironpath-preferred-member',name); }
  function unsyncGroup() { if (!window.confirm('Unsync this group from this browser? Your shared workspace will not be deleted.')) return; setGroupData(null); setPreferredMember(''); window.localStorage.removeItem('ironpath-hiscore-result'); window.localStorage.removeItem('ironpath-hiscore-group'); window.localStorage.removeItem('ironpath-preferred-member'); }
  function completeRoadmapTask(id:string) { if (workspace) { updateWorkspace('efficient',{ ...workspace.data.efficient,[id]:true }); return; } try { const current = JSON.parse(window.localStorage.getItem('ironpath-efficient-progress') || '{}') as Record<string,boolean>; window.localStorage.setItem('ironpath-efficient-progress',JSON.stringify({ ...current,[id]:true })); } catch { /* ignore local storage failure */ } }
  function updateWorkspace<K extends keyof WorkspaceData>(key: K, value: WorkspaceData[K]) { if (!workspace) return; const next = { ...workspace, data:{ ...workspace.data, [key]:value }, updatedAt:Date.now() }; setWorkspace(next); fetch('/api/workspace',{method:'PUT',headers:{'content-type':'application/json','x-ironpath-workspace':workspace.id,'x-ironpath-token':workspace.token},body:JSON.stringify({name:workspace.name,data:next.data})}).catch(()=>{}); }
  const views: Record<string, React.ReactNode> = {
    Overview: <Overview groupData={groupData} goTo={setActive} unsyncGroup={unsyncGroup} />,
    Dashboard: <HiScoresView result={groupData} setResult={setGroupData} workspace={workspace} preferredMember={preferredMember} setPreferredMember={choosePreferredMember} />,
    'Task Generator': <TaskGenerator groupData={groupData} preferredMember={preferredMember} />,
    Repeatables: <RepeatablesView shared={workspace?.data.repeatables} setShared={value=>updateWorkspace('repeatables',value)} groupData={groupData} preferredMember={preferredMember} />,
    'Ironman Guide': <IronmanGuideView shared={workspace?.data.unlocks} setShared={value=>updateWorkspace('unlocks',value)} />,
    'Progression Roadmap': <EfficientProgressView fixedView="Roadmap" groupData={groupData} preferredMember={preferredMember} shared={workspace?.data.efficient} setShared={value=>updateWorkspace('efficient',value)} />,
    'Skill Training': <EfficientProgressView fixedView="Training" groupData={groupData} preferredMember={preferredMember} shared={workspace?.data.efficient} setShared={value=>updateWorkspace('efficient',value)} />,
    Familiars: <EfficientProgressView fixedView="Familiars" groupData={groupData} preferredMember={preferredMember} shared={workspace?.data.efficient} setShared={value=>updateWorkspace('efficient',value)} />,
    Invention: <InventionView />,
    'Good general information': <GeneralInformationView />,
    'Farming Routes': <FarmRunsView player={groupData?.players.find(member => member.name === preferredMember) || groupData?.players[0]} shared={workspace?.data.farming} setShared={value=>updateWorkspace('farming',value)} />,
    'Shop Runs': <ShopRunsView shared={workspace?.data.shops} setShared={value=>updateWorkspace('shops',value)} />,
  };
  if (showLanding) return <main className="min-h-screen bg-background text-foreground" data-theme={theme}><IronpathLanding onEnter={() => setShowLanding(false)} /></main>;
  return <main className="min-h-screen bg-background text-foreground" data-theme={theme}>
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-bar">
          <button className="brand-home" onClick={() => setActive('Overview')} aria-label="Open Ironpath overview">
            <img className="brand-rune-banner" src="/ironpath-banner-transparent-v1.png" alt="Ironpath" />
          </button>
          <div className="navigation-row">
            <nav aria-label="Primary navigation">{nav.map(([, label]) => <button key={label} className={active === label ? 'nav-button active' : 'nav-button'} onClick={() => setActive(label)} aria-label={label}><span>{label}</span></button>)}<div className="extras-menu" onMouseEnter={() => { setExtrasOpen(true); setTestOpen(false); }} onMouseLeave={() => setExtrasOpen(false)} onFocus={() => { setExtrasOpen(true); setTestOpen(false); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setExtrasOpen(false); }}><button className={['Ironman Guide','Progression Roadmap','Skill Training','Good general information'].includes(active) ? 'nav-button active' : 'nav-button'} onClick={() => setExtrasOpen(value => !value)} aria-label="Open resources" aria-expanded={extrasOpen} aria-haspopup="true"><Sparkles size={18} strokeWidth={1.7}/><span>Resources</span><ChevronRight className={extrasOpen ? 'extras-chevron open' : 'extras-chevron'} size={14}/></button>{extrasOpen && <div className="extras-popover"><p className="eyebrow">Ironman reference</p><button onClick={() => { setActive('Ironman Guide'); setExtrasOpen(false); }}><BookOpen size={17}/><span><strong>Ironman Guide</strong><small>Unlocks, habits and priorities</small></span></button><button onClick={() => { setActive('Progression Roadmap'); setExtrasOpen(false); }}><ListChecks size={17}/><span><strong>Progression Roadmap</strong><small>Ordered goals and quest progress</small></span></button><button onClick={() => { setActive('Skill Training'); setExtrasOpen(false); }}><Dumbbell size={17}/><span><strong>Skill Training</strong><small>Level-based training methods</small></span></button><button onClick={() => { setActive('Good general information'); setExtrasOpen(false); }}><Gem size={17}/><span><strong>Good General Information</strong><small>Consumables and armour effects</small></span></button></div>}</div><div className="extras-menu" onMouseEnter={() => { setTestOpen(true); setExtrasOpen(false); }} onMouseLeave={() => setTestOpen(false)} onFocus={() => { setTestOpen(true); setExtrasOpen(false); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setTestOpen(false); }}><button className={['Farming Routes','Shop Runs','Familiars','Invention'].includes(active) ? 'nav-button active' : 'nav-button'} onClick={() => setTestOpen(value => !value)} aria-label="Open supplemental information" aria-expanded={testOpen} aria-haspopup="true"><Wrench size={17} strokeWidth={1.8}/><span>Supplemental Info</span><ChevronRight className={testOpen ? 'extras-chevron open' : 'extras-chevron'} size={14}/></button>{testOpen && <div className="extras-popover test-popover"><p className="eyebrow">Practical planning</p><button onClick={() => { setActive('Farming Routes'); setTestOpen(false); }}><Leaf size={17}/><span><strong>Farming Routes</strong><small>Herb, tree and fruit-tree circuits</small></span></button><button onClick={() => { setActive('Shop Runs'); setTestOpen(false); }}><Coins size={17}/><span><strong>Shop Runs</strong><small>Group stock and supply stops</small></span></button><button onClick={() => { setActive('Invention'); setTestOpen(false); }}><Boxes size={17}/><span><strong>Invention</strong><small>Components and useful sources</small></span></button><button onClick={() => { setActive('Familiars'); setTestOpen(false); }}><Users size={17}/><span><strong>Familiars</strong><small>Summoning companions by level</small></span></button></div>}</div></nav>
          </div>
        </div>
      </header>
      <section className="workspace">
        {views[active]}
        <footer className="app-credit"><label className="theme-control footer-theme-control"><span>Theme</span><select value={theme} onChange={event => changeTheme(event.target.value as Theme)} aria-label="Choose color theme">{themes.map(([id,label]) => <option value={id} key={id}>{label}</option>)}</select></label><span>Concept created by <strong>Justjay btw</strong></span><i aria-hidden="true"/><span>AI-assisted development</span><i aria-hidden="true"/><span>For the community</span><i aria-hidden="true"/><a href="/faq">FAQ</a><i aria-hidden="true"/><a href="/privacy">Privacy &amp; data</a><i aria-hidden="true"/><span className="legal-note">Unofficial · Not affiliated with Jagex</span></footer>
      </section>
    </div>
  </main>;
}

function IronpathLanding({ onEnter }: { onEnter: () => void }) {
  return <section className="ironpath-entry" aria-label="Ironpath introduction">
    <div className="entry-orbit entry-orbit-one" aria-hidden="true"/>
    <div className="entry-orbit entry-orbit-two" aria-hidden="true"/>
    <header className="entry-header"><span className="entry-kicker"><i/> RuneScape 3 · Group Ironman</span></header>
    <div className="entry-main">
      <div className="entry-copy">
        <p className="eyebrow">Your group’s shared companion</p>
        <button className="entry-logo-button" onClick={onEnter} aria-label="Enter Ironpath"><img src="/ironpath-banner-transparent-v1.png" alt="Ironpath"/></button>
        <h1>Build the next chapter together.</h1>
        <p>Live group standings, shared planning, practical references, and helpful routines—made for the way Group Ironmen actually progress.</p>
        <div className="entry-actions"><button className="entry-primary" onClick={onEnter}>Enter Ironpath <ChevronRight size={18}/></button><span>No account required · Community-built</span></div>
      </div>
      <div className="entry-feature-stack" aria-label="Ironpath features"><article><Trophy size={17}/><div><strong>Group Dashboard</strong><span>Standings, activity, and shared history</span></div></article><article><CalendarCheck2 size={17}/><div><strong>Keep the rhythm</strong><span>Repeatables, runs, and practical routes</span></div></article><article><ListChecks size={17}/><div><strong>Make progress clear</strong><span>Resources shaped for Ironman accounts</span></div></article></div>
    </div>
    <footer className="entry-footer"><span>Concept created by Justjay btw · AI-assisted development</span><span>Unofficial · Not affiliated with Jagex</span></footer>
  </section>;
}

function ShopRunsView({ shared, setShared }:{ shared?:Record<string,boolean>; setShared:(value:Record<string,boolean>)=>void }) {
  const [completed, setCompleted] = useState<Record<string,boolean>>({});
  useEffect(() => { if (shared) setCompleted(shared); else try { setCompleted(JSON.parse(window.localStorage.getItem('ironpath-shop-runs') || '{}')); } catch { /* ignore */ } }, [shared]);
  function toggle(name:string) { setCompleted(current => { const next={...current,[name]:!current[name]}; if(shared) setShared(next); else window.localStorage.setItem('ironpath-shop-runs',JSON.stringify(next)); return next; }); }
  const done = shopRuns.filter(([name]) => completed[name]).length;
  return <section className="panel shop-runs-card"><div className="panel-heading"><div><p className="eyebrow">Ironman stock planner</p><h3>Shop Runs</h3><p>Mark a stop when it has been checked. Your group can use this as a simple shared circuit.</p></div><span className="route-progress">{done}/{shopRuns.length}</span></div><div className="shop-run-list">{shopRuns.map(([name,locations,stock,advice])=><article className={completed[name]?'hub-check-row done':'hub-check-row'} key={name}><button className="route-check" onClick={()=>toggle(name)} aria-label={`Mark ${name} ${completed[name]?'incomplete':'complete'}`}>{completed[name]&&<Check size={14}/>}</button><div><strong>{name}</strong><p><strong>Where:</strong> {locations}</p><p><strong>Key stock:</strong> {stock}</p><p>{advice}</p></div></article>)}</div></section>;
}

function Overview({ groupData, goTo, unsyncGroup }: { groupData:HiscoreResult|null; goTo:(view:string)=>void; unsyncGroup:()=>void }) {
  const connected = Boolean(groupData?.players.length);
  return <div className="content feature-page landing-page"><section className="panel landing-hero"><div><p className="date-line">RUNESCAPE 3 GROUP IRONMAN COMPANION</p><h1>Build your group’s next chapter.</h1><p>Ironpath brings together live group standings, shared routines, progression references and practical Ironman planning—without replacing the way your group plays.</p><div className="landing-actions"><button className="primary-button" onClick={()=>goTo('Dashboard')}><Trophy size={16}/>{connected?'Open your dashboard':'Look up your group'}</button><button className="secondary-button" onClick={()=>goTo('Progression Roadmap')}><ListChecks size={16}/>Explore the roadmap</button></div></div><aside className="landing-status"><CircleDot size={18}/><span>{connected?'Group connected':'Ready when you are'}</span><strong>{connected ? groupData!.group : 'Start with a group lookup'}</strong><small>{connected ? `${groupData!.mode} · ${groupData!.players.length} members` : 'Use Dashboard to connect an official Group Ironman roster.'}</small>{connected && <button className="unsync-group-button" onClick={unsyncGroup}>Unsync group</button>}</aside></section><section className="landing-section"><div className="landing-section-heading"><p className="eyebrow">What Ironpath helps with</p><h2>One home for the useful things.</h2></div><div className="landing-feature-grid"><article className="panel"><Trophy size={22}/><h3>Group Dashboard</h3><p>Refresh member totals, compare skill leaders, review public activity and keep a group drop archive.</p></article><article className="panel"><CalendarCheck2 size={22}/><h3>Repeatables</h3><p>Keep daily, weekly and monthly group habits visible without losing your own routine.</p></article><article className="panel"><ListChecks size={22}/><h3>Progression References</h3><p>Use the roadmap, training guidance, familiars and Invention notes whenever you need direction.</p></article><article className="panel"><Dice5 size={22}/><h3>Task Generator</h3><p>Pull a sensible Ironman objective when your group wants something productive to do next.</p></article></div></section><section className="landing-steps panel"><div><p className="eyebrow">Getting started</p><h2>Set up in a few steps.</h2></div><ol><li><span>01</span><div><strong>Look up your group</strong><p>Open Dashboard and enter the exact official Group Ironman name.</p></div></li><li><span>02</span><div><strong>Choose your character</strong><p>Select who you are on Dashboard to tailor level-aware resources.</p></div></li><li><span>03</span><div><strong>Plan and play</strong><p>Use the resources, repeatables and shared routes as your group needs them.</p></div></li></ol></section></div>;
}

function HiScoresView({ result, setResult, workspace, preferredMember, setPreferredMember }: { result: HiscoreResult | null; setResult: (value: HiscoreResult | null) => void; workspace:Workspace|null; preferredMember:string; setPreferredMember:(name:string)=>void }) {
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
  const [activityRefresh, setActivityRefresh] = useState(0);

  useEffect(() => {
    const saved = window.localStorage.getItem('ironpath-hiscore-group');
    if (!saved) return;
    try { const value = JSON.parse(saved); setGroup(value.group || ''); setSize(value.size || '4'); setCompetitive(Boolean(value.competitive)); } catch { /* ignore invalid local preference */ }
  }, []);

  useEffect(() => {
    if (!result) { setActivities([]); setActivityMembers([]); setActivityMember('all'); return; }
    setActivityMember(result.players.some(player => player.name === preferredMember) ? preferredMember : 'all');
    const query = result.players.map(player => `player=${encodeURIComponent(player.name)}`).join('&');
    setActivityLoading(true);
    fetch(`/api/activities?${query}${activityRefresh ? `&refresh=${activityRefresh}` : ''}`, { cache:'no-store' })
      .then(response => response.ok ? response.json() : { activities:[],members:[] })
      .then((data: { activities?:GroupActivity[];members?:ActivityMember[] }) => { setActivities(data.activities || []); setActivityMembers(data.members || []); })
      .catch(() => { setActivities([]); setActivityMembers([]); })
      .finally(() => setActivityLoading(false));
  }, [result,activityRefresh,preferredMember]);


  const visibleActivities = activityMember === 'all'
    ? activities.reduce<GroupActivity[]>((limited, activity) => limited.filter(item => item.player === activity.player).length < 5 ? [...limited, activity] : limited, [])
    : activities.filter(activity => activity.player === activityMember).slice(0,5);

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

  return <div className="content feature-page repeatables-tracker">
    <section className="feature-heading">
      <div><p className="date-line">LIVE FROM RUNESCAPE</p><h2>Group HiScores</h2><p>Look up your team, refresh every member, and compare progress in one place.</p></div>
      {result && <div className="status-chip"><CircleDot size={14} /> Refreshed {new Date(result.refreshedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>}
    </section>
    <form className="lookup-panel panel" onSubmit={refresh}>
      <label className="field group-field"><span>Group name</span><input value={group} onChange={event => setGroup(event.target.value)} placeholder="Enter exact group name" /></label>
      <label className="field"><span>Group size</span><select value={size} onChange={event => setSize(event.target.value)}><option value="2">2 members</option><option value="3">3 members</option><option value="4">4 members</option><option value="5">5 members</option></select></label>
      <label className="mode-toggle"><input type="checkbox" checked={competitive} onChange={event => setCompetitive(event.target.checked)} /><span><strong>Competitive</strong></span></label>
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
      {(() => { const selected=result.players.find(player=>player.name===preferredMember) || result.players[0]; const top=selected ? [...selected.skills].sort((a,b)=>b.xp-a.xp)[0] : undefined; return selected ? <section className="panel member-home-selector"><div><p className="eyebrow">Your character</p><h3>Personalize Ironpath</h3><p>Choose your group member to tailor suggestions, training levels and available familiars to you.</p></div><label className="field"><span>Viewing as</span><select value={selected.name} onChange={event=>setPreferredMember(event.target.value)}>{result.players.map(player=><option value={player.name} key={player.name}>{player.name}</option>)}</select></label><div className="personal-stat"><span>Total level</span><strong>{selected.overall?.level.toLocaleString() || '—'}</strong></div><div className="personal-stat"><span>Top skill</span><strong>{top ? `${top.name} ${top.level}` : '—'}</strong></div></section> : null; })()}
      <div className="dashboard-primary-sections">
      <section className="panel hiscore-table-panel">
        <div className="panel-heading"><div><h3>Member standings</h3></div><span className="source-note">Position ranks members by total XP within this group</span></div>
        <div className="hiscore-table"><div className="hiscore-row table-head"><span>Member</span><span>Total level</span><span>Total XP</span><span>Group position</span><span>Top skill</span></div>{[...result.players].sort((a,b)=>(b.overall?.xp||0)-(a.overall?.xp||0)).map((player, position) => {
          const top = [...player.skills].sort((a,b) => b.xp - a.xp)[0];
          const placement = position + 1;
          const expanded = expandedMember === player.name;
          const statistics = player.overall ? [player.overall, ...player.skills] : player.skills;
          return <section className={expanded ? 'score-entry expanded' : 'score-entry'} key={player.name}><button className="hiscore-row clickable" onClick={() => setExpandedMember(expanded ? null : player.name)} aria-expanded={expanded}><div className="score-member"><span>{player.name.slice(0,2).toUpperCase()}</span><strong>{player.name}</strong></div><strong>{player.overall?.level.toLocaleString() || '—'}</strong><span>{compactNumber(player.overall?.xp || 0)}</span><span className={`placement-badge placement-${Math.min(placement,4)}`} aria-label={`Group placement ${placement} of ${result.players.length}`}><Medal size={18}/><b>{placement}</b><small>of {result.players.length}</small></span><span className="top-skill-cell">{top ? <><img src={skillIconUrl(top.name)} alt="" onError={event => { event.currentTarget.style.display = 'none'; }} /><span>{top.name} {top.level}</span></> : 'Stats unavailable'}<ChevronRight size={14} /></span></button>{expanded && <div className="skill-drawer"><div className="skill-drawer-head"><div><p className="eyebrow">Individual statistics</p><h3>{player.name}</h3></div><span>{statistics.length} ranked skills</span></div><div className="skill-grid"><div className="skill-grid-head"><span>Skill</span><span>Level</span><span>XP</span><span>Rank</span></div>{statistics.map(skill => <div className="skill-stat-row" key={skill.name}><strong className="skill-name-cell"><img src={skillIconUrl(skill.name)} alt="" onError={event => { event.currentTarget.style.display = 'none'; }} />{skill.name}</strong><span>{skill.level.toLocaleString()}</span><span>{skill.xp.toLocaleString()}</span><span>{skill.rank > 0 ? `#${skill.rank.toLocaleString()}` : '—'}</span></div>)}</div></div>}</section>;
        })}</div>
      </section>
      <GroupDropLog group={result.group} players={result.players.map(player => player.name)} workspace={workspace} preferredMember={preferredMember} />
      <section className="panel activity-panel">
        <div className="panel-heading"><div><p className="eyebrow">Adventurer's Log</p><h3>See what your group has been up to</h3></div><a className="source-note source-link-inline" href="https://runescape.wiki/w/Application_programming_interface" target="_blank" rel="noreferrer">RuneMetrics API reference <ExternalLink size={12}/></a></div>
        <div className="activity-controls"><div className="activity-filter"><label><span>Showing activity for</span><select value={activityMember} onChange={event => setActivityMember(event.target.value)}><option value="all">All members ({activities.length})</option>{activityMembers.map(member => <option value={member.name} key={member.name}>{member.name} ({activities.filter(activity => activity.player === member.name).length})</option>)}</select></label><button className="secondary-button activity-refresh" onClick={() => setActivityRefresh(value => value + 1)} disabled={activityLoading}><RefreshCw className={activityLoading ? 'spin' : ''} size={14}/> Retry all logs</button></div><div className="activity-member-status">{activityMembers.map(member => <span className={member.stale ? 'stale' : member.available ? 'available' : 'unavailable'} key={member.name}><i/>{member.name}{(member.stale || !member.available) && <small>{member.reason}</small>}</span>)}</div></div>
        {activityLoading ? <div className="small-empty"><RefreshCw className="spin" size={22}/><h3>Gathering group milestones</h3><p>Checking every member's public RuneMetrics activity log. Temporary failures are retried automatically.</p></div> : visibleActivities.length ? <div className="activity-feed">{visibleActivities.map((activity,index) => <article key={`${activity.player}-${activity.timestamp}-${index}`}><div className="activity-avatar">{activity.player.slice(0,2).toUpperCase()}</div><div className="activity-copy"><div><strong>{activity.text}</strong><span>{activity.player}</span></div><p>{activity.details}</p></div><time dateTime={new Date(activity.timestamp).toISOString()}>{activity.date}</time></article>)}</div> : <div className="small-empty"><Clock3 size={22}/><h3>No public milestones found</h3><p>{activityMember === 'all' ? 'Members must set their RuneMetrics profile and online status to public for activities to appear.' : `No recent public activities were returned for ${activityMember}.`}</p></div>}
      </section>
      </div>
    </>}
  </div>;
}

type LoggedDrop = { item:string; quantity:number; player:string; date:string; timestamp:number; source:string };
function GroupDropLog({ group, players, workspace, preferredMember }:{ group:string; players:string[]; workspace:Workspace|null; preferredMember:string }) {
  const [member, setMember] = useState(preferredMember || 'all');
  const [search, setSearch] = useState('');
  const [dropEvents, setDropEvents] = useState<LoggedDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false); const [historyItem, setHistoryItem] = useState(''); const [historyQuantity, setHistoryQuantity] = useState('1'); const [historyPlayer, setHistoryPlayer] = useState(players[0] || ''); const [historyDate, setHistoryDate] = useState(new Date().toISOString().slice(0,10)); const [bulkHistory, setBulkHistory] = useState(''); const [historyMessage, setHistoryMessage] = useState(''); const [savingHistory, setSavingHistory] = useState(false); const [archiveRefresh, setArchiveRefresh] = useState(0);
  useEffect(() => { if (players.includes(preferredMember)) setMember(preferredMember); }, [preferredMember,players.join('|')]);
  useEffect(() => { const query = players.map(player => `player=${encodeURIComponent(player)}`).join('&'); setLoading(true); fetch(`/api/drops?group=${encodeURIComponent(group)}&${query}`,{cache:'no-store'}).then(response => response.ok ? response.json() : { events:[] }).then((data:{events?:LoggedDrop[]}) => setDropEvents(data.events || [])).catch(() => setDropEvents([])).finally(() => setLoading(false)); },[group,players.join('|'),archiveRefresh]);
  const visible = (member === 'all' ? dropEvents : dropEvents.filter(drop => drop.player === member)).filter(drop => `${drop.item} ${drop.player}`.toLowerCase().includes(search.toLowerCase()));
  const rows = Object.values(visible.reduce<Record<string,{ item:string; quantity:number; events:LoggedDrop[] }>>((groups, drop) => { const key = drop.item.toLocaleLowerCase(); const group = groups[key] || { item:drop.item,quantity:0,events:[] }; group.quantity += drop.quantity; group.events.push(drop); groups[key] = group; return groups; }, {})).sort((a,b) => Math.max(...b.events.map(event => event.timestamp)) - Math.max(...a.events.map(event => event.timestamp)));
  const previewRows = [['Dragon hatchet',1,players[0] || 'Group member'],['Armadyl crossbow',1,players[1] || players[0] || 'Group member'],['Ranarr seed',6,players[0] || 'Group member'],['Moss golem pet',1,players[2] || players[0] || 'Group member']].map(([item,quantity,player], index) => ({ item:item as string,quantity:quantity as number,events:[{ item:item as string,quantity:quantity as number,player:player as string,date:`Example · ${4-index} days ago`,timestamp:Date.now()-(index+1)*86_400_000,source:'Example preview' }] }));
  const showingPreview = !loading && rows.length === 0 && member === 'all';
  const displayRows = showingPreview ? previewRows : rows;
  async function saveHistory(event:FormEvent) { event.preventDefault(); if (!workspace) { setHistoryMessage('Create or join your Group Hub workspace before adding shared archive history.'); return; } const events=[...(historyItem.trim() ? [{ item:historyItem.trim(),quantity:Number(historyQuantity) || 1,player:historyPlayer,date:historyDate }] : []),...bulkHistory.split('\n').map(line => line.trim()).filter(Boolean).map(line => { const [date,player,item,quantity]=line.split(',').map(value => value.trim()); return { date,player,item,quantity:Number(quantity) || 1 }; })]; if (!events.length) { setHistoryMessage('Add an item above or paste one or more CSV lines.'); return; } setSavingHistory(true); setHistoryMessage(''); try { const response=await fetch('/api/drops',{method:'POST',headers:{'content-type':'application/json','x-ironpath-workspace':workspace.id,'x-ironpath-token':workspace.token},body:JSON.stringify({group,events})}); const result=await response.json() as {added?:number;error?:string}; if (!response.ok) throw new Error(result.error || 'Could not save archive history.'); setHistoryMessage(`Added ${result.added || 0} historical entr${result.added === 1 ? 'y' : 'ies'} to the archive.`); setHistoryItem(''); setBulkHistory(''); setArchiveRefresh(value=>value+1); } catch(reason) { setHistoryMessage(reason instanceof Error ? reason.message : 'Could not save archive history.'); } finally { setSavingHistory(false); } }
  return <section className="panel drop-log-panel"><div className="panel-heading"><div><p className="eyebrow">Group drop archive</p><h3>{group} item history</h3></div><span className="source-note">New public RuneMetrics drop events are retained for this group.</span></div><div className="drop-log-controls"><label><span>Show drops for</span><select value={member} onChange={event => setMember(event.target.value)}><option value="all">All members</option>{players.map(player => <option key={player}>{player}</option>)}</select></label><label><span>Search archive</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Item or member" /></label><button className="secondary-button archive-history-button" onClick={()=>setHistoryOpen(value=>!value)}>{historyOpen ? 'Close history entry' : 'Add past drops'}</button><span>{loading ? 'Syncing archive…' : showingPreview ? 'Example preview' : `${rows.length} item ${rows.length === 1 ? 'type' : 'types'} archived`}</span></div>{historyOpen && <form className="archive-history-form" onSubmit={saveHistory}><div><p className="eyebrow">Historical backfill</p><strong>Add one entry or paste multiple entries from your group’s past.</strong><small>Bulk format: <code>YYYY-MM-DD, Player name, Item name, Quantity</code> — one entry per line.</small></div><label className="field"><span>Item</span><input value={historyItem} onChange={event=>setHistoryItem(event.target.value)} placeholder="Dragon hatchet" /></label><label className="field"><span>Member</span><select value={historyPlayer} onChange={event=>setHistoryPlayer(event.target.value)}>{players.map(player=><option key={player}>{player}</option>)}</select></label><label className="field"><span>Date</span><input type="date" value={historyDate} onChange={event=>setHistoryDate(event.target.value)} /></label><label className="field"><span>Quantity</span><input type="number" min="1" value={historyQuantity} onChange={event=>setHistoryQuantity(event.target.value)} /></label><label className="field archive-bulk"><span>Bulk historical entries</span><textarea value={bulkHistory} onChange={event=>setBulkHistory(event.target.value)} placeholder={'2026-06-03, Justjay btw, Dragon hatchet, 1\n2026-06-07, Xtrmie, Ranarr seed, 6'} /></label><button className="primary-button" disabled={savingHistory}>{savingHistory ? 'Saving…' : 'Save to archive'}</button>{historyMessage && <p className="archive-history-message">{historyMessage}</p>}</form>}{showingPreview && <p className="drop-preview-note">Example items only — these are shown to preview the layout and are replaced automatically by real RuneMetrics drop events or historical entries you add.</p>}{displayRows.length ? <div className="drop-table"><div className="drop-table-head"><span>Item</span><span>Quantity</span><span>Found by</span><span>Latest entry</span></div>{displayRows.map(row => { const newest = [...row.events].sort((a,b) => b.timestamp-a.timestamp)[0]; return <article key={row.item}><div className="drop-item"><img src={`https://runescape.wiki/Special:FilePath/${encodeURIComponent(row.item)}.png`} alt="" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} /><strong>{row.item}</strong></div><strong>{row.quantity.toLocaleString()}</strong><span>{[...new Set(row.events.map(event => event.player))].join(', ')}</span><time dateTime={newest.date.startsWith('Example') ? undefined : new Date(newest.timestamp).toISOString()}>{newest.date}</time></article>; })}</div> : <div className="small-empty drop-empty"><Gem size={22}/><h3>No archived item drops yet</h3><p>Ironpath will retain verified item events from this group as they are reported by RuneMetrics.</p></div>}<p className="guide-credit"><BookOpen size={14}/> Historical entries are protected by your Group Hub workspace key. New public RuneMetrics entries continue to be saved automatically.</p></section>;
}

function TaskGenerator({ groupData, preferredMember }:{ groupData:HiscoreResult|null; preferredMember:string }) {
  const [category,setCategory] = useState('All');
  const [effort,setEffort] = useState('All');
  const [scope,setScope] = useState('All');
  const [member,setMember] = useState('Any member');
  const [current,setCurrent] = useState<{task:IronTask;assignee:string}|null>(null);
  const [recent,setRecent] = useState<string[]>([]);
  const [completed,setCompleted] = useState(0);
  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem('ironpath-random-recent') || '[]')); setCompleted(Number(localStorage.getItem('ironpath-random-completed') || 0)); } catch { /* ignore local history */ } },[]);
  useEffect(() => { if (preferredMember && groupData?.players.some(player => player.name === preferredMember)) setMember(preferredMember); }, [groupData,preferredMember]);
  const categories = ['All',...new Set(ironTasks.map(task => task.category))];
  const efforts = ['All','Quick','Focused','Long'];
  const skillLevel = (player:HiscorePlayer,skill:string) => player.skills.find(item => item.name.toLowerCase() === skill.toLowerCase())?.level || 0;
  function candidates() {
    const chosen = groupData?.players.find(player => player.name === member);
    return ironTasks.filter(task => {
      if (category !== 'All' && task.category !== category) return false;
      if (effort !== 'All' && task.effort !== effort) return false;
      if (scope !== 'All' && task.scope !== scope) return false;
      if (!task.skill || !task.minLevel || !groupData) return true;
      return chosen ? skillLevel(chosen,task.skill) >= task.minLevel : groupData.players.some(player => skillLevel(player,task.skill!) >= task.minLevel!);
    });
  }
  function generate() {
    const pool = candidates();
    const fresh = pool.filter(task => !recent.includes(task.id));
    const options = fresh.length ? fresh : pool;
    if (!options.length) { setCurrent(null); return; }
    const task = options[Math.floor(Math.random()*options.length)];
    let assignee = task.scope === 'Group' ? groupData?.group || 'The group' : member;
    if (task.scope === 'Solo' && member === 'Any member') {
      const eligible = groupData?.players.filter(player => !task.skill || !task.minLevel || skillLevel(player,task.skill) >= task.minLevel) || [];
      assignee = eligible.length ? eligible[Math.floor(Math.random()*eligible.length)].name : 'Any member';
    }
    const next = [task.id,...recent.filter(id => id !== task.id)].slice(0,8);
    setRecent(next); setCurrent({task,assignee}); localStorage.setItem('ironpath-random-recent',JSON.stringify(next));
  }
  function finish() { const next=completed+1; setCompleted(next); localStorage.setItem('ironpath-random-completed',String(next)); generate(); }
  const available = candidates().length;
  return <div className="content feature-page task-generator-page">
    <section className="feature-heading"><div><p className="date-line">IRONMAN TASK GENERATOR</p><h2>What should we do next?</h2><p>Roll a practical RS3 Ironman goal, tuned to your available time and the group roster you looked up.</p></div><div className="status-chip"><Sparkles size={14}/> {completed} tasks completed</div></section>
    <section className="panel generator-controls">
      <label className="field"><span>Category</span><select value={category} onChange={event=>setCategory(event.target.value)}>{categories.map(value=><option key={value}>{value}</option>)}</select></label>
      <label className="field"><span>Time commitment</span><select value={effort} onChange={event=>setEffort(event.target.value)}>{efforts.map(value=><option key={value}>{value}</option>)}</select></label>
      <label className="field"><span>Task type</span><select value={scope} onChange={event=>setScope(event.target.value)}><option>All</option><option>Solo</option><option>Group</option></select></label>
      <label className="field"><span>Assign to</span><select value={member} onChange={event=>setMember(event.target.value)}><option>Any member</option>{groupData?.players.map(player=><option key={player.name}>{player.name}</option>)}</select></label>
      <button className="primary-button generator-button" onClick={generate}><Dice5 size={18}/> Generate task</button>
    </section>
    {!groupData && <div className="generator-note"><CircleDot size={14}/><span>Look up your group in HiScores to filter skill requirements and assign suitable members automatically. General tasks still work now.</span></div>}
    <section className={current ? 'panel generated-task has-task' : 'panel generated-task'}>
      {current ? <><div className="generated-task-top"><span className="task-category">{current.task.category}</span><span>{current.task.effort} · {current.task.scope}</span></div><div className="task-die"><Dice5 size={34}/></div><p className="eyebrow">Assigned to {current.assignee}</p><h3>{current.task.title}</h3><p>{current.task.description}</p>{current.task.skill && <div className="task-requirement"><strong>{current.task.skill}</strong><span>Level {current.task.minLevel}+ recommended</span></div>}<div className="generated-actions"><button className="primary-button" onClick={finish}><Check size={16}/> Mark complete</button><button className="secondary-button" onClick={generate}><RefreshCw size={15}/> Try another</button><a className="text-button" href={current.task.link} target="_blank" rel="noreferrer">Open Wiki guidance <ExternalLink size={13}/></a></div></> : <><div className="task-die"><Dice5 size={34}/></div><p className="eyebrow">{available} suitable tasks in this roll</p><h3>Ready when you are</h3><p>Choose any filters you care about, then generate a task. Recently shown tasks are held back so the results stay varied.</p><button className="primary-button" onClick={generate}><Dice5 size={18}/> Give me a task</button></>}
    </section>
    <section className="generator-principles"><article><Shield size={20}/><strong>Ironman-first</strong><p>Tasks emphasize self-sufficient supplies, unlocks and account progress.</p></article><article><Users size={20}/><strong>Group-aware</strong><p>Skill-gated rolls can be assigned to a currently suitable team member.</p></article><article><Clock3 size={20}/><strong>Reasonable scope</strong><p>Quick, focused and long tasks avoid absurd grinds or fragile drop-rate promises.</p></article></section>
  </div>;
}

function ConnectGroup({ goTo }: { goTo: (view: string) => void }) {
  return <div className="content feature-page"><section className="connect-card panel"><div className="journey-emblem"><Shield size={24} /></div><p className="eyebrow">First-time setup</p><h2>Connect your Group Ironman team</h2><p>Look up your official RuneScape group once. Ironpath will use that roster and its live totals throughout the entire app.</p><button className="primary-button" onClick={() => goTo('Dashboard')}><Search size={15} /> Look up my group</button></section></div>;
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

function EfficientProgressView({ groupData, preferredMember, shared, setShared, fixedView }: { groupData: HiscoreResult | null; preferredMember:string; shared?:Record<string,boolean>; setShared:(value:Record<string,boolean>)=>void; fixedView?:'Roadmap'|'Training'|'Familiars' }) {
  const [view, setView] = useState<'Roadmap' | 'Training' | 'Familiars'>(fixedView || 'Roadmap');
  const [sectionId, setSectionId] = useState(progressData.progression[0].id);
  const [skill, setSkill] = useState('agility');
  const [member, setMember] = useState(groupData?.players[0]?.name || '');
  const [query, setQuery] = useState('');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [questPlayer, setQuestPlayer] = useState(groupData?.players[0]?.name || '');
  const [questName, setQuestName] = useState('');
  const [syncingQuests, setSyncingQuests] = useState(false);
  const [questSyncMessage, setQuestSyncMessage] = useState('');
  useEffect(() => { if (shared) setCompleted(shared); else try { setCompleted(JSON.parse(window.localStorage.getItem('ironpath-efficient-progress') || '{}')); } catch { /* ignore */ } }, [shared]);
  useEffect(() => { if (fixedView) setView(fixedView); }, [fixedView]);
  useEffect(() => { if (preferredMember && groupData?.players.some(player => player.name === preferredMember)) setMember(preferredMember); }, [groupData,preferredMember]);
  useEffect(() => { if (preferredMember && groupData?.players.some(player => player.name === preferredMember)) setQuestPlayer(preferredMember); else if (groupData?.players.length && !groupData.players.some(player => player.name === questPlayer)) setQuestPlayer(groupData.players[0].name); }, [groupData, preferredMember, questPlayer]);
  const allRows = progressData.progression.flatMap(section => section.rows);
  const completedCount = allRows.filter(row => completed[row.id]).length;
  const activeSection = progressData.progression.find(section => section.id === sectionId) || progressData.progression[0];
  const visibleRows = activeSection.rows.filter(row => `${row.title} ${'notes' in row ? row.notes || '' : ''}`.toLowerCase().includes(query.toLowerCase()));
  const skills = Object.keys(progressData.training).sort();
  const selectedPlayer = groupData?.players.find(player => player.name === member);
  const currentLevel = selectedPlayer?.skills.find(value => value.name.toLowerCase() === skill)?.level;
  const methods = progressData.training[skill as keyof typeof progressData.training];
  function toggle(id: string) { setCompleted(current => { const next = { ...current, [id]: !current[id] }; if (shared) setShared(next); else window.localStorage.setItem('ironpath-efficient-progress', JSON.stringify(next)); return next; }); }
  function normalQuestTitle(value:string) { return value.normalize('NFKD').replace(/[’‘`]/gu, "'").toLowerCase().replace(/[^a-z0-9]+/gu, ' ').trim(); }
  async function syncQuests() {
    const player = (groupData ? questPlayer : questName).trim();
    if (!player) { setQuestSyncMessage('Choose a group member or enter a RuneScape name first.'); return; }
    setSyncingQuests(true); setQuestSyncMessage('');
    try {
      const response = await fetch(`/api/quests?player=${encodeURIComponent(player)}`);
      const result = await response.json() as QuestSyncResult & { error?:string };
      if (!response.ok) throw new Error(result.error || 'Quest sync could not be completed.');
      const completedQuestNames = new Set(result.quests.filter(quest => quest.completed).map(quest => normalQuestTitle(quest.title)));
      const matched = allRows.filter(row => row.type === 'quest' && 'questName' in row && row.questName && completedQuestNames.has(normalQuestTitle(row.questName)));
      setCompleted(current => {
        const next = { ...current };
        matched.forEach(row => { next[row.id] = true; });
        if (shared) setShared(next); else window.localStorage.setItem('ironpath-efficient-progress', JSON.stringify(next));
        return next;
      });
      setQuestSyncMessage(`${result.player}: marked ${matched.length} completed roadmap quest${matched.length === 1 ? '' : 's'}. Existing checklist choices were kept.`);
    } catch (error) { setQuestSyncMessage(error instanceof Error ? error.message : 'Quest sync could not be completed.'); }
    finally { setSyncingQuests(false); }
  }
  return <div className="content feature-page efficient-page">
    <section className="feature-heading">
      <div><p className="date-line">IRONMAN PROGRESSION</p><h2>Efficient Progress</h2><p>Follow the ordered Ironman pathway or find the best training method for your current levels.</p></div>
      <a className="source-link" href={progressData.source.wiki} target="_blank" rel="noreferrer">View Wiki source <ExternalLink size={13}/></a>
    </section>
    {view === 'Roadmap' && <section className="panel progress-card roadmap-progress-card"><div className="ring" style={{ '--value': `${(completedCount / allRows.length) * 360}deg` } as React.CSSProperties}><span>{Math.round((completedCount / allRows.length) * 100)}%</span></div><div><p className="eyebrow">Roadmap checklist</p><h3>{completedCount} of {allRows.length} complete</h3><p>Track progress across every planned roadmap step for this group.</p></div></section>}
    {!fixedView && <section className="efficient-overview"><div className="guide-tabs"><button className={view === 'Roadmap' ? 'active' : ''} onClick={() => setView('Roadmap')}><ListChecks size={16}/><span>Progression roadmap</span></button><button className={view === 'Training' ? 'active' : ''} onClick={() => setView('Training')}><Dumbbell size={16}/><span>Skill training</span></button><button className={view === 'Familiars' ? 'active' : ''} onClick={() => setView('Familiars')}><Users size={16}/><span>Familiars</span></button></div></section>}
    {view === 'Roadmap' ? <div className="roadmap-layout">
      <aside className="phase-list panel"><p className="eyebrow">Route phases</p>{progressData.progression.map(section => { const done = section.rows.filter(row => completed[row.id]).length; return <button key={section.id} className={section.id === activeSection.id ? 'active' : ''} onClick={() => setSectionId(section.id)}><span><strong>{section.title}</strong><small>{section.rows.length} steps</small></span><em>{done}/{section.rows.length}</em></button>; })}</aside>
      <section className="panel route-panel"><div className="route-toolbar"><div><p className="eyebrow">Current phase</p><h3>{activeSection.title}</h3></div><label className="route-search"><Search size={14}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filter this phase" /></label></div>
        <div className="quest-sync"><div><p className="eyebrow">Quest sync</p><strong>Update this roadmap from RuneMetrics</strong><small>Verified completed quests are added to the checklist. Manual progress remains untouched.</small></div><div className="quest-sync-actions">{groupData ? <select value={questPlayer} onChange={event => setQuestPlayer(event.target.value)} aria-label="Choose a group member to sync">{groupData.players.map(player => <option key={player.name}>{player.name}</option>)}</select> : <input value={questName} onChange={event => setQuestName(event.target.value)} placeholder="RuneScape character name" aria-label="RuneScape character name" />}<button className="secondary-button" onClick={syncQuests} disabled={syncingQuests}><RefreshCw size={14} className={syncingQuests ? 'spin' : ''}/>{syncingQuests ? 'Syncing…' : 'Sync quests'}</button></div>{questSyncMessage && <p className={questSyncMessage.includes('marked') ? 'quest-sync-message success' : 'quest-sync-message'}>{questSyncMessage}</p>}</div>
        <div className="route-list">{visibleRows.map((row, index) => <article className={completed[row.id] ? 'route-row done' : 'route-row'} key={row.id}><button className="route-check" onClick={() => toggle(row.id)} aria-label={`Mark ${row.title} ${completed[row.id] ? 'incomplete' : 'complete'}`}>{completed[row.id] && <Check size={14}/>}</button><span className="route-number">{String(index + 1).padStart(2, '0')}</span><div><strong>{row.title}</strong>{'notes' in row && row.notes && <p>{row.notes}</p>}</div><span className="route-type">{row.type}</span>{row.type === 'quest' && 'questName' in row && row.questName ? <a href={`https://runescape.wiki/w/${encodeURIComponent(row.questName.replaceAll(' ', '_'))}/Quick_guide`} target="_blank" rel="noreferrer" aria-label={`Open ${row.title} quick guide`}><ExternalLink size={14}/></a> : <span/>}</article>)}</div>
      </section>
    </div> : view === 'Training' ? <section className="training-layout">
      <div className="panel training-controls"><div><p className="eyebrow">Training lookup</p><h3>Choose a skill</h3></div><label className="field"><span>Skill</span><select value={skill} onChange={event => setSkill(event.target.value)}>{skills.map(value => <option value={value} key={value}>{titleCase(value)}</option>)}</select></label>{groupData && <label className="field"><span>Use member level</span><select value={member} onChange={event => setMember(event.target.value)}>{groupData.players.map(player => <option key={player.name}>{player.name}</option>)}</select></label>}<div className="level-summary" aria-label={`Current ${titleCase(skill)} level`}><span>Current level</span><strong>{currentLevel ?? '—'}</strong><small>{selectedPlayer?.name || 'Choose a member'}</small></div></div>
      <div className="method-grid">{methods.map((method, index) => { const current = currentLevel !== undefined && currentLevel >= method.start && currentLevel <= method.end; return <article className={current ? 'panel method-card current' : 'panel method-card'} key={`${skill}-${method.start}-${method.end}-${index}`}><div><span className="level-range">Levels {method.start}–{method.end}</span>{current && <span className="current-tag">Current</span>}</div><p>{method.desc}</p>{method.link && <a href={method.link} target="_blank" rel="noreferrer">RuneScape Wiki <ExternalLink size={12}/></a>}</article>; })}</div>
    </section> : <EfficientFamiliarsView player={selectedPlayer} />}
    <p className="guide-credit"><BookOpen size={14}/> Progression and training data adapted from the <a href={progressData.source.wiki} target="_blank" rel="noreferrer">RuneScape Wiki source</a>. Guide data retrieved {progressData.source.retrieved}.</p>
  </div>;
}

function FarmRunsView({ player, shared, setShared }:{ player?:HiscorePlayer; shared?:Record<string,boolean>; setShared:(value:Record<string,boolean>)=>void }) {
  const [run, setRun] = useState<'Herb'|'Tree'|'Fruit tree'>('Herb');
  const [completed, setCompleted] = useState<Record<string,boolean>>({});
  useEffect(() => { if (shared) setCompleted(shared); else try { setCompleted(JSON.parse(window.localStorage.getItem('ironpath-farm-runs') || '{}')); } catch { /* ignore */ } }, [shared]);
  const farming = player?.skills.find(skill => skill.name === 'Farming')?.level || 1;
  const bestCrop = (crops:readonly (readonly [number,string])[]) => [...crops].reverse().find(([level]) => farming >= level) || crops[0];
  const plans = {
    Herb: {
      crop:bestCrop(herbCrops), cadence:'Every 80 minutes', note:'Use this for a steady Ironman Herblore supply. Start with the longest or hardest-to-reach patch, then work toward free teleports.',
      steps:[['Trollheim','Fastest travel: Trollheim Farm Teleport.'],['Falador','Fastest travel: Explorer’s ring cabbage-port.'],['Morytania','Fastest travel: Modified farmer’s hat teleport.'],['Catherby','Fastest travel: Modified botanist’s mask teleport.'],['Ardougne','Fastest travel: Manor Farm teleport or Ardougne cloak.'],['Crwys, Prifddinas','Fastest travel: Crystal teleport seed to Crwys.'],['Wilderness','Fastest travel: Wilderness sword herb-patch teleport.']],
    },
    Tree: {
      crop:bestCrop(treeCrops), cadence:'Check once per growth cycle', note:'Prepare saplings before leaving the bank. Tree runs are best used for large Farming experience rather than Herblore supplies.',
      steps:[['Varrock Palace','Fastest travel: Grand Exchange spirit tree, then run south-east.'],['Falador Park','Fastest travel: Ring of wealth teleport to Falador Park.'],['Taverley','Fastest travel: Redirected house teleport to Taverley.'],['Tree Gnome Stronghold','Fastest travel: Spirit tree to the Stronghold.'],['Tree Gnome Village','Fastest travel: Spirit tree to Tree Gnome Village, then Elkoy’s guidance.'],['Prifddinas','Fastest travel: Crystal teleport seed to the city.']],
    },
    'Fruit tree': {
      crop:bestCrop(fruitCrops), cadence:'Check once per growth cycle', note:'Fruit trees provide strong Farming experience and renewable produce. Keep the fruit instead of paying with it whenever it is useful to your group.',
      steps:[['Tree Gnome Stronghold','Fastest travel: Spirit tree to the Stronghold.'],['Catherby','Fastest travel: Catherby Teleport (Lunar spellbook).'],['Tree Gnome Village','Fastest travel: Spirit tree, then Elkoy’s guidance.'],['Brimhaven','Fastest travel: Brimhaven house teleport.'],['Lletya','Fastest travel: Crystal teleport seed to Lletya.'],['Herblore Habitat','Fastest travel: Juju teleport spiritbag.'],['Meilyr, Prifddinas','Fastest travel: Crystal teleport seed to Meilyr.'],["Dalia's Tree Nursery",'Fastest travel: Wendlewick lodestone, then run south.']],
    },
  } as const;
  const plan = plans[run];
  function toggle(place:string) { const key=`${run}:${place}`; setCompleted(current => { const next={...current,[key]:!current[key]}; if (shared) setShared(next); else window.localStorage.setItem('ironpath-farm-runs',JSON.stringify(next)); return next; }); }
  function clearCurrentRun() { setCompleted(current => { const next=Object.fromEntries(Object.entries(current).filter(([key])=>!key.startsWith(`${run}:`))); if (shared) setShared(next); else window.localStorage.setItem('ironpath-farm-runs',JSON.stringify(next)); return next; }); }
  return <section className="farm-run-layout"><div className="farm-run-intro panel"><div><p className="eyebrow">Farming for Herblore</p><h3>Farming Routes</h3><p>Route order, transport options and the highest crop currently available to {player?.name || 'your selected member'}.</p></div><div className="farm-crop"><span>Recommended crop</span><strong>{plan.crop[1]}</strong><small>Requires {plan.crop[0]} Farming · currently {farming}</small></div></div><div className="farm-tabs">{(['Herb','Tree','Fruit tree'] as const).map(value => <button className={run === value ? 'active' : ''} onClick={() => setRun(value)} key={value}><span>{value} run</span><small>{value === 'Herb' ? 'Herblore supplies' : 'Farming XP'}</small></button>)}</div><section className="panel farm-route"><div className="farm-route-head"><div><p className="eyebrow">Recommended order</p><h3>{run} run</h3></div><div className="farm-route-actions"><span>{plan.cadence}</span><button className="text-button clear-route-button" onClick={clearCurrentRun}>Clear {run.toLowerCase()} checks</button></div></div><p className="farm-route-note">{plan.note}</p><ol>{plan.steps.map(([place,travel], index) => { const done=Boolean(completed[`${run}:${place}`]); return <li className={done ? 'done' : ''} key={place}><button className="route-check" onClick={() => toggle(place)} aria-label={`Mark ${place} ${done ? 'incomplete' : 'complete'}`}>{done && <Check size={14}/>}</button><span>{String(index + 1).padStart(2,'0')}</span><div><strong>{place}</strong><p>{travel}</p></div></li>; })}</ol></section><p className="guide-credit"><Leaf size={14}/> Route details based on the RuneScape Wiki’s <a href="https://runescape.wiki/w/All_farming_patches" target="_blank" rel="noreferrer">farming patch locations</a>, <a href="https://runescape.wiki/w/Herb_patch" target="_blank" rel="noreferrer">herb patch guide</a>, and <a href="https://runescape.wiki/w/Fruit_Tree_Patch" target="_blank" rel="noreferrer">fruit tree patch guide</a>.</p></section>;
}

function EfficientFamiliarsView({ player }:{ player?:HiscorePlayer }) {
  const level = player?.skills.find(skill => skill.name === 'Summoning')?.level || 1;
  const [familiars, setFamiliars] = useState<FamiliarReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { fetch('/api/familiars').then(async response => { const result = await response.json() as { familiars?:FamiliarReference[]; error?:string }; if (!response.ok) throw new Error(result.error || 'The familiar list could not be loaded.'); setFamiliars(result.familiars || []); }).catch(reason => setError(reason instanceof Error ? reason.message : 'The familiar list could not be loaded.')).finally(() => setLoading(false)); }, []);
  const available = familiars.filter(familiar => familiar.level <= level);
  const charmTone = (charm:string='') => ['crimson','blue','green','gold'].find(value => charm.toLowerCase().includes(value)) || 'neutral';
  return <section className="familiar-layout"><section className="panel familiar-intro"><div><p className="eyebrow">Summoning reference</p><h3>Available familiars</h3><p>Every familiar currently usable by this member, with its pouch materials and practical effects.</p></div><div className="familiar-level"><span>{player?.name || 'Selected member'}</span><strong>{level}</strong><small>Summoning · {loading ? 'checking familiar list…' : `${available.length} familiar${available.length === 1 ? '' : 's'} available`}</small></div></section>{loading ? <div className="panel small-empty"><RefreshCw className="spin" size={24}/><h3>Loading familiar catalogue</h3><p>Checking the current RuneScape Wiki familiar list.</p></div> : error ? <div className="error-banner">{error}</div> : available.length ? <div className="familiar-grid">{available.map(familiar => <article className="panel familiar-card unlocked" key={`${familiar.level}-${familiar.name}`}><div className="familiar-card-head"><span>{familiar.boost ? `Boost · ${familiar.boost}` : 'Summoning familiar'}</span><strong>Level {familiar.level}</strong></div><h3>{familiar.name}</h3><p>{familiar.ability || 'Combat familiar with its listed special move.'}</p><div className="familiar-materials" aria-label={`${familiar.name} pouch ingredients`}><span className={`charm-chip ${charmTone(familiar.charm)}`}>{familiar.charm || 'Wiki recipe unavailable'}</span>{familiar.charm && <><span>{familiar.shards || '—'} shards</span><span>{familiar.tertiary || 'Tertiary item unavailable'}</span><span>1 pouch</span></>}</div>{familiar.special && <small className="familiar-special">Special: {familiar.special}</small>}<em>Available to this member</em></article>)}</div> : <div className="panel small-empty"><Users size={24}/><h3>No familiars unlocked yet</h3><p>Train Summoning a little further, then return to see every familiar available at the selected level.</p></div>}<p className="guide-credit"><Users size={14}/> Familiar and pouch data comes from the live <a href="https://runescape.wiki/w/Summoning_familiars" target="_blank" rel="noreferrer">RuneScape Wiki familiar catalogue</a> and is refreshed periodically.</p></section>;
}

function GeneralInformationView() {
  const powders = [
    ['Powder of protection','Use while learning bosses or on dangerous Slayer tasks when you are relying on Protect/Deflect prayers. It raises their protection to 60% for 30 minutes; it does not stack with an amulet of souls.'],
    ['Powder of burials','Use for a dedicated bone-burying Prayer session, especially when banking is the bottleneck. It gives an extra 250% Prayer XP from burying bones for 30 minutes (3.5× total XP).'],
    ['Powder of penance','Bring this when damage taken is draining too much Prayer, such as a long combat task with sustained incoming hits. It returns Prayer equal to 2.5% of damage received.'],
    ['Powder of item protection','Activate before a risky Wilderness or dangerous death where you are using Protect Item. It protects one extra item, up to five protected items total.'],
    ['Powder of pulverising','Use at the Ectofuntus when processing a large inventory of bones. It automatically grinds every bone in your inventory, removing the manual grinding step.'],
    ['Powder of defence','Use only when the +2 Defence boost from Thick Skin, Rock Skin, or Steel Skin will make a meaningful difference. It is a light early-game defensive layer, not a PvM replacement.'],
  ] as const;
  const incense = [
    ['Ranarr incense','Light this for prayer-heavy bossing or Slayer when every Prayer bonus matters. Each potency gives +1 Prayer bonus, reaching +4 at potency 4.'],
    ['Marrentill incense','Use for poison-heavy encounters or travel routes. Each potency reduces poison damage by 12.5%, reaching 50% at potency 4.'],
    ['Tarromin incense','Use during ash gathering or Firemaking training when you want the ashes without constant banking. Each potency adds a 25% auto-bank chance, reaching 100% at potency 4.'],
    ['Guam incense','Use while chopping normal trees for basic logs. Each potency gives a 10% chance for an extra log, reaching 40% at potency 4.'],
  ] as const;
  const consumables = [
    ['Supercompost and ultracompost','Use on valuable herb, tree, and fruit-tree patches before every run. They protect crops and improve the return from seeds you cannot simply replace through the Grand Exchange.'],
    ['Juju farming potion','Reserve for high-value herb runs when seed supply is limited. Its herb-harvest yield benefit gives your group more value from each planted seed.'],
    ['Overloads','Use for planned bossing rather than casual combat. They repeatedly refresh boosted combat levels, freeing you from re-potting during a long encounter.'],
    ['Weapon poison','Use against targets that survive long enough for repeated hits. It is particularly worthwhile for Slayer and bosses, but less useful for monsters that die immediately.'],
    ['Vulnerability bombs','Use at the start of a group PvM phase when the target can be affected. One throw applies vulnerability in an area, letting the whole group benefit from increased damage.'],
    ['Adrenaline and replenishment potions','Save for encounters where a specific ability rotation, phase skip, or defensive sequence matters. They are high-value tools, not routine potions to use on every task.'],
  ] as const;
  return <div className="content feature-page general-info-page"><section className="feature-heading"><div><p className="date-line">REFERENCE LIBRARY</p><h2>Good general information</h2><p>Practical uses, breakpoints, and armour effects for a self-sufficient Ironman account.</p></div></section><InfoSection title="Het’s Oasis powders" eyebrow="When to bring them" items={powders}/><InfoSection title="Incense sticks" eyebrow="When to light them" items={incense} note="Each effect begins at potency 1 and gains a potency level every 10 minutes, up to potency 4. You can maintain one effect at any Firemaking level, two at 71, and three at 95."/><InfoSection title="Other useful consumables" eyebrow="When they earn a slot" items={consumables}/><ArmourEffectsSection/><p className="guide-credit"><BookOpen size={14}/> References: <a href="https://runescape.wiki/w/Template%3APrayer_powder_details" target="_blank" rel="noreferrer">Het’s Oasis powders</a>, <a href="https://runescape.wiki/w/Fire_making_outfit" target="_blank" rel="noreferrer">incense effects</a>, <a href="https://runescape.wiki/w/Barrows_equipment" target="_blank" rel="noreferrer">Barrows equipment</a>, <a href="https://runescape.wiki/w/Crystal_equipment" target="_blank" rel="noreferrer">crystal equipment</a>, and <a href="https://runescape.wiki/w/Masterwork_melee_equipment" target="_blank" rel="noreferrer">masterwork armour</a>.</p></div>;
}

function InfoSection({ title, eyebrow, items, note }:{ title:string; eyebrow:string; items:readonly (readonly [string,string])[]; note?:string }) {
  return <section className="general-info-section panel"><div className="panel-heading"><div><p className="eyebrow">{eyebrow}</p><h3>{title}</h3></div></div>{note && <p className="general-section-note">{note}</p>}<div className="general-info-grid">{items.map(([name, detail]) => <article key={name}><span className="general-use-label">Practical use</span><h4>{name}</h4><p>{detail}</p></article>)}</div></section>;
}

const armourEffects = [
  ['Ahrim the Blighted','Barrows magic · 70 Defence / 70 Magic','Full armour: 965.8 armour and +2,800 Magic style bonus.','Blighted Aura can lower an enemy’s Strength by 5 levels.','Wear all four set pieces and land successful magic attacks; it can trigger repeatedly.','Use as an accessible set for niche weakening, not as a modern maximum-damage setup.'],
  ['Dharok the Wretched','Barrows melee · 70 Defence / 70 Attack / 70 Strength','Full armour: 965.8 armour. At 1 life point, maximum melee hit can be roughly 33% higher.','Wretched Strength scales maximum melee damage downward as your life points rise.','Wear the full set and attack with the greataxe; it is not guaranteed and does not stack with abilities.','Use only for controlled low-life legacy-style damage situations; it is not a safe general PvM set.'],
  ['Guthan the Infested','Barrows melee · 70 Defence / 70 Attack','Full armour: 965.8 armour. A successful effect heals life points equal to the damage dealt.','Infestation provides self-healing instead of a fixed stat bonus.','Wear all four pieces and land a successful attack when the effect procs.','Use on long, low-risk Slayer or training trips where saving food is more valuable than dealing maximum damage.'],
  ['Karil the Tainted','Barrows ranged · 70 Defence / 70 Ranged','Full armour: 965.8 armour and the Barrows ranged weapon requirement.','Tainted Shot can reduce the opponent’s Agility.','Wear the complete set and land successful ranged attacks.','Treat as a collection or legacy utility set; modern ranged armour generally provides more practical PvM value.'],
  ['Torag the Corrupted','Barrows melee · 70 Defence / 70 Attack','Full armour: 965.8 armour.','Corruption can reduce a target’s run energy; it has very limited PvM impact.','Wear the complete set and land successful melee attacks.','Use for collection, PvP/legacy experimentation, or when it is simply the best tank gear your group currently has.'],
  ['Verac the Defiled','Barrows melee · 70 Defence / 70 Attack','Full armour: 965.8 armour.','Shatter can bypass an opponent’s armour on a successful proc.','Wear all four pieces and attack with the flail; the bypass is chance-based.','Use as a legacy niche against targets where armour bypass has value; do not assume it outperforms modern accuracy tools.'],
  ['Crystal armour','Ranged tank · 70 Defence','Tier 70 ranged tank armour; its value is defence and charge-based set utility rather than a raw damage passive.','The complete set supplies a defensive ranged option with a charge mechanic.','Wear the full charged set; check the item tooltip for charge and upkeep before committing to it.','Use when learning ranged content where survival matters more than speed, especially before high-tier power armour.'],
  ['Anima Core of Seren / Zaros / Sliske','Power armour · 80 Defence','Tier 80 power armour; no required full-set passive.','Its passive value is that it is non-degrading and provides style/hybrid power armour coverage.','No full set trigger: benefit comes from equipped pieces and their combat style.','Use as a reliable mid-game power armour step when repair cost and acquisition route matter.'],
  ['Trimmed masterwork melee','Melee power armour · 92 Defence','At 3+ pieces, 10% of incoming damage is delayed per piece for 6 seconds; five pieces delay 50%.','Delayed damage turns one large hit into six smaller bleed-like hits.','Wear at least three trimmed masterwork pieces; each additional piece increases the delayed share by 10%.','Use for difficult melee encounters where smoothing lethal bursts is more useful than another small damage increase.'],
  ['Custom-fit trimmed masterwork','Melee upkeep upgrade · 92 Defence','200,000 charges per piece (double normal trimmed); keeps the 10% per piece / 50% full-set damage delay.','Does not lose charges on a current Slayer or Reaper target, or in Elite Dungeons.','Custom-fit the full set, then wear 3–5 pieces for the delay effect.','Use as the long-term Ironman melee tank/power option for Slayer, Reapers and Elite Dungeons.'],
  ['Cryptbloom armour','Magic tank · 90 Defence','Nature’s Envoy: 2 pieces = 12% magic / 8% melee reduction; 3 pieces = 18% / 12%; earth spells double the 3-piece effect to 24% / 16%.','Four pieces add a 6% chance to infect the target, granting 10% backstab damage for 15 seconds; five pieces create a 15-second shield below 20% life points.','Wear 2–5 pieces; the fungal shield triggers automatically once you fall below 20% life points.','Use for learning dangerous bosses, tank roles, and content where survival makes more kills possible than a damage set would.'],
  ['Achto raid armour','Raid tank · 90 Defence','Tier 90 tank armour; the set effect is built around defensive ability and shield use rather than a single damage multiplier.','Its utility is defensive-resource support for raid tanking.','Wear the raid set while actively using defensive abilities; its value is most noticeable in a dedicated tank role.','Use when your group needs one player to survive and control damage rather than maximise personal damage.'],
  ['Vestments of Havoc','Melee power · 95 Defence','Tier 95 melee power armour.','Individual Vestments effects enhance aggressive melee and bleed-oriented play; this is not a classic “equip all pieces for one tank passive” set.','Effects are tied to the relevant equipped pieces and melee ability use.','Use once you are comfortable with the encounter and want to convert safety margin into faster melee kills.'],
  ['Elite tectonic','Magic power · 92 Defence','Tier 92 magic power armour with high offensive magic stats.','No four-piece set trigger to maintain; its strength is direct magic damage and accuracy.','Equip the pieces for their individual power-armour bonuses.','Use for magic-focused PvM when you can maintain its upkeep and do not need a tank set’s safety net.'],
] as const;

function ArmourEffectsSection() {
  return <section className="general-info-section panel armour-effects"><div className="panel-heading"><div><p className="eyebrow">Mid to late game · 60+ Defence</p><h3>Relevant armour effects</h3></div></div><p className="general-section-note">Open an entry for its requirements, published numeric effects, trigger condition, and where it earns its place on an Ironman account.</p><div className="armour-effect-list">{armourEffects.map(([name, role, stats, passive, trigger, use]) => <details key={name}><summary><span><strong>{name}</strong><small>{role}</small></span><ChevronRight size={16}/></summary><div className="armour-detail-grid"><div><span>Numbers</span><p>{stats}</p></div><div><span>Passive effect</span><p>{passive}</p></div><div><span>Trigger</span><p>{trigger}</p></div><div><span>Practical use</span><p>{use}</p></div></div></details>)}</div></section>;
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
type JourneyRequirement = { id:string; text:string; explanation:string; quest?:string; allMembers?:boolean; totalLevelPerMember?:number; skill?:[string,number]; manual?:boolean };
const journeyRequirements:Record<string,JourneyRequirement[]> = {
  'Tier 0':[
    {id:'total-level',text:'Group total level',explanation:'Reach 40 total levels for every member in the group.',totalLevelPerMember:40},
    {id:'cooks-assistant',text:"Cook's Assistant",explanation:'At least one member must complete the quest.',quest:"Cook's Assistant"},
    {id:'ironman-armour',text:'Collect Ironman armour',explanation:'At least one member must collect the free set from the Iron Enclave.',manual:true},
  ],
  'Tier 1':[
    {id:'total-level',text:'Group total level',explanation:'Reach 50 total levels for every member in the group.',totalLevelPerMember:50},
    {id:'quest-points',text:'Group quest points',explanation:'Earn 5 quest points for every member in the group.',manual:true},
    {id:'restless-ghost',text:'The Restless Ghost',explanation:'Every current group member must have completed this quest.',quest:'The Restless Ghost',allMembers:true},
    {id:'provider',text:'The Provider of Misthalin',explanation:'One member must complete the gathering achievement.',manual:true},
    {id:'scourge',text:'The Scourge of Misthalin',explanation:'One member must complete the Lumbridge combat achievement.',manual:true},
  ],
  'Tier 2':[
    {id:'total-level',text:'Group total level',explanation:'Reach 200 total levels for every member in the group.',totalLevelPerMember:200},
    {id:'priest-in-peril',text:'Priest in Peril',explanation:'At least one member must complete the quest.',quest:'Priest in Peril'},
    {id:'slayer-10',text:'Slayer level 10',explanation:'Have at least one member reach Slayer 10.',skill:['Slayer',10]},
    {id:'lumbridge-easy',text:'Lumbridge easy tasks',explanation:'Complete the easy Lumbridge achievement set.',manual:true},
  ],
  'Tier 3':[{id:'tier-3',text:'Journey Tier 3 achievements',explanation:'Complete the in-game skilling, quest and combat requirements shown in the Group Ironman achievement panel.',manual:true}],
  'Tier 4':[{id:'tier-4',text:'Journey Tier 4 achievements',explanation:'Complete the in-game tier requirements; this tier expands Group Storage by 20 spaces.',manual:true}],
  'Tier 5':[{id:'tier-5',text:'Journey Tier 5 achievements',explanation:'Complete the in-game mid-game quest, skill and combat requirements.',manual:true}],
  'Tier 6':[{id:'tier-6',text:'Journey Tier 6 achievements',explanation:'Complete the in-game advanced progression requirements.',manual:true}],
  'Tier 7':[{id:'tier-7',text:'Journey Tier 7 achievements',explanation:'Complete the in-game late-mid-game group requirements.',manual:true}],
  'Tier 8':[{id:'tier-8',text:'Journey Tier 8 achievements',explanation:'Complete the in-game tier requirements; this tier expands Group Storage by 20 spaces.',manual:true}],
  'Tier 9':[
    {id:'ritual-of-the-mahjarrat',text:'Ritual of the Mahjarrat',explanation:'At least one member must complete the quest.',quest:'Ritual of the Mahjarrat'},
    {id:'tier-9',text:'Remaining Journey Tier 9 achievements',explanation:'Confirm the remaining high-level achievement requirements in game.',manual:true},
  ],
  'Tier 10':[{id:'tier-10',text:'Journey Tier 10 achievements',explanation:'Complete the final in-game requirements to earn the last storage expansion and armour progression.',manual:true}],
};
function JourneyTierPanel({groupData,data,toggle}:{groupData:HiscoreResult|null;data:WorkspaceData;toggle:(key:string)=>void}) {
  const [questChecks,setQuestChecks]=useState<Record<string,Set<string>>>({});
  const [syncing,setSyncing]=useState(false);
  const members=groupData?.players || [];
  async function syncJourney() { if (!members.length) return; setSyncing(true); try { const results=await Promise.all(members.map(async member=>{ const response=await fetch(`/api/quests?player=${encodeURIComponent(member.name)}`); if(!response.ok) return [member.name,[]] as const; const payload=await response.json() as QuestSyncResult; return [member.name,payload.quests.filter(quest=>quest.completed).map(quest=>quest.title)] as const; })); setQuestChecks(Object.fromEntries(results.map(([name,quests])=>[name,new Set(quests.map(quest=>quest.toLowerCase()))]))); } finally { setSyncing(false); } }
  function requirementComplete(requirement:JourneyRequirement) { if(requirement.quest){ const completed=members.filter(member=>questChecks[member.name]?.has(requirement.quest!.toLowerCase())); return requirement.allMembers ? members.length>0 && completed.length===members.length : completed.length>0; } if(requirement.totalLevelPerMember) return Boolean(groupData && groupData.totalLevel >= requirement.totalLevelPerMember*members.length); if(requirement.skill){ const [skill,level]=requirement.skill; return members.some(member=>(member.skills.find(value=>value.name===skill)?.level || 0)>=level); } return Boolean(data.journey[`requirement:${requirement.id}`]); }
  return <section className="panel hub-list-panel journey-tier-panel"><div className="panel-heading"><div><p className="eyebrow">Official GIM progression</p><h3>Journey tiers</h3><p className="journey-tier-note">Open a tier to see its requirements and what the reward means for the group.</p></div><div className="journey-tier-actions"><button className="secondary-button" onClick={syncJourney} disabled={!members.length||syncing}>{syncing?'Syncing…':'Sync quest checks'}</button><a className="source-link" href="https://runescape.wiki/w/Group_Ironman_Mode/Strategies#Journey_tiers" target="_blank" rel="noreferrer">Requirements source <ExternalLink size={13}/></a></div></div>{journeyTiers.map(([tier,reward,detail])=>{ const requirements=journeyRequirements[tier]||[]; const complete=requirements.filter(requirementComplete).length; return <details className={data.journey[tier]?'journey-tier done':'journey-tier'} key={tier}><summary><span><strong>{tier}</strong><small>{reward}</small></span><em>{complete}/{requirements.length} verified</em><ChevronRight size={16}/></summary><div className="journey-tier-body"><p>{detail}</p>{requirements.map(requirement=>{ const complete=requirementComplete(requirement); const automatic=Boolean(requirement.quest||requirement.totalLevelPerMember||requirement.skill); return <article className={complete?'journey-requirement complete':'journey-requirement'} key={requirement.id}><button className="route-check" disabled={automatic} onClick={()=>!automatic&&toggle(`requirement:${requirement.id}`)} aria-label={`${complete?'Mark incomplete':'Mark complete'} ${requirement.text}`}>{complete&&<Check size={14}/>}</button><div><strong>{requirement.text}</strong><p>{requirement.explanation}</p>{automatic&&<small>{questChecks && Object.keys(questChecks).length?'Synced from public character data':'Sync to check automatically'}</small>}</div></article>})}<button className="secondary-button journey-tier-finish" onClick={()=>toggle(tier)}>{data.journey[tier]?'Mark tier incomplete':'Mark tier complete'}</button></div></details>;})}</section>;
}
const shopRuns = [
  ['Runes and magic','Zaff, Betty, Aubury, Lunar Isle and Void Knight shops','Combat runes, nature runes, astral runes, staves and spell supplies','Prioritise runes for teleports, alchemy and combat. Check stock when you are already nearby rather than making a long detour.'],
  ['Herblore supplies','Taverley, Prifddinas and Granny Rowan','Vials of water, bomb vials and useful secondaries','Buy capped basics that save gathering time; pair this with farm runs instead of buying everything blindly.'],
  ['Slayer and components','Any Slayer master, especially Burthorpe','Broad arrowheads, insulated boots and enchanted gem packs','Broad arrowheads feed Precise components, boots feed Powerful components, and gem packs help create Precious components.'],
  ['Armoury disassembly','White Knight Armoury, Lowe, Betty, Zaff and Ali Morrisane','Weapons, armour, bows, staves, wands and blackjacks','Good low-effort component stock. White Knight equipment needs the Armoury access unlock.'],
  ['Summoning','Taverley and Amlodd','Spirit shards and pouch-making supplies','Keep shards available before long charm sessions so training does not stop halfway through.'],
  ['Construction','Sawmills, Fort Forinthry and Prifddinas','Logs, planks, limestone bricks and bolts of cloth','Buy what supports your current build; Fort stock is especially convenient while progressing its buildings.'],
] as const;
const pvmMilestones = [
  ['War’s Retreat teleport','10 total boss kills'],['Altar of War','200 boss kills'],['Adrenaline crystal','1,000 boss kills'],['Reaper points for hydrix','Complete regular Soul Reaper assignments'],['Entry-level GWD1 gear','Target useful power armour and components'],['Necromancy T70–T90 tasks','Complete Kili upgrade paths'],['Invention-ready combat set','Augment weapon, body and legs'],['Overloads','Reach or boost to 96 Herblore'],['Curses and prayer sustain','Temple at Senntisten plus a Prayer training plan'],['Group boss roles','Assign damage, support and supply responsibilities'],
] as const;
const estateTasks = [
  ['Player-owned Farm','Set breeding pairs and bean targets'],['Herb runs','Choose priority herbs and seed sources'],['Secondary ingredients','Track white berries, potato cactus, limpwurt and fungi'],['Kingdom approval','Keep approval near 100%'],['Kingdom treasury','Maintain sufficient coins for collection cycles'],['Kingdom allocation','Choose herbs, hardwood, maples or fish'],['Player-owned Ports','Send voyages and prioritise story progress'],['Trade goods','Track bones, spices, chi, lacquer and plate'],['Water filtration','Claim passive Fort Forinthry rewards'],
] as const;
const inventionSources = [
  ['Precise','Broad arrowheads, bows and ranged-shop equipment','Buy broad arrowheads after Slayer unlocks; save bows from training.','Weapon and tool perks'],['Precious','Slayer rings','Buy enchanted gem packs, craft rings of slaying, then disassemble.','Scavenging and equipment siphons'],['Powerful','Insulated boots, battlestaves and terrorbird pouches','Slayer masters and magic shops are reliable sources; do not disassemble your only useful gear.','Augmentors and useful devices'],['Simple','Maple or acadia logs and divine energy products','Keep ordinary logs from Woodcutting or Kingdom rather than selling them all.','Divine charges and devices'],['Dextrous','Shortbows, claws and ranged armour','String self-made shortbows and save shop bows when convenient.','Equipment siphons and rod-o-matics'],['Enhancing','Slayer rings','Craft extras from gem packs during Slayer shop runs.','Augmentors'],['Protective','White Knight armour, smithed armour and dragonhide','Armoury stock and Smithing training provide steady batches.','Armour gizmos'],['Historic','Venator artefacts and archaeology materials','Keep duplicate Archaeology artefacts after collections are satisfied.','Ancient gizmos and early ancient perks'],['Vintage','Completed high-level archaeology artefacts','Use duplicate completed artefacts after checking collection needs.','Crackling, Relentless and Fortune combinations'],['Fortunate','Clue-scroll fortunate items','Only disassemble surplus fortunate items after confirming you do not need the item.','Alchemical onyx and hydrix products'],
] as const;
const inventionMaterials = {
  Common: ['Base','Blade','Clear','Connector','Cover','Crafted','Crystal','Deflecting','Delicate','Flexible','Head','Magic','Metallic','Organic','Padded','Plated','Simple','Smooth','Spiked','Spiritual','Stave','Tensile'],
  Uncommon: ['Dextrous','Direct','Enhancing','Ethereal','Evasive','Healthy','Heavy','Imbued','Light','Living','Offcut','Pious','Powerful','Precise','Protective','Refined','Sharp','Strong','Stunning','Subtle','Swift','Variable'],
  Rare: ['Armadyl','Ascended','Avernic','Bandos','Brassican','Clockwork','Corporeal','Culinary','Cywir','Dragonfire','Explosive','Faceted','Fortunate','Fungal','Harnessed','Ilujankan','Knightly','Noxious','Oceanic','Pestiferous','Resilient','Rumbling','Saradomin','Seren','Shadow','Shifting','Silent','Third-age','Undead','Zamorak','Zaros'],
  Ancient: ['Classic','Historic','Timeworn','Vintage'],
  Other: ['Junk'],
} as const;
const inventionCatalogue = Object.entries(inventionMaterials).flatMap(([tier, materials]) => materials.map(component => {
  const curated = inventionSources.find(([name]) => name === component);
  return { component, tier, sources:curated?.[1] || 'Use the in-game Analyse ability or the Wiki reference to check current disassembly sources.', stock:curated?.[2] || 'Keep only surplus equipment and materials once you have covered your active training and gear needs.', use:curated?.[3] || 'Used in Invention gizmos, devices, or perk combinations. Check the Wiki for exact recipes.' };
}));
const componentIcons: Record<string,string> = {
  Precise:'https://runescape.wiki/images/Precise_components.png?d3ca0', Precious:'https://runescape.wiki/images/Precious_components.png?3dce1', Powerful:'https://runescape.wiki/images/Powerful_components.png?9a688', Simple:'https://runescape.wiki/images/Simple_parts.png?106b0', Dextrous:'https://runescape.wiki/images/Dextrous_components.png?5ece1', Enhancing:'https://runescape.wiki/images/Enhancing_components.png?aa8e2', Protective:'https://runescape.wiki/images/Protective_components.png?9b9fa', Historic:'https://runescape.wiki/images/Historic_components.png?0f882', Vintage:'https://runescape.wiki/images/Vintage_components.png?0b3e2', Fortunate:'https://runescape.wiki/images/Fortunate_components.png?19bed',
};
function componentIcon(component:string, tier:string) { return componentIcons[component] || `https://runescape.wiki/Special:FilePath/${encodeURIComponent(`${component} ${tier === 'Common' ? 'parts' : 'components'}.png`)}?width=64`; }
function ComponentCard({ component, tier, sources, stock, use }: { component:string; tier:string; sources:string; stock:string; use:string }) {
  const materialTerm = tier === 'Common' ? 'parts' : 'components';
  return <article className="panel method-card component-card"><header><img src={componentIcon(component,tier)} alt={`${component} ${materialTerm}`} loading="lazy" onError={event => { event.currentTarget.style.visibility='hidden'; }}/><div><span className="level-range">{component} {materialTerm}</span><small>{tier}</small><a href={`https://runescape.wiki/w/${encodeURIComponent(`${component}_${materialTerm}`)}`} target="_blank" rel="noreferrer">View on the Wiki</a></div></header><div className="component-details"><section><span className="general-use-label">Practical uses</span><p>{use}</p></section><section><span className="general-use-label">What to keep from training</span><p>{stock}</p></section><section><span className="general-use-label">Common sources</span><p>{sources}</p></section></div></article>;
}

function InventionView() {
  const [query,setQuery] = useState('');
  const rows = inventionCatalogue.filter(row => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()));
  return <div className="content feature-page"><section className="feature-heading"><div><p className="date-line">IRONMAN REFERENCE</p><h2>Invention</h2><p>Quick component sources and sensible items to keep before you disassemble.</p></div></section><section><div className="panel invention-search"><div><p className="eyebrow">Complete material catalogue</p><h3>{rows.length} of {inventionCatalogue.length} materials</h3></div><label className="route-search"><Search size={15}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search materials, perks or sources" /></label></div><div className="method-grid">{rows.map(row=><ComponentCard {...row} key={row.component}/>)}</div></section></div>;
}

function GroupHubView({ groupData, workspace, setWorkspace, updateWorkspace, preferredMember, embedded=false }: { groupData:HiscoreResult|null; workspace:Workspace|null; setWorkspace:(value:Workspace|null)=>void; updateWorkspace:<K extends keyof WorkspaceData>(key:K,value:WorkspaceData[K])=>void; preferredMember:string; embedded?:boolean }) {
  const [tab,setTab] = useState<'Invention'|'Requests'>('Invention');
  const [name,setName] = useState(groupData?.group || ''); const [code,setCode] = useState(''); const [error,setError] = useState(''); const [loading,setLoading] = useState(false);
  const [supplyName,setSupplyName] = useState(''); const [quantity,setQuantity] = useState(''); const [owner,setOwner] = useState(preferredMember); const [purpose,setPurpose] = useState(''); const [componentQuery,setComponentQuery] = useState('');
  useEffect(() => { if (preferredMember && groupData?.players.some(player => player.name === preferredMember)) setOwner(preferredMember); }, [groupData,preferredMember]);
  async function createWorkspace() { setLoading(true);setError(''); try { const response=await fetch('/api/workspace',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:name||groupData?.group||'My Ironman Group'})}); const value=await response.json(); if(!response.ok) throw new Error(value.error); const next={...value,data:{...emptyWorkspaceData,...value.data}}; setWorkspace(next); window.localStorage.setItem('ironpath-workspace',JSON.stringify({id:next.id,token:next.token})); } catch(reason){setError(reason instanceof Error?reason.message:'Unable to create workspace.');} finally{setLoading(false);} }
  async function joinWorkspace() { const [id,token]=code.trim().split('.'); if(!id||!token){setError('Paste the complete workspace key.');return;} setLoading(true);setError(''); try { const response=await fetch('/api/workspace',{headers:{'x-ironpath-workspace':id,'x-ironpath-token':token}}); const value=await response.json(); if(!response.ok) throw new Error(value.error); const next={...value,token,data:{...emptyWorkspaceData,...value.data}};setWorkspace(next);window.localStorage.setItem('ironpath-workspace',JSON.stringify({id,token}));}catch(reason){setError(reason instanceof Error?reason.message:'Unable to join workspace.');}finally{setLoading(false);} }
  if(!workspace) return <div className="content feature-page"><section className="feature-heading"><div><p className="date-line">SHARED TEAM DATA</p><h2>Group Hub</h2><p>Create one workspace for your team or join using a key shared by another member.</p></div></section><div className="workspace-connect-grid"><section className="panel hub-connect"><Users size={30}/><h3>Create a group workspace</h3><p>This stores Journey, supplies, shops, PvM and estate progress online for the whole team.</p><label className="field"><span>Workspace name</span><input value={name} onChange={event=>setName(event.target.value)} placeholder="Your group name"/></label><button className="primary-button" onClick={createWorkspace} disabled={loading}>Create workspace</button></section><section className="panel hub-connect"><Boxes size={30}/><h3>Join an existing workspace</h3><p>Ask a group member for the workspace key, then paste it below.</p><label className="field"><span>Workspace key</span><input value={code} onChange={event=>setCode(event.target.value)} placeholder="workspace.token"/></label><button className="secondary-button" onClick={joinWorkspace} disabled={loading}>Join workspace</button></section></div>{error&&<div className="error-banner">{error}</div>}</div>;
  const data=workspace.data; const journeyDone=Object.values(data.journey).filter(Boolean).length; const shopDone=Object.values(data.shops).filter(Boolean).length; const pvmDone=Object.values(data.pvm).filter(Boolean).length;
  const highest=(skill:string)=>Math.max(0,...(groupData?.players.flatMap(player=>player.skills.filter(value=>value.name.toLowerCase()===skill.toLowerCase()).map(value=>value.level))||[]));
  const nextUnlocks=[['Invention',Math.min(highest('Crafting'),highest('Divination'),highest('Smithing')),80],['Overloads',highest('Herblore'),96],['Player-owned Ports',Math.max(...['Agility','Construction','Cooking','Divination','Dungeoneering','Fishing','Herblore','Hunter','Prayer','Runecrafting','Slayer','Thieving'].map(highest)),90]].sort((a,b)=>(a[2] as number-a[1] as number)-(b[2] as number-b[1] as number));
  function toggleRecord(key:'journey'|'shops'|'pvm'|'farming',id:string){updateWorkspace(key,{...data[key],[id]:!data[key][id]});}
  function addSupply(event:FormEvent){event.preventDefault();if(!supplyName.trim())return;updateWorkspace('supplies',[...data.supplies,{id:crypto.randomUUID(),name:supplyName.trim(),detail:purpose.trim(),owner:owner.trim()||'Unassigned',quantity:quantity.trim()||'—',done:false}]);setSupplyName('');setQuantity('');setOwner('');setPurpose('');}
  const shareCode=`${workspace.id}.${workspace.token}`;
  return <div className="content feature-page group-hub"><section className="feature-heading"><div><p className="date-line">SHARED TEAM DATA</p><h2>{workspace.name}</h2><p>One synchronized operations board for your Group Ironman team.</p></div><div className="hub-share"><button className="secondary-button" onClick={()=>navigator.clipboard.writeText(shareCode)}>Copy workspace key</button><button className="text-button" onClick={()=>{localStorage.removeItem('ironpath-workspace');setWorkspace(null)}}>Leave</button></div></section><div className="hub-tabs">{(['Invention','Requests'] as const).map(value=><button key={value} className={tab===value?'active':''} onClick={()=>setTab(value)}>{value}</button>)}</div>
    {tab==='Overview'&&<><section className="hub-stat-grid"><article className="panel"><span>Journey tiers</span><strong>{journeyDone}/{journeyTiers.length}</strong></article><article className="panel"><span>Supply requests</span><strong>{data.supplies.filter(item=>!item.done).length}</strong></article><article className="panel"><span>Shop run</span><strong>{shopDone}/{shopRuns.length}</strong></article><article className="panel"><span>PvM milestones</span><strong>{pvmDone}/{pvmMilestones.length}</strong></article></section><section className="panel next-unlocks"><div className="panel-heading"><div><p className="eyebrow">Based on group HiScores</p><h3>Closest major unlocks</h3></div></div>{groupData?nextUnlocks.map(([unlock,current,target])=><article key={String(unlock)}><div><strong>{unlock}</strong><span>Best qualifying level {current} / {target}</span></div><div className="progress-track"><span style={{width:`${Math.min(100,(Number(current)/Number(target))*100)}%`}}/></div></article>):<p className="hub-note">Look up your group in HiScores to calculate level-based recommendations.</p>}</section></>}
    {tab==='Journey'&&<JourneyTierPanel groupData={groupData} data={data} toggle={key=>toggleRecord('journey',key)}/>}
    {tab==='Requests'&&<><form className="panel supply-form" onSubmit={addSupply}><label className="field"><span>Item or resource</span><input value={supplyName} onChange={e=>setSupplyName(e.target.value)} placeholder="Pure essence"/></label><label className="field"><span>Quantity</span><input value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="2,000"/></label><label className="field"><span>Owner</span><select value={owner} onChange={e=>setOwner(e.target.value)}><option value="">Unassigned</option>{groupData?.players.map(player=><option key={player.name}>{player.name}</option>)}</select></label><label className="field"><span>Purpose</span><input value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="Necrotic runes"/></label><button className="primary-button"><Plus size={16}/>Add</button></form><section className="panel hub-list-panel">{data.supplies.length?data.supplies.map(item=><article className={item.done?'supply-row done':'supply-row'} key={item.id}><button className="route-check" onClick={()=>updateWorkspace('supplies',data.supplies.map(value=>value.id===item.id?{...value,done:!value.done}:value))}>{item.done&&<Check size={14}/>}</button><div><strong>{item.name}</strong><p>{item.detail||'No purpose noted'}</p></div><span>{item.quantity}</span><span>{item.owner}</span><button className="delete-button" onClick={()=>updateWorkspace('supplies',data.supplies.filter(value=>value.id!==item.id))}><Trash2 size={15}/></button></article>):<div className="small-empty"><Boxes size={26}/><h3>No supply requests</h3><p>Add the first resource your group needs.</p></div>}</section></>}
    {tab==='Shops'&&<section className="panel hub-list-panel"><div className="panel-heading"><div><p className="eyebrow">Ironman stock planner</p><h3>Shop run</h3></div></div>{shopRuns.map(([name,locations,stock,advice])=><article className={data.shops[name]?'hub-check-row done':'hub-check-row'} key={name}><button className="route-check" onClick={()=>toggleRecord('shops',name)}>{data.shops[name]&&<Check size={14}/>}</button><div><strong>{name}</strong><p><strong>Where:</strong> {locations}</p><p><strong>Key stock:</strong> {stock}</p><p>{advice}</p></div></article>)}</section>}
    {tab==='Invention'&&<section><div className="panel invention-search"><div><p className="eyebrow">Ironman component lookup</p><h3>What should I disassemble?</h3></div><label className="route-search"><Search size={15}/><input value={componentQuery} onChange={e=>setComponentQuery(e.target.value)} placeholder="Search components or uses"/></label></div><div className="method-grid">{inventionSources.filter(row=>row.join(' ').toLowerCase().includes(componentQuery.toLowerCase())).map(([component,sources,stock,use])=><article className="panel method-card" key={component}><span className="level-range">{component} components</span><span className="general-use-label">Common sources</span><p>{sources}</p><span className="general-use-label">What to keep</span><p>{stock}</p><strong>{use}</strong></article>)}</div></section>}
    {tab==='PvM'&&<section className="panel hub-list-panel"><div className="panel-heading"><div><p className="eyebrow">Combat readiness</p><h3>PvM progression</h3></div></div>{pvmMilestones.map(([name,detail])=><article className={data.pvm[name]?'hub-check-row done':'hub-check-row'} key={name}><button className="route-check" onClick={()=>toggleRecord('pvm',name)}>{data.pvm[name]&&<Check size={14}/>}</button><div><strong>{name}</strong><p>{detail}</p></div></article>)}</section>}
    {tab==='Estate'&&<><section className="estate-summary"><article className="panel"><Leaf size={22}/><span>Farm and Herblore</span><strong>{estateTasks.slice(0,3).filter(([name])=>data.farming[name]).length}/3</strong></article><article className="panel"><Coins size={22}/><span>Kingdom and passive resources</span><strong>{estateTasks.slice(3).filter(([name])=>data.farming[name]).length}/{estateTasks.length-3}</strong></article></section><section className="panel hub-list-panel">{estateTasks.map(([name,detail])=><article className={data.farming[name]?'hub-check-row done':'hub-check-row'} key={name}><button className="route-check" onClick={()=>toggleRecord('farming',name)}>{data.farming[name]&&<Check size={14}/>}</button><div><strong>{name}</strong><p>{detail}</p></div></article>)}</section></>}
  </div>;
}

function RepeatablesView({ shared, setShared, groupData, preferredMember }: { shared?:Record<string,boolean>; setShared:(value:Record<string,boolean>)=>void; groupData:HiscoreResult|null; preferredMember:string }) {
  const [period, setPeriod] = useState<keyof typeof repeatables>('Daily');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [completedQuests,setCompletedQuests] = useState<Set<string>|null>(null);
  const [syncing,setSyncing] = useState(false);
  const [syncError,setSyncError] = useState('');
  const [showAvailable,setShowAvailable] = useState(true);
  const [query,setQuery] = useState('');
  const [showCompleted,setShowCompleted] = useState(false);
  const [showSettings,setShowSettings] = useState(false);
  const [manualUnlocks,setManualUnlocks] = useState<Record<string,boolean>>({});
  const player = groupData?.players.find(value => value.name === preferredMember) || groupData?.players[0];
  useEffect(() => { if (shared) setCompleted(shared); else try { setCompleted(JSON.parse(window.localStorage.getItem('ironpath-repeatables') || '{}')); } catch { /* ignore */ } }, [shared]);
  useEffect(() => { setCompletedQuests(null); setSyncError(''); if (!player) return; try { setManualUnlocks(JSON.parse(window.localStorage.getItem(`ironpath-repeatable-unlocks:${player.name}`) || '{}')); } catch { setManualUnlocks({}); } }, [player?.name]);
  function persist(next:Record<string,boolean>) { setCompleted(next); if (shared) setShared(next); else window.localStorage.setItem('ironpath-repeatables',JSON.stringify(next)); }
  function toggle(name: string) { persist({ ...completed, [name]:!completed[name] }); }
  async function syncAccess() { if (!player) return; setSyncing(true); setSyncError(''); try { const response=await fetch(`/api/quests?player=${encodeURIComponent(player.name)}`); const result=await response.json() as QuestSyncResult & { error?:string }; if (!response.ok) throw new Error(result.error || 'Quest sync is unavailable.'); setCompletedQuests(new Set(result.quests.filter(quest=>quest.completed).map(quest=>normalQuestTitle(quest.title)))); } catch (error) { setCompletedQuests(null); setSyncError(error instanceof Error ? error.message : 'Quest sync is unavailable.'); } finally { setSyncing(false); } }
  function toggleManual(key:string) { const next={...manualUnlocks,[key]:!manualUnlocks[key]}; setManualUnlocks(next); if(player) window.localStorage.setItem(`ironpath-repeatable-unlocks:${player.name}`,JSON.stringify(next)); }
  function access(name:string) { const rule=repeatableRequirements[name]; if (!rule || !player) return { available:true, note:'' }; const missingSkills=(rule.skills||[]).filter(([skill,level]) => (player.skills.find(value=>value.name===skill)?.level || 0) < level); if(name==='Player-owned ports' && player.skills.some(skill=>['Agility','Construction','Cooking','Divination','Dungeoneering','Fishing','Herblore','Hunter','Prayer','Runecrafting','Slayer','Thieving'].includes(skill.name) && skill.level>=90)) missingSkills.length=0; if(missingSkills.length) return {available:false,note:missingSkills.map(([skill,level])=>`${skill} ${level}`).join(', ')}; const missingQuests=(rule.quests||[]).filter(quest=>completedQuests && !completedQuests.has(normalQuestTitle(quest))); if(missingQuests.length) return {available:false,note:missingQuests.join(', ')}; if(rule.manual && !manualUnlocks[rule.manual]) return {available:true,note:`Confirm: ${rule.manual}`}; return {available:true,note:''}; }
  const baseList = repeatables[period];
  const list = showAvailable && player ? baseList.filter(([name]) => access(name).available) : baseList;
  const visibleList = list.filter(([name,description,tag]) => (!showCompleted || completed[name]) && [name,description,tag].join(' ').toLowerCase().includes(query.toLowerCase()));
  const done = list.filter(([name]) => completed[name]).length;

  return <div className="content feature-page">
    <section className="feature-heading">
      <div><p className="date-line">ROUTINE PLANNER</p><h2>Repeatables</h2><p>Keep your daily, weekly, and monthly Ironman routines visible without letting them run your game.</p></div>
      <div className="reset-card"><Clock3 size={16} /><div><span>Next {period.toLowerCase()} reset</span><strong>{resetLabel(period)}</strong></div></div>
    </section>
    <section className="tracker-personal-strip"><Users size={16}/><span>{player ? `Tracking for ${player.name}` : 'Connect a group to personalise activities'}</span>{player && <div className="quest-sync-status"><em className={syncError ? 'sync-error' : completedQuests ? 'sync-ready' : ''}>{syncing ? 'Syncing quest access…' : syncError || (completedQuests ? 'Quest access synced' : 'Quest access not synced')}</em><button className="quest-sync-button" onClick={syncAccess} disabled={syncing}><RefreshCw size={16} className={syncing?'spin':''}/>{syncing ? 'Syncing…' : 'Sync quest access'}</button></div>}</section>
    <section className="repeatable-overview">
      <div className="panel repeatable-progress"><div className="ring" style={{ '--value': `${(done / list.length) * 360}deg` } as React.CSSProperties}><span>{done}/{list.length}</span></div><div className="cycle-progress-copy"><p className="eyebrow">Current cycle</p><h3>{period} checklist</h3><p>{list.length - done} activities remaining</p></div></div>
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
    <section className="panel repeatable-list-panel tracker-board">
      <div className="tracker-board-head"><div><p className="eyebrow">{period} activity board</p><h3>Choose what matters today.</h3><small>{visibleList.length} shown · {done} completed</small></div><button className="text-button" onClick={() => { const next = { ...completed }; list.forEach(([name]) => delete next[name]); persist(next); }}>Clear {period.toLowerCase()}</button></div>
      <div className="tracker-toolbar"><label className="route-search"><Search size={15}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder={`Search ${period.toLowerCase()} activities`} /></label><button className={showCompleted?'tracker-filter active':'tracker-filter'} onClick={()=>setShowCompleted(value=>!value)}>{showCompleted?'Completed only':'All statuses'}</button><button className={showSettings?'tracker-filter active':'tracker-filter'} onClick={()=>setShowSettings(value=>!value)}>Access settings</button></div>
      {showSettings && <div className="tracker-settings">{player ? <><button className="secondary-button" onClick={syncAccess} disabled={syncing}><RefreshCw size={14} className={syncing?'spin':''}/>{syncing?'Syncing…':'Sync quest access'}</button><label><input type="checkbox" checked={showAvailable} onChange={event=>setShowAvailable(event.target.checked)}/> Show available only</label><div className="manual-unlock-list">{manualRepeatableUnlocks.map(key=><label key={key}><input type="checkbox" checked={Boolean(manualUnlocks[key])} onChange={()=>toggleManual(key)}/><span>{key}</span></label>)}</div></> : <p>Connect a group in Dashboard to filter activities for a specific character.</p>}</div>}
      <div className="repeatable-list tracker-list">{visibleList.map(([name, description, tag]) => { const requirement=access(name); const guidance=repeatableGuidance[name] || { summary:description, tip:`A ${period.toLowerCase()} activity for ${tag.toLowerCase()}. Check it off only once you have finished it.` }; return <article className={completed[name] ? 'repeatable-row done' : 'repeatable-row'} key={name}><button type="button" className="repeat-check" onClick={() => toggle(name)} aria-label={`Mark ${name} as ${completed[name] ? 'incomplete' : 'complete'}`}>{completed[name] && <Check size={14} />}</button><div className="repeat-task-info" tabIndex={0} aria-label={`More information about ${name}`}><span className="repeat-copy"><strong>{name}</strong><small>{requirement.note || description}</small></span><aside className="repeat-task-tooltip" role="tooltip"><p className="eyebrow">{tag} · {period}</p><strong>{name}</strong><p>{guidance.summary}</p>{guidance.tip && <p className="repeat-tooltip-tip"><b>Helpful note:</b> {guidance.tip}</p>}{guidance.link && <a href={guidance.link} target="_blank" rel="noreferrer">Open reference <ExternalLink size={12}/></a>}</aside></div><span className="repeat-tag">{tag}</span><ChevronRight className="repeat-info-chevron" size={15} aria-hidden="true" /></article>; })}{!visibleList.length && <div className="small-empty"><ListChecks size={23}/><h3>No activities match these filters</h3><p>Try clearing the search or showing all statuses.</p></div>}</div>
    </section>
    <p className="update-note"><Sparkles size={14} /> Updated for the March 2026 DailyScape overhaul. Removed and uncapped former dailies are intentionally excluded.</p>
  </div>;
}

function compactNumber(value: number) { return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(value); }
function skillIconUrl(skill:string) { return `https://runescape.wiki/Special:FilePath/${encodeURIComponent(`${skill}-icon.png`)}`; }
function titleCase(value: string) { return value.replace(/\b\w/g, letter => letter.toUpperCase()); }
function resetLabel(period: keyof typeof repeatables) {
  const now = new Date(); const next = new Date(now);
  if (period === 'Daily') next.setUTCDate(next.getUTCDate() + 1), next.setUTCHours(0,0,0,0);
  else if (period === 'Weekly') { const days = (10 - next.getUTCDay()) % 7 || 7; next.setUTCDate(next.getUTCDate() + days); next.setUTCHours(0,0,0,0); }
  else next.setUTCMonth(next.getUTCMonth() + 1, 1), next.setUTCHours(0,0,0,0);
  const hours = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 3600000));
  return hours > 48 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${Math.floor(((next.getTime() - now.getTime()) % 3600000) / 60000)}m`;
}
