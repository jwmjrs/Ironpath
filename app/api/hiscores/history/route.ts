import { env } from 'cloudflare:workers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const group = url.searchParams.get('group')?.trim().toLowerCase();
  const size = Number(url.searchParams.get('size') || 4);
  const mode = url.searchParams.get('competitive') === 'true' ? 'competitive' : 'regular';
  if (!group || size < 2 || size > 5) return Response.json({ error: 'A valid group and size are required.' }, { status: 400 });
  const key = `${mode}:${size}:${group}`;
  const rows = await env.DB.prepare('SELECT total_level, total_xp, players_json, captured_at FROM hiscore_snapshots WHERE group_key = ? ORDER BY captured_at DESC LIMIT 60').bind(key).all<{ total_level:number; total_xp:number; players_json:string; captured_at:number }>();
  return Response.json({ snapshots: rows.results.reverse().map(row => ({ totalLevel:row.total_level,totalXp:row.total_xp,players:JSON.parse(row.players_json),capturedAt:new Date(row.captured_at).toISOString() })) });
}
