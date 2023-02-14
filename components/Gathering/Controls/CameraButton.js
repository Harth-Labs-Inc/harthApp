import { useState } from "react";
import { IconVideoFill } from "../../../resources/icons/IconVideoFill";
import { IconVideoOffFill } from "../../../resources/icons/IconVideoOffFill";
import styles from "./gatheringButtons.module.scss";

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
                <div className={styles.OptionsMenu}>
                    <div className={styles.OptionsMenuContainer}>
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
                ${isMobile ? styles.basicButtonLarge : styles.basicButtonSmall} 
                ${isOn ? styles.basicButtonActive : styles.basicButtonInactive}
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
                        <IconVideoOffFill fill="#bb0000" />
                    </div>
                )}
            </button>
        </div>
    );
};
