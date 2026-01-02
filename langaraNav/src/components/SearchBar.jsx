import { useState } from "react";
import { ElevatorIcon } from "./Icons";

function SearchBar(props) {
  // Local "Draft" states for typing
  const [localStart, setLocalStart] = useState("");
  const [localEnd, setLocalEnd] = useState("");

  return (
    <>
      <div id="pathfinder-ui">
        <div className="app-title">
          LangaraNAV
        </div>
        {/* THE TOP ICON BAR */}
        {props.isDirectionsMode && (
          <div className="nav-header">
            <div className="mode-icons">
              {/* Elevator Toggle Button */}
              <button
                className={`icon-btn ${props.elevatorOnly ? "active" : ""}`}
                onClick={function () { props.setElevatorOnly(!props.elevatorOnly); }}
                title="Elevators Only"
              >
                <ElevatorIcon />
              </button>
            </div>

            {/* The Close Button */}
            <button className="header-close-btn"
            onClick={function () {
              // Clear the text currently typed in the component
              setLocalStart("");
              setLocalEnd("");

              // Call the App.jsx function to reset the map and directions mode
              props.onClose();
            }}
            >
              ✕
            </button>
          </div>
        )}

        {/* 2. THE INPUTS */}
        <div className="input-group">
          {props.isDirectionsMode && (
            <input
              list="room-list"
              placeholder="Choose starting point..."
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}

            />
          )}
          <input
            list="room-list"
            placeholder="Enter Room Number ie. A240c"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
          />
        </div>

        {/* ERROR MESSAGE (Inserted here) */}
        {props.errorMessage && (
          <div className="inline-error">
            {props.errorMessage}
          </div>
        )}

        {/* THE FIND BUTTON */}
        {!props.isDirectionsMode ? (
          <button onClick={() => props.onSearch(localEnd)}>Find Room</button>
        ) : (
          <button
            className="findPath-btn"
            onClick={function () {
              // If start and end are the same, just show the room
              if (localStart === localEnd && localStart !== "") {
                setLocalStart("");
                props.onClose();          // Closes the "From" box
                props.onSearch(localEnd, false); // Highlights just the one room
              } else {
                //  Otherwise, find the path between them
                props.onGetDirections(localStart, localEnd);
              }
            }}
          >
            Find Path
          </button>
        )}

        {props.segmentCount > 1 && (
          <>
            <hr className="nav-divider" />
            <div className="inline-nav-controls">
              <button onClick={props.onPrev} disabled={props.index === 0}>
                &lt; Prev
              </button>
              <span className="floor-display">Floor {props.floor}</span>
              <button onClick={props.onNext} disabled={props.index === props.segmentCount - 1}>
                Next &gt;
              </button>
            </div>
          </>
        )}

      </div>

      <datalist id="room-list">
        {props.rooms.map(function (room) {
          return <option key={room} value={room} />;
        })}
      </datalist>
    </>
  );
}

export default SearchBar;