"use strict";
import { Graph, dijkstra, reconstructPath } from "./graph.js";
let graph;
let nodeMap;
let jsonData;

function loadApp(){
  setUpEventListener();
  loadAssets();
}

function loadAssets() {
  Promise.all([
    // Fetch request 1: Get the SVG file as text
    fetch("Images/A2FloorPlanBlank.svg").then((response) => response.text()),

    // Fetch request 2: Get the JSON file and parse it
    fetch("../python/graph.json").then((response) => response.json()),
  ])
    .then(([svgData, loadedJson]) => {
      // This block runs only after BOTH files have been successfully loaded.

      // Step 1: Place the SVG map into the div
      document.getElementById("Map-Container").innerHTML = svgData;

      // Create a map for efficient node lookup (ID -> {x, y})
      jsonData = loadedJson;
      const nodes = jsonData.nodes
      const edges = jsonData.edges
      nodeMap = new Map();
      for (const node of nodes) {
        nodeMap.set(node.id, { x: node.x, y: node.y });
      }

      // Instantiate the graph
      graph = new Graph();
      

      // Add edges to the graph
      for (const edge of edges) {
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

      const roomNames = nodes
        .filter((node) => node.id.startsWith("A2RoomNode-"))
        .map((node) => node.id.split("-")[1]);

      populateDatalist(roomNames);

      console.log("Graph built successfully:", graph);

      drawNodes(nodes);
      document.getElementById("find-path-btn").disabled = false;
    })
    .catch((error) => {
      // If either fetch fails, this will log an error
      console.error("Error loading assets:", error);
    });
}

function setUpEventListener(){
  const findPathBtn = document.getElementById("find-path-btn");

      findPathBtn.addEventListener("click", () => {
        const startRoomValue = document.getElementById("start-room").value;
        const endRoomValue = document.getElementById("end-room").value;
        
        if (startRoomValue && endRoomValue) {
          const startId = `A2RoomNode-${startRoomValue}`;
          const endId = `A2RoomNode-${endRoomValue}`;
          handlePathRequest(startId, endId);

        } else {
          alert("Please select a valid start and end room.");
        }

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
    
    if(node.id.includes("HallwayNode")){
      newCircle.setAttribute("r", "5");
      newCircle.setAttribute("fill", "lime"); // Changed color for visibility

    }

    if(node.id.includes("RoomNode")){
      newCircle.setAttribute("r", "3");
      newCircle.setAttribute("fill", "brown");
    }

    if(node.id.includes("ProjectedNode")){
      newCircle.setAttribute("r", "3");
      newCircle.setAttribute("fill", "blue");
    }

    // You can also use the ID from the JSON data
    newCircle.setAttribute("id", `node-${node.id}`);

    svgElement.appendChild(newCircle);
  }
}

function handlePathRequest(startId,endId){
  console.log("Finding path from:", startId, "to:", endId);
  const startPoint = nodeMap.get(startId);
  const endPoint = nodeMap.get(endId);

  if (!startPoint || !endPoint) {
    console.error("Could not find coordinates for start or end room.");
    return;
  }

  const hallwayEdgesForProjection = [];

  for (const edge of jsonData.edges) {
  const fromId = `A2HallwayNode-${edge.from}`;
  const toId = `A2HallwayNode-${edge.to}`;
  const fromNode = nodeMap.get(fromId);
  const toNode = nodeMap.get(toId);

  if (fromNode && toNode) {
    // Store the full node object, including the ID
    hallwayEdgesForProjection.push([
      { id: fromId, ...fromNode },
      { id: toId, ...toNode },
    ]);
  }
}

  // Now you can call findClosestEdge
  const startProjection = findClosestEdge(startPoint, hallwayEdgesForProjection);
  const endProjection = findClosestEdge(endPoint, hallwayEdgesForProjection);



  const projectedNodesToDraw = [
    { id: "ProjectedNode-start", ...startProjection.closestPoint },
    { id: "ProjectedNode-end", ...endProjection.closestPoint },
  ];

  drawNodes(projectedNodesToDraw);

   // --- 2. Temporarily Modify the Graph ---
  const tempStartId = "temp-start-node";
  const tempEndId = "temp-end-node";

  // Add temporary nodes to nodeMap for coordinate lookup
  nodeMap.set(tempStartId, startProjection.closestPoint);
  nodeMap.set(tempEndId, endProjection.closestPoint);

  // Connect the temporary start and end nodes to the graph
  connectTemporaryNode(tempStartId, startProjection);
  connectTemporaryNode(tempEndId, endProjection);

  // --- 3. Run Dijkstra's Algorithm ---
  const { path: previousNodes } = dijkstra(graph, tempStartId);
  const pathIds = reconstructPath(previousNodes, tempStartId, tempEndId);

  // --- 4. Draw the Resulting Path ---
  drawPath(pathIds);

  // --- 5. Clean Up the Graph ---
  graph.removeNode(tempStartId);
  graph.removeNode(tempEndId);
  nodeMap.delete(tempStartId);
  nodeMap.delete(tempEndId);

  // Restore the original edges that were split
  restoreOriginalEdge(startProjection);
  restoreOriginalEdge(endProjection);
}

function connectTemporaryNode(tempNodeId, projectionResult) {
  const { closestPoint, closestEdge } = projectionResult;
  
  // closestEdge is now [{id, x, y}, {id, x, y}]
  const [nodeU, nodeV] = closestEdge; 

  // NO MORE LOOKUP! We already have the IDs.
  const nodeU_id = nodeU.id;
  const nodeV_id = nodeV.id;

  // The rest of the logic remains the same.
  graph.removeEdge(nodeU_id, nodeV_id);

  const distToU = getDistance(closestPoint, nodeU);
  const distToV = getDistance(closestPoint, nodeV);

  graph.addEdge(tempNodeId, nodeU_id, distToU);
  graph.addEdge(tempNodeId, nodeV_id, distToV);
}


function drawPath(pathIds) {
  if (pathIds.length < 2) return;

  // Convert array of IDs to an SVG path 'd' attribute string
  let d = `M ${nodeMap.get(pathIds[0]).x} ${nodeMap.get(pathIds[0]).y}`;
  for (let i = 1; i < pathIds.length; i++) {
    const node = nodeMap.get(pathIds[i]);
    d += ` L ${node.x} ${node.y}`;
  }

  const svgElement = document.querySelector("#Map-Container svg");
  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );

  pathElement.setAttribute("d", d);
  pathElement.setAttribute("class", "path"); 
  pathElement.setAttribute("stroke", "red"); 
  pathElement.setAttribute("stroke-width", "2");
  pathElement.setAttribute("fill", "none");

  // Clear any old path first
  const oldPath = svgElement.querySelector(".path");
  if (oldPath) {
    oldPath.remove();
  }

  svgElement.appendChild(pathElement);
}

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function populateDatalist(roomNames) {
  const datalist = document.getElementById("room-list");
  if (!datalist) {
    console.error("Datalist element not found.");
    return;
  }

  // Clear any existing options
  datalist.innerHTML = "";

  for (const name of roomNames) {
    const option = document.createElement("option");
    option.value = name;
    datalist.appendChild(option);
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
loadApp();