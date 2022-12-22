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
    toggleTopicEditModal,
  } = props;

  const toggleActive = () => {
    clickHandler(topic);
  };

  const toggleEditMenu = (evt) => {
    if (evt.button === 2) {
      const targetElement = document.getElementById(topic._id);
      if (targetElement && targetElement.contains(evt.target)) {
        evt.preventDefault();
        toggleTopicEditModal({
          topic,
          pos: {
            x: evt.clientX,
            y: evt.clientY,
          },
        });
      }
    }
  };

  if (!topic) {
    return null;
  }

  return (
    <button
      id={topic._id}
      className={`
                    ${styles.topic} 
                    ${isMobile && styles.topicMobile} 
                    ${isActive && styles.topicActive} 
                    ${hasAlert && styles.topicAlert} 
                    `}
      onClick={toggleActive}
      onMouseUp={toggleEditMenu}
    >
      {/* {isShort ? (
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
      )} */}

        <div className={`
                    ${styles.topicIndicatorBox} 
                    ${isActive && styles.topicIndicatorBoxActive} 
                    `}>
          <div className={styles.label}
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
    </button>
  );
  // return (
  //   <CustomContextMenu targetID={topic._id}>
  //     <button
  //       id={topic._id}
  //       className={`
  //                   ${styles.topic}
  //                   ${isActive && styles.topicActive}
  //                   ${hasAlert && styles.topicAlert}
  //                   `}
  //       onClick={toggleActive}
  //       onMouseDown={toggleEditMenu}
  //     >
  //       {isShort ? (
  //         <div
  //           className={`
  //                   ${styles.icon}
  //                   ${isMobile && styles.iconMobile}
  //                   `}
  //         >
  //           <IconTimerNoFill />
  //         </div>
  //       ) : (
  //         <div
  //           className={`
  //                   ${styles.icon}
  //                   ${isMobile && styles.iconMobile}
  //                   `}
  //         >
  //           <IconBookmarkNoFill />
  //         </div>
  //       )}

  //       <div className={styles.topicWithPointer}>
  //         <div
  //           className={`
  //                   ${styles.topicContainer}
  //                   ${hasAlert && styles.topicContainerAlert}
  //                   `}
  //         >
  //           <div
  //             className={`
  //                           ${styles.label}
  //                           ${isMobile && styles.labelMobile}
  //                           `}
  //           >
  //             {label}
  //           </div>

  //           {hasAlert && (
  //             <div className={styles.alertProfiles}>
  //               {alertProfiles.map((e) => (
  //                 <Avatar
  //                   picSize={isMobile ? 36 : 28}
  //                   imageSrc={e?.creator_image}
  //                 />
  //               ))}
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </button>
  //   </CustomContextMenu>
  // );
};

export default TopicListElement;
