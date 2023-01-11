import { Dice } from "../Dice/Dice";
import { useState } from "react";
import styles from "./gatherTools.module.scss";
import { IconClose } from "../../../resources/icons/IconClose";
// import Draggable from "react-draggable";
import Draggable from "react-draggable";
import { DraggableCore } from "react-draggable";

export const DiceBar = (props) => {
    const { type = "desktop", diceRollHandler, togggleDiceModal } = props;

    return (
        <>
            {type == "desktop" ? (
                <Draggable handle="#handle">
                    <div className={styles.mainContainer}>
                        <div className={styles.topBar} id="handle">
                            <div className={styles.spacer} />
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
            )}
        </>
    );
};
