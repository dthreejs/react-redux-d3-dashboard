import sys
import json
import copy
import random

random.seed(0)

geo_filename = sys.argv[1]
heat_filename = sys.argv[2]

with open(geo_filename) as infile:
    geo_data = json.load(infile)

with open(heat_filename) as infile:
    heat_data = json.load(infile)
    random.shuffle(heat_data)

room_ids = []
cubicle_ids = []
for feature in geo_data['features']:
    props = feature.get('properties', {})
    if props.get('facility') == 'room':
        room_ids.append(feature['id'])
    elif props.get('fixture') == 'cubicle':
        cubicle_ids.append(feature['id'])

i_space_ids = []
we_space_ids = []
for space in heat_data:
    if space['i_we'] == 'I':
        i_space_ids.append(space['space_id'])
    else:
        we_space_ids.append(space['space_id'])

translate = dict(zip(cubicle_ids, i_space_ids))
translate.update(dict(zip(room_ids, we_space_ids)))

i_space_ids.reverse()
we_space_ids.reverse()
for old_id, new_id in zip(room_ids + cubicle_ids, i_space_ids + we_space_ids):
    if old_id not in translate:
        translate[old_id] = new_id
        
new_geo = copy.deepcopy(geo_data)
for index, feature in enumerate(geo_data['features']):
    new_id = translate.get(feature['id'])
    if new_id is not None:
        new_geo['features'][index]['id'] = new_id

print json.dumps(new_geo, indent=2, separators=(',', ': '))
