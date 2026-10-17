'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Check, ChevronRight, Circle, FlaskConical, Gem, RefreshCw, Search, Sparkles, Trophy } from 'lucide-react';
import { displayText } from '../../lib/display-text';
import catalogue from '../../data/quest-rewards.json';
import { questKey, questStatusMap, readQuestProfile, type QuestProfile, type QuestState } from '../../lib/quest-rewards';
import './quest-rewards.css';
const quests = catalogue.quests;
const exampleCompleted = new Set(["Cook's Assistant", 'Druidic Ritual', 'A Fairy Tale I - Growing Pains'].map(questKey));
const skills = [...new Set(quests.flatMap(quest => quest.skills))].sort();
const storageKey = (player: string) => `ironpath-quest-rewards:v1:${player.trim().toLowerCase()}`;
const stateNames: Record<QuestState,string> = { completed:'Completed', started:'In progress', 'not-started':'Not started', unknown:'Not synced' };
type Quest = (typeof quests)[number];
function rewardText(quest: Quest) { return quest.rewards.map(reward => reward.parts.map(part => part.text).join('')).join(' '); }
export default function QuestRewardsView({ preferredMember = '' }: { preferredMember?: string }) {
  const [player, setPlayer] = useState(preferredMember), [profile, setProfile] = useState<QuestProfile|null>(null);
  const [example,setExample]=useState(true),[query,setQuery]=useState(''),[filter,setFilter]=useState('All quests'),[skill,setSkill]=useState('All rewards');
  const [selected,setSelected]=useState('A Fairy Tale I - Growing Pains'),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  const request = useRef<AbortController|null>(null);
  function restore(name:string) {
    try {
      for(const key of [storageKey(name),`ironpath-quest-cache:${name}`]) {
        const saved=readQuestProfile(JSON.parse(localStorage.getItem(key)||'null'),name);
        if(saved){setProfile(saved);setExample(false);return;}
      }
    } catch { /* A missing or damaged browser copy does not prevent a fresh sync. */ }
    setProfile(null);
  }
  useEffect(()=>{
    let name=preferredMember;
    try {name ||= localStorage.getItem('ironpath-preferred-member')||'';}catch{ /* Sync also works without browser storage. */ }
    setPlayer(name);if(name)restore(name);
    return()=>request.current?.abort();
  },[preferredMember]);
  const currentProfile = profile?.player.trim().toLowerCase()===player.trim().toLowerCase()?profile:null;
  const statuses=useMemo(()=>questStatusMap(currentProfile),[currentProfile]);
  const statusOf=(quest:Quest):QuestState=>example?(exampleCompleted.has(questKey(quest.name))?'completed':'not-started'):(statuses.get(questKey(quest.name))||'unknown');
  const completed=quests.filter(quest=>statusOf(quest)==='completed');
  const points=completed.reduce((total,quest)=>total+quest.questPoints,0);
  const visible=quests.filter(quest=>{
    const status=statusOf(quest),search=questKey(`${quest.name} ${rewardText(quest)}`);
    return (!query.trim()||search.includes(questKey(query))) && (skill==='All rewards'||quest.skills.includes(skill)) && (filter==='All quests'||filter==='Completed'&&status==='completed'||filter==='Remaining'&&status!=='completed'||filter==='In progress'&&status==='started');
  });
  const quest=quests.find(quest=>quest.name===selected)!,state=statusOf(quest),isCompleted=state==='completed';
  async function sync() {
    const name=player.trim();
    if(!name||name.length>20){setError('Enter a RuneScape character name, up to 20 characters.');return;}
    request.current?.abort();const controller=new AbortController();request.current=controller;
    const timer=setTimeout(()=>controller.abort(),20000);setBusy(true);setError('');setMessage('');
    try {
      const response=await fetch(`/api/quests?player=${encodeURIComponent(name)}`,{signal:controller.signal,cache:'no-store'});
      const data=await response.json() as { error?: string };if(!response.ok)throw new Error(data.error||'Quest sync is unavailable.');
      const saved=readQuestProfile(data,name);if(!saved)throw new Error('The character profile did not return valid quest statuses.');
      if(controller!==request.current)return;
      setProfile(saved);setExample(false);
      try {localStorage.setItem(storageKey(name),JSON.stringify(saved));setMessage(`Quest progress synced for ${name}. This browser keeps a saved copy.`);}
      catch {setMessage(`Quest progress synced for ${name}. Browser storage is unavailable, so this copy will not survive a reload.`);}
    } catch(e) {if(controller===request.current)setError(e instanceof Error&&e.name!=='AbortError'?e.message:'Quest sync timed out. Your last saved progress is still available.');}
    finally {clearTimeout(timer);if(controller===request.current)setBusy(false);}
  }
  function changePlayer(value:string){request.current?.abort();request.current=null;setBusy(false);setPlayer(value);setExample(false);setMessage('');setError('');restore(value);}
  return <section className="qr-view">
    <div className="qr-heading"><div><p className="qr-eyebrow">PROGRESSION / QUEST REWARDS</p><h1>Every quest. <span>A new possibility.</span></h1><p>Find the experience, equipment, and unlocks worth your next adventure.</p></div><span className="qr-prototype"><FlaskConical size={14}/> Prototype</span></div>
    <section className="qr-sync-panel" aria-label="Character quest sync"><div className="qr-sync-copy"><span className="qr-panel-icon"><BookOpen size={23}/></span><div><h2>Your story, at a glance.</h2><p>{example?'Example progress · three quests marked complete to preview the design.':currentProfile?`Showing saved progress for ${currentProfile.player}.`:'Sync a public RuneMetrics profile to see your completed quests.'}</p></div></div><form onSubmit={event=>{event.preventDefault();void sync();}}><label htmlFor="qr-player">RuneScape character<input id="qr-player" value={player} maxLength={20} onChange={event=>changePlayer(event.target.value)} placeholder="Your character name" autoComplete="off"/></label><button className="qr-primary" disabled={busy||!player.trim()}><RefreshCw size={15} className={busy?'qr-spinning':''}/>{busy?'Syncing…':'Sync quests'}</button></form></section>
    <div className="qr-sync-meta"><span>{currentProfile&&!example?`Last synced ${new Date(currentProfile.refreshedAt).toLocaleString()}`:'No account login or password needed.'}</span><button onClick={()=>{request.current?.abort();request.current=null;setBusy(false);setExample(value=>!value);setMessage('');setError('');}}>{example?'Exit example':'Preview completed quests'}</button></div>
    {message&&<p className="qr-notice" role="status">{message}</p>}{error&&<p className="qr-notice qr-error" role="alert">{error}</p>}
    <div className="qr-stats"><div><BookOpen size={20}/><span><strong>{quests.length}</strong><small>Quests in this reference</small></span></div><div className="qr-stat-complete"><Check size={20}/><span><strong>{example||currentProfile?completed.length:'N/A'}<em> / {quests.length}</em></strong><small>{example?'Example completed':'Completed in this reference'}</small></span></div><div><Trophy size={20}/><span><strong>{example||currentProfile?points:'N/A'}<em> QP</em></strong><small>{example?'Example quest points':'Points from matched completed quests'}</small></span></div></div>
    <div className="qr-layout"><section className="qr-list-panel" aria-label="Quest directory"><div className="qr-list-top"><h2>Quest directory</h2><p>Search for a quest, an item, or an unlock.</p><label className="qr-search"><Search size={17}/><input aria-label="Search quests and rewards" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Try fairy rings, Herblore, Dragon Slayer…"/></label><div className="qr-filters"><label>Status<select value={filter} onChange={event=>setFilter(event.target.value)}>{['All quests','Remaining','Completed','In progress'].map(value=><option key={value}>{value}</option>)}</select></label><label>Experience reward<select value={skill} onChange={event=>setSkill(event.target.value)}><option>All rewards</option>{skills.map(value=><option key={value}>{value}</option>)}</select></label></div><div className="qr-list-caption"><span>{visible.length} {visible.length===1?'quest':'quests'} · A–Z</span><span>QUEST POINTS</span></div></div>
      <div className="qr-quest-list">{visible.map(candidate=>{const status=statusOf(candidate),done=status==='completed';return <button key={candidate.name} className={`qr-quest-row ${done?'is-completed':''} ${selected===candidate.name?'is-selected':''}`} aria-expanded={selected===candidate.name} aria-controls="qr-reward-panel" onClick={()=>{setSelected(candidate.name);if(window.innerWidth<=760)requestAnimationFrame(()=>document.getElementById('qr-reward-panel')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));}}><span className="qr-row-status">{done?<Check size={16}/>:status==='started'?<Circle size={16} className="qr-started"/>:<BookOpen size={16}/>}</span><span className="qr-row-copy"><strong>{candidate.name}</strong><small>{example&&done?'Example · completed':stateNames[status]}</small></span><span className="qr-row-qp">{candidate.questPoints}<small>QP</small></span><ChevronRight size={15}/></button>;})}{!visible.length&&<div className="qr-empty"><Search size={24}/><h3>No matching quests</h3><p>Try another reward or clear your filters.</p><button onClick={()=>{setQuery('');setFilter('All quests');setSkill('All rewards');}}>Clear filters</button></div>}</div>
    </section>
    <section id="qr-reward-panel" className={`qr-reward-panel ${isCompleted?'is-completed':''}`} aria-label="Selected quest rewards" aria-live="polite"><div className="qr-detail-top"><span className="qr-eyebrow">THE REWARD FOR YOUR JOURNEY</span><span className={`qr-state ${isCompleted?'is-completed':''}`}>{isCompleted?<Check size={13}/>:<Circle size={12}/>} {example?'Example · ':''}{stateNames[state]}</span></div><h2>{quest.name}</h2><div className="qr-detail-tags"><span><Trophy size={14}/>{quest.questPoints} quest {quest.questPoints===1?'point':'points'}</span>{quest.skills.length>0&&<span><Sparkles size={14}/>{quest.skills.length} experience {quest.skills.length===1?'reward skill':'reward skills'}</span>}</div>
      {isCompleted&&<p className="qr-complete-note"><Check size={16}/>{example?'This example shows how completed quests stay fully viewable.':'Completed on your synced profile. All rewards remain available to browse.'}</p>}
      <div className="qr-rewards-heading"><Gem size={18}/><h3>Completion rewards</h3></div><ul className="qr-rewards">{quest.rewards.map((reward,index)=><li key={index} className={reward.depth?'qr-reward-note':''}><span className="qr-reward-bullet">{reward.depth?<ChevronRight size={12}/>:<Gem size={15}/>}</span><p>{reward.parts.map((part,i)=>'href' in part&&part.href?<a key={i} href={part.href} target="_blank" rel="noreferrer">{displayText(part.text)}</a>:<span key={i}>{displayText(part.text)}</span>)}</p></li>)}</ul>
      <div className="qr-detail-footer"><a href={quest.url} target="_blank" rel="noreferrer">Quest guide on the Wiki <ArrowUpRight size={14}/></a><small>Reward conditions and follow-up actions are retained from the reference.</small></div>
    </section></div>
    <footer className="qr-source"><BookOpen size={15}/><p>Rewards by <a href={catalogue.source} target="_blank" rel="noreferrer">RuneScape Wiki contributors</a>, reused under <a href={catalogue.licenseUrl} target="_blank" rel="noreferrer">{catalogue.license}</a>. Formatting adapted for Ironpath. <a href={`https://runescape.wiki/w/Special:PermanentLink/${catalogue.revision}`} target="_blank" rel="noreferrer">Source revision</a> · <a href={`https://runescape.wiki/w/Special:PermanentLink/${catalogue.templateRevision}`} target="_blank" rel="noreferrer">Reward table revision</a> · saved {catalogue.retrievedAt}.<br/>This snapshot follows the linked quest rewards table; miniquests and some newer quests may be absent. Unmatched quest statuses remain “Not synced”. Progress is stored per character in this browser; resync to refresh it.</p></footer>
  </section>;
}
