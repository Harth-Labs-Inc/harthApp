import { useState } from "react";

import { IconBag } from "../../../resources/icons/IconBag";
import { DiceButton } from "./DiceButton";
import { MapButton } from "./MapButton";

import styles from "./gatheringButtons.module.scss";

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
        <div className={styles.BagButton}>
            {buttonState == "on" ? (
                <div className={styles.BagButtonOptions}>
                    <div className={styles.BagButtonOptionsContainer}>
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
