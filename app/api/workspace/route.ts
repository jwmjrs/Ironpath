import { env } from 'cloudflare:workers';

const emptyData = { version: 1, efficient: {}, repeatables: {}, unlocks: {}, journey: {}, supplies: [], shops: {}, pvm: {}, farming: {}, kingdom: {}, updatedBy: '' };

async function hash(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}

function credentials(request: Request) {
  return { id: request.headers.get('x-ironpath-workspace') || '', token: request.headers.get('x-ironpath-token') || '' };
}

async function initialize() {
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, name TEXT NOT NULL, data_json TEXT NOT NULL DEFAULT \'{}\', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_workspaces_updated_at ON workspaces(updated_at)'),
  ]);
}

async function authorized(request: Request) {
  const { id, token } = credentials(request);
  if (!id || !token) return null;
  const row = await env.DB.prepare('SELECT id, token_hash, name, data_json, updated_at FROM workspaces WHERE id = ?').bind(id).first<{ id:string; token_hash:string; name:string; data_json:string; updated_at:number }>();
  return row && row.token_hash === await hash(token) ? row : null;
}

export async function POST(request: Request) {
  await initialize();
  const body = await request.json<{ name?: string }>().catch(() => ({}));
  const name = String(body.name || 'My Ironman Group').trim().slice(0, 60);
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  const token = `${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
  const now = Date.now();
  await env.DB.prepare('INSERT INTO workspaces (id, token_hash, name, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, await hash(token), name, JSON.stringify(emptyData), now, now).run();
  return Response.json({ id, token, name, data: emptyData, updatedAt: now }, { status: 201 });
}

export async function GET(request: Request) {
  await initialize();
  const row = await authorized(request);
  if (!row) return Response.json({ error: 'Workspace not found or access key is invalid.' }, { status: 401 });
  return Response.json({ id: row.id, name: row.name, data: JSON.parse(row.data_json), updatedAt: row.updated_at });
}

export async function PUT(request: Request) {
  await initialize();
  const row = await authorized(request);
  if (!row) return Response.json({ error: 'Workspace not found or access key is invalid.' }, { status: 401 });
  const raw = await request.text();
  if (raw.length > 750_000) return Response.json({ error: 'Workspace data is too large.' }, { status: 413 });
  const body = JSON.parse(raw) as { data?: unknown; name?: string };
  if (!body.data || typeof body.data !== 'object') return Response.json({ error: 'Workspace data is required.' }, { status: 400 });
  const now = Date.now();
  const name = String(body.name || row.name).trim().slice(0, 60);
  await env.DB.prepare('UPDATE workspaces SET name = ?, data_json = ?, updated_at = ? WHERE id = ?').bind(name, JSON.stringify(body.data), now, row.id).run();
  return Response.json({ ok: true, updatedAt: now });
}
