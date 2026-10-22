import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStrategy,fetchStrategy,validBossName } from '../app/lib/wiki-strategies.ts';
import { CachedWiki } from '../app/lib/wiki-cache.ts';
test('strategy formatting preserves headings, paragraphs, lists, and table spans without executable HTML',()=>{
 const blocks=parseStrategy(`<div><div class="toc"><ul><li>Navigation</li></ul></div><h2 id="Strategy">Strategy &amp; mechanics</h2><p>Use <a href="/w/Protect_from_Melee">Protect from Melee</a> &#8212; keep moving.<script>alert('bad')</script><img src="x" onerror="bad()" alt=""/></p><ul><li>First attack</li><li>Second &lt;attack&gt;</li></ul><table><tr><th colspan="2">Equipment</th></tr><tr><td rowspan="2">Weapon</td><td><a href="javascript:alert(1)">Example</a></td></tr></table></div>`);
 assert.equal(blocks.length,4);assert.equal(blocks[0].content.map(p=>p.text).join(''),'Strategy & mechanics');
 assert.equal(blocks[1].content.map(p=>p.text).join(''),'Use Protect from Melee — keep moving.');
 assert.equal(blocks[1].content[1].href,'https://runescape.wiki/w/Protect_from_Melee');
 assert.equal(blocks[2].items[1][0].text,'Second <attack>');assert.equal(blocks[3].rows[0].cells[0].colSpan,2);assert.equal(blocks[3].rows[1].cells[0].rowSpan,2);assert.equal(blocks[3].rows[1].cells[1].content[0].href,undefined);
 assert.ok(!JSON.stringify(blocks).includes('alert'));assert.equal(validBossName('Nex/Strategies'),null);assert.equal(validBossName("K'ril Tsutsaroth"),"K'ril Tsutsaroth");
});
test('redirected strategy pages preserve the canonical title, exact revision, and reuse attribution',async()=>{
 const guide=await fetchStrategy('Alias',async url=>{assert.equal(new URL(url).searchParams.get('redirects'),'1');return Response.json({parse:{title:'Canonical boss/Strategies',revid:123,text:{'*':'<h2>Fight</h2><p>Keep moving.</p>'}}});});
 assert.equal(guide.name,'Canonical boss');assert.equal(guide.revisionUrl,'https://runescape.wiki/w/Special:PermanentLink/123');assert.equal(guide.license,'CC BY-NC-SA 3.0');
});
function memory(){const rows=new Map(),locks=new Map();return {rows,store:{read:async key=>rows.get(key)||null,write:async(key,record)=>{rows.set(key,record);},claim:async(key,until,now)=>{if((locks.get(key)||0)>now)return false;locks.set(key,until);return true;},release:async key=>{locks.delete(key);}}};}
test('persistent cache suppresses repeated and simultaneous Wiki fetches, then keeps stale content and backs off after an outage',async()=>{
 const {rows,store}=memory();let now=1000,calls=0;const cache=new CachedWiki(store,()=>now);const load=async()=>{calls++;return {text:'Strategy'};};
 await Promise.all([cache.get('boss',7000,load),cache.get('boss',7000,load)]);assert.equal(calls,1);
 await new CachedWiki(store,()=>now).get('boss',7000,load);assert.equal(calls,1);
 now=9000;const stale=await cache.get('boss',7000,async()=>{calls++;throw new Error('outage');});assert.deepEqual(stale.data,{text:'Strategy'});assert.equal(calls,2);
 await cache.get('boss',7000,load);assert.equal(calls,2);assert.ok(rows.get('boss').retryAt>now);
 now=rows.get('boss').retryAt+1;await cache.get('boss',7000,load);assert.equal(calls,3);
});
test('modern Wiki equipment cards and mode tabs retain their requirements and advice',()=>{
 const blocks=parseStrategy('<div class="tabbertab" data-title="Normal mode"><div class="calc-header-title"><span>Requirements</span></div><div class="calc-list-item calc-compact"><div class="calc-list-item-title"><a href="/w/Constitution">70+ Constitution</a></div><div class="calc-list-item-desc">You need this level to enter the fortress.</div></div></div>');
 assert.equal(blocks[0].content[0].text,'Normal mode');assert.equal(blocks[1].content[0].text,'Requirements');assert.equal(blocks[2].type,'callout');assert.equal(blocks[2].title[0].text,'70+ Constitution');assert.equal(blocks[2].content[0].text,'You need this level to enter the fortress.');
});
test('equipment tables and recommendation cards retain exact artwork, links, and safe fallback titles',()=>{
 const blocks=parseStrategy('<h2>Equipment</h2><table><tr><td><a href="/w/Augmented_Bow_of_the_Last_Guardian"><img src="/images/thumb/Bow_of_the_Last_Guardian.png/40px-Bow_of_the_Last_Guardian.png?abc" alt="Bow of the Last Guardian"></a><a href="/w/Augmented_Bow_of_the_Last_Guardian">Augmented weapon</a></td></tr></table><div class="calc-list-item"><div class="calc-list-item-thumbnail"><img src="/images/Torso_slot.png?abc"></div><div class="calc-list-item-title">Armour</div><div class="calc-list-item-desc"><img src="https://evil.example/images/Wrong.png" alt="Wrong"><a href="/w/Sirenic_armour">Sirenic</a></div></div>');
 const parts=blocks[1].rows[0].cells[0].content;
 assert.equal(parts[0].image.title,'Augmented Bow of the Last Guardian');
 assert.equal(parts[0].image.src,'https://runescape.wiki/images/thumb/Bow_of_the_Last_Guardian.png/40px-Bow_of_the_Last_Guardian.png?abc');
 assert.equal(parts[0].href,'https://runescape.wiki/w/Augmented_Bow_of_the_Last_Guardian');
 assert.equal(parts[1].text,'Augmented weapon');
 assert.equal(blocks[2].image.title,'Torso slot');
 assert.equal(blocks[2].content.length,1);
 assert.ok(!JSON.stringify(blocks).includes('evil.example'));
});

test('equipment preset slots and inventory cells keep their arrangement and empty slots',()=>{
 const blocks=parseStrategy('<div class="equipmenttable" title="Ranged preset"><div class="equipmentrow"><div class="equipmentslot headslot"><a href="/w/Armadyl_helmet"><img src="/images/Armadyl_helmet.png"></a></div><div class="equipmentslot pocketslot"></div></div></div><table class="inventorytable"><tr><td><img src="/images/Sailfish.png"></td><td></td></tr></table>');
 assert.equal(blocks[0].type,'equipment');assert.equal(blocks[0].title,'Ranged preset');assert.equal(blocks[0].slots[0].slot,'headslot');assert.equal(blocks[0].slots[0].content[0].image.title,'Armadyl helmet');assert.equal(blocks[0].slots[1].content.length,0);assert.equal(blocks[1].inventory,true);assert.equal(blocks[1].rows[0].cells.length,2);
});
