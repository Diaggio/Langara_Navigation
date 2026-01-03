function InfoCard(props) {
  const activeClass = props.isOpen ? "open" : "";

  return (
    <div id="info-card" className={activeClass}>
      <div className="info-header">
        <span>Info</span>
        <button className="info-close-x" onClick={props.onClose}>
          ✕
        </button>
      </div>

      <div className="info-section notice">
        Notice: This app is currently in development. Only the A2 floor has been
        enabled so far.
      </div>
      
      <hr className="info-divider" />

      <div className="info-section disclaimer">
        LangaraNAV is an independent personal project created by a Langara
        graduate. It is not affiliated with Langara College.
      </div>
    </div>
  );
}

export default InfoCard;