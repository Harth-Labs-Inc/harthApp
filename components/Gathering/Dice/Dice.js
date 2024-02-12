import { useContext, useState } from "react";

import { IconDiceD20 } from "../../../resources/icons/IconDiceD20";
import { IconDiceD12 } from "../../../resources/icons/IconDiceD12";
import { IconDiceD10 } from "../../../resources/icons/IconDiceD10";
import { IconDiceD8 } from "../../../resources/icons/IconDiceD8";
import { IconDiceD6 } from "../../../resources/icons/IconDiceD6";
import { IconDiceD4 } from "../../../resources/icons/IconDiceD4";

import { MobileContext } from "../../../contexts/mobile";

import styles from "./dice.module.scss";

export const Dice = (props) => {
  const { number = 20, diceRollHandler } = props;

  const { isMobile } = useContext(MobileContext);

  const [isDisabled, setIsDisabled] = useState(false);
  const [rollResult, setRollResult] = useState();
  const [showRoll, setShowRoll] = useState(false);
  const [multiplier, setMultiplier] = useState(1);

  const rollAnimation = () => {
    setIsDisabled(true);
    //timeout for animation roll
    setTimeout(() => rollDice(), 2000);
  };

  const rollDice = () => {
    setShowRoll(true);
    for (let i = 0; i < multiplier; i++) {
      let result = (Math.floor(Math.random() * number) + 1).toString();
      setRollResult(result);
      diceRollHandler({ sides: number, number: result });
    }
    setTimeout(() => {
      setShowRoll(false);
      setIsDisabled(false);
    }, 2000);
  };

  const incrementMultiplier = () => {
    if (multiplier >= 6) {
      setMultiplier(1);
    } else {
      setMultiplier(multiplier + 1);
    }
  };

  /* eslint-disable */

  return (
    <>
      <div
        className={`
            ${isMobile ? styles.Mobile : styles.Desktop}
        `}
      >
        <button
          className={`
                ${styles.diceButton} 
                ${
                  isDisabled == true
                    ? styles.diceButtonAnimated
                    : styles.diceButtonInactive
                }
                
            `}
          aria-label="dice"
          onClick={rollAnimation}
          disabled={isDisabled}
        >
          {showRoll && <div className={styles.rollResult}>{rollResult}</div>}

          {number == 20 && !showRoll && (
            <div className={styles.icon}>
              <IconDiceD20 hasGradient="true" />
            </div>
          )}

          {number == 12 && !showRoll && (
            <div className={styles.icon}>
              <IconDiceD12 hasGradient="true" />
            </div>
          )}

          {number == 10 && !showRoll && (
            <div className={styles.icon}>
              <IconDiceD10 hasGradient="true" />
            </div>
          )}

          {number == 8 && !showRoll && (
            <div className={styles.icon}>
              <IconDiceD8 hasGradient="true" />
            </div>
          )}

          {number == 6 && !showRoll && (
            <div className={styles.icon}>
              <IconDiceD6 hasGradient="true" />
            </div>
          )}

          {number == 4 && !showRoll && (
            <div className={styles.icon}>
              <IconDiceD4 hasGradient="true" />
            </div>
          )}
        </button>
        <button className={styles.multiplier} onClick={incrementMultiplier}>
          <span className={styles.x}>x</span>
          {multiplier}
        </button>
      </div>
    </>
  );
};
