import xml.etree.ElementTree as ET

floor = "A0"
file = f'../langaraNav/public/Images/{floor}FloorPlan.svg'
INK_LABEL = "{http://www.inkscape.org/namespaces/inkscape}label"

# Registering namespaces is required to prevent breaking the SVG tags
ET.register_namespace('inkscape', "http://www.inkscape.org/namespaces/inkscape")
ET.register_namespace('', "http://www.w3.org/2000/svg")

tree = ET.parse(file)

for g in tree.iter('{http://www.w3.org/2000/svg}g'):
    # Look for a child whose ID starts with 'room-' and extract the number
    room_id = next((c.get('id')[5:] for c in g if (c.get('id') or "").startswith('room-')), None)
    
    if room_id:
        for child in g:
            # Find the circle in the same group and rename it
            if child.tag.endswith('circle'):
                name = f"{floor}RoomNode-{room_id}"
                child.set('id', name)
                child.set(INK_LABEL, name)
                print(f"Renamed: {name}")

tree.write(file)