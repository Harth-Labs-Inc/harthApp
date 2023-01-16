import { useState } from "react";
import { IconMicFill } from "../../../resources/icons/IconMicFill";
import { IconMuteMicFill } from "../../../resources/icons/IconMuteMicFill";
import styles from "./gatheringButtons.module.scss";

export const MicButton = (props) => {
    const {
        size = "large",
        onPress,
        audioList,
        changeAudioDevice,
        clearAudioList,
    } = props;
    const [buttonState, setButtonState] = useState("on");

    const toggleActive = () => {
        if (buttonState == "muted") {
            setButtonState("on");
        } else {
            setButtonState("muted");
        }
        onPress();
    };

    return (
        <div className={styles.BagButton}>
            {audioList ? (
                <div className={styles.BagButtonOptions}>
                    <div className={styles.BagButtonOptionsContainer}>
                        {audioList.map((device) => {
                            const { label, deviceId } = device;
                            return (
                                <button
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
                        ? styles.basicButtonInactive
                        : styles.basicButtonMuted
                }
            `}
                aria-label="Microphone"
                onClick={toggleActive}
            >
                {buttonState == "on" ? (
                    <div height="100%" width="100%">
                        <IconMicFill hasGradient="true" />
                    </div>
                ) : (
                    <div height="100%" width="100%">
                        <IconMuteMicFill />
                    </div>
                )}
            </button>
        </div>
    );
};
