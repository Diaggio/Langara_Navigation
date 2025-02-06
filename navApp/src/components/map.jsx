import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import map from '../assets/Maps/A2a.svg'
import intersections from '../assets/Maps/intersections.svg'


const Map = () => {
  return (
    <div className="map-viewPort">
        <TransformWrapper>
          <TransformComponent>
            <div>
              <img src={intersections} alt="test2" />
              <img src={map} alt="test" />
            </div>
          </TransformComponent>
        </TransformWrapper>

    </div>
  );
};

export default Map;