function SearchBar(props) {
  return (
    <>
      <div id="pathfinder-ui">
        <input 
          //list looks for the data list for autocomplete, its called room-list defined below
          list="room-list" 
          placeholder="Start Room"
          // the value in the box will be the state
          value={props.startRoom} 
          //update the state whenever a key is pressed
          onChange={function(e) { props.setStart(e.target.value) }} 
        />
        <input 
          list="room-list" 
          placeholder="End Room"
          value={props.endRoom} 
          onChange={function(e) { props.setEnd(e.target.value) }} 
        />
        {/* //button is disabled until data finishes loading */}
        <button onClick={props.onSearch} disabled={props.isLoading}>
          Find Path
        </button>
      </div>
 
      <datalist id="room-list">
        {props.rooms.map(function(room) {
          return <option key={room} value={room} />;
        })}
      </datalist>
    </>
  );
}

export default SearchBar;