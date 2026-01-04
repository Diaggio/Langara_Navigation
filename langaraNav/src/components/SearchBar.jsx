import { useState } from "react";
import { ElevatorIcon, BackIcon, InfoIcon, DirectionsIcon } from "./Icons";


function SearchBar(props) {
  // Local "Draft" states for typing
  const [localStart, setLocalStart] = useState("");
  const [localEnd, setLocalEnd] = useState("");

  const showDirectionsIcon = !props.isDirectionsMode && 
                            localEnd !== "" && 
                            localEnd.toLowerCase() === props.endRoom?.toLowerCase();

  function handleSubmit(e) {
    e.preventDefault(); // Stop page reload

    if (!props.isDirectionsMode) {
      props.onSearch(localEnd);
    } else {
      const startInput = localStart.trim().toLowerCase();
      const endInput = localEnd.trim().toLowerCase();
      
      if (startInput === endInput && startInput !== "") {
        setLocalStart("");
        props.onSearch(localEnd, false); // Collapse UI
      } else {
        props.onGetDirections(localStart, localEnd);
      }
    }

    if (document.activeElement) {
      document.activeElement.blur();
    }

  }

  return (
    <>
      <form id="pathfinder-ui" onSubmit={handleSubmit}>
        <div className="title-row">
          {/* Show the back arrow ONLY in directions mode on Mobile */}
          {props.isDirectionsMode && (
          <button 
            type="button" 
            className="back-icon-btn mobile-only" 
            onClick={function () {
              setLocalStart(""); 
              setLocalEnd("");   
              props.onClose();
          }}
          >
            <BackIcon />
          </button>
          )}
          <div className="app-title">
            LangaraNAV
          </div>
          <button type="button"
            className="info-icon-btn"
            onClick={props.onToggleInfo}>
              <InfoIcon />
          </button>
        </div>
        {/* THE TOP ICON BAR */}
        {props.isDirectionsMode && (
          <div className="nav-header mobile-hide">
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

        {/* THE INPUTS */}
        <div className="input-group">
          {props.isDirectionsMode && (
            <input
              //list="room-list"
              placeholder="Choose starting point..."
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}

            />
          )}
          <div className="search-input-wrapper">
            <input
              //list="room-list"
              placeholder="Enter Room Number ie. A240c"
              value={localEnd}
              onChange={(e) => setLocalEnd(e.target.value)}
            />
            {showDirectionsIcon && (
            <>
              <div className="input-divider"></div>
              <button 
                type="button" 
                className="directions-trigger-btn"
                onClick={() => props.setIsDirectionsMode(true)}
              >
                <DirectionsIcon />
              </button>
            </>
          )}
          </div>
        </div>

        {/* ERROR MESSAGE (Inserted here) */}
        {props.errorMessage && (
          <div className="inline-error">
            {props.errorMessage}
          </div>
        )}

        {/* THE FIND BUTTON */}
        {!props.isDirectionsMode ? (
          <button 
            type="submit" className="mobile-hide" disabled={props.isLoading}>
            Find Room
          </button>
        ) : (
          <button type="submit" className="findPath-btn mobile-hide" disabled={props.isLoading}>
            Find Path
          </button>
        )}

        {props.segmentCount > 1 && (
          <>
            <hr className="nav-divider" />
            <div className="inline-nav-controls">
              <button type="button" onClick={props.onPrev} disabled={props.index === 0}>
                &lt; Prev
              </button>
              <span className="floor-display">Floor {props.floor}</span>
              <button type="button" onClick={props.onNext} disabled={props.index === props.segmentCount - 1}>
                Next &gt;
              </button>
            </div>
          </>
        )}

      </form>

      <datalist id="room-list">
        {props.rooms.map(function (room) {
          return <option key={room} value={room} />;
        })}
      </datalist>
    </>
  );
}

export default SearchBar;