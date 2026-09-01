import { archaeologyCollectors } from '../../data/archaeology-collectors';

type WikiResponse = { parse?:{ text?:{ '*':string } } };
const cache = new Map<string,{expires:number;value:CollectionDetail}>();
type CollectionDetail = { name:string; artefacts:string[]; reward:string; recurring:string };
const clean = (value:string) => value.replace(/<[^>]*>/gu,'').replace(/&#\d+;/gu,' ').replace(/&amp;/gu,'&').replace(/\s+/gu,' ').trim();

async function collectionDetail(name:string) {
  const cached=cache.get(name); if (cached && cached.expires>Date.now()) return cached.value;
  const url=`https://runescape.wiki/api.php?action=parse&page=${encodeURIComponent(name)}&prop=text&format=json`;
  const response=await fetch(url,{headers:{'User-Agent':'Ironpath Group Ironman Companion'}});
  if (!response.ok) throw new Error('The RuneScape Wiki did not return this collection.');
  const html=(await response.json() as WikiResponse).parse?.text?.['*'] || '';
  const field=(key:string) => clean(html.match(new RegExp(`data-attr-param="${key}">([\\s\\S]*?)<\\/td>`, 'u'))?.[1] || 'No unique reward listed');
  const amount=Number(clean(html.match(/data-attr-param="artefacts">(\d+)/u)?.[1] || '0'));
  const artefacts=[...html.matchAll(/<tr[^>]*data-rowid="([^"]+)"/gu)].map(match=>clean(match[1])).slice(0,amount || undefined);
  const value={name,artefacts,reward:field('firstdisp'),recurring:field('recurringdisp')}; cache.set(name,{expires:Date.now()+21_600_000,value}); return value;
}

export async function GET(request:Request) {
  const collector=new URL(request.url).searchParams.get('collector') || '';
  const selected=archaeologyCollectors.find(item=>item.name===collector);
  if (!selected) return Response.json({error:'Choose a valid Archaeology collector.'},{status:400});
  const collections=await Promise.all(selected.collections.map(async name=>{ try { return await collectionDetail(name); } catch { return {name,artefacts:[],reward:'Check the Wiki entry for this collection.',recurring:'Not available'}; }}));
  return Response.json({collector:selected,collections},{headers:{'Cache-Control':'public, max-age=900'}});
}
