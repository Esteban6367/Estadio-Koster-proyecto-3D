from pathlib import Path
import zipfile
root=Path(__file__).resolve().parents[1]
items=[p for p in root.iterdir() if p.is_file() and p.suffix in {'.md','.json','.mjs','.js','.txt'}]
items.append(root/'.openai/hosting.json')
if (root/'.gitignore').is_file():items.append(root/'.gitignore')
items+=list((root/'scripts').glob('*'))
items+=[p for p in (root/'dist').rglob('*') if p.is_file() and p.suffix!='.zip' and 'node_modules' not in p.parts and '.vite' not in p.parts]
with zipfile.ZipFile(root/'dist/koster-3d-proyecto.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in items:
  if p.is_file():z.write(p,'koster-3d/'+str(p.relative_to(root)))
print('Source bundle saved.')
