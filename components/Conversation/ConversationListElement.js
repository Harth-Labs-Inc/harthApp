
import { useState } from "react";
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
                    ${styles.conversation} 
                    ${buttonState && styles.conversationActive} 
                    ${alertState && styles.conversationAlert} 
                    `}
                onClick={toggleActive}>



                    <div className={styles.avatarHolder} >
                        {/* picture array is parsed  */}
                        {conversationProfiles.map(e => (
                            <div className={`
                            ${styles.avatar} 
                            ${isMobile && styles.avatarMobile} 
                            `} >
                            <Avatar picSize={isMobile ? 48 : 36} imageSrc={e.pic}/>
                            </div>
                        ))}  
                    </div>



                <div className={styles.conversationWithPointer}>
                    <div className={`
                            ${styles.pointer} 
                            ${isMobile && styles.pointerMobile} 
                            `} >
                            <p></p>
                        </div>



                    <div className={`
                    ${styles.conversationContainer} 
                    ${alertState && styles.conversationContainerAlert} 
                    `}
                    >
                        <div className={`
                            ${styles.label} 
                            ${isMobile && styles.labelMobile} 
                            `} >
                               {conversationProfiles.map(e => (<p>{e.name}</p>))}
                        </div>
                    </div>
                </div>

            </button>
        </>
    )
}

export default ConversationListElement;



