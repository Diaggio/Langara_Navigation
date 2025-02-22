import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import map from '../assets/Maps/A2v2.svg';
import DrawNodes from "./drawNodes";

const Map = ({ nodes, activePath, showNodes }) => {
  
  const getPathCoordinates = (start, end) => {
    if (!start || !end) return '';
    const startNode = nodes.find(n => n.id === start);
    const endNode = nodes.find(n => n.id === end);
    return `M ${startNode.x},${startNode.y} L ${endNode.x},${endNode.y}`;
  };

  return (
    <div className="map-viewPort">
      <TransformWrapper>
        <TransformComponent>
          <svg
            viewBox="0 0 147 210" 
            height="100%"
            preserveAspectRatio="none"
          >            
          <image href={map} width="147" height="210"/>
          {showNodes && <DrawNodes nodes={nodes} />}
            
          {activePath && (
            <path 
              className="path"
              d={getPathCoordinates(activePath.start, activePath.end)}
            />
          )}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default Map;