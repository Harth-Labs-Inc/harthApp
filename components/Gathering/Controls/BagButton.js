import { IconBag } from "../../../resources/icons/IconBag";
import { useState } from "react";
import styles from "./gatheringButtons.module.scss";
import { DiceButton } from "./DiceButton";
import { MapButton } from "./MapButton";

export const BagButton = (props) => {
  const { size = "large", onDicePress, onMapPress } = props;
  const [buttonState, setButtonState] = useState("off");

  const toggleActive = () => {
    if (buttonState == "off") {
      setButtonState("on");
    } else {
      setButtonState("off");
    }
  };

  return (
    <div>
      {buttonState == "on" ? (
        <div>
          <DiceButton
            onPress={() => {
              setButtonState("off");
              onDicePress();
            }}
          />
          <MapButton
            onPress={() => {
              setButtonState("off");
              onMapPress();
            }}
          />
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
                    ? styles.basicButtonActive
                    : styles.basicButtonInactive
                }
            `}
        aria-label="Game Bag"
        onClick={toggleActive}
      >
        {buttonState == "on" ? (
          <div height="100%" width="100%">
            <IconBag hasGradient="true" />
          </div>
        ) : (
          <div height="100%" width="100%">
            <IconBag />
          </div>
        )}
      </button>
    </div>
  );
};
