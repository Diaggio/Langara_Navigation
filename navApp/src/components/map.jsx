import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import map from '../assets/Maps/A2v2.svg'
import intersections from '../assets/Maps/intersections.svg'
import nodes from '../assets/Nodes/nodes.json'
import DrawNodes from "./drawNodes";


const Map = () => {
  return (
    <div className="map-viewPort">
      <TransformWrapper >
        <TransformComponent>
        <svg
            viewBox="0 0 147 210" 
            width="100%" 
            height="100%"
            preserveAspectRatio="none"
          >
            <image href={map} width="147" height="210" />
            <DrawNodes nodes={nodes} />
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default Map;