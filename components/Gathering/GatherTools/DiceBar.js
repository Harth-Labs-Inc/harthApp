import { useContext, useEffect } from "react";
import Draggable from "react-draggable";

import { IconClose } from "../../../resources/icons/IconClose";
import { MobileContext } from "../../../contexts/mobile";

import { Dice } from "../Dice/Dice";
import styles from "./gatherTools.module.scss";
import OutsideClickHandler from "components/Common/Modals/OutsideClick";

export const DiceBar = (props) => {
  const { diceRollHandler, togggleDiceModal } = props;

  const { isMobile } = useContext(MobileContext);

  useEffect(() => {
    const element = document.getElementById("mainContainerDice");
    if (element) {
      element.classList.add(styles.rendering);
      setTimeout(() => {
        element.classList.remove(styles.rendering);
        element.classList.add(styles.entered);
      }, 100);
    }

    return () => {
      if (element) {
        element.classList.remove(styles.entered);
        element.classList.remove(styles.rendering);
      }
    };
  }, []);

  if (isMobile) {
    return (
      <>
        <OutsideClickHandler
          onClickOutside={togggleDiceModal}
          onFocusOutside={togggleDiceModal}
        >
          <div
            id="mainContainerDice"
            className={`${styles.mainContainerDice} ${
              isMobile && styles.mainContainerDiceMobile
            }`}
          >
            <div 
              className={`
                ${styles.topBar} 
                ${isMobile && styles.topBarMobile}
              `} 
              id="handle">
                <div className={styles.grabber} />
                {!isMobile ?
                  <button
                    className={styles.close}
                    aria-label="close dice bar"
                    onClick={togggleDiceModal}
                  >
                    <IconClose />
                  </button>
                  : null}
            </div>

            <div className={styles.diceContainer} aria-label="dice bar">
              <Dice
                diceRollHandler={diceRollHandler}
                number={4}
                size={isMobile ? "large" : "small"}
                ariaLabel="D 4"
              />
              <Dice
                diceRollHandler={diceRollHandler}
                number={6}
                size={isMobile ? "large" : "small"}
                ariaLabel="D 6"
              />
              <Dice
                diceRollHandler={diceRollHandler}
                number={8}
                size={isMobile ? "large" : "small"}
                ariaLabel="D 8"
              />
              <Dice
                diceRollHandler={diceRollHandler}
                number={10}
                size={isMobile ? "large" : "small"}
                ariaLabel="D 10"
              />
              <Dice
                diceRollHandler={diceRollHandler}
                number={12}
                size={isMobile ? "large" : "small"}
                ariaLabel="D 12"
              />
              <Dice
                diceRollHandler={diceRollHandler}
                number={20}
                size={isMobile ? "large" : "small"}
                ariaLabel="D 20"
              />
            </div>
          </div>
        </OutsideClickHandler>
      </>
    );
  }

  return (
    <>
      <Draggable
        handle="#handle"
        bounds={isMobile ? "#PartyWindow" : "#video-container"}
      >
        <div
          id="mainContainerDice"
          className={`${styles.mainContainerDice} ${
            isMobile && styles.mainContainerDiceMobile
          }`}
        >
          <div className={styles.topBar} id="handle">
            <div className={styles.grabber} />
            <button
              className={styles.close}
              aria-label="close dice bar"
              onClick={togggleDiceModal}
            >
              <IconClose />
            </button>
          </div>

          <div className={styles.diceContainer} aria-label="dice bar">
            <Dice
              diceRollHandler={diceRollHandler}
              number={4}
              size={isMobile ? "large" : "small"}
              ariaLabel="D 4"
            />
            <Dice
              diceRollHandler={diceRollHandler}
              number={6}
              size={isMobile ? "large" : "small"}
              ariaLabel="D 6"
            />
            <Dice
              diceRollHandler={diceRollHandler}
              number={8}
              size={isMobile ? "large" : "small"}
              ariaLabel="D 8"
            />
            <Dice
              diceRollHandler={diceRollHandler}
              number={10}
              size={isMobile ? "large" : "small"}
              ariaLabel="D 10"
            />
            <Dice
              diceRollHandler={diceRollHandler}
              number={12}
              size={isMobile ? "large" : "small"}
              ariaLabel="D 12"
            />
            <Dice
              diceRollHandler={diceRollHandler}
              number={20}
              size={isMobile ? "large" : "small"}
              ariaLabel="D 20"
            />
          </div>
        </div>
      </Draggable>
      {/* {type == "desktop" ? (
                <Draggable handle="#handle" bounds={"#video-container"}>
                    <div className={`${styles.mainContainerDice} ${isMobile && styles.mainContainerDiceMobile}`}>
                        <div className={styles.topBar} id="handle">
                            <div className={styles.grabber} />
                            <button
                                className={styles.close}
                                aria-label="close dice bar"
                                onClick={togggleDiceModal}
                            >
                                <IconClose />
                            </button>
                        </div>

                        <div
                            className={styles.diceContainer}
                            aria-label="dice bar"
                        >
                            <Dice
                                diceRollHandler={diceRollHandler}
                                number={4}
                                size="small"
                                ariaLabel="D 4"
                            />
                            <Dice
                                diceRollHandler={diceRollHandler}
                                number={6}
                                size="small"
                                ariaLabel="D 6"
                            />
                            <Dice
                                diceRollHandler={diceRollHandler}
                                number={8}
                                size="small"
                                ariaLabel="D 8"
                            />
                            <Dice
                                diceRollHandler={diceRollHandler}
                                number={10}
                                size="small"
                                ariaLabel="D 10"
                            />
                            <Dice
                                diceRollHandler={diceRollHandler}
                                number={12}
                                size="small"
                                ariaLabel="D 12"
                            />
                            <Dice
                                diceRollHandler={diceRollHandler}
                                number={20}
                                size="small"
                                ariaLabel="D 20"
                            />
                        </div>
                    </div>
                </Draggable>
            ) : (
                <div
                    className={styles.mobileDiceContainer}
                    aria-label="dice bar"
                >
                    <div className={styles.grabber} />

                    <div className={styles.diceRow}>
                        <Dice
                            diceRollHandler={diceRollHandler}
                            number={4}
                            size="large"
                            ariaLabel="D 4"
                        />
                        <Dice
                            diceRollHandler={diceRollHandler}
                            number={6}
                            size="large"
                            ariaLabel="D 6"
                        />
                        <Dice
                            diceRollHandler={diceRollHandler}
                            number={8}
                            size="large"
                            ariaLabel="D 8"
                        />
                    </div>
                    <div className={styles.diceRow}>
                        <Dice
                            diceRollHandler={diceRollHandler}
                            number={10}
                            size="large"
                            ariaLabel="D 10"
                        />
                        <Dice
                            diceRollHandler={diceRollHandler}
                            number={12}
                            size="large"
                            ariaLabel="D 12"
                        />
                        <Dice
                            diceRollHandler={diceRollHandler}
                            number={20}
                            size="large"
                            ariaLabel="D 20"
                        />
                    </div>
                </div>
            )} */}
    </>
  );
};
