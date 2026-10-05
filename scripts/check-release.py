"""Release integrity: asset paths, image ratios, guide, and script syntax."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,subprocess
root=Path(__file__).resolve().parents[1];dist=root/'dist';html=(dist/'index.html').read_text()
class Audit(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.refs=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  for k in ('src','href'):
   v=a.get(k,'')
   if v:self.refs.append(v)
a=Audit();a.feed(html);assert len(a.ids)==len(set(a.ids))
for ref in a.refs:
 if ref.startswith('#'):assert ref[1:] in a.ids,ref
 elif not re.match(r'\w+:|//',ref):assert (dist/ref).exists(),ref
photos=json.loads(re.search(r'id="mz-run-photos">(.*?)</script>',html,re.S)[1])
assert len(photos)==6 and sum(p.get('type')=='info' for p in photos)==1
for p in photos:
 assert p['width']>0 and p['height']>0
 if 'src' in p:assert (dist/p['src']).exists()
assert sum(p['width']<p['height'] for p in photos)==3
assert html.count('<dl class="run-facts">')==1
assert 'class="run-facts"' in html[html.index('<dialog id="run-guide"'):]
assert 'photo-picker' not in html and 'photo-preview-note' not in html
for p in dist.glob('*.js'):subprocess.run(['node','--check',str(p)],check=True)
print('PASS: five photos, three portraits, one infographic; local assets/IDs, guide, removed draft UI and all JS syntax.')
