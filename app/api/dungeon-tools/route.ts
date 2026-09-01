type WikiResponse = { parse?:{ wikitext?:{ '*':string } } };
type Pouch = { family:string; pouch:string; charm:string; tertiary:string };
let cached:{expires:number;pouches:Pouch[]}|null=null;

function linkText(value:string) {
  const named=value.match(/\|txt=([^}|]+)/u)?.[1];
  return (named || value.replace(/^.*?\{\{Plink\|/u,'').replace(/[|}].*$/u,'')).replace(/\s*\(Dungeoneering\)$/u,'').trim();
}
async function fetchPouches() {
  if (cached && cached.expires>Date.now()) return cached.pouches;
  const response=await fetch('https://runescape.wiki/api.php?action=parse&page=Dungeoneering%2FSummoning&prop=wikitext&format=json',{headers:{'User-Agent':'Ironpath Group Ironman Companion'}});
  if (!response.ok) throw new Error('The RuneScape Wiki did not return the Dungeoneering Summoning page.');
  const source=(await response.json() as WikiResponse).parse?.wikitext?.['*'] || '';
  const pouches:Pouch[]=[];
  const sections=source.split(/^===([^=]+)===$/gmu);
  for (let index=1; index<sections.length; index+=2) {
    const family=sections[index].trim(); let charm=''; let tertiary='';
    for (const line of (sections[index+1] || '').split('\n')) {
      if (/\{\{Plink\|(Gold|Green|Crimson|Blue) charm/u.test(line)) { charm=linkText(line); tertiary=''; continue; }
      if (!charm || !line.includes('{{Plink|')) continue;
      const value=linkText(line);
      if (/ pouch$/iu.test(value)) { pouches.push({family,pouch:value,charm,tertiary}); charm=''; tertiary=''; }
      else if (!tertiary) tertiary=value;
    }
  }
  cached={expires:Date.now()+21_600_000,pouches}; return pouches;
}
export async function GET() { try { return Response.json({pouches:await fetchPouches()},{headers:{'Cache-Control':'public, max-age=900'}}); } catch { return Response.json({pouches:[],error:'Dungeoneering pouch recipes could not be loaded.'},{status:502}); } }
