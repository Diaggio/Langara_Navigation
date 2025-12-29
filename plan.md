

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


projection logic

in order to figure out in which diretion the room node needs to project
we need to loop through every edge and figure out which edge has the shortest distance to the room node. We compare all the x and y distances, and take the smallest value. if x is shortest then it means the closest edge is vertical and we have to project left or right (depending if positive or negative) if y is the smallest then we need to project up or down

todo

#h3 backend
- clean room and hallways naming pickup
- transition between:
    - stairs
    - elevator
    - outside doors


#h3 frontend

desktop
- arrows for moving to the next segment
- zooming in to starting point?

- glow different colours for ending and starting points 
    - maybe have an arrow at the end? or not to avoid direction issues
- error for when only start or end field entered, highlight other box and display error that other field is required



mobile

- search here top bar:
    - turns into from and to boxes
    - zooms in to the path
    - glow different colours for ending and starting points 
- next arrow to move through events?
    - events array to loop through for the next arrows? 