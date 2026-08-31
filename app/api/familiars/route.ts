type WikiFamiliar = { level:number; name:string; special:string; boost:string; ability:string; charm?:string; shards?:string; tertiary?:string };
type PouchMaterials = { charm:string; shards:string; tertiary:string };

const WIKI_URL = 'https://runescape.wiki/api.php?action=parse&page=Summoning_familiars&prop=text&format=json&origin=*';
const POUCH_URL = 'https://runescape.wiki/api.php?action=parse&page=Calculator%3ASummoning%2FPouches&prop=text&format=json&origin=*';
let cached: { expires:number; familiars:WikiFamiliar[] } | null = null;

function clean(value:string) {
  return value.replace(/<br\s*\/?>/gi, ' · ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}

function familiarKey(value:string) { return value.toLowerCase().replace(/\bpouch\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }

function pouchTable(html:string) {
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  const materials = new Map<string,PouchMaterials>();

  for (const table of tables) {
    const rows = table.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    const parsedRows = rows.map(row => [...row.matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map(match => clean(match[1])));
    const headerIndex = parsedRows.findIndex(cells => cells.some(cell => /spirit shards/i.test(cell)) && cells.some(cell => /charm/i.test(cell)) && cells.some(cell => /pouch/i.test(cell)));
    if (headerIndex < 0) continue;

    const headers = parsedRows[headerIndex].map(cell => cell.toLowerCase());
    const indexOf = (expression:RegExp) => headers.findIndex(header => expression.test(header));
    const pouchIndex = indexOf(/pouch/);
    const levelIndex = indexOf(/^level$/);
    const shardsIndex = indexOf(/spirit shards/);
    const charmIndex = indexOf(/^charm$/);
    const tertiaryIndex = indexOf(/tertiary/);
    if ([pouchIndex, levelIndex, shardsIndex, charmIndex, tertiaryIndex].some(index => index < 0)) continue;

    for (const cells of parsedRows.slice(headerIndex + 1)) {
      if (!/^\d+$/.test(cells[levelIndex] || '')) continue;
      const name = familiarKey(cells[pouchIndex] || '');
      const charm = cells[charmIndex] || '';
      if (name && charm) materials.set(name, { shards:cells[shardsIndex] || '', charm, tertiary:cells[tertiaryIndex] || '' });
    }
  }
  return materials;
}

function familiarTable(html:string, materials:Map<string,PouchMaterials>): WikiFamiliar[] {
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  const table = tables.find(value => /Familiar[\s\S]{0,900}Other ability/i.test(value));
  if (!table) return [];
  let previousLevel = 0;
  return (table.match(/<tr[\s\S]*?<\/tr>/gi) || []).map(row => {
    const cells = [...row.matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map(match => clean(match[1]));
    const parsedLevel = Number.parseInt(cells[0] || '', 10);
    if (Number.isFinite(parsedLevel)) previousLevel = parsedLevel;
    const name = cells[2] || '';
    const pouch = materials.get(familiarKey(name));
    return { level:previousLevel, name, special:cells[9] || '', boost:cells[10] || '', ability:cells[11] || '', ...pouch };
  }).filter(familiar => familiar.level > 0 && familiar.name && familiar.name !== 'Familiar');
}

export async function GET() {
  try {
    if (cached && cached.expires > Date.now()) return Response.json({ familiars:cached.familiars, cached:true });
    const [response, pouchResponse] = await Promise.all([fetch(WIKI_URL, { headers:{ 'user-agent':'Ironpath/1.0 (Group Ironman companion)' } }),fetch(POUCH_URL, { headers:{ 'user-agent':'Ironpath/1.0 (Group Ironman companion)' } })]);
    if (!response.ok) throw new Error('RuneScape Wiki request failed');
    const data = await response.json() as { parse?:{ text?:{ '*':string } } };
    const pouchData = pouchResponse.ok ? await pouchResponse.json() as { parse?:{ text?:{ '*':string } } } : undefined;
    const familiars = familiarTable(data.parse?.text?.['*'] || '', pouchTable(pouchData?.parse?.text?.['*'] || ''));
    if (!familiars.length) throw new Error('Familiar list could not be read');
    cached = { familiars, expires:Date.now() + 3_600_000 };
    return Response.json({ familiars });
  } catch {
    return Response.json({ error:'The current familiar list could not be retrieved from the RuneScape Wiki.' }, { status:502 });
  }
}
