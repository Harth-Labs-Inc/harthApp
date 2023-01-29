import { IconMap } from "../../../resources/icons/IconMap";
import { useState } from "react";
import styles from "./gatheringButtons.module.scss";

export const MapButton = (props) => {
  const { isMobile = false, onPress, ariaLabel = "map button" } = props;
  const [buttonState, setButtonState] = useState("off");

  const toggleActive = () => {
    onPress();
  };

  return (
    <>
      <button
        className={`
                ${styles.basicButton} 
                ${styles.basicButtonBagButtonBottom} 
                ${isMobile
                  ? styles.basicButtonLarge
                  : styles.basicButtonSmall
                } 
            `}
        aria-label={ariaLabel}
        onClick={toggleActive}
      >
        <div height="100%" width="100%">
          <IconMap />
        </div>

      </button>
    </>
  );
};
