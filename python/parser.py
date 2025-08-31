from bs4 import BeautifulSoup
import json

with open('../Plain/Images/A2FloorPlanNodes3.svg','r') as f:
    svg_content = f.read()

soup = BeautifulSoup(svg_content,"xml")

graph = {"nodes":[],"edges":[]}

graph_layer = soup.find("g",{"id":"GraphLayer"})

# cicle nodes
if graph_layer:
    for circle in graph_layer.find_all("circle"):
        graph["nodes"].append({
            "id": circle.get("id"),
            "x": float(circle.get("cx", 0)),
            "y": float(circle.get("cy", 0))
        })

    # path edges

    for path in graph_layer.find_all("path"):
        id = path.get("id")
        parts = id.split("-")

        graph["edges"].append({
            "id": id,
            "from": parts[1],
            "to": parts[2] 
        })
        
print(graph)
with open("graph.json","w") as f:
     json.dump(graph,f,indent=2)