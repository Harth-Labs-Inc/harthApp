import { IconVideoFill } from "../../../resources/icons/IconVideoFill";
import { IconVideoOffFill } from "../../../resources/icons/IconVideoOffFill";
import styles from "./gatheringButtons.module.scss";
import OutsideClickHandler from "components/Common/Modals/OutsideClick";

export const CameraButton = (props) => {
  const {
    isMobile = false,
    onPress,
    videoList,
    changeVideoDevice,
    clearVideoList,
    isOn,
  } = props;

  return (
    <div>
      {videoList ? (
        <OutsideClickHandler
          onClickOutside={clearVideoList}
          onFocusOutside={clearVideoList}
        >
          <div className={styles.OptionsMenu}>
            <div className={styles.OptionsMenuContainer}>
              {videoList.map((device) => {
                let lastUsedVideoDeviceID = localStorage.getItem(
                  "lastUsedVideoDeviceID"
                );
                const { label, deviceId } = device;
                return (
                  <button
                    id={
                      lastUsedVideoDeviceID == deviceId ? styles.selected : null
                    }
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
        </OutsideClickHandler>
      ) : null}
      <button
        className={`
                ${styles.basicButton} 
                ${isMobile ? styles.basicButtonLarge : styles.basicButtonSmall} 
                ${isOn ? styles.basicButtonActive : styles.basicButtonMuted}
            `}
        aria-label="Webcam"
        onClick={onPress}
      >
        {isOn ? (
          <div height="100%" width="100%">
            <IconVideoFill hasGradient="true" />
          </div>
        ) : (
          <div height="100%" width="100%">
            <IconVideoOffFill hasGradient="false" />
          </div>
        )}
      </button>
    </div>
  );
};
