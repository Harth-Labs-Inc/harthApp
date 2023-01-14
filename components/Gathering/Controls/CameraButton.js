import { useState } from "react";
import { IconVideoFill } from "../../../resources/icons/IconVideoFill";
import styles from "./gatheringButtons.module.scss";

export const CameraButton = (props) => {
  const {
    size = "large",
    onPress,
    videoList,
    changeVideoDevice,
    clearVideoList,
  } = props;
  const [buttonState, setButtonState] = useState("off");

  const toggleActive = () => {
    if (buttonState == "off") {
      setButtonState("on");
    } else {
      setButtonState("off");
    }
    onPress();
  };

  return (
    <div>
      {videoList ? (
        <div className={styles.BagButtonOptions}>
          <div className={styles.BagButtonOptionsContainer}>
            {videoList.map((device) => {
              const { label, deviceId } = device;
              return (
                <button
                  key={deviceId}
                  onClick={() => {
                    clearVideoList();
                    changeVideoDevice(device);
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <button
        className={`
                ${styles.basicButton} 
                ${
                  size == "large"
                    ? styles.basicButtonLarge
                    : styles.basicButtonSmall
                } 
                ${
                  buttonState == "on"
                    ? styles.basicButtonActive
                    : styles.basicButtonInactive
                }
            `}
        aria-label="Webcam"
        onClick={toggleActive}
      >
        {buttonState == "on" ? (
          <div height="100%" width="100%">
            <IconVideoFill hasGradient="true" />
          </div>
        ) : (
          <div height="100%" width="100%">
            <IconVideoFill />
          </div>
        )}
      </button>
    </div>
  );
};
