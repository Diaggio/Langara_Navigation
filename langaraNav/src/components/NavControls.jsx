function NavControls(props) {
  // If there's only one floor in the path, don't show buttons at all
  if (props.segmentCount <= 1) {
    return null;
  }

  return (
    <div id="navigation-controls">
      <button onClick={props.onPrev} disabled={props.index === 0}>
        &lt; Prev
      </button>
      <span>Floor {props.floor}</span>
      <button onClick={props.onNext} disabled={props.index === props.segmentCount - 1}>
        Next &gt;
      </button>
    </div>
  );
}

export default NavControls;