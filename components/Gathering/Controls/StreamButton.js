import { useState } from "react";
import { IconPresentFill } from "../../../resources/icons/IconPresentFill";
import { IconCancelCastFill } from "../../../resources/icons/IconCancelCastFill";
import styles from "./gatheringButtons.module.scss";

export const StreamButton = (props) => {
    const { isMobile = false, helpText, onPress, isOn } = props;

    return (
        <button
            className={`
                ${styles.basicButton} 
                ${isMobile ? styles.basicButtonLarge : styles.basicButtonSmall} 
                ${isOn ? styles.basicButtonActive : styles.basicButtonInactive}
            `}
            aria-label="Stream"
            onClick={onPress}
        >
            {isOn ? (
                <div height="100%" width="100%">
                    <IconCancelCastFill hasGradient="true" />
                </div>
            ) : (
                <div height="100%" width="100%">
                    <IconPresentFill hasGradient={false} fill="#fcfff666" />
                </div>
            )}
        </button>
    );
};
