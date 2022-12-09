import { useState } from "react"
import { IconVolumeUpFill } from "../../../resources/icons/IconVolumeUpFill";
import styles from './profileContainer.module.scss';


export const VolumeButton = (props) => {
    const { onClick } = props;
    const [buttonState, setButtonState] = useState("off");

    const toggleActive = () => {
        if (buttonState == "off"){
            setButtonState("on");
            onClick();
        }
        else{
            setButtonState("off");
            onClick();
        }
    };


    return (
        <>
        <button
            className={`
                ${styles.volumeButton} 
                ${buttonState == "on" && styles.volumeButtonActive }
            `}
            aria-label="Expand Volume Controls"
            onClick={toggleActive}
        >
 
            <div height="100%" width="100%">
                <IconVolumeUpFill />
            </div>            

        </button>
        </>
    );
};
