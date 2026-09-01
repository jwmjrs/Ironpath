import { env } from 'cloudflare:workers';

type Activity = { date?:string; text?:string; details?:string };
const normalize = (value:string) => value.replace(/[\u200B-\u200D\uFEFF]/gu,'').replace(/\s+/gu,' ').trim();
const timestamp = (value:string) => { const match=value.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4}) (\d{2}):(\d{2})$/); const months:Record<string,number>={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11}; return match ? Date.UTC(Number(match[3]),months[match[2]] ?? 0,Number(match[1]),Number(match[4]),Number(match[5])) : 0; };
function dropFromActivity(player:string, activity:Activity) {
  const title=(activity.text || '').replace(/\s+/gu,' ').trim();
  const match=title.match(/^(?:I\s+)?(?:received|obtained|found|looted)\s+(?:(\d[\d,]*)\s*(?:x|×)?\s+)?(?:an?\s+|the\s+)?(.+?)[.!]?$/iu);
  if (!match || /(?:quest points|total levels|levelled|achievement|qualification)/iu.test(title)) return null;
  const item=match[2].trim().replace(/\s+(?:drop|loot)$/iu,''); const occurredAt=timestamp(activity.date || '');
  return item && item.length <= 80 ? { item,quantity:match[1] ? Number(match[1].replaceAll(',','')) : 1,player,occurredAt,occurredDate:activity.date || '',activityText:title } : null;
}
async function setup() { await env.DB.batch([env.DB.prepare('CREATE TABLE IF NOT EXISTS group_drop_archive (id INTEGER PRIMARY KEY AUTOINCREMENT, group_key TEXT NOT NULL, item_key TEXT NOT NULL, item_name TEXT NOT NULL, quantity INTEGER NOT NULL, player_name TEXT NOT NULL, occurred_at INTEGER NOT NULL, occurred_date TEXT NOT NULL, activity_text TEXT NOT NULL)'),env.DB.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_group_drop_archive_unique ON group_drop_archive (group_key, item_key, player_name, occurred_at, activity_text)'),env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_group_drop_archive_group_time ON group_drop_archive (group_key, occurred_at)')]); }
async function hash(value:string) { const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)); return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join(''); }
async function workspaceAuthorized(request:Request) { const id=request.headers.get('x-ironpath-workspace') || ''; const token=request.headers.get('x-ironpath-token') || ''; if (!id || !token) return false; await env.DB.prepare('CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, name TEXT NOT NULL, data_json TEXT NOT NULL DEFAULT \'{}\', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)').run(); const workspace=await env.DB.prepare('SELECT token_hash FROM workspaces WHERE id = ?').bind(id).first<{token_hash:string}>(); return Boolean(workspace && workspace.token_hash === await hash(token)); }

export async function POST(request:Request) {
  await setup();
  if (!await workspaceAuthorized(request)) return Response.json({ error:'Connect your Group Hub workspace before adding archive history.' },{status:401});
  const body = await request.json().catch(() => ({})) as { group?:string; events?:Array<{item?:string;quantity?:number;player?:string;date?:string}> };
  const group=normalize(String(body.group || '')); const events=Array.isArray(body.events) ? body.events.slice(0,200) : [];
  if (!group || !events.length) return Response.json({ error:'A group and at least one historical entry are required.' },{status:400});
  const key=group.toLocaleLowerCase(); let added=0;
  for (const [index,event] of events.entries()) { const item=normalize(String(event.item || '')).slice(0,80); const player=normalize(String(event.player || '')).slice(0,20); const quantity=Math.max(1,Math.min(1_000_000,Math.floor(Number(event.quantity) || 1))); const date=String(event.date || '').trim(); const base=Date.parse(`${date}T12:00:00Z`); if (!item || !player || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(base)) continue; const occurredAt=base+index; const result=await env.DB.prepare('INSERT OR IGNORE INTO group_drop_archive (group_key,item_key,item_name,quantity,player_name,occurred_at,occurred_date,activity_text) VALUES (?,?,?,?,?,?,?,?)').bind(key,item.toLocaleLowerCase(),item,quantity,player,occurredAt,date,'Historical backfill').run(); added+=result.meta.changes || 0; }
  return Response.json({ added });
}

export async function GET(request:Request) {
  const url=new URL(request.url); const group=normalize(url.searchParams.get('group') || ''); const players=[...new Set(url.searchParams.getAll('player').map(normalize).filter(Boolean))].slice(0,5);
  if (!group || !players.length) return Response.json({ error:'A group and one to five members are required.' },{status:400});
  await setup(); const key=group.toLocaleLowerCase(); let imported=0;
  for (const player of players) { try { const response=await fetch(`https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(player)}&activities=20`,{headers:{'User-Agent':'Ironpath Group Ironman Companion'}}); const profile=await response.json() as { activities?:Activity[] }; for (const activity of profile.activities || []) { const drop=dropFromActivity(player,activity); if (!drop) continue; const result=await env.DB.prepare('INSERT OR IGNORE INTO group_drop_archive (group_key,item_key,item_name,quantity,player_name,occurred_at,occurred_date,activity_text) VALUES (?,?,?,?,?,?,?,?)').bind(key,drop.item.toLocaleLowerCase(),drop.item,drop.quantity,drop.player,drop.occurredAt,drop.occurredDate,drop.activityText).run(); imported += result.meta.changes || 0; } } catch { /* Individual profiles may be unavailable. */ } }
  const rows=await env.DB.prepare('SELECT item_name,quantity,player_name,occurred_at,occurred_date,activity_text FROM group_drop_archive WHERE group_key = ? ORDER BY occurred_at DESC LIMIT 500').bind(key).all<{item_name:string;quantity:number;player_name:string;occurred_at:number;occurred_date:string;activity_text:string}>();
  return Response.json({ group,imported,events:rows.results.map(row=>({item:row.item_name,quantity:row.quantity,player:row.player_name,timestamp:row.occurred_at,date:row.occurred_date,source:row.activity_text})) },{headers:{'Cache-Control':'private, no-store'}});
}
