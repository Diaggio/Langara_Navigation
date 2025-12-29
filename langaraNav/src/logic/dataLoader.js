import { Graph } from './graphLogic';
import { getDistance } from './utils';


/* 
This function is in charge of going through every node file and extracting the node
and edge data contained within. It stores them into separate Data Structures for later use
*/
export async function initializeAppData() {
  const manifest = await fetch("/data/manifest.json").then(res => res.json());
  
  const floorData = await Promise.all(
    manifest.floor_files.map(file => fetch(`/data/${file}`).then(res => res.json()))
  );
  
  const transitions = await fetch("/data/transitions.json").then(res => res.json());

  //graph needed for dijkstra
  const newGraph = new Graph();
  /* nodeMap is to access x and y node coordinates by its node ID. We need to look for specific
    node ids for path creation so no point in iterating through a list */
  const newNodeMap = new Map();
  /* newEdges is a list as we have to iterate through every edge for projection calculations
    so no need for a map */
  const newEdges = [];
  //we store each room name in a list in order to create the autocomplete drop down list in the search bar
  const newRoomsList = [];

  floorData.forEach(floor => {
    //load of the nodes
    floor.nodes.forEach(node => {
      //add the key value pair to the nodeMap
      newNodeMap.set(node.id, { x: node.x, y: node.y });

      //if its a room add to the roomList for dropdown 
      if (node.id.includes("RoomNode")){
        newRoomsList.push(node.id.split('-')[1]);
      }
    });

    //process the edges and create the graph structure
    floor.edges.forEach(edge => {
      /* Recall each key of the newNodeMap looks like "A2HallwayNode-2", this
        cycles through every edge, extracts to and from and adds to the graph */
      const nodeA = newNodeMap.get(edge.from);
      const nodeB = newNodeMap.get(edge.to);
      //if two values were found, then...
      if (nodeA && nodeB) {
        /* we add to the graph, the weight will be the distance between both nodes
          the graph does not contain x and y positional data */
        newGraph.addEdge(edge.from, edge.to, getDistance(nodeA, nodeB));
        /*newEdges list contains positional data for finding the closest hallway edge
          structure looks like [{id: "A2HallwayNode-2", x: 10, y: 10}, {id: "A2HallwayNode-3", x: 50, y: 10}]*/
        newEdges.push([{ id: edge.from, ...nodeA }, { id: edge.to, ...nodeB }]);
      }
    });
  });

  //go through the transition file and add to graph for stairs and elevators
  transitions.forEach(t => newGraph.addEdge(t.from, t.to, t.weight));

  return {
    graph: newGraph,
    nodeMap: newNodeMap,
    hallwayEdges: newEdges,
    roomsList: newRoomsList
  };
}