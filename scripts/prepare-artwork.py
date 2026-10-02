"""Normalize the supplied vector art without redrawing any mascot detail.

Requires Inkscape and Pillow. Original sources are retained in artwork/.
The running strip has uneven frame widths: blank-column separators, rather
than equal-width slicing, preserve every hand, shoe and dust shape.
"""
from pathlib import Path
import copy
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'dist/assets'
SVG = '{http://www.w3.org/2000/svg}'
ET.register_namespace('', 'http://www.w3.org/2000/svg')

with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp)
    source = ET.parse(ROOT/'artwork/mz-duo-original.svg').getroot()
    (ASSETS/'mz-duo.svg').write_bytes((ROOT/'artwork/mz-duo-original.svg').read_bytes())
    groups = source.findall(SVG+'g')
    for name, group in zip(('boy', 'girl'), groups):
        root = ET.Element(SVG+'svg', {'viewBox':source.attrib['viewBox']})
        root.append(copy.deepcopy(source.find(SVG+'defs')))
        char = copy.deepcopy(group); char.set('id', 'character'); root.append(char)
        file = tmp/f'{name}.svg'; ET.ElementTree(root).write(file)
        query = subprocess.check_output(['inkscape',str(file),'--query-id=character','--query-x','--query-y','--query-width','--query-height'], text=True, stderr=subprocess.DEVNULL)
        bounds = [float(v) for v in query.splitlines()]
        root.set('viewBox', ' '.join(str(v) for v in bounds))
        ET.ElementTree(root).write(ASSETS/f'mz-{name}.svg', encoding='utf-8', xml_declaration=True)

    sheet = tmp/'strip.png'
    subprocess.run(['inkscape', str(ROOT/'artwork/mz-run-original.svg'), '--export-width=3872', f'--export-filename={sheet}'], check=True, stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
    im = Image.open(sheet).convert('RGBA'); alpha=im.getchannel('A')
    runs=[]; start=None
    for x in range(im.width):
        occupied = alpha.crop((x,0,x+1,im.height)).getbbox() is not None
        if occupied and start is None: start=x
        if not occupied and start is not None: runs.append((start,x)); start=None
    if start is not None: runs.append((start,im.width))
    # Tiny antialiasing gaps within a pose are joined; broad gaps separate poses.
    spans=[]
    for l,r in runs:
        if spans and l-spans[-1][1]<8: spans[-1]=(spans[-1][0],r)
        else: spans.append((l,r))
    assert len(spans)==8, f'Expected 8 running poses, got {len(spans)}'
    atlas=Image.new('RGBA',(640*8,540))
    for n,(l,r) in enumerate(spans):
        pose=im.crop((l,0,r,im.height)); p=pose.load()
        # The yellow face is a stable registration point across all poses.
        xs=[x for y in range(pose.height) for x in range(pose.width)
            if p[x,y][3]>200 and p[x,y][0]>220 and 95<p[x,y][1]<190 and p[x,y][2]<80]
        face=sum(xs)/len(xs)
        frame=Image.new('RGBA',(640,540)); frame.alpha_composite(pose,(round(320-face),10))
        atlas.alpha_composite(frame,(n*640,0))
        if n==0: frame.save(ASSETS/'mz-run-still.webp',quality=95)
    atlas.save(ASSETS/'mz-run-atlas.webp',quality=95)
    print('Prepared two vector mascots and 8 aligned 640×540 running frames.')
