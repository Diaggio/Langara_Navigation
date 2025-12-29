export function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function getClosestPointOnSegment(p, edge) {
  const [a, b] = edge;

  // Vector from A to B (the segment's direction and length)
  const vx = b.x - a.x;
  const vy = b.y - a.y;

  // Handle the case where the segment is just a point.
  const segmentLengthSq = vx * vx + vy * vy;
  if (segmentLengthSq === 0) {
    const dx = p.x - a.x;
    const dy = p.y - a.y;
    return {
      point: { x: a.x, y: a.y },
      t: 0,
      distanceSq: dx * dx + dy * dy,
    };
  }

  // Vector from A to P
  const apx = p.x - a.x;
  const apy = p.y - a.y;

  // The 't' parameter is the projection of vector AP onto vector AB,
  // normalized by the length of AB. This tells us how far along the
  // infinite line AB the projection point lies.
  const t = (apx * vx + apy * vy) / segmentLengthSq;

  let closestPoint;

  // "Clamp" t to the range [0, 1] to ensure the point is on the segment.
  if (t < 0) {
    closestPoint = { x: a.x, y: a.y };
  } else if (t > 1) {
    closestPoint = { x: b.x, y: b.y };
  } else {
    closestPoint = {
      x: a.x + t * vx,
      y: a.y + t * vy,
    };
  }
  
  // Calculate the squared distance from the original point to the closest point.
  const dx = p.x - closestPoint.x;
  const dy = p.y - closestPoint.y;
  const distanceSq = dx * dx + dy * dy;
  
  return {
    point: closestPoint,
    // We return the clamped t value to know if it's an endpoint
    t: Math.max(0, Math.min(1, t)),
    distanceSq: distanceSq
  };
}

//point is the id string, hallwayEdges is the array of edges
export function findClosestEdge(point, hallwayEdges) {
    //safety check in case hallwayEdges is empty
  if (!hallwayEdges || hallwayEdges.length === 0) {
    return null;
  }

  let minDistanceSq = Infinity;
  let closestEdgeResult = null;

  /* cycle through every edge in the list and find the closest one
    recall that each edge is an actual object in the list
    { id: "A2HallwayNode-2", x: 10, y: 10 }, 
    { id: "A2HallwayNode-3", x: 50, y: 10 } */
  for (const edge of hallwayEdges) {
    //get the closest projected point and edge
    const result = getClosestPointOnSegment(point, edge);
    
    //if the distance to the edge is smaller then replace data
    if (result.distanceSq < minDistanceSq) {
      minDistanceSq = result.distanceSq;
      closestEdgeResult = {
        point: result.point,
        edge: edge,
        t: result.t, // Store t to check for endpoint later
      };
    }
  }

  // The point is an endpoint if t is 0 (at point A) or 1 (at point B). BOOLEAN
  const isEndpoint = closestEdgeResult.t === 0 || closestEdgeResult.t === 1;

  return {
    closestPoint: closestEdgeResult.point,
    closestEdge: closestEdgeResult.edge,
    distance: Math.sqrt(minDistanceSq),
    isEndpoint: isEndpoint,
  };
}

//temporarily modify the graph to add the projected start and ending room nodes
export function connectTemp(tempId, proj,graph,nodeMap) {
  // unpack the 2 nodes that make the edge [A and B]
  const [u, v] = proj.closestEdge;
  //add the temp node to the map with its corresponding x/y values
  nodeMap.set(tempId, proj.closestPoint);
  //pass 2 node ids to remove their mutual connection
  graph.removeEdge(u.id, v.id); // Split the hallway A--B
  //reconnect the hallway edges to the room nodes A--U--B
  graph.addEdge(tempId, u.id, getDistance(proj.closestPoint, u));
  graph.addEdge(tempId, v.id, getDistance(proj.closestPoint, v));

  //graph.displayEdges(tempId);
}

export function handleSameEdgeConnection(tempStartId, tempEndId, startProj, endProj, fullStartId, fullEndId, graph, nodeMap) {
  const [u, v] = startProj.closestEdge;
  nodeMap.set(tempStartId, startProj.closestPoint);
  nodeMap.set(tempEndId, endProj.closestPoint);

  //removes the common edge connection
  graph.removeEdge(u.id, v.id);

  // Check which projection point is closer to node 'u' to keep the order correct
  const d1U = getDistance(startProj.closestPoint, u);
  const d2U = getDistance(endProj.closestPoint, u);

  const [near, far] = d1U < d2U ? [startProj, endProj] : [endProj, startProj];
  const [nearId, farId] = d1U < d2U ? [tempStartId, tempEndId] : [tempEndId, tempStartId];

  // Chain: U <-> NearProj <-> FarProj <-> V
  graph.addEdge(u.id, nearId, getDistance(u, near.closestPoint));
  graph.addEdge(nearId, farId, getDistance(near.closestPoint, far.closestPoint));
  graph.addEdge(farId, v.id, getDistance(far.closestPoint, v));

  // Connect doors
  graph.addEdge(fullStartId, tempStartId, startProj.distance);
  graph.addEdge(fullEndId, tempEndId, endProj.distance);
}

export function restoreOriginalEdges(proj,graph) {
    const [u, v] = proj.closestEdge;
    graph.removeNode("temp-start"); // Simplified cleanup
    graph.removeNode("temp-end");
    graph.addEdge(u.id, v.id, getDistance(u, v));
}