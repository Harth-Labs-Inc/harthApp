import { IconMicFill } from "../../../resources/icons/IconMicFill";
import { IconMuteMicFill } from "../../../resources/icons/IconMuteMicFill";
import styles from "./gatheringButtons.module.scss";
import OutsideClickHandler from "../../Common/Modals/OutsideClick";

export const MicButton = (props) => {
  const {
    isMobile = false,
    onPress,
    audioList,
    changeAudioDevice,
    clearAudioList,
    isOn,
  } = props;

  return (
    <div className={styles.BagButton}>
      {audioList ? (
        <OutsideClickHandler
          onClickOutside={clearAudioList}
          onFocusOutside={clearAudioList}
        >
          <div className={styles.OptionsMenu}>
            <div className={styles.OptionsMenuContainer}>
              {audioList.map((device) => {
                let lastUsedAudioDeviceID = localStorage.getItem(
                  "lastUsedAudioDeviceID"
                );
                const { label, deviceId } = device;
                return (
                  <button
                    id={
                      lastUsedAudioDeviceID == deviceId ? styles.selected : null
                    }
                    key={deviceId}
                    onClick={() => {
                      clearAudioList();
                      changeAudioDevice(device);
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
                ${isOn ? styles.basicButtonInactive : styles.basicButtonMuted}
            `}
        aria-label="Microphone"
        onClick={onPress}
      >
        {isOn ? (
          <div height="100%" width="100%">
            <IconMicFill hasGradient={false} />
          </div>
        ) : (
          <div height="100%" width="100%">
            <IconMuteMicFill hasGradient={false} />
          </div>
        )}
      </button>
    </div>
  );
};
