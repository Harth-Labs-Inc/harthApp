import { IconDice } from "../../../resources/icons/IconDice";
import { useState } from "react";
import styles from "./gatheringButtons.module.scss";


export const DiceButton = (props) => {
    const {
        size = "large",
        onPress,
        ariaLabel,
    } = props;
    const [buttonState, setButtonState] = useState("off");

    const toggleActive = () => {
        if (buttonState == "off"){
            setButtonState("on")
        }
        else{
            setButtonState("off")
        }
    };


    return (
        <>
        <button
            className={`
                ${styles.basicButton} 
                ${styles.basicButtonBag} 
                ${buttonState == "on" ? styles.basicButtonActive : styles.basicButtonInactive}
            `}
            aria-label={ariaLabel}
            onClick={toggleActive}
        >
            {(buttonState == "on")
            ?
                <div height="100%" width="100%">
                    <IconDice hasGradient="true"/>
                </div>
            :
                <div height="100%" width="100%">
                    <IconDice />
                </div>
        
            }
            

        </button>
        </>
    );
};
