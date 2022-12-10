import { IconBookmarkNoFill } from "../../../resources/icons/IconBookmarkNoFill";
import { Avatar } from "../../Common/Avatar/Avatar";


import styles from "./topics.module.scss";



const TopicListElement = (props) => {
    const { 
        onClick,
        isMobile,
        hasAlert = false,
        alertProfiles,
        isActive =true,
        label = "topic name",

    } = props;


    const profileIcon =
    "https://thehill.com/wp-content/uploads/sites/2/2022/11/f026baa605674c8d92f28b0c1855cd8e.jpg";



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
                                <Avatar picSize={24} imageSrc={profileIcon}/>
                                <Avatar picSize={24} imageSrc={profileIcon}/>
                                <Avatar picSize={24} imageSrc={profileIcon}/>
                            </div>
                        )}
                    </div>
                </div>

            </button>
        </>
    )
}

export default TopicListElement;



