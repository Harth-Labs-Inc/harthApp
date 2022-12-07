import { IconBag } from "../../../resources/icons/IconBag";
import { useState } from "react";
import styles from "./gatheringButtons.module.scss";


export const BagButton = (props) => {
    const {
        size = "large",
        onPress,
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
                ${size == "large" ? styles.basicButtonLarge : styles.basicButtonSmall} 
                ${buttonState == "on" ? styles.basicButtonActive : styles.basicButtonInactive}
            `}
            aria-label="Game Bag"
            onClick={toggleActive}
        >
            {(buttonState == "on")
            ?
                <div height="100%" width="100%">
                    <IconBag hasGradient="true"/>
                </div>
            :
                <div height="100%" width="100%">
                    <IconBag />
                </div>
        
            }
            

        </button>
        </>
    );
};
