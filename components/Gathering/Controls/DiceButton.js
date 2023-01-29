import { IconDice } from "../../../resources/icons/IconDice";
import { useState } from "react";
import styles from "./gatheringButtons.module.scss";

export const DiceButton = (props) => {
  const { isMobile = false, onPress, ariaLabel } = props;
  const [buttonState, setButtonState] = useState("off");

  const toggleActive = () => {
    onPress();
  };

  return (
    <>
      <button
        className={`
                ${styles.basicButton} 
                ${isMobile
                  ? styles.basicButtonLarge
                  : styles.basicButtonSmall
                } 
                ${styles.basicButtonBagButtonTop}
            `}
        aria-label={ariaLabel}
        onClick={toggleActive}
      >
        <div height="100%" width="100%">
          <IconDice />
        </div>

      </button>
    </>
  );
};
