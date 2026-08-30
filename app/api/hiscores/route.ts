const skillNames = [
  'Overall', 'Attack', 'Defence', 'Strength', 'Constitution', 'Ranged',
  'Prayer', 'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing',
  'Firemaking', 'Crafting', 'Smithing', 'Mining', 'Herblore', 'Agility',
  'Thieving', 'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction',
  'Summoning', 'Dungeoneering', 'Divination', 'Invention', 'Archaeology',
  'Necromancy',
];

type Skill = { name: string; rank: number; level: number; xp: number };

async function initializeHiscoreStorage() {
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS hiscore_cache (cache_key TEXT PRIMARY KEY, response_json TEXT NOT NULL, fetched_at INTEGER NOT NULL)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS hiscore_snapshots (id INTEGER PRIMARY KEY AUTOINCREMENT, group_key TEXT NOT NULL, total_level INTEGER NOT NULL, total_xp INTEGER NOT NULL, players_json TEXT NOT NULL, captured_at INTEGER NOT NULL)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_hiscore_snapshots_group_captured ON hiscore_snapshots(group_key, captured_at)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS request_limits (bucket_key TEXT PRIMARY KEY, request_count INTEGER NOT NULL, window_start INTEGER NOT NULL)'),
  ]);
}

async function checkRateLimit(request: Request) {
  const client = request.headers.get('cf-connecting-ip') || 'local';
  if (client === 'local') return true;
  const windowStart = Math.floor(Date.now() / 600_000) * 600_000;
  const key = `${client}:${windowStart}`;
  await env.DB.prepare('INSERT INTO request_limits (bucket_key, request_count, window_start) VALUES (?, 1, ?) ON CONFLICT(bucket_key) DO UPDATE SET request_count = request_count + 1').bind(key, windowStart).run();
  const row = await env.DB.prepare('SELECT request_count FROM request_limits WHERE bucket_key = ?').bind(key).first<{ request_count:number }>();
  return (row?.request_count || 0) <= 30;
}

function parsePlayerHiscores(csv: string): Skill[] {
  return csv.trim().split('\n').slice(0, skillNames.length).map((row, index) => {
    const [rank, level, xp] = row.split(',').map(Number);
    return { name: skillNames[index], rank, level, xp };
  });
}

function decodeName(value: string) {
  return value.replaceAll('\\u0026', '&').replaceAll('\\"', '"');
}

function pageNumber(html: string, key: string) {
  const match = html.match(new RegExp(`${key}[\\s\\S]{0,900}?\\\\"children\\\\":\\\\"([\\d,]+)\\\\"`));
  return match ? Number(match[1].replaceAll(',', '')) : 0;
}

function memberPageTotals(html: string, name: string) {
  const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const segment = html.match(new RegExp(`GROUP_MEMBER_TOTAL_${safeName}[\\s\\S]{0,6500}`))?.[0] || '';
  const values = [...segment.matchAll(/clampedTextLarge\\",\\"children\\":\\"([\d,]+)\\"/g)];
  return { level: Number(values[0]?.[1].replaceAll(',', '') || 0), xp: Number(values[1]?.[1].replaceAll(',', '') || 0) };
}

const groupSkillKeys = [
  'attack','defence','strength','hitpoints','ranged','prayer','magic','cooking',
  'woodcutting','fletching','fishing','firemaking','crafting','smithing','mining',
  'herblore','agility','thieving','slayer','farming','runecraft','hunter',
  'construction','summoning','dungeoneering','divination','invention','archaeology','necromancy',
];

function memberPageSkills(html: string, name: string): Skill[] {
  const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const start = html.search(new RegExp(`GROUP_MEMBER_TOTAL_${safeName}`));
  if (start < 0) return [];
  const next = html.indexOf('GROUP_MEMBER_TOTAL_', start + `GROUP_MEMBER_TOTAL_${name}`.length);
  const rawSegment = html.slice(start, next > start ? next : undefined);
  const tokenMap = new Map<string, string>();
  for (const match of html.matchAll(/\\n([0-9a-f]+):([\s\S]*?)(?=\\n[0-9a-f]+:|<\\\/script>)/g)) tokenMap.set(match[1], match[2]);
  const expand = (text: string, depth = 0): string => depth > 4 ? text : text.replace(/\$L([0-9a-f]+)/g, (_all, id: string) => expand(tokenMap.get(id) || '', depth + 1));
  const segment = expand(rawSegment);
  return groupSkillKeys.flatMap((key, index) => {
    const pattern = new RegExp(`SKILL_TOTAL_${key}_level[\\s\\S]{0,700}?\\\\"children\\\\":\\\\"([\\d,]+)\\\\"[\\s\\S]{0,700}?SKILL_TOTAL_${key}_xp[\\s\\S]{0,700}?\\\\"children\\\\":\\\\"([\\d,]+)\\\\"`);
    const match = segment.match(pattern);
    return match ? [{ name: skillNames[index + 1], rank: -1, level: Number(match[1].replaceAll(',', '')), xp: Number(match[2].replaceAll(',', '')) }] : [];
  });
}

export async function GET(request: Request) {
  await initializeHiscoreStorage();
  if (!await checkRateLimit(request)) return Response.json({ error: 'Too many lookups. Please wait a few minutes and try again.' }, { status: 429, headers: { 'Retry-After': '600' } });
  const url = new URL(request.url);
  const group = url.searchParams.get('group')?.trim();
  const size = Number(url.searchParams.get('size') || 4);
  const competitive = url.searchParams.get('competitive') === 'true';

  if (!group || size < 2 || size > 5) {
    return Response.json({ error: 'Enter a group name and choose a group size from 2 to 5.' }, { status: 400 });
  }

  const mode = competitive ? 'competitive' : 'regular';
  const groupUrl = `https://rs.runescape.com/hiscores/group-ironman/${mode}/${size}/${encodeURIComponent(group)}`;
  const cacheKey = `${mode}:${size}:${group.toLowerCase()}`;
  const cached = await env.DB.prepare('SELECT response_json, fetched_at FROM hiscore_cache WHERE cache_key = ?').bind(cacheKey).first<{ response_json:string; fetched_at:number }>();
  if (cached && Date.now() - cached.fetched_at < 300_000) return Response.json({ ...JSON.parse(cached.response_json), cached: true }, { headers: { 'Cache-Control': 'private, max-age=60' } });

  try {
    const groupResponse = await fetch(groupUrl, {
      headers: { 'User-Agent': 'Ironpath local Group Ironman tracker' },
    });
    if (!groupResponse.ok) throw new Error('The RuneScape group page did not respond.');
    const html = await groupResponse.text();
    const memberMatches = [...html.matchAll(/\\"displayName\\":\\"([^"\\]+)\\"/g)];
    const members = [...new Set(memberMatches.map(match => decodeName(match[1])))]
      .filter(name => name && name !== group)
      .slice(0, size);

    if (!members.length || html.includes("Oops, something went wrong")) {
      return Response.json({ error: 'Group not found. Check the exact name, size, and mode.' }, { status: 404 });
    }

    const playerResults = await Promise.all(members.map(async name => {
      const response = await fetch(`https://secure.runescape.com/m=hiscore/index_lite.ws?player=${encodeURIComponent(name)}`, {
        headers: { 'User-Agent': 'Ironpath local Group Ironman tracker' },
      });
      if (!response.ok) return { name, skills: [] as Skill[] };
      return { name, skills: parsePlayerHiscores(await response.text()) };
    }));

    const players = playerResults.map(player => {
      const pageTotals = memberPageTotals(html, player.name);
      const apiOverall = player.skills[0];
      return {
      name: player.name,
      overall: apiOverall ? { ...apiOverall, level: pageTotals.level || apiOverall.level, xp: pageTotals.xp || apiOverall.xp } : (pageTotals.level ? { name: 'Overall', rank: -1, ...pageTotals } : null),
      skills: player.skills.length > 1 ? player.skills.slice(1) : memberPageSkills(html, player.name),
    }; });
    const totalLevel = pageNumber(html, 'GROUP_TOTALS_OVERALL_level') || players.reduce((sum, player) => sum + (player.overall?.level || 0), 0);
    const totalXp = pageNumber(html, 'GROUP_TOTALS_OVERALL_xp') || players.reduce((sum, player) => sum + (player.overall?.xp || 0), 0);

    const result = {
      group: group.replaceAll('+', ' '), mode, size, totalLevel, totalXp, players,
      refreshedAt: new Date().toISOString(), sourceUrl: groupUrl,
    };
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO hiscore_cache (cache_key, response_json, fetched_at) VALUES (?, ?, ?) ON CONFLICT(cache_key) DO UPDATE SET response_json = excluded.response_json, fetched_at = excluded.fetched_at').bind(cacheKey, JSON.stringify(result), now),
      env.DB.prepare('INSERT INTO hiscore_snapshots (group_key, total_level, total_xp, players_json, captured_at) VALUES (?, ?, ?, ?, ?)').bind(cacheKey, totalLevel, totalXp, JSON.stringify(players), now),
      env.DB.prepare('DELETE FROM request_limits WHERE window_start < ?').bind(now - 86_400_000),
    ]);
    return Response.json(result, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (error) {
    if (cached) return Response.json({ ...JSON.parse(cached.response_json), cached: true, stale: true, warning: 'RuneScape did not respond; showing the most recent saved result.' });
    return Response.json({ error: error instanceof Error ? error.message : 'Unable to refresh HiScores.' }, { status: 502 });
  }
}
import { env } from 'cloudflare:workers';
