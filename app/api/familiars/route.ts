type WikiFamiliar = { level:number; name:string; special:string; boost:string; ability:string };

const WIKI_URL = 'https://runescape.wiki/api.php?action=parse&page=Summoning_familiars&prop=text&format=json&origin=*';
let cached: { expires:number; familiars:WikiFamiliar[] } | null = null;

function clean(value:string) {
  return value.replace(/<br\s*\/?>/gi, ' · ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}

function familiarTable(html:string): WikiFamiliar[] {
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  const table = tables.find(value => /Familiar[\s\S]{0,900}Other ability/i.test(value));
  if (!table) return [];
  let previousLevel = 0;
  return (table.match(/<tr[\s\S]*?<\/tr>/gi) || []).map(row => {
    const cells = [...row.matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map(match => clean(match[1]));
    const parsedLevel = Number.parseInt(cells[0] || '', 10);
    if (Number.isFinite(parsedLevel)) previousLevel = parsedLevel;
    const name = cells[2] || '';
    return { level:previousLevel, name, special:cells[9] || '', boost:cells[10] || '', ability:cells[11] || '' };
  }).filter(familiar => familiar.level > 0 && familiar.name && familiar.name !== 'Familiar');
}

export async function GET() {
  try {
    if (cached && cached.expires > Date.now()) return Response.json({ familiars:cached.familiars, cached:true });
    const response = await fetch(WIKI_URL, { headers:{ 'user-agent':'Ironpath/1.0 (Group Ironman companion)' } });
    if (!response.ok) throw new Error('RuneScape Wiki request failed');
    const data = await response.json() as { parse?:{ text?:{ '*':string } } };
    const familiars = familiarTable(data.parse?.text?.['*'] || '');
    if (!familiars.length) throw new Error('Familiar list could not be read');
    cached = { familiars, expires:Date.now() + 3_600_000 };
    return Response.json({ familiars });
  } catch {
    return Response.json({ error:'The current familiar list could not be retrieved from the RuneScape Wiki.' }, { status:502 });
  }
}
