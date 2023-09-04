import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import styles from "./ZoomViewer.module.scss";
import { useEffect, useState } from "react";
import { getDownloadURL } from "requests/s3";
import { SpinningLoader } from "components/Common/SpinningLoader/SpinningLoader";

const ZoomViewer = ({
  url,
  resetImageSLideshow,
  prevImageInSlideshow,
  nextImageInSlideshow,
}) => {
  const [fullImage, setFullImage] = useState("");

  const getFullImage = async (url) => {
    let name = url.name;
    if (name.includes("thumbnail")) {
      name = name.replace("thumbnail", "full");
    }
    const data = await getDownloadURL(
      name,
      url.fileType,
      "topic-message-attachments"
    );
    if (data) {
      const { ok, downloadURL } = data;
      if (ok) {
        setFullImage(downloadURL);
      }
    }
  };
  useEffect(() => {
    getFullImage(url);
  }, [url]);

  if (fullImage) {
  }

  return (
    <>
      <div className={styles.mainContainer}>
        <button onClick={resetImageSLideshow} className={styles.button}>
          close
        </button>
        {fullImage ? (
          <div className={styles.imageContainer}>
            <style jsx global>{`
              .react-transform-wrapper {
                width: 100% !important;
                height: 100% !important;
              }
              .react-transform-component {
                display: flex;
                flex-direction: column;
                justify-content: center;
                width: 100%;
                height: 100%;
              }
            `}</style>
            <TransformWrapper>
              {() => (
                <TransformComponent>
                  <img src={fullImage} alt="Zoomable content" />
                </TransformComponent>
              )}
            </TransformWrapper>
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate3d(-50%, -50%, 0)",
            }}
          >
            <SpinningLoader spinnerOnly={true} />
          </div>
        )}
      </div>
      <button
        onClick={() => nextImageInSlideshow(url)}
        className={styles.nextbutton}
      >
        {">"}
      </button>
      <button
        onClick={() => prevImageInSlideshow(url)}
        className={styles.prevbutton}
      >
        {"<"}
      </button>
    </>
  );
};

export default ZoomViewer;
