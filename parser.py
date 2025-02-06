from bs4 import BeautifulSoup
import json

with open('NavApp/src/assets/Maps/intersections.svg','r') as f:
    svg_content = f.read()

soup = BeautifulSoup(svg_content,"xml")

nodes = []

for circle in soup.find_all("circle"):
     nodes.append({
        "id": circle.get("id"),
        "x": float(circle.get("cx", 0)),
        "y": float(circle.get("cy", 0))
    })
     
print(nodes)
with open("nodes.json","w") as f:
     json.dump(nodes,f,indent=2)