import json
from os import mkdir, path
from shutil import copyfile
import hashlib

def hash_file(file_path):
    hash_obj = hashlib.new('sha1')
    with open(file_path, 'rb') as file:
        while chunk := file.read(8192):
            hash_obj.update(chunk)

    # Return the hexadecimal digest of the hash
    return hash_obj.hexdigest()

with open('scenes.json', 'r') as fh:
    scenes = json.load(fh)

with open('template.html', 'r') as fh:
    template = fh.read()

if not path.isdir('s'):
    mkdir('s')

for scene, info in scenes.items():

    scenes[scene]['hash'] = hash_file(f'scenes/{scene}.glb')
    
    if not path.isdir(f's/{scene}'):
        mkdir(f's/{scene}')
    
    with open(f's/{scene}/index.html', 'w') as fh:
        out = template.replace('[TITLE]', info.get('title', scene) + ' - CodedCells 3D Scene Viewer')
        out = out.replace("[DESC]", """NSFW 3D Scenes made by CodedCells and his friends.
Select, rotate and zoom to your desired viewing angles.""")
        fh.write(out)
    
    for sid in info.get('post_ids', {}).get('FA', []):
        if not path.isdir(f's/{sid}'):
            mkdir(f's/{sid}')
        
        copyfile(f's/{scene}/index.html', f's/{sid}/index.html')

with open('scenes.json', 'w') as fh:
    json.dump(scenes, fh, indent='\t')
    
