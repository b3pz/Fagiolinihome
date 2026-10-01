"""Build app icons from the original square logo, using macOS sips.
Usage: python3 scripts/build-icons.py logo-fagiolini.png
"""
from pathlib import Path
import json
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
if len(sys.argv) != 2:
    raise SystemExit('Uso: python3 scripts/build-icons.py percorso-del-logo.png')
source = Path(sys.argv[1]).resolve()
if not source.is_file():
    raise SystemExit(f'Logo non trovato: {source}')
info = subprocess.check_output(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(source)], text=True)
values = dict(line.strip().split(': ', 1) for line in info.splitlines() if ': ' in line)
if values.get('pixelWidth') != values.get('pixelHeight'):
    raise SystemExit('Usa il logo quadrato originale per evitare deformazioni.')
output = root / 'assets' / 'icons'
output.mkdir(parents=True, exist_ok=True)
for size, name in [(32, 'favicon.png'), (180, 'apple-touch-icon.png'), (192, 'icon-192.png'), (512, 'icon-512.png')]:
    subprocess.run(['sips', '-s', 'format', 'png', '-z', str(size), str(size), str(source), '--out', str(output / name)], check=True, capture_output=True)
manifest_path = root / 'manifest.json'
manifest = json.loads(manifest_path.read_text())
manifest['icons'] = [{'src': f'assets/icons/icon-{size}.png', 'sizes': f'{size}x{size}', 'type': 'image/png', 'purpose': 'any'} for size in (192, 512)]
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
p = root / 'index.html'
html = p.read_text()
marker = '<!-- App icons -->'
if marker not in html:
    html = html.replace('<link rel="manifest" href="manifest.json">', '<link rel="manifest" href="manifest.json">\n' + marker + '\n<link rel="icon" type="image/png" sizes="32x32" href="assets/icons/favicon.png">\n<link rel="apple-touch-icon" sizes="180x180" href="assets/icons/apple-touch-icon.png">')
p.write_text(html)
print('Create favicon, icona iPhone e icone app 192/512 px dal logo originale.')
