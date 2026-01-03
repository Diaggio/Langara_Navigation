import { useState, useEffect } from "react";
import "./App.css";
import { initializeAppData } from "./logic/dataLoader";
import { getProcessedPath, segmentPathByFloor } from "./logic/pathLogic";
import MapDisplay from "./components/MapDisplay";
import SearchBar from "./components/SearchBar";
import InfoCard from "./components/InfoCard";

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
  const [isDirectionsMode, setIsDirectionsMode] = useState(false);

  const [elevatorOnly, setElevatorOnly] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

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
  function handleFindRoom(roomName,openDirections = true) {
    setError("");
    const actualRoom = roomsList.find(
      (r) => r.toLowerCase() === roomName.trim().toLowerCase()
    );
   
    if (roomsList.includes(actualRoom)) {
      setEndRoom(actualRoom);
      setCurrentFloor(actualRoom.substring(0, 2));
      setIsDirectionsMode(true);

      if (openDirections) {
      setIsDirectionsMode(true);
      } else {
        setIsDirectionsMode(false);
      }
    } else {
      // Set error if validation fails
      setError("Room '" + actualRoom + "' not found.");
    }
  }

  function handleGetDirections(start, end) {
    setError("");
    const actualStart = roomsList.find(
      (r) => r.toLowerCase() === start.trim().toLowerCase()
    );
    const actualEnd = roomsList.find(
      (r) => r.toLowerCase() === end.trim().toLowerCase()
    );
    if(!roomsList.includes(start)) {
      setError("Starting room not found.");
      return;
    }

    setStartRoom(actualStart);
    setEndRoom(actualEnd);
    // searchQuery is our Destination, originRoom is our Start
    const pathIds = getProcessedPath(actualStart, actualEnd, graph, nodeMap, hallwayEdges, elevatorOnly);
    
    if (pathIds && pathIds.length > 0) {
      const segments = segmentPathByFloor(pathIds);
      setPathSegments(segments);
      setCurrentSegmentIndex(0);
      setCurrentFloor(segments[0].floor);
    } else {
      setError("Could not find a path from " + end);
    }
  }

  function handleCloseDirections() {
    setIsDirectionsMode(false);
    setStartRoom("");
    setEndRoom("");
    setPathSegments([]);
    setElevatorOnly(false);
    setError("");
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
    
    <div className="ui-overlay">
      <SearchBar 
          isDirectionsMode={isDirectionsMode}
          onSearch={handleFindRoom}
          onGetDirections={handleGetDirections}
          rooms={roomsList}
          isLoading={!graph}
          onClose={handleCloseDirections}
          elevatorOnly={elevatorOnly}
          setElevatorOnly={setElevatorOnly}
          floor={currentFloor}
          index={currentSegmentIndex}
          segmentCount={pathSegments.length}
          onPrev={goToPrev}
          onNext={goToNext}
          errorMessage={error}
          onToggleInfo={function() { setIsInfoOpen(!isInfoOpen); }}
      />
    </div>

    <InfoCard 
      isOpen={isInfoOpen} 
      onClose={function() { setIsInfoOpen(false); }}
    />

    <div id="Map-Container">
      <MapDisplay 
        floorId={currentFloor} 
        startRoom={startRoom}
        endRoom={endRoom}
        nodeMap={nodeMap}
        pathIds={pathSegments[currentSegmentIndex]?.path} 
      />
    </div>

  </div>
);
}

export default App;