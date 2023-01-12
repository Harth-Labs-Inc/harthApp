import { IconMap } from "../../../resources/icons/IconMap";
import { useState } from "react";
import styles from "./gatheringButtons.module.scss";

export const MapButton = (props) => {
  const { onPress, ariaLabel = "map button" } = props;
  const [buttonState, setButtonState] = useState("off");

  const toggleActive = () => {
    if (buttonState == "off") {
      setButtonState("on");
      //OnPress();
    } else {
      setButtonState("off");
      //OnPress();
    }
    onPress();
  };

  return (
    <>
      <button
        className={`
                ${styles.basicButton} 
                ${styles.basicButtonBag} 
                ${
                  buttonState == "on"
                    ? styles.basicButtonActive
                    : styles.basicButtonInactive
                }
            `}
        aria-label={ariaLabel}
        onClick={toggleActive}
      >
        {buttonState == "on" ? (
          <div height="100%" width="100%">
            <IconMap hasGradient="true" />
          </div>
        ) : (
          <div height="100%" width="100%">
            <IconMap />
          </div>
        )}
      </button>
    </>
  );
};
