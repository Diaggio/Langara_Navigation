import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import map from '../assets/Maps/A2a.svg'


const Map = () => {
  return (
    <div className="map-viewPort">
        <TransformWrapper>
        <TransformComponent>
            <img src={map} alt="test" />
        </TransformComponent>
        </TransformWrapper>

    </div>
  );
};

export default Map;