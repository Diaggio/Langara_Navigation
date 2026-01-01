import { dijkstra, reconstructPath } from "./graphLogic";
import { findClosestEdge, connectTemp,handleSameEdgeConnection,restoreOriginalEdges } from "./utils";



export function getProcessedPath(startRoom, endRoom, graph, nodeMap, hallwayEdges, elevatorOnly) {
  //compose the strings to search the nodeMap
  const fullStartId = startRoom.substring(0, 2) + "RoomNode-" + startRoom;
  const fullEndId = endRoom.substring(0, 2) + "RoomNode-" + endRoom;

  //with the ids we extract the actual node objects from the map
  const startPoint = nodeMap.get(fullStartId);
  const endPoint = nodeMap.get(fullEndId);
  //if ids don't exist (user typed invalid room), return null
  if (!startPoint || !endPoint) return null;

  const startProj = findClosestEdge(startPoint, hallwayEdges);
  const endProj = findClosestEdge(endPoint, hallwayEdges);
  const tempStartId = "temp-start";
  const tempEndId = "temp-end";

  //check if the projections happened to land on the same edge
  const isSame = startProj.closestEdge[0].id === endProj.closestEdge[0].id &&
                startProj.closestEdge[1].id === endProj.closestEdge[1].id;

  //if they are the same, then run the same edge function
  if(isSame) {
    handleSameEdgeConnection(tempStartId, tempEndId, startProj, endProj, fullStartId, fullEndId, graph, nodeMap);
  }else {
    //if not the same, then we don't need to modify the hallwayEdges
    connectTemp(tempStartId, startProj, graph, nodeMap);
    connectTemp(tempEndId, endProj, graph, nodeMap);
    graph.addEdge(fullStartId, tempStartId, startProj.distance);
    graph.addEdge(fullEndId, tempEndId, endProj.distance);
  }
 

  const avoidType = elevatorOnly ? "Stairs" : null
  //run dijkstra to find the shortest path
  const result = dijkstra(graph, fullStartId,avoidType);
  //take the path object/map, convert it to an array in the right order
  const pathIds = reconstructPath(result.path, fullStartId, fullEndId);

  /* Cleanup: Restore the original edges
    given the path has been found, we can reset the graph to its original state right away */  
  restoreOriginalEdges(startProj,graph);
  restoreOriginalEdges(endProj,graph);

  //returns the list of nodes for the path
  return pathIds;
}

export function segmentPathByFloor(pathIds) {
  const segments = [];
  if (pathIds.length === 0) return segments;

  let currentSegment = {
    /* extract the initial 2 characters that describe the building and floor ie: A2
    create the initial starting floor */
    floor: pathIds[0].substring(0, 2),
    path: [],
  };
  segments.push(currentSegment);

  for (const nodeId of pathIds) {
    const nodeFloor = nodeId.substring(0, 2);

    // If floor changes and it's not a temp node, start a new segment
    if (nodeFloor !== currentSegment.floor && !nodeId.startsWith("temp")) {
      currentSegment = { floor: nodeFloor, path: [] };
      segments.push(currentSegment);
    }
    currentSegment.path.push(nodeId);
  }

  /* final structure looks something like:
  [
  {
    floor: "A2",
    path: ["A2RoomNode-A202", "temp-start", "A2HallwayNode-1", "A2Stairs-1"]
  },
  {
    floor: "A3",
    path: ["A3Stairs-1", "A3HallwayNode-5", "A3RoomNode-A305"]
  }
] */
  return segments;
}