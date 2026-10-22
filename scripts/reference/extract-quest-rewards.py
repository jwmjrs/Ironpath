from html.parser import HTMLParser
from urllib.parse import urljoin,urlparse
import json,re,sys
from datetime import datetime,timezone
source_path=sys.argv[1]
template_path=sys.argv[2]
output_path=sys.argv[3]
class Node:
 def __init__(self,tag='',attrs=None,text=''):self.tag=tag;self.attrs=dict(attrs or []);self.children=[];self.text=text
class Parser(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.root=Node('root');self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs);self.stack[-1].children.append(n)
  if tag not in ['img','br','hr','input','meta','link','wbr','source']:self.stack.append(n)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==tag:self.stack=self.stack[:i];break
 def handle_data(self,data):self.stack[-1].children.append(Node('#text',text=data))
def nodes(n,tag):
 for c in n.children:
  if c.tag==tag:yield c
  yield from nodes(c,tag)
def plain(n):return re.sub(r'\s+',' ',''.join(x.text if x.tag=='#text' else x.attrs.get('alt','') if x.tag=='img' else plain(x) for x in n.children)).strip()
def parts(n,href=None):
 if n.tag in ['script','style','sup']:return []
 if n.tag=='#text':return [{'text':n.text,**({'href':href} if href else {})}]
 if n.tag in ['ul','ol']:return []
 if n.tag=='br':return [{'text':' '}]
 if n.tag=='img':return [{'text':n.attrs.get('alt',''),**({'href':href} if href else {})}]
 if n.tag=='a':
  url=urljoin('https://runescape.wiki',n.attrs.get('href',''))
  href=url if urlparse(url).hostname=='runescape.wiki' and urlparse(url).path.startswith('/w/') else None
 result=[]
 for c in n.children:result+=parts(c,href)
 return result
raw=json.load(open(source_path));p=Parser();p.feed(raw['parse']['text']['*'])
table=next(n for n in nodes(p.root,'table') if 'wikitable' in n.attrs.get('class',''))
quests=[]
for row in nodes(table,'tr'):
 cells=[c for c in row.children if c.tag=='td']
 if len(cells)!=3:continue
 a=next(nodes(cells[0],'a'));name=plain(a);rewards=[]
 def bullets(n,depth=0):
  for c in n.children:
   if c.tag=='li':
    ps=parts(c)
    for x in ps:x['text']=re.sub(r'\s+',' ',x['text'])
    if ps:rewards.append({'parts':ps,'depth':depth})
    for sub in c.children:
     if sub.tag in ['ul','ol']:bullets(sub,depth+1)
   elif c.tag in ['ul','ol']:bullets(c,depth)
 bullets(cells[2])
 if not rewards:rewards=[{'parts':parts(cells[2]),'depth':0}]
 skills=sorted({n.attrs['data-skill'] for n in nodes(cells[2],'span') if 'data-skill' in n.attrs})
 quests.append({'name':name,'url':urljoin('https://runescape.wiki',a.attrs['href']),'questPoints':int(plain(cells[1]) or 0),'skills':skills,'rewards':rewards})
template=json.load(open(template_path))
template_revision=next(iter(template['query']['pages'].values()))['revisions'][0]['revid']
out={'templateRevision':template_revision,'source':'https://runescape.wiki/w/Quests/Rewards','revision':raw['parse']['revid'],'retrievedAt':datetime.now(timezone.utc).date().isoformat(),'license':'CC BY-NC-SA 3.0','licenseUrl':'https://creativecommons.org/licenses/by-nc-sa/3.0/','quests':quests}
open(output_path,'w').write(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Quest entries:',len(quests),'Rewards:',sum(len(q['rewards']) for q in quests));print(quests[0])
