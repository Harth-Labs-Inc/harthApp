import { useState } from "react";

import styles from "./conversation.module.scss";

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

    const [buttonState, setButtonState] = useState(isActive);
    // const [alertState, setAlertState] = useState(hasAlert);

    const toggleActive = () => {
        if (!buttonState) {
            setButtonState(true);
            // setAlertState(false);
        } else {
            setButtonState(false);
        }
        clickHandler(conversation);
    };

    /* eslint-disable */

    const toggleEditMenu = (evt, id, conversation) => {
        if (evt.button === 2) {
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
        }
    };

    /* eslint-disable */

    return (
        <>
            <button
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
                onMouseUp={(e) =>
                    toggleEditMenu(e, conversation._id, conversation)
                }
            >
                {conversation.users?.map((e) => (
                    <div key={e.userId} className={styles.participantElement}>
                        <img
                            className={`
                                ${styles.avatar} 
                                ${isMobile && styles.avatarMobile} 
                                `}
                            src={e.iconKey}
                            loading="lazy"
                        />
                        <div className={styles.label}>{e.name}</div>
                    </div>
                ))}
            </button>
        </>
    );
};

export default ConversationListElement;
