
import { useState } from "react";
import { IconBookmarkNoFill } from "../../resources/icons/IconBookmarkNoFill";
import { IconTimerNoFill } from "../../resources/icons/IconTimerNoFill";
import { Avatar } from "../Common/Avatar/Avatar";


import styles from "./conversation.module.scss";



const ConversationListElement = (props) => {
    const { 
        onClick,
        isMobile = false,
        hasAlert = true,
        //currently the names and pictures are passed as an array of objects
        conversationProfiles =[],
        isActive = false,

    } = props;

    const [buttonState, setButtonState] = useState(isActive);
    const [alertState, setAlertState] = useState(hasAlert);


    const toggleActive = () => {
        if (!buttonState){
            setButtonState(true);
            setAlertState(false);
            //onClick()
        }
        else{
            setButtonState(false);
        }
    };

    return (
        <>
            <button 
                className={`
                    ${styles.topic} 
                    ${buttonState && styles.topicActive} 
                    ${alertState && styles.topicAlert} 
                    `}
                onClick={toggleActive}>



                    <div className={`
                    ${styles.icon} 
                    ${isMobile && styles.iconMobile} 
                    `} >
                        <IconTimerNoFill />
                    </div>







                <div className={styles.topicWithPointer}>
                    <div className={styles.pointer}><p> </p></div>
                    <div className={`
                    ${styles.topicContainer} 
                    ${alertState && styles.topicContainerAlert} 
                    `}
                    >
                        <div className={`
                            ${styles.label} 
                            ${isMobile && styles.labelMobile} 
                            `} >
                               {conversationProfiles.map(e => (e.name+"<br />"))}
                        </div>

                        {alertState && (
                            <div className={styles.conversationProfilePics}>
                                {/* picture array is parsed  */}
                               {conversationProfiles.map(e => (
                                    <Avatar picSize={isMobile ? 36 : 28} imageSrc={e.pic}/>
                                ))}                    
                            </div>
                        )}
                    </div>
                </div>

            </button>
        </>
    )
}

export default ConversationListElement;



