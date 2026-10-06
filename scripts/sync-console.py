"""Publish the reusable game source into the static website."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
source=root/'prototypes/geymzkii'; target=root/'dist/geymzkii'
target.mkdir(exist_ok=True)
for name in ('index.html','console.css','console.js','engine.js'):
 text=(source/name).read_text().replace('../../dist/assets/', '../assets/')
 (target/name).write_text(text)
shutil.copytree(source/'assets',target/'assets',dirs_exist_ok=True)
print('Console synced to dist/geymzkii')
