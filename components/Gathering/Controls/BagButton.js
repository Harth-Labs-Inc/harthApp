import { useState } from "react";

import { IconBag } from "../../../resources/icons/IconBag";
import { DiceButton } from "./DiceButton";
import { MapButton } from "./MapButton";

import styles from "./gatheringButtons.module.scss";

export const BagButton = (props) => {
    const { onDicePress, onMapPress, isMobile = false } = props;
    const [buttonState, setButtonState] = useState("off");

    const toggleActive = () => {
        if (buttonState == "off") {
            setButtonState("on");
        } else {
            setButtonState("off");
        }
    };

    /* eslint-disable */

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
                            isMobile={isMobile}
                        />
                        <MapButton
                            onPress={() => {
                                setButtonState("off");
                                onMapPress();
                            }}
                            isMobile={isMobile}
                        />
                    </div>
                </div>
            ) : null}

            <button
                className={`
                ${styles.basicButton} 
                ${isMobile ? styles.basicButtonLarge : styles.basicButtonSmall} 
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
                    <div height="100%" width="100%" className={styles.defaultIcon}>
                        <IconBag hasGradient={false} />
                    </div>
                )}
            </button>
        </div>
    );
};
