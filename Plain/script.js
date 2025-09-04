"use strict";

function loadAssets() {
  Promise.all([
    // Fetch request 1: Get the SVG file as text
    fetch("Images/A2FloorPlanNodes3.svg").then((response) => response.text()),

    // Fetch request 2: Get the JSON file and parse it
    fetch("../python/graph.json").then((response) => response.json()),
  ])
    .then(([svgData, jsonData]) => {
      // This block runs only after BOTH files have been successfully loaded.

      // Step 1: Place the SVG map into the div
      document.getElementById("Map-Container").innerHTML = svgData;

      // Create a map for efficient node lookup (ID -> {x, y})
      const nodeMap = new Map();
      for (const node of jsonData.nodes) {
        nodeMap.set(node.id, { x: node.x, y: node.y });
      }

      // Instantiate the graph
      const graph = new Graph();

      // Add edges to the graph
      for (const edge of jsonData.edges) {
        // Construct the full node IDs from the "from" and "to" properties
        const fromId = `A2HallwayNode-${edge.from}`;
        const toId = `A2HallwayNode-${edge.to}`;

        const nodeA = nodeMap.get(fromId);
        const nodeB = nodeMap.get(toId);

        if (nodeA && nodeB) {
          // Calculate the Euclidean distance for the edge weight
          const weight = Math.sqrt(
            Math.pow(nodeB.x - nodeA.x, 2) + Math.pow(nodeB.y - nodeA.y, 2)
          );
          graph.addEdge(fromId, toId, weight);
        }
      }

      // Now your 'graph' object is ready for pathfinding.
      // You can store it in a global variable or pass it to other functions.
      console.log("Graph built successfully:", graph);

      // Step 2 (Optional but good for debugging): Draw all nodes from JSON
      drawNodes(jsonData.nodes);
    })
    .catch((error) => {
      // If either fetch fails, this will log an error
      console.error("Error loading assets:", error);
    });
}

function drawNodes(nodesArray) {
  const svgElement = document.querySelector("#Map-Container svg");

  if (!svgElement) {
    console.error("SVG element not found.");
    return;
  }

  // Loop through each node object in the array that was passed in
  for (const node of nodesArray) {
    const newCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );

    // Use the x and y properties from the current node object
    newCircle.setAttribute("cx", node.x);
    newCircle.setAttribute("cy", node.y);
    newCircle.setAttribute("r", "5");
    newCircle.setAttribute("fill", "lime"); // Changed color for visibility

    // You can also use the ID from the JSON data
    newCircle.setAttribute("id", `node-${node.id}`);

    svgElement.appendChild(newCircle);
  }
}

function getClosestPointOnSegment(p, edge) {
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

function findClosestEdge(point, edges) {
  if (!edges || edges.length === 0) {
    return null;
  }

  let minDistanceSq = Infinity;
  let closestEdgeResult = null;

  for (const edge of edges) {
    const result = getClosestPointOnSegment(point, edge);
    
    if (result.distanceSq < minDistanceSq) {
      minDistanceSq = result.distanceSq;
      closestEdgeResult = {
        point: result.point,
        edge: edge,
        t: result.t, // Store t to check for endpoint later
      };
    }
  }

  // The point is an endpoint if t is 0 (at point A) or 1 (at point B).
  const isEndpoint = closestEdgeResult.t === 0 || closestEdgeResult.t === 1;

  return {
    closestPoint: closestEdgeResult.point,
    closestEdge: closestEdgeResult.edge,
    distance: Math.sqrt(minDistanceSq),
    isEndpoint: isEndpoint,
  };
}

// Start the entire process
loadAssets();