import { useContext, useState, useRef, useEffect } from "react";
import ReactPanZoom from "react-image-pan-zoom-rotate";
import Draggable from "react-draggable";
import OutsideClickHandler from "components/Common/Modals/OutsideClick";
import styles from "./gatherTools.module.scss";
import { IconClose } from "../../../resources/icons/IconClose";

import { Button } from "../../Common";
import { IconMap } from "../../../resources/icons/IconMap";

// import { LeaveButtonMobile } from "../Controls/LeaveButtonMobile";

import { MobileContext } from "../../../contexts/mobile";

import {
  checkForBadFile,
  uploadCustomNamedFile,
} from "../../../services/helper";

import {
  checkForFileWithPrefix,
  getDownloadURL,
  deleteS3File,
} from "../../../requests/s3";

export const MapBar = (props) => {
  const {
    // type = "desktop",
    togggleMapModal,
    roomId,
    mapChangeHandler,
    mapUpdate,
  } = props;

  const { isMobile } = useContext(MobileContext);

  const [loading, setLoading] = useState(true);
  const [hasMap, setHasMap] = useState(false);
  const [mapImg, setMapImg] = useState();
  const [imageKey, setImageKey] = useState();

  const [hasBottomBar, setHasBottomBar] = useState();
  // const [image, setImage] = useState();

  const inputRef = useRef();
  const imageRef = useRef();

  useEffect(() => {
    const element = document.getElementById("mainContainerMap");
    if (element) {
      element.classList.add(styles.rendering);
      setTimeout(() => {
        element.classList.remove(styles.rendering);
        element.classList.add(styles.entered);
      }, 100);
    }

    return () => {
      if (element) {
        element.classList.remove(styles.entered);
        element.classList.remove(styles.rendering);
      }
    };
  }, [loading]);

  useEffect(() => {
    async function checkForExistingMap() {
      let results = await checkForFileWithPrefix(
        `${roomId}_map-image`,
        "room-map-image"
      );
      let { files } = results;
      if (files && files.length) {
        files.forEach(({ Key }) => {
          async function getURL() {
            let extention = Key.split(".").pop();
            let mimeType = "application/pdf";
            if (extention === "PNG" || extention === "png") {
              mimeType = "image/png";
            }
            if (
              extention === "jpeg" ||
              extention === "jpg" ||
              extention === "JPG"
            ) {
              mimeType = "image/jpeg";
            }
            const data = await getDownloadURL(Key, mimeType, "room-map-image");
            const { downloadURL } = data;
            if (downloadURL) {
              setImageKey(Key);
              // setImage(downloadURL);
              setMapImg(downloadURL);
              setHasMap(true);
              setLoading(false);
            } else {
              setLoading(false);
            }
          }
          getURL();
        });
      } else {
        setLoading(false);
      }
    }
    checkForExistingMap();
  }, [roomId, mapUpdate]);

  const clearMap = () => {
    async function deleteFile() {
      await deleteS3File(imageKey, "room-map-image");
      setImageKey(null);
      // setImage(null);
      setMapImg(null);
      setHasMap(false);
    }
    deleteFile();
  };
  const showBottomBar = () => {
    setHasBottomBar(true);
  };
  const hideBottomBar = () => {
    setHasBottomBar(false);
  };
  const saveFile = async (e) => {
    let file = e.target.files[0];
    let isBadFile = checkForBadFile(file);
    if (!isBadFile) {
      let s3Upload = await uploadCustomNamedFile({
        file: file,
        bucket: "room-map-image",
        name: `${roomId}_map-image`,
      });
      let profileIconKey = `https://room-map-image.s3.us-east-2.amazonaws.com/${s3Upload.name}`;
      imageRef.current = profileIconKey;
      setImageKey(s3Upload.name);
      // setImage(profileIconKey);
      setMapImg(profileIconKey);
      setHasMap(true);
      mapChangeHandler();
    }
  };
  const clickHandler = () => {
    inputRef?.current.click();
  };

  if (loading) {
    return null; //<p>loadding.....</p>;
  }

  if (isMobile) {
    return (
      <>
        <OutsideClickHandler
          onClickOutside={togggleMapModal}
          onFocusOutside={togggleMapModal}
        >
          <input
            ref={inputRef}
            hidden
            type="file"
            name="image-uploader"
            id="image-uploader"
            onChange={saveFile}
          ></input>
          <div
            id="mainContainerMap"
            className={`${styles.mainContainerMap} ${
              isMobile && styles.mainContainerMapMobile
            }`}
          >
            <div className={`
                ${styles.topBar} 
                ${isMobile && styles.topBarMobile}
              `} id="handle">

                {isMobile ? (
                  <div className={styles.grabber} />
                ):(
                  <>
                  <div className={styles.spacer} />
                  <div className={styles.grabber} />
                  <button
                    className={styles.close}
                    aria-label="close dice bar"
                    onClick={togggleMapModal}
                  >
                    <IconClose />
                  </button>
                  </>
                )}
            </div>

            {!hasMap ? (
              <div className={styles.mapContainer}>
                <div className={styles.icon}>
                  <IconMap />
                </div>
                <div className={styles.label}>Game Board</div>
                <Button
                  tier="primary"
                  size="small"
                  text="add an image"
                  onClick={clickHandler}
                />
              </div>
            ) : (
              <div
                className={`
                ${styles.mapContainer} 
                ${styles.mapContainerActive} 
                ${isMobile && styles.mapContainerActiveMobile} 
                `}
                onMouseOver={showBottomBar}
                onMouseLeave={hideBottomBar}
              >
                <ReactPanZoom image={mapImg} alt="Image alt text" />
                {hasBottomBar && (
                  <div className={styles.bottomBar}>
                    <Button
                      tier="secondary"
                      size="small"
                      text="clear image"
                      onClick={clearMap}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </OutsideClickHandler>
      </>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        hidden
        type="file"
        name="image-uploader"
        id="image-uploader"
        onChange={saveFile}
      ></input>
      <Draggable
        handle="#handle"
        bounds={isMobile ? "#PartyWindow" : "#video-container"}
      >
        <div
          id="mainContainerMap"
          className={`${styles.mainContainerMap} ${
            isMobile && styles.mainContainerMapMobile
          }`}
        >
          <div className={styles.topBar} id="handle">
            <div className={styles.spacer} />
            <div className={styles.grabber} />
            <button
              className={styles.close}
              aria-label="close dice bar"
              onClick={togggleMapModal}
            >
              <IconClose />
            </button>
          </div>

          {!hasMap ? (
            <div className={styles.mapContainer}>
              <div className={styles.icon}>
                <IconMap />
              </div>
              <div className={styles.label}>Game Board</div>
              <Button
                tier="primary"
                size="small"
                text="add an image"
                onClick={clickHandler}
              />
            </div>
          ) : (
            <div
              className={`
                ${styles.mapContainer} 
                ${styles.mapContainerActive} 
                `}
              onMouseOver={showBottomBar}
              onMouseLeave={hideBottomBar}
            >
              <ReactPanZoom image={mapImg} alt="Image alt text" />
              {hasBottomBar && (
                <div className={styles.bottomBar}>
                  <Button
                    tier="secondary"
                    size="small"
                    text="clear image"
                    onClick={clearMap}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Draggable>
    </>
  );
};
