import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import styles from "./ZoomViewer.module.scss";
import OutsideClickHandler from "components/Common/Modals/OutsideClick";
import { useEffect, useState } from "react";

const ZoomViewer = ({ url, resetImageSLideshow }) => {
  const [defaultScale, setDefaultScale] = useState(0.8);

  useEffect(() => {
    const img = new Image();
    img.src = url;
    img.onload = function () {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;
      const scaleWidth = containerWidth / this.width;
      const scaleHeight = containerHeight / this.height;
      setDefaultScale(Math.min(scaleWidth, scaleHeight));
    };
  }, [url]);
  console.log(defaultScale, "defaultScale");
  return (
    <div className={styles.mainContainer}>
      <div className={styles.imageContainer}>
        <OutsideClickHandler onMouseUpOutside={resetImageSLideshow}>
          <TransformWrapper defaultScale={defaultScale}>
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
