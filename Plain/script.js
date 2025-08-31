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

      // Step 2: Call the draw function, passing the array of nodes from the JSON
      drawNodes(jsonData.nodes);
    })
    .catch((error) => {
      // If either fetch fails, this will log an error
      console.error("Error loading assets:", error);
    });
}

/**
 * Draws circles on the SVG for each node in the provided array.
 * @param {Array} nodesArray - An array of node objects, e.g., [{id, x, y}, ...]
 */
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

// Start the entire process
loadAssets();