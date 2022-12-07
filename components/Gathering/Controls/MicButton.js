import { useState } from "react"
import { IconMicFill } from "../../../resources/icons/IconMicFill"
import { IconMuteMicFill } from "../../../resources/icons/IconMuteMicFill"
import styles from "./gatheringButtons.module.scss"


export const MicButton = (props) => {
    const {
        size = "large",
        onPress,
    } = props;
    const [buttonState, setButtonState] = useState("on");

    const toggleActive = () => {
        if (buttonState == "muted"){
            //onPress()
            //Does this need an await function for onPress 
            //before it sets the button
            setButtonState("on")
        }
        else{
            //onPress()
            //Does this need an await function for onPress 
            //before it sets the button
            setButtonState("muted")
        }
    };


    return (
        <>
        <button
            className={`
                ${styles.basicButton} 
                ${size == "large" ? styles.basicButtonLarge : styles.basicButtonSmall} 
                ${buttonState == "on" ? styles.basicButtonInactive : styles.basicButtonMuted}
            `}
            aria-label="Microphone"
            onClick={toggleActive}
        >
            {(buttonState == "on")
            ?
                <div height="100%" width="100%">
                    <IconMicFill hasGradient="true"/>
                </div>
            :
                <div height="100%" width="100%">
                    <IconMuteMicFill />
                </div>
        
            }
            

        </button>
        </>
    );
};
