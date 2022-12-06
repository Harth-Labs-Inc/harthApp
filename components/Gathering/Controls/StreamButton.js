import { useState } from "react";
import { IconPresentFill } from "../../../resources/icons/IconPresentFill";
import { IconCancelCastFill } from "../../../resources/icons/IconCancelCastFill";
import styles from "./gatheringButtons.module.scss";


export const StreamButton = (props) => {
    const {
        size = "large",
        helpText,
        onPress,
        onShow ="ok",
    } = props;
    const [buttonState, setButtonState] = useState("off");

    const toggleActive = () => {
        if (buttonState == "off"){
            //onPress()
            //Does this need an await function for onPress 
            //before it sets the button
            setButtonState("on")
        }
        else{
            //onPress()
            //Does this need an await function for onPress 
            //before it sets the button
            setButtonState("off")
        }
    };


    return (
        <button
            className={`
                ${styles.basicButton} 
                ${size == "large" ? styles.basicButtonLarge : styles.basicButtonSmall} 
                ${buttonState == "on" ? styles.basicButtonActive : styles.basicButtonInactive}
            `}
            aria-label="Microphone"
            onClick={toggleActive}
        >
            {(buttonState == "on")
            ?
                <div height="100%" width="100%">
                    <IconCancelCastFill hasGradient="true"/>
                </div>
            :
                <div height="100%" width="100%">
                    <IconPresentFill />
                </div>
            }
        </button>
  

        
    );
};
