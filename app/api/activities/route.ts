import { env } from 'cloudflare:workers';

type RuneMetricsActivity = { date?:string; text?:string; details?:string };
type MemberResult = { name:string; available:boolean; reason?:string; activities:Array<{ player:string; date:string; timestamp:number; text:string; details:string }> };

function activityTime(value:string) {
  const match = value.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4}) (\d{2}):(\d{2})$/);
  if (!match) return 0;
  const months:Record<string,number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  return Date.UTC(Number(match[3]), months[match[2]] ?? 0, Number(match[1]), Number(match[4]), Number(match[5]));
}

async function loadMember(name:string):Promise<MemberResult> {
  try {
    const endpoint = `https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(name)}&activities=20`;
    const response = await fetch(endpoint, { headers:{ 'User-Agent':'Ironpath Group Ironman Companion' } });
    if (!response.ok) return { name,available:false,reason:'RuneMetrics did not respond for this member.',activities:[] };
    const profile = await response.json() as { error?:string; activities?:RuneMetricsActivity[] };
    if (profile.error) return { name,available:false,reason:profile.error === 'PROFILE_PRIVATE' ? 'RuneMetrics profile is private.' : 'Activity log is unavailable.',activities:[] };
    return { name,available:true,activities:(profile.activities || []).map(item => ({ player:name,date:item.date || '',timestamp:activityTime(item.date || ''),text:item.text || 'RuneScape milestone',details:item.details || '' })) };
  } catch { return { name,available:false,reason:'Activity log is temporarily unavailable.',activities:[] }; }
}

export async function GET(request:Request) {
  const url = new URL(request.url);
  const players = [...new Set(url.searchParams.getAll('player').map(name => name.trim()).filter(Boolean))].slice(0,5);
  if (!players.length || players.some(name => name.length > 20)) return Response.json({ error:'One to five valid member names are required.' }, { status:400 });
  const cacheKey = `activities:${players.map(name => name.toLowerCase()).sort().join('|')}`;
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS hiscore_cache (cache_key TEXT PRIMARY KEY, response_json TEXT NOT NULL, fetched_at INTEGER NOT NULL)').run();
  const cached = await env.DB.prepare('SELECT response_json, fetched_at FROM hiscore_cache WHERE cache_key = ?').bind(cacheKey).first<{response_json:string;fetched_at:number}>();
  if (cached && Date.now()-cached.fetched_at < 300_000) return Response.json({ ...JSON.parse(cached.response_json),cached:true });
  const members = await Promise.all(players.map(loadMember));
  const activities = members.flatMap(member => member.activities).sort((a,b) => b.timestamp-a.timestamp).slice(0,40);
  const result = { activities,members:members.map(({name,available,reason}) => ({name,available,reason})),refreshedAt:new Date().toISOString() };
  await env.DB.prepare('INSERT INTO hiscore_cache (cache_key,response_json,fetched_at) VALUES (?,?,?) ON CONFLICT(cache_key) DO UPDATE SET response_json=excluded.response_json,fetched_at=excluded.fetched_at').bind(cacheKey,JSON.stringify(result),Date.now()).run();
  return Response.json(result, { headers:{'Cache-Control':'private, max-age=60'} });
}
