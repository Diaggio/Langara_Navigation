import { useState, useEffect } from "react";

function MapDisplay(props) {
  const { floorId, pathIds, nodeMap } = props;
  const [svgContent, setSvgContent] = useState("");
  // 1. Add state for the viewBox
  const [viewBox, setViewBox] = useState("0 0 1000 1000");

  useEffect(function() {
    fetch("/Images/" + floorId + "FloorPlanBlank.svg")
      .then(function(res) { return res.text(); })
      .then(function(data) {
        setSvgContent(data);

        // 2. Extract the viewBox from the SVG file text
        const match = data.match(/viewBox="([^"]+)"/);
        if (match && match[1]) {
          setViewBox(match[1]);
        }
      });
  }, [floorId]);

  //genrates the pathing animation svg controlled with CSS
  function generatePathD() {
  if (!pathIds || pathIds.length < 2) return "";

  let d = "";
  for (let i = 0; i < pathIds.length; i++) {
    const node = nodeMap.get(pathIds[i]);
    if (!node) continue;

    if (i === 0) {
      // M: Move to start
      d += `M ${node.x} ${node.y}`;
    } else {
      // L: Draw a straight line directly to the next node
      d += ` L ${node.x} ${node.y}`;
    }
  }
    return d;
  }

  return (
    <div id="Map-Wrapper">
      <div 
        className="map-svg"
        dangerouslySetInnerHTML={{ __html: svgContent }} 
      />

      {/* 3. Use the dynamic viewBox state here */}
      <svg 
        className="path-overlay" 
        viewBox={viewBox} 
        preserveAspectRatio="xMidYMid meet"
      >
        <path className="path" d={generatePathD()} />
      </svg>
    </div>
  );
}

export default MapDisplay;