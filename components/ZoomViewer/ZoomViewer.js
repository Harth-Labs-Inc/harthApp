import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import styles from "./ZoomViewer.module.scss";
import { useEffect, useState } from "react";
import { getDownloadURL } from "requests/s3";
import { SpinningLoader } from "components/Common/SpinningLoader/SpinningLoader";
import { IconChevronLeft } from "resources/icons/IconChevronLeft";
import { IconChevronRight } from "resources/icons/IconChevronRight";
//import { IconDownload } from "resources/icons/IconDownload";

/* eslint-disable */
const ZoomViewer = ({
  url,
  resetImageSLideshow,
  prevImageInSlideshow,
  nextImageInSlideshow,
  slideshowURLRef,
}) => {
  const [fullImage, setFullImage] = useState("");
  const [mediaType, setMediaType] = useState("");

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
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      resetImageSLideshow();
    }
  };

  useEffect(() => {
    if (url.fileType.startsWith("image/")) {
      setMediaType("image");
    } else if (url.fileType.startsWith("video/")) {
      setMediaType("video");
    }
    getFullImage(url);
  }, [url]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const index = slideshowURLRef?.findIndex((obj) => obj.name === url.name);
  return (
    <>
      <div className={styles.mainContainer}>
        {/* <button onClick={} className={styles.download}>
          <IconDownload />
        </button> */}
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
            {mediaType === "image" && (
              <TransformWrapper>
                {() => (
                  <TransformComponent>
                    <img src={fullImage} alt="Zoomable content" />
                  </TransformComponent>
                )}
              </TransformWrapper>
            )}
            {mediaType === "video" && (
              <video
                width="80%"
                height="80%"
                controls
                playsInline
                muted
                src={fullImage}
                type={url.fileType}
              ></video>
            )}
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
      {index < slideshowURLRef?.length - 1 && (
        <button
          onClick={() => nextImageInSlideshow(url)}
          className={styles.prevbutton}
        >
          <IconChevronLeft />
        </button>
      )}
      {index > 0 && (
        <button
          onClick={() => prevImageInSlideshow(url)}
          className={styles.nextbutton}
        >
          <IconChevronRight />
        </button>
      )}
    </>
  );
};

export default ZoomViewer;
