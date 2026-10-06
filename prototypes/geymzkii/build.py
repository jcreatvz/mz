"""Build an offline single HTML file. Python 3 standard library only."""
import argparse
import base64
import json
import mimetypes
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--site-root', type=Path, default=HERE.parents[1])
parser.add_argument('--output', type=Path, default=HERE / 'GEYMZKII-Console-Draft.html')
args = parser.parse_args()

def data(path):
    mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()

assets = {p.name: data(p) for p in (args.site_root / 'dist/assets').iterdir()
          if p.name in ['anton.woff2', 'mz-run-atlas.webp', 'mz-run-still.webp',
                        'game-banana.webp', 'game-ice.webp', 'game-barrier.webp',
                        'game-cone.webp', 'game-pothole.webp', 'game-water.webp']}
assert len(assets) == 9, 'Missing shared site assets'
assets.update({'assets/' + str(p.relative_to(HERE/'assets')): data(p) for p in (HERE / 'assets').rglob('*') if p.is_file() and p.suffix in ('.svg','.webp','.gif')})
html = (HERE / 'index.html').read_text()
css = (HERE / 'console.css').read_text().replace('../../dist/assets/anton.woff2', assets['anton.woff2'])
html = html.replace('<link rel="stylesheet" href="console.css">', '<style>' + css + '</style>')
html = re.sub(r'<script src="[^"]+" defer></script>', '', html)
for key, value in assets.items():
    html = html.replace('src="' + key + '"', 'src="' + value + '"')
scripts = 'window.MZ_ASSETS=' + json.dumps(assets) + ';\n' + '\n'.join((HERE / name).read_text() for name in ['world-config.js','leaderboard-data.js','leaderboard.js','engine.js','console.js'])
html = html.replace('</body>', '<script>' + scripts.replace('</script', '<\\/script') + '</script></body>')
license_text = (args.site_root / 'dist/assets/anton-OFL.txt').read_text().replace('--', '—')
html = html.replace('</html>', '<!-- Embedded Anton font license:\n' + license_text + '\n--></html>')
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(html)
print(str(args.output), args.output.stat().st_size, 'bytes')
