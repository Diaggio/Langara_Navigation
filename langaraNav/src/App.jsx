import { useState, useEffect } from "react";
import "./App.css";
import { initializeAppData } from "./logic/dataLoader";
import { getProcessedPath, segmentPathByFloor } from "./logic/pathLogic";
import MapDisplay from "./components/MapDisplay";
import SearchBar from "./components/SearchBar";
import NavControls from "./components/NavControls";
import ErrorMessage from "./components/ErrorMessage";

function App() {
  // set up the needed states
  const [graph, setGraph] = useState(null);
  const [nodeMap, setNodeMap] = useState(new Map());
  const [hallwayEdges, setHallwayEdges] = useState([]);
  const [roomsList, setRoomsList] = useState([]);

  const [startRoom, setStartRoom] = useState("");
  const [endRoom, setEndRoom] = useState("");

  const [currentFloor, setCurrentFloor] = useState("campus");
  const [pathSegments, setPathSegments] = useState([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [error, setError] = useState("");

  // Initialize Data
  useEffect(function () {

    async function loadData() {
      //load up all the data and create structures
      const data = await initializeAppData();
      setGraph(data.graph);
      setNodeMap(data.nodeMap);
      setHallwayEdges(data.hallwayEdges);
      setRoomsList(data.roomsList);
    }

    loadData();
  }, []);

  // Handler for searching
  function handleSearch() {
    setError("");
    const pathIds = getProcessedPath(startRoom, endRoom, graph, nodeMap, hallwayEdges);
      //pathIds is the list containing the node ids for the path
    if (pathIds) {
      //get the path broken down per floor
      const segments = segmentPathByFloor(pathIds);
      setPathSegments(segments);
      setCurrentSegmentIndex(0);
      setCurrentFloor(segments[0].floor);
    } else {
      setError("Rooms not found or path unavailable.");
    }
  }

  function goToNext() {
    if (currentSegmentIndex < pathSegments.length - 1) {
      const next = currentSegmentIndex + 1;
      setCurrentSegmentIndex(next);
      setCurrentFloor(pathSegments[next].floor);
    }
  }

  function goToPrev() {
    if (currentSegmentIndex > 0) {
      const prev = currentSegmentIndex - 1;
      setCurrentSegmentIndex(prev);
      setCurrentFloor(pathSegments[prev].floor);
    }
  }

  //console.log("Current Segments:", pathSegments);
  return (
    <div id="appContainer">
      <h1>LangaraNAV</h1>

      {/* load up search bar*/}    
      <SearchBar 
        startRoom={startRoom}
        setStart={setStartRoom}
        endRoom={endRoom}
        setEnd={setEndRoom}
        onSearch={handleSearch}
        isLoading={!graph}
        rooms={roomsList}
      />

      <ErrorMessage message={error} />

      {/* load up next/prev floor buttons if multiple floors in path*/} 
      <NavControls 
        onPrev={goToPrev}
        onNext={goToNext}
        floor={currentFloor}
        index={currentSegmentIndex}
        segmentCount={pathSegments.length}
      />

      {/* load up the map itself*/} 
      <div id="Map-Container">
        <MapDisplay 
          floorId={currentFloor} 
          pathIds={pathSegments[currentSegmentIndex]?.path} 
          nodeMap={nodeMap}
        />
      </div>
    </div>
  );
}

export default App;