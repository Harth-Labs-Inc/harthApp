import { useState } from "react"
import { IconChevronLeft } from "../../../resources/icons/IconChevronLeft"
import styles from "./gatheringButtons.module.scss"


export const MoreButton = (props) => {
    const {
        onPress,
    } = props;
    const [buttonState, setButtonState] = useState("off");

    const toggleActive = () => {
        if (buttonState == "off"){
            setButtonState("on")
            //onPress()
        }
        else{
            setButtonState("off")
            //onPress()
        }
    };

    return (
        <>
        <button
            className={`
                ${styles.moreButton} 
            `}
            aria-label="More"
            onClick={onPress}
        >
            <div height="100%" width="100%">
                <IconChevronLeft />
            </div>
        </button>
        </>
    );
};
