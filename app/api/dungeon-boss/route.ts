type ParseResponse = { parse?:{ text?:{ '*':string } } };
type ImageResponse = { query?:{ pages?:Record<string,{ thumbnail?:{ source?:string } }> } };

const cache=new Map<string,{expires:number;value:BossDetail}>();
type BossDetail={name:string;image:string|null;description:string;mechanics:string};
const clean=(value:string) => value.replace(/<sup[\s\S]*?<\/sup>/gu,'').replace(/<[^>]+>/gu,' ').replace(/\[\s*edit(?:\s*\|\s*edit source)?\s*\]/gu,'').replace(/&nbsp;/gu,' ').replace(/&amp;/gu,'&').replace(/&#39;/gu,"'").replace(/\s+/gu,' ').trim();
const firstParagraph=(html:string) => clean(html.match(/<p>([\s\S]*?)<\/p>/u)?.[1] || 'No overview was provided by the Wiki.');
const mechanicsText=(html:string) => {
  const section=html.match(/<h[23][^>]*>[\s\S]*?(?:Mechanics|Strategy|Fight overview|The fight)[\s\S]*?<\/h[23]>([\s\S]*?)(?=<h[23]|$)/iu)?.[1] || '';
  return clean(section) || 'Open the Wiki entry for this boss’s full encounter guide.';
};

export async function GET(request:Request) {
  const name=new URL(request.url).searchParams.get('name') || '';
  if (!name) return Response.json({error:'Choose a boss first.'},{status:400});
  const existing=cache.get(name); if (existing && existing.expires>Date.now()) return Response.json(existing.value);
  try {
    const title=encodeURIComponent(name);
    const [parsed,imageResult]=await Promise.all([
      fetch(`https://runescape.wiki/api.php?action=parse&page=${title}&prop=text&format=json`,{headers:{'User-Agent':'Ironpath Group Ironman Companion'}}),
      fetch(`https://runescape.wiki/api.php?action=query&titles=${title}&prop=pageimages&pithumbsize=460&format=json`,{headers:{'User-Agent':'Ironpath Group Ironman Companion'}}),
    ]);
    if (!parsed.ok) throw new Error('The RuneScape Wiki did not return this boss.');
    const html=(await parsed.json() as ParseResponse).parse?.text?.['*'] || '';
    const pages=(await imageResult.json() as ImageResponse).query?.pages || {};
    const image=Object.values(pages)[0]?.thumbnail?.source || null;
    const value={name,image,description:firstParagraph(html),mechanics:mechanicsText(html)};
    cache.set(name,{expires:Date.now()+21_600_000,value});
    return Response.json(value,{headers:{'Cache-Control':'public, max-age=900'}});
  } catch {
    return Response.json({error:'Boss details could not be loaded from the RuneScape Wiki.'},{status:502});
  }
}
