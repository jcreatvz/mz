"""Publish the reusable game source into the static website."""
from pathlib import Path
import shutil
import csv
import json
root=Path(__file__).resolve().parents[1]
source=root/'prototypes/geymzkii'; target=root/'dist/geymzkii'
target.mkdir(exist_ok=True)
rows=list(csv.DictReader((source/'results.csv').open(newline='')))
(source/'leaderboard-data.js').write_text('window.MZ_LEADERBOARD='+json.dumps(rows,ensure_ascii=True).replace('<','\\u003c')+';\n')
for name in ('index.html','console.css','console.js','engine.js','world-config.js','leaderboard.js','leaderboard-data.js'):
 text=(source/name).read_text().replace('../../dist/assets/', '../assets/')
 (target/name).write_text(text)
shutil.copytree(source/'assets',target/'assets',dirs_exist_ok=True)
print('Console synced to dist/geymzkii')
