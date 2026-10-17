export type WikiImage = { src: string; title: string; alt: string };
export type Inline = { text: string; href?: string; image?: WikiImage };
export type GuideBlock =
  | { type: 'heading'; level: number; id: string; content: Inline[] }
  | { type: 'paragraph'; content: Inline[] }
  | { type: 'callout'; title: Inline[]; content: Inline[]; image?: WikiImage }
  | { type: 'list'; ordered: boolean; items: Inline[][] }
  | { type: 'equipment'; title: string; slots: { slot: string; content: Inline[] }[] }
  | { type: 'table'; inventory?: boolean; rows: { cells: { content: Inline[]; header: boolean; colSpan: number; rowSpan: number }[] }[] };
export type StrategyGuide = { name: string; title: string; revision: number; sourceUrl: string; revisionUrl: string; historyUrl: string; license: string; licenseUrl: string; blocks: GuideBlock[] };
type Node = { tag: string; attrs: Record<string,string>; children: Node[]; text?: string };
const entities: Record<string,string> = { nbsp:' ',amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',ndash:'–',mdash:'—',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“',hellip:'…',bull:'•',times:'×',minus:'−',plusmn:'±',le:'≤',ge:'≥',ne:'≠',rarr:'→',larr:'←',uarr:'↑',darr:'↓',deg:'°',copy:'©',middot:'·',thinsp:' ',ensp:' ',emsp:' ' };
export function decode(value: string) { return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match,entity:string) => {
  if (entity[0]==='#') { const n=entity[1]?.toLowerCase()==='x'?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10); return n>0&&n<=0x10ffff?String.fromCodePoint(n):''; }
  return entities[entity.toLowerCase()]??match;
}); }
function tree(html:string) {
  const root:Node={tag:'root',attrs:{},children:[]}, stack=[root];
  for (const token of html.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-z][^>]*>|[^<]+|</gi)) {
    const value=token[0];
    if(value.startsWith('<!--')||value.startsWith('<!'))continue;
    if(value.startsWith('</')) { const tag=value.match(/^<\/([\w:-]+)/)?.[1]?.toLowerCase(); const index=stack.map(node=>node.tag).lastIndexOf(tag||'');if(index>0)stack.length=index;continue; }
    if(value.startsWith('<')&&value!== '<') {
      const tag=value.match(/^<([\w:-]+)/)?.[1]?.toLowerCase(); if(!tag)continue;
      const attrs:Record<string,string>={}; for(const attr of value.matchAll(/\s([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g))attrs[attr[1].toLowerCase()]=decode(attr[2]??attr[3]??attr[4]??'');
      const node:Node={tag,attrs,children:[]}; stack.at(-1)!.children.push(node);
      if(!['img','br','hr','input','meta','link','source','wbr'].includes(tag)&&!value.endsWith('/>'))stack.push(node);
    } else stack.at(-1)!.children.push({tag:'#text',attrs:{},children:[],text:decode(value)});
  }
  return root;
}
function skip(node:Node) { return ['script','style','iframe','noscript','form','input','svg'].includes(node.tag)||/(?:^|\s)(?:toc|navbox|messagebox|mw-editsection|mw-empty-elt|rs-external-header-links|navigation-not-searchable|printfooter|catlinks|reference|tooltip-content|noprint)(?:\s|$)/.test(node.attrs.class||''); }
function link(value:string) { try { const url=new URL(value,'https://runescape.wiki'); return url.protocol==='https:'&&url.hostname==='runescape.wiki'&&['/w/','/index.php'].some(prefix=>url.pathname.startsWith(prefix))&&!url.searchParams.has('action')&&!url.searchParams.has('veaction')?url.href:undefined; }catch{return undefined;} }
export function trustedWikiImage(value: string) {
  try { const url = new URL(value, 'https://runescape.wiki');
    return url.protocol === 'https:' && url.hostname === 'runescape.wiki' && !url.username && !url.password && /^\/images\/.+\.(?:png|webp|jpe?g|gif)$/i.test(url.pathname) ? url.href : undefined;
  } catch { return undefined; }
}
function image(node: Node): WikiImage | undefined {
  const src = trustedWikiImage(node.attrs.src || '');
  if (!src) return undefined;
  const path = new URL(src).pathname;
  let title = path.split('/').at(-1)!.replace(/^\d+px-/, '').replace(/\.(png|webp|jpe?g|gif)$/i, '');
  try { title = decodeURIComponent(title).replaceAll('_', ' '); } catch { return undefined; }
  return { src, title, alt: node.attrs.alt || title };
}
function inline(node:Node, href?:string):Inline[] {
  if(skip(node))return [];
  if(node.tag==='#text')return [{text:node.text||'',...(href?{href}:{})}];
  if(node.tag==='br')return [{text:'\n'}];
  if(node.tag==='img') { const asset=image(node);if(asset&&href){try{const subject=decodeURIComponent(new URL(href).pathname.replace(/^\/w\//,'')).replaceAll('_',' ');if(subject&&!subject.includes(':')){asset.title=subject;asset.alt=node.attrs.alt||subject;}}catch{}}return asset?[{text:'',image:asset,...(href?{href}:{})}]:[]; }
  return node.children.flatMap(child=>inline(child,node.tag==='a'?link(node.attrs.href||''):href));
}
function trim(parts:Inline[]) {
  const output:Inline[]=[];for(const part of parts){if(part.image){output.push(part);continue;}const text=part.text.replace(/[\t\r\n ]+/g,' ');if(!text)continue;const previous=output.at(-1);if(previous&&!previous.image&&previous.href===part.href)previous.text+=text;else output.push({...part,text});}
  if(output.length){output[0].text=output[0].text.trimStart();output.at(-1)!.text=output.at(-1)!.text.trimEnd();}
  return output.filter(part=>part.image||part.text.length>0);
}
function descendants(node:Node, tag:string):Node[] { if(skip(node))return [];return node.children.flatMap(child=>child.tag===tag?[child]:descendants(child,tag)); }
export function parseStrategy(html:string):GuideBlock[] {
  const blocks:GuideBlock[]=[];
  function walk(node:Node) {
    if(skip(node))return;
    const classes=(node.attrs.class||'').split(/\s+/);
    if(classes.includes('tabbertab')&&node.attrs['data-title'])blocks.push({type:'heading',level:3,id:`strategy-section-${blocks.length}`,content:[{text:node.attrs['data-title']}]});
    if(classes.includes('equipmenttable')){
      const findSlots=(root:Node):Node[]=>root.children.flatMap(child=>(child.attrs.class||'').split(/\s+/).includes('equipmentslot')?[child]:findSlots(child));
      const slots=findSlots(node).map(slot=>({slot:(slot.attrs.class||'').split(/\s+/).find(name=>name!=='equipmentslot'&&name.endsWith('slot'))||'itemslot',content:trim(inline(slot))}));
      if(slots.length)blocks.push({type:'equipment',title:node.attrs.title||'Equipment preset',slots});return;
    }
    if(classes.includes('calc-header-title')){const content=trim(inline(node));if(content.length)blocks.push({type:'heading',level:4,id:`strategy-section-${blocks.length}`,content});return;}
    if(classes.includes('calc-list-item')){
      const find=(root:Node,className:string):Node|undefined=>root.children.find(child=>(child.attrs.class||'').split(/\s+/).includes(className))||root.children.map(child=>find(child,className)).find(Boolean);
      const title=find(node,'calc-list-item-title'),description=find(node,'calc-list-item-desc'),thumbnail=find(node,'calc-list-item-thumbnail');
      const asset=thumbnail?descendants(thumbnail,'img').map(image).find(Boolean):undefined;
      const content=trim(inline(description||node));if(content.length)blocks.push({type:'callout',title:title?trim(inline(title)):[],content,...(asset?{image:asset}:{})});return;
    }
    if(/^h[2-4]$/.test(node.tag)) { const content=trim(inline(node));if(content.length)blocks.push({type:'heading',level:Number(node.tag[1]),id:`strategy-section-${blocks.length}`,content});return; }
    if(node.tag==='p') {const content=trim(inline(node));if(content.length)blocks.push({type:'paragraph',content});return;}
    if(node.tag==='ul'||node.tag==='ol') {const items=node.children.filter(child=>child.tag==='li').map(child=>trim(inline(child))).filter(item=>item.length);if(items.length)blocks.push({type:'list',ordered:node.tag==='ol',items});return;}
    if(node.tag==='table') {
      const rows=descendants(node,'tr').map(row=>({cells:row.children.filter(cell=>['td','th'].includes(cell.tag)).map(cell=>({content:trim(inline(cell)),header:cell.tag==='th',colSpan:Math.min(20,Math.max(1,Number(cell.attrs.colspan)||1)),rowSpan:Math.min(100,Math.max(1,Number(cell.attrs.rowspan)||1))}))})).filter(row=>row.cells.some(cell=>cell.content.length));
      if(rows.length)blocks.push({type:'table',...(classes.includes('inventorytable')?{inventory:true}:{}),rows});return;
    }
    if(node.tag==='div'&&!node.children.some(child=>['div','p','ul','ol','table','h2','h3','h4'].includes(child.tag))){const content=trim(inline(node));if(content.length)blocks.push({type:'paragraph',content});return;}
    node.children.forEach(walk);
  }
  walk(tree(html));return blocks;
}
export class WikiFailure extends Error { status:number; constructor(message:string,status=502){super(message);this.status=status;} }
export function validBossName(value:string) { const name=value.replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();return name.length>=2&&name.length<=100&&!/[|:/?#<>\u0000-\u001f]/.test(name)?name:null; }
export async function fetchStrategy(name:string, fetcher:typeof fetch=fetch):Promise<StrategyGuide> {
  const params=new URLSearchParams({action:'parse',page:`${name}/Strategies`,prop:'text|revid',redirects:'1',format:'json'});
  const response=await fetcher(`https://runescape.wiki/api.php?${params}`,{headers:{'User-Agent':'Ironpath/1.0 (cached, attributed RS3 boss strategy reader)'},signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new WikiFailure('The Wiki strategy source is temporarily unavailable.');
  const raw=await response.text();if(raw.length>2_000_000)throw new WikiFailure('This guide is too large to cache safely.');
  const data=JSON.parse(raw) as {error?:{code:string};parse?:{title:string;revid:number;text:{'*':string}}};
  if(data.error?.code==='missingtitle')throw new WikiFailure('No dedicated Wiki strategy page was found for this boss.',404);
  const parsed=data.parse;if(!parsed||!parsed.title.endsWith('/Strategies')||!Number.isInteger(parsed.revid))throw new WikiFailure('The Wiki did not return a valid boss strategy page.');
  const blocks=parseStrategy(parsed.text['*']);if(!blocks.some(block=>block.type==='heading')||!blocks.length)throw new WikiFailure('The strategy page could not be read.');
  const sourceUrl=`https://runescape.wiki/w/${encodeURIComponent(parsed.title.replaceAll(' ','_'))}`;
  return {name:parsed.title.replace(/\/Strategies$/,''),title:parsed.title,revision:parsed.revid,sourceUrl,revisionUrl:`https://runescape.wiki/w/Special:PermanentLink/${parsed.revid}`,historyUrl:`https://runescape.wiki/index.php?title=${encodeURIComponent(parsed.title)}&action=history`,license:'CC BY-NC-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-nc-sa/3.0/',blocks};
}
export async function searchStrategies(query:string,fetcher:typeof fetch=fetch) {
  const params=new URLSearchParams({action:'query',list:'search',srsearch:`intitle:Strategies ${query}`,srnamespace:'0',srlimit:'20',format:'json'});
  const response=await fetcher(`https://runescape.wiki/api.php?${params}`,{headers:{'User-Agent':'Ironpath/1.0 (cached RS3 boss strategy search)'},signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new WikiFailure('Boss search is temporarily unavailable.');
  const data=await response.json() as {query?:{search:{title:string}[]}};
  if(!data.query?.search)throw new WikiFailure('The Wiki returned an invalid search response.');
  return data.query.search.filter(page=>page.title.endsWith('/Strategies')).map(page=>({name:page.title.replace(/\/Strategies$/,''),title:page.title})).slice(0,12);
}
