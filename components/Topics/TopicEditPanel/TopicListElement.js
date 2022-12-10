import { IconBookmarkNoFill } from "../../../resources/icons/IconBookmarkNoFill";
import { Avatar } from "../../Common/Avatar/Avatar";


import styles from "./topics.module.scss";



const TopicListElement = (props) => {
    const { 
        onClick,
        isMobile,
        hasAlert = true,
        //pictures of the chats that activated the alert are passed in an array
        alertProfiles =[],
        isActive = false,
        label = "topic name",

    } = props;

    return (
        <>
            <button 
                className={`
                    ${styles.topic} 
                    ${isActive && styles.topicActive} 
                    ${hasAlert && styles.topicAlert} 
                    `}
                onClick={onClick}>


                <div className={styles.icon}><IconBookmarkNoFill /></div>

                <div className={styles.topicWithPointer}>
                    <div className={styles.pointer}><p> </p></div>
                    <div className={`
                    ${styles.topicContainer} 
                    ${hasAlert && styles.topicContainerAlert} 
                    `}
                    >
                        <div className={styles.label}>
                            {label}

                        </div>

                        {hasAlert && (
                            <div className={styles.alertProfiles}>
                                {/* picture array is parsed  */}
                               {alertProfiles.map(e => (
                                    <Avatar picSize={28} imageSrc={e}/>
                                ))}                    
                            </div>
                        )}
                    </div>
                </div>

            </button>
        </>
    )
}

export default TopicListElement;



