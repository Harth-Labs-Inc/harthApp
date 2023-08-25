import { useState } from "react";
import { IconSmsFill } from "../../../resources/icons/IconSmsFill";
import styles from "./gatheringButtonsStream.module.scss";

export const ChatButtonStream = (props) => {
    const { isMobile = false, onPress, unreadMsg } = props;
    const [buttonState, setButtonState] = useState("off");

    const toggleActive = () => {
        if (buttonState == "off") {
            setButtonState("on");
        } else {
            setButtonState("off");
        }
        onPress();
    };

    /* eslint-disable */

    return (
        <>
            <button
                className={`
                ${styles.chatButton} 
                ${isMobile ? styles.chatButtonMobile : styles.chatButtonDesktop} 
                ${
                    buttonState == "on"
                        ? styles.basicButtonActive
                        : styles.basicButtonInactive
                }
            `}
                aria-label="Gathering Chat"
                onClick={toggleActive}
            >
                {unreadMsg ? (
                    <p className={styles.unreadMsg} style={{ color: "white" }}>
                        unread
                    </p>
                ) : null}
                {buttonState == "on" ? (
                    <div height="100%" width="100%">
                        <IconSmsFill hasGradient="true" />
                    </div>
                ) : (
                    <div height="100%" width="100%" className={styles.defaultIcon}>
                        <IconSmsFill hasGradient={false} />
                    </div>
                )}
            </button>
        </>
    );
};
