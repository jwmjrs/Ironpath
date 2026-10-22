import { env } from 'cloudflare:workers';
import { CachedWiki, type CacheRecord, type WikiStore } from '../../lib/wiki-cache';
import { fetchStrategy, searchStrategies, validBossName } from '../../lib/wiki-strategies';
let setup:Promise<unknown>|null=null;
function ensure(){return setup||=(env.DB.batch([
  env.DB.prepare('CREATE TABLE IF NOT EXISTS wiki_strategy_cache (cache_key TEXT PRIMARY KEY, record_json TEXT NOT NULL, fetched_at INTEGER NOT NULL)'),
  env.DB.prepare('CREATE TABLE IF NOT EXISTS wiki_strategy_locks (cache_key TEXT PRIMARY KEY, expires_at INTEGER NOT NULL)'),
]).catch(error=>{setup=null;throw error;}));}
const store:WikiStore={
  async read(key){await ensure();const row=await env.DB.prepare('SELECT record_json FROM wiki_strategy_cache WHERE cache_key = ?').bind(key).first<{record_json:string}>();return row?JSON.parse(row.record_json) as CacheRecord:null;},
  async write(key,record){await env.DB.prepare('INSERT INTO wiki_strategy_cache (cache_key,record_json,fetched_at) VALUES (?,?,?) ON CONFLICT(cache_key) DO UPDATE SET record_json=excluded.record_json,fetched_at=excluded.fetched_at').bind(key,JSON.stringify(record),record.fetchedAt).run();await env.DB.prepare('DELETE FROM wiki_strategy_cache WHERE cache_key IN (SELECT cache_key FROM wiki_strategy_cache ORDER BY fetched_at DESC LIMIT -1 OFFSET 300)').run();},
  async claim(key,until,now){await ensure();const row=await env.DB.prepare('INSERT INTO wiki_strategy_locks (cache_key,expires_at) VALUES (?,?) ON CONFLICT(cache_key) DO UPDATE SET expires_at=excluded.expires_at WHERE wiki_strategy_locks.expires_at < ? RETURNING cache_key').bind(key,until,now).first();return Boolean(row);},
  async release(key){await env.DB.prepare('DELETE FROM wiki_strategy_locks WHERE cache_key = ?').bind(key).run();},
};
const cache=new CachedWiki(store);
export async function GET(request:Request){
  const params=new URL(request.url).searchParams,search=params.has('q');
  const name=validBossName(params.get(search?'q':'name')||'');
  if(!name)return Response.json({error:'Enter a boss name between 2 and 100 characters.'},{status:400});
  try{
    const record=await cache.get(`${search?'search-v2':'guide-v4'}:${name.toLowerCase()}`,search?3_600_000:7*86_400_000,()=>search?searchStrategies(name):fetchStrategy(name));
    if(!record.data)return Response.json({error:record.error},{status:record.status||502,headers:{'Cache-Control':'no-store','Retry-After':'5'}});
    const stale=record.expiresAt<=Date.now();
    return Response.json({...(search?{results:record.data}:{guide:record.data}),fetchedAt:new Date(record.fetchedAt).toISOString(),expiresAt:new Date(record.expiresAt).toISOString(),stale},{headers:{'Cache-Control':stale?'no-store':'public, max-age=3600','X-Ironpath-Cache':'server-persisted'}});
  }catch{return Response.json({error:'The strategy cache is temporarily unavailable.'},{status:503,headers:{'Cache-Control':'no-store','Retry-After':'5'}});}
}
