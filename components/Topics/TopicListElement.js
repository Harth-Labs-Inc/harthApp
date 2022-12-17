import { useEffect } from "react";
import { IconBookmarkNoFill } from "../../resources/icons/IconBookmarkNoFill";
import { IconTimerNoFill } from "../../resources/icons/IconTimerNoFill";
import { Avatar } from "../Common/Avatar/Avatar";
import { CustomContextMenu } from "../CustomContextMenu/CustomContextMenu";
import styles from "./topics.module.scss";

const TopicListElement = (props) => {
  const {
    topic,
    clickHandler,
    isMobile = false,
    hasAlert = true,
    alertProfiles = [],
    isActive = false,
    isShort = false,
    label = "topic name",
  } = props;

  const toggleActive = () => {
    clickHandler(topic);
  };

  if (!topic) {
    return null;
  }

  return (
    <CustomContextMenu targetID={topic._id}>
      <button
        id={topic._id}
        className={`
                    ${styles.topic} 
                    ${isActive && styles.topicActive} 
                    ${hasAlert && styles.topicAlert} 
                    `}
        onClick={toggleActive}
      >
        {isShort ? (
          <div
            className={`
                    ${styles.icon} 
                    ${isMobile && styles.iconMobile} 
                    `}
          >
            <IconTimerNoFill />
          </div>
        ) : (
          <div
            className={`
                    ${styles.icon} 
                    ${isMobile && styles.iconMobile} 
                    `}
          >
            <IconBookmarkNoFill />
          </div>
        )}

        <div className={styles.topicWithPointer}>
          <div
            className={`
                    ${styles.topicContainer} 
                    ${hasAlert && styles.topicContainerAlert} 
                    `}
          >
            <div
              className={`
                            ${styles.label} 
                            ${isMobile && styles.labelMobile} 
                            `}
            >
              {label}
            </div>

            {hasAlert && (
              <div className={styles.alertProfiles}>
                {alertProfiles.map((e) => (
                  <Avatar
                    picSize={isMobile ? 36 : 28}
                    imageSrc={e?.creator_image}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </button>
    </CustomContextMenu>
  );
};

export default TopicListElement;
