import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import styles from "./ZoomViewer.module.scss";
import OutsideClickHandler from "components/Common/Modals/OutsideClick";

const ZoomViewer = ({ url, resetImageSLideshow }) => {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.imageContainer}>
        <OutsideClickHandler onMouseUpOutside={resetImageSLideshow}>
          <TransformWrapper>
            {() => (
              <TransformComponent>
                <img src={url} alt="Zoomable content" />
              </TransformComponent>
            )}
          </TransformWrapper>
        </OutsideClickHandler>
      </div>
    </div>
  );
};

export default ZoomViewer;
