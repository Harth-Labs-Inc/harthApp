import { useState } from "react"
import { IconVideoFill } from "../../../resources/icons/IconVideoFill"
import styles from "./gatheringButtons.module.scss"


export const CameraButton = (props) => {
    const {
        size = "large",
        onPress,
        videoOn,
    } = props;
    const [buttonState, setButtonState] = useState("off");

    const toggleActive = () => {
        onPress();
        // if (buttonState == "off"){
        //     setButtonState("on");
        //     onPress();
        // }
        // else{
        //     setButtonState("off");
        //     onPress();
        // }
    };


    return (
        <>
        <button
            className={`
                ${styles.basicButton} 
                ${size == "large" ? styles.basicButtonLarge : styles.basicButtonSmall} 
                ${videoOn ? styles.basicButtonActive : styles.basicButtonInactive}
            `}
            aria-label="Webcam"
            onClick={onPress}
        >
            {(videoOn)
            ?
                <div height="100%" width="100%">
                    <IconVideoFill hasGradient="true"/>
                </div>
            :
                <div height="100%" width="100%">
                    <IconVideoFill />
                </div>
        
            }
            

        </button>
        </>
    );
};
