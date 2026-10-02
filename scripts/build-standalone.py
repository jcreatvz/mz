"""Create a portable HTML draft with all referenced fonts and sprites embedded."""
from pathlib import Path
import base64
import json
import re
import sys

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
def data_url(path):
    mime={'.woff2':'font/woff2','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'}[path.suffix]
    return f'data:{mime};base64,'+base64.b64encode(path.read_bytes()).decode('ascii')

html=(DIST/'index.html').read_text()
css='\n'.join((DIST/file).read_text() for file in ('styles.css','game.css'))
for relative in set(re.findall(r'assets/[a-zA-Z0-9_.-]+',css)):
    css=css.replace(relative,data_url(DIST/relative))
html=re.sub(r'\s*<link rel="preload"[^>]+>','',html)
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+css+'\n</style>').replace('<link rel="stylesheet" href="game.css">','')
html=re.sub(r'\s*<script src="[^"]+" defer></script>','',html)
assets={f'assets/{p.name}':data_url(p) for p in (DIST/'assets').iterdir() if p.suffix in ('.svg','.webp')}
html=re.sub(r'src="(assets/[^"]+)"',lambda m:'src="'+assets.get(m[1],data_url(DIST/m[1]))+'"',html)
scripts='window.METRO_ASSETS='+json.dumps(assets,separators=(',',':'))+';\n'
scripts+='\n'.join((DIST/file).read_text() for file in ('scene-motion.js','app.js','game-engine.js','game.js'))
html=html.replace('</body>','<script>\n'+scripts+'\n</script>\n</body>')
out=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'metro-zoomin-concept-draft.html'
out.write_text(html)
print(f'{out}: {out.stat().st_size:,} bytes')
