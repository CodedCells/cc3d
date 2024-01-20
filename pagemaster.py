import json
from os import mkdir, path
from shutil import copyfile

with open('scenes.json', 'r') as fh:
    scenes = json.load(fh)

with open('template.html', 'r') as fh:
    template = fh.read()

if not path.isdir('s'):
    mkdir('s')

for scene, info in scenes.items():
    if not path.isdir(f's/{scene}'):
        mkdir(f's/{scene}')
    
    with open(f's/{scene}/index.html', 'w') as fh:
        out = template.replace('[TITLE}', info.get('title', scene) + ' - CodedCells 3D Scene Viewer')
        out = out.replace("[DESC]", """NSFW 3D Scenes made by CodedCells and his friends.
Select, rotate and zoom to your desired viewing angles.""")
        fh.write(out)
    
    for sid in info.get('post_ids', []):
        if not path.isdir(f's/{sid}'):
            mkdir(f's/{sid}')
        
        copyfile(f's/{scene}/index.html', f's/{sid}/index.html')
