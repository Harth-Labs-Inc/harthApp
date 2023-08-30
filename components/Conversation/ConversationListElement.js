import { useState } from "react";

import styles from "./conversation.module.scss";
import { useComms } from "contexts/comms";
import { IconMoreDots } from "resources/icons/IconMoreDots";
/* eslint-disable */
const ConversationListElement = (props) => {
  const {
    clickHandler,
    isMobile = false,
    hasAlert = false,
    isActive = false,
    conversation,
    label,
    toggleConversationEditModal,
  } = props;

  const { profile, selectedcomm } = useComms();
  const [buttonState, setButtonState] = useState(isActive);

  const toggleActive = () => {
    if (!buttonState) {
      setButtonState(true);
    } else {
      setButtonState(false);
    }
    clickHandler(conversation);
  };

  const toggleEditMenu = (evt, id, conversation) => {
    evt.stopPropagation();
    const targetElement = document.getElementById(id);
    if (targetElement && targetElement.contains(evt.target)) {
      evt.preventDefault();
      toggleConversationEditModal({
        conversation,
        pos: {
          x: evt.clientX,
          y: evt.clientY,
        },
      });
    }
  };

  return (
    <>
      <div
        key={conversation._id}
        title={label}
        id={conversation._id}
        className={`
                    ${styles.conversation} 
                    ${
                      isMobile
                        ? styles.conversationMobile
                        : styles.conversationDesktop
                    } 
                    ${isActive && styles.conversationActive} 
                    ${hasAlert && styles.conversationAlert} 
                    `}
        onClick={toggleActive}
      >
        {conversation.OriginalUsers
          ? conversation.OriginalUsers?.map((e) => {
              if (e.userId !== profile.userId) {
                let creator = selectedcomm.users?.find(
                  (usr) => usr.userId === e.userId
                );
                return (
                  <div key={e.userId} className={styles.participantElement}>
                    <img
                      className={`
                                  ${styles.avatar} 
                                  ${isMobile && styles.avatarMobile} 
                                  ${selectedcomm?._id}_${e.userId}
                                  `}
                      src={creator?.iconKey}
                      loading="eager"
                    />
                    <div
                      className={[
                        styles.label,
                        `${selectedcomm._id}_${e.userId}_name`,
                      ].join(" ")}
                    >
                      {creator?.name}
                    </div>
                  </div>
                );
              }
              return null;
            })
          : conversation.users?.map((e) => {
              let creator = selectedcomm.users?.find(
                (usr) => usr.userId === e.userId
              );
              if (e.userId == profile?.userId) {
                return (
                  <div key={e.userId} className={styles.participantElement}>
                    <img
                      className={`
                                            ${styles.avatar}
                                            ${isMobile && styles.avatarMobile}
                                            ${selectedcomm?._id}_${
                        profile?.userId
                      }
                                            `}
                      src={creator?.iconKey}
                      loading="eager"
                    />
                    <div
                      className={[
                        styles.label,
                        `${selectedcomm._id}_${profile?.userId}_name`,
                      ]}
                    >
                      {creator?.name}
                    </div>
                  </div>
                );
              }
              return (
                <div key={e.userId} className={styles.participantElement}>
                  <img
                    className={`
                                ${styles.avatar} 
                                ${isMobile && styles.avatarMobile} 
                                ${selectedcomm?._id}_${e.userId}
                                `}
                    src={creator?.iconKey}
                    loading="eager"
                  />
                  <div
                    className={[
                      styles.label,
                      `${selectedcomm._id}_${e.userId}_name`,
                    ].join(" ")}
                  >
                    {creator?.name}
                  </div>
                </div>
              );
            })}
        <button
          className={styles.moreMenu}
          onClick={(e) => toggleEditMenu(e, conversation._id, conversation)}
        >
          <IconMoreDots />
        </button>
      </div>
    </>
  );
};

export default ConversationListElement;
