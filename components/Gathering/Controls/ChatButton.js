import { useState } from "react";
import { IconSmsFill } from "../../../resources/icons/IconSmsFill";
import styles from "./gatheringButtons.module.scss";

export const ChatButton = (props) => {
  const { size = "large", onPress, unreadMsg } = props;
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
    <>
      {unreadMsg ? <p style={{ color: "white" }}>unread</p> : null}
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
        aria-label="Gathering Chat"
        onClick={toggleActive}
      >
        {buttonState == "on" ? (
          <div height="100%" width="100%">
            <IconSmsFill hasGradient="true" />
          </div>
        ) : (
          <div height="100%" width="100%">
            <IconSmsFill />
          </div>
        )}
      </button>
    </>
  );
};
