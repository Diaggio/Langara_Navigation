"use strict";
import { Graph, dijkstra, reconstructPath } from "./graph.js";
let graph;
let nodeMap;
let jsonData;
let hallwayEdgesForProjection = [];
const svgCache = new Map;
let currentPathSegments = [];
let currentSegmentIndex = 0;

function loadApp(){
  setUpEventListener();
  loadAssets();
}

function loadAssets() {
 
  fetch("data/manifest.json")
    .then(response => response.json())
    .then(manifest => {
      const floorPromises = manifest.floor_files.map(filename =>
        fetch(`data/${filename}`).then(response => response.json())
      );

      const transitionsPromise = fetch("data/transitions.json").then(res => res.json());

      return Promise.all([transitionsPromise, ...floorPromises]);
    })
    .then(results => {

      const transitionsJson = results[0];
      const allFloorData = results.slice(1);

      // --- Initialize our main data structures ---
      nodeMap = new Map();
      graph = new Graph();
      let nodesForUI = []; // To collect all nodes for the dropdown list

      // --- Process each floor's data file ---
      for (const floorData of allFloorData) {
        // Add all nodes from this floor to the nodeMap
        for (const node of floorData.nodes) {
          nodeMap.set(node.id, { x: node.x, y: node.y });

          if (node.id.includes("RoomNode")) {
            nodesForUI.push(node.id.split('-')[1]);
        }
        }
        

        // Add all hallway edges from this floor to the graph and projection array
        for (const edge of floorData.edges) {
          const fromId = edge.from;
          const toId = edge.to;
          const nodeA = nodeMap.get(fromId);
          const nodeB = nodeMap.get(toId);

          if (nodeA && nodeB) {
            graph.addEdge(fromId, toId, getDistance(nodeA, nodeB));
            hallwayEdgesForProjection.push([
              { id: fromId, ...nodeA },
              { id: toId, ...nodeB },
            ]);
          }
        }
      }

      // --- Process the transitions file ---
      for (const transition of transitionsJson) {
        graph.addEdge(transition.from, transition.to, transition.weight);
      }

      // Populate the dropdown list with rooms from ALL floors

      populateDatalist(nodesForUI);
      console.log("Unified graph built successfully with all floors:", graph);

      // Enable the button now that everything is ready
      document.getElementById("find-path-btn").disabled = false;

      // --- Display the default starting map (without loading all SVGs) ---
      displayFloor("campus"); 
    })
    .catch(error => {
      console.error("Error loading assets:", error);
    });
}

function setUpEventListener(){
  const findPathBtn = document.getElementById("find-path-btn");

      findPathBtn.addEventListener("click", () => {
        const startRoomValue = document.getElementById("start-room").value;
        const endRoomValue = document.getElementById("end-room").value;
        
        if (startRoomValue && endRoomValue) {
          handlePathRequest(startRoomValue, endRoomValue);

        } else {
          alert("Please select a valid start and end room.");
        }

      });

  const prevBtn = document.getElementById("prev-floor-btn");
  const nextBtn = document.getElementById("next-floor-btn");

  prevBtn.addEventListener("click", () => {
    if (currentSegmentIndex > 0) {
      currentSegmentIndex--;
      const floorId = currentPathSegments[currentSegmentIndex].floor;
      displayFloor(floorId); // Display the new floor's SVG and path
      updateNavigationUI(); // Update the buttons and text
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentSegmentIndex < currentPathSegments.length - 1) {
      currentSegmentIndex++;
      const floorId = currentPathSegments[currentSegmentIndex].floor;
      displayFloor(floorId); // Display the new floor's SVG and path
      updateNavigationUI(); // Update the buttons and text
    }
  });

}

function displayFloor(floorId) {
  const mapContainer = document.getElementById("Map-Container");

  // First, check if we already have this SVG in our cache
  if (svgCache.has(floorId)) {
    mapContainer.innerHTML = svgCache.get(floorId);
    drawPathForCurrentFloor(floorId); // Redraw path if it exists
    return;
  }

  // If not in cache, fetch it
  console.log(`floor id is ${floorId}`);
  const svgUrl = `Images/${floorId}FloorPlanBlank.svg`; 
  console.log(svgUrl);
  fetch(svgUrl)
    .then(response => response.text())
    .then(svgData => {
      // Store the fetched SVG in the cache for next time
      svgCache.set(floorId, svgData);
      mapContainer.innerHTML = svgData;
      drawPathForCurrentFloor(floorId); // Draw path if it exists
    });
}

// Helper to redraw the path when switching floors
function drawPathForCurrentFloor(floorId) {
  const segment = currentPathSegments.find(seg => seg.floor === floorId);
  if (segment) {
    drawPath(segment.path);
    console.log(segment)
  } else {
    // If there's no path segment for this floor, clear any old path
    const oldPath = document.querySelector("#Map-Container .path");
    if (oldPath) oldPath.remove();
  }
}

function updateNavigationUI() {
  const navControls = document.getElementById("navigation-controls");
  
  // If there's no path or it's only on one floor, hide the controls.
  if (currentPathSegments.length <= 1) {
    navControls.style.display = "none";
    return;
  }

  // Otherwise, show the controls.
  navControls.style.display = "block";

  const floorDisplay = document.getElementById("current-floor-display");
  const prevBtn = document.getElementById("prev-floor-btn");
  const nextBtn = document.getElementById("next-floor-btn");

  // Update the text to show the current floor
  const currentFloor = currentPathSegments[currentSegmentIndex].floor;
  floorDisplay.textContent = `Floor ${currentFloor}`;

  // Disable/enable buttons based on the current index
  prevBtn.disabled = (currentSegmentIndex === 0);
  nextBtn.disabled = (currentSegmentIndex === currentPathSegments.length - 1);
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
    console.log("here")
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
  const fullStartId = `${startId.substring(0, 2)}RoomNode-${startId}`;
  const fullEndId = `${endId.substring(0, 2)}RoomNode-${endId}`;

  console.log("Finding path from:", fullStartId, "to:", fullEndId);

  const startPoint = nodeMap.get(fullStartId);
  const endPoint = nodeMap.get(fullEndId);

  if(!startPoint || !endPoint){
    return;
  }
  const startProjection = findClosestEdge(startPoint, hallwayEdgesForProjection);
  const endProjection = findClosestEdge(endPoint, hallwayEdgesForProjection);


  //this is for drawing the nodes on the map itself to make sure coordinates are correct
  const projectedNodesToDraw = [
    { id: "ProjectedNode-start", ...startProjection.closestPoint },
    { id: "ProjectedNode-end", ...endProjection.closestPoint },
  ];


   // add temp nodes representing the rooms for pathfinding
  const tempStartId = "temp-projected-start-node";
  const tempEndId = "temp-projected-end-node";
  connectTemporaryNode(tempStartId, startProjection);
  connectTemporaryNode(tempEndId, endProjection);

  // Add temporary nodes to nodeMap for coordinate lookup
  nodeMap.set(tempStartId, startProjection.closestPoint);
  nodeMap.set(tempEndId, endProjection.closestPoint);

  graph.addNode(fullStartId);
  graph.addNode(fullEndId);
  graph.addEdge(fullStartId, tempStartId, startProjection.distance);
  graph.addEdge(fullEndId, tempEndId, endProjection.distance);

  // Connect the temporary start and end nodes to the graph

  // --- 3. Run Dijkstra's Algorithm ---
  const { path: previousNodes } = dijkstra(graph, fullStartId);
  const pathIds = reconstructPath(previousNodes, startId, fullEndId);
  console.log(`Path ids ${pathIds}`)

  const startFloor = startId.substring(0, 2);
  const endFloor = endId.substring(0, 2);
  currentPathSegments = []; // Clear old path
  if (pathIds.length > 0) {
 
    let currentSegment = { floor: startFloor, path: [] };
    currentPathSegments.push(currentSegment);

    for (const nodeId of pathIds) {
      let floorOfNode;
      // The temp nodes are no longer the start/end, so we simplify this
      if (nodeId.startsWith("temp-projected")) {
        // Find which room it's connected to, to determine its floor
        const neighbors = Array.from(graph.getNeighbours(nodeId));
        const roomNeighbor = neighbors.find(n => n[0].includes("RoomNode"));
        floorOfNode = roomNeighbor ? roomNeighbor[0].substring(0, 2) : nodeId.substring(0, 2);
      } else {
        floorOfNode = nodeId.substring(0, 2);
      }

      if (floorOfNode !== currentSegment.floor) {
        // Before switching, add the current node to the old segment if it's a transition point
        // This ensures stairs/elevators appear on both floor paths
        console.log(`node id for current segment ${nodeId}`);
        currentSegment = { floor: floorOfNode, path: [] };
        currentPathSegments.push(currentSegment);
        // Start the new segment
      } 

      currentSegment.path.push(nodeId);
     
    }

    console.log(currentPathSegments);

    if (currentPathSegments.length > 0) {
      currentSegmentIndex = 0; // Reset to the beginning of the path
      const startingFloor = currentPathSegments[0].floor;
      displayFloor(startingFloor);
    }

  }

  // --- 4. Draw the Resulting Path ---
    updateNavigationUI();
    //drawNodes(projectedNodesToDraw);
    //zoomToPath(pathIds);

    // --- 5. Clean Up the Graph ---
    graph.removeNode(tempStartId);
    graph.removeNode(tempEndId);
    graph.removeNode(fullStartId);
    graph.removeNode(fullEndId);
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

function restoreOriginalEdge(projectionResult) {
  // The projectionResult contains the original edge that was split.
  const { closestEdge } = projectionResult;
  const [nodeU, nodeV] = closestEdge;

  // We already have the IDs from our improved data structure.
  const nodeU_id = nodeU.id;
  const nodeV_id = nodeV.id;

  // Calculate the original weight of the edge (the distance between its endpoints).
  const originalWeight = getDistance(nodeU, nodeV);

  // Add the original edge back to the graph.
  graph.addEdge(nodeU_id, nodeV_id, originalWeight);
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

/* function zoomToPath(pathIds) {
  const svgElement = document.querySelector("#Map-Container svg");
  if (!svgElement || pathIds.length === 0) return;

  // Get the actual coordinate objects for each ID in the path
  const pathPoints = pathIds.map(id => nodeMap.get(id));

  // Find the min and max coordinates (the bounding box)
  let minX = pathPoints[0].x;
  let maxX = pathPoints[0].x;
  let minY = pathPoints[0].y;
  let maxY = pathPoints[0].y;

  for (const point of pathPoints) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  // Add some padding so the path isn't touching the edges
  const padding = 50; // Adjust this value as needed
  minX -= padding;
  minY -= padding;
  const width = (maxX - minX) + (padding * 2);
  const height = (maxY - minY) + (padding * 2);

  const viewBoxValue = `${minX} ${minY} ${width} ${height}`;
  svgElement.setAttribute("viewBox", viewBoxValue);
}
 */
// Start the entire process
loadApp();