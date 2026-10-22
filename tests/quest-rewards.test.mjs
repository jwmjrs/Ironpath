import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { questKey,questState,questStatusMap,readQuestProfile } from '../app/lib/quest-rewards.ts';
const catalogue=JSON.parse(fs.readFileSync(new URL('../app/data/quest-rewards.json',import.meta.url),'utf8'));
test('quest sync only marks explicitly completed statuses green',()=>{
 assert.equal(questState('COMPLETED'),'completed');assert.equal(questState('COMPLETE'),'completed');
 for(const status of ['NOT_COMPLETE','NOT_STARTED','INCOMPLETE','UNKNOWN',''])assert.notEqual(questState(status),'completed');
 assert.equal(questState('STARTED'),'started');
});
test('quest name matching tolerates Wiki articles and apostrophes without fuzzy cross-quest matches',()=>{
 assert.equal(questKey('The Restless Ghost'),questKey('Restless Ghost'));
 assert.equal(questKey('Cook’s Assistant'),questKey("Cook's Assistant"));
 assert.notEqual(questKey('A Fairy Tale I - Growing Pains'),questKey('A Fairy Tale II - Cure a Queen'));
});
test('saved character progress stays attached to its own player and unmatched quests remain unknown',()=>{
 const profile={player:'Example',refreshedAt:'2026-10-17T12:00:00Z',quests:[{title:"Cook's Assistant",status:'COMPLETED'},{title:'Dragon Slayer',status:'NOT_STARTED'}]};
 assert.equal(readQuestProfile(profile,'Other player'),null);assert.equal(readQuestProfile({...profile,refreshedAt:'invalid'},'Example'),null);
 const states=questStatusMap(readQuestProfile(profile,'example'));
 assert.equal(states.get(questKey('Cook’s Assistant')),'completed');assert.equal(states.get(questKey('Dragon Slayer')),'not-started');assert.equal(states.get(questKey('Missing quest')),undefined);
});
test('cached Wiki reference retains complete reward lists, follow-up notes and safe source links',()=>{
 assert.equal(catalogue.quests.length,295);assert.equal(new Set(catalogue.quests.map(q=>q.name)).size,295);
 const fairy=catalogue.quests.find(q=>q.name==='A Fairy Tale I - Growing Pains');
 assert.ok(fairy.rewards.some(r=>r.depth>0&&r.parts.some(p=>/10%/.test(p.text))));
 assert.ok(fairy.rewards.some(r=>r.parts.some(p=>p.text==='Magic secateurs')));
 for(const q of catalogue.quests){assert.ok(Number.isInteger(q.questPoints)&&q.questPoints>0);assert.ok(q.rewards.length>0);assert.ok(q.url.startsWith('https://runescape.wiki/w/'));for(const r of q.rewards)for(const p of r.parts)if(p.href)assert.ok(p.href.startsWith('https://runescape.wiki/w/'));}
});
