

- Draw all hallway nodes
- Draw all room nodes
- draw edges/paths in the svg between hallway nodes that can be used
    to reference the connected edges once shapes extracted
- build graph data structure for hallway nodes from nodes extracted
- create dropdown list to and from using room nodes
- graph will be undirected 
    - edges will be weighted using the path length. Given hallway nodes are
    at each intersection, this sort of maps real/scaled distance so it works


algo Steps

- make graph data structure with hallway nodes and edges
- add weights based on line length
- select starting and end points
- project onto map, create new connections
- run pathfinding algorithm
