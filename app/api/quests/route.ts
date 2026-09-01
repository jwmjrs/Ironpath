import { env } from 'cloudflare:workers';

type RuneMetricsQuest = { title?:string; status?:string; difficulty?:number; members?:boolean; questPoints?:number; userEligible?:boolean };

const normalizePlayerName = (value:string) => value.replace(/[\u200B-\u200D\uFEFF]/gu, '').replace(/\s+/gu, ' ').trim();

export async function GET(request:Request) {
  const player = normalizePlayerName(new URL(request.url).searchParams.get('player') || '');
  if (!player || player.length > 20) return Response.json({ error:'Enter one valid RuneScape character name.' }, { status:400 });

  await env.DB.prepare('CREATE TABLE IF NOT EXISTS hiscore_cache (cache_key TEXT PRIMARY KEY, response_json TEXT NOT NULL, fetched_at INTEGER NOT NULL)').run();
  const cacheKey = `quests:${player.toLowerCase()}`;
  const cached = await env.DB.prepare('SELECT response_json, fetched_at FROM hiscore_cache WHERE cache_key = ?').bind(cacheKey).first<{ response_json:string; fetched_at:number }>();
  if (cached && Date.now() - cached.fetched_at < 300_000) return Response.json({ ...JSON.parse(cached.response_json), cached:true }, { headers:{ 'Cache-Control':'private, max-age=60' } });

  try {
    const response = await fetch(`https://apps.runescape.com/runemetrics/quests?user=${encodeURIComponent(player)}`, { headers:{ 'User-Agent':'Ironpath Group Ironman Companion' } });
    if (!response.ok) throw new Error(`RuneMetrics returned HTTP ${response.status}.`);
    const profile = await response.json() as { error?:string; quests?:RuneMetricsQuest[] };
    if (profile.error === 'PROFILE_PRIVATE') return Response.json({ error:'This RuneMetrics profile is private. Make the profile public, then try again.' }, { status:403 });
    if (profile.error || !Array.isArray(profile.quests)) throw new Error('RuneMetrics did not provide quest data for this character.');
    const quests = profile.quests.filter(quest => quest.title).map(quest => ({ title:quest.title!,status:quest.status || 'UNKNOWN',completed:/COMPLETE/iu.test(quest.status || ''),difficulty:quest.difficulty ?? null,members:quest.members ?? null,questPoints:quest.questPoints ?? null,eligible:quest.userEligible ?? null }));
    const result = { player,quests,refreshedAt:new Date().toISOString() };
    await env.DB.prepare('INSERT INTO hiscore_cache (cache_key,response_json,fetched_at) VALUES (?,?,?) ON CONFLICT(cache_key) DO UPDATE SET response_json=excluded.response_json,fetched_at=excluded.fetched_at').bind(cacheKey,JSON.stringify(result),Date.now()).run();
    return Response.json(result, { headers:{ 'Cache-Control':'private, no-store' } });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : 'Quest data is temporarily unavailable.' }, { status:502 });
  }
}
