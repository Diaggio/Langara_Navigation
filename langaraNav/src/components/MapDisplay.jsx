import { useState, useEffect,useRef,memo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

function MapDisplay(props) {
  const { floorId, endRoom, pathIds, nodeMap } = props;
  const [svgContent, setSvgContent] = useState("");
  // Add state for the viewBox
  const [viewBox, setViewBox] = useState("0 0 1000 1000");
  const transformRef = useRef(null);

  useEffect(function() {
    fetch("/Images/" + floorId + "FloorPlan.svg")
      .then(function(res) { return res.text(); })
      .then(function(data) {
        setSvgContent(data);

        // Extract the viewBox from the SVG file text
        const match = data.match(/viewBox="([^"]+)"/);
        if (match && match[1]) {
          setViewBox(match[1]);
        }
      });
  }, [floorId]);

  useEffect(function() {
    // Only zoom if we have a room and we are on the correct floor
    const isCorrectFloor = endRoom && endRoom.substring(0, 2) === floorId;
    
    if (isCorrectFloor && transformRef.current) {
      const { zoomToElement } = transformRef.current;
      
      // Delay briefly so the browser has time to finish drawing the new SVG
      setTimeout(function() {
        // endRoom "A238" becomes ID "room-A238"
        // 3 is the zoom level (higher is closer)
        zoomToElement("room-" + endRoom, 3); 
      }, 200);
    }
  }, [endRoom, floorId, svgContent]);

  

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

  useEffect(function() {
    // Remove highlight from any old rooms
    const oldHighlights = document.querySelectorAll(".highlight-room");
    for (const el of oldHighlights) {
      el.classList.remove("highlight-room");
    }
    const roomIsOnThisFloor = endRoom && endRoom.substring(0, 2) === floorId;

    //  Add highlight to the target room
    if (roomIsOnThisFloor) {
      const el = document.getElementById("room-" + endRoom);
      if (el) {
        el.classList.add("highlight-room");
        // Bring to front: SVG draws in order, so move to end of list
        el.parentNode.appendChild(el);
      }
    }
  }, [endRoom, svgContent,pathIds,floorId]);


  return (
    <TransformWrapper
      key={floorId + svgContent.length}
      ref={transformRef}
      initialScale={1}
      minScale={0.2}
      maxScale={8}
      centerOnInit={true}
      limitToBounds={false}
      alignmentAnimation={{ disabled: true }}
      panning={{ velocityDisabled: true }}
    >
      <TransformComponent 
      wrapperClass="debug-wrapper" 
      contentClass="debug-content"
      wrapperStyle={{ width: "100%", height: "100%" }} 
      contentStyle={{ width: "auto", height: "auto" }}>
        <div id="Map-Wrapper" style={{ position: "relative", display: "inline-block" }}>
          <div 
            className="map-svg" 
            dangerouslySetInnerHTML={{ __html: svgContent }} 
          />
          <svg className="path-overlay" 
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet" 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none"
          }}>
            <path className="path" d={generatePathD()} />
          </svg>
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}

export default memo(MapDisplay);