import { useState } from "react"
import IconMuteIncoming from '../../../resources/icons/IconMuteIncoming';
import styles from './profileContainer.module.scss';


export const MuteProfileButton = (props) => {
    const { onClick, buttonState} = props;
    //const [buttonState, setButtonState] = useState();
    //setButtonState(state);
    // const toggleActive = () => {
    //     if (buttonState == "off"){
    //         setButtonState("on");
    //         onClick();
    //     }
    //     else{
    //         setButtonState("off");
    //         onClick();
    //     }
    // };


    return (
        <>
        <button
            className={`
                ${styles.muteButton} 
                ${buttonState && styles.muteButtonActive }
            `}
            aria-label="Expand Volume Controls"
            onClick={onClick}
        >
 
            <div height="100%" width="100%">
                <IconMuteIncoming />
            </div>            

        </button>
        </>
    );
};
