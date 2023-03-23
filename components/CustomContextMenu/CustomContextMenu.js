import { useRef } from "react";

import { useComms } from "../../contexts/comms";

import { IconNotificationsNoFill } from "../../resources/icons/IconNotificationsNoFill";

import { IconVisibilityNoFill } from "../../resources/icons/IconVisibilityNoFill";
import { IconEditNoFill } from "../../resources/icons/IconEditNoFill";
import { IconDeleteNoFill } from "../../resources/icons/IconDeleteNoFill";

import OutsideClickHandler from "../Common/Modals/OutsideClick";

import styles from "./CustomContextMenu.module.scss";

export const CustomContextMenu = ({
    user,
    topic,
    pos,
    closeModal,
    onMuteHandler,
    onHideHandler,
    onRenameHandler,
    onDeleteHandler,
    isHiddenTopic,
}) => {
    const contextRef = useRef(null);
    const { selectedcomm } = useComms();

    let userIndex = topic.members.findIndex(({ user_id }) => {
        return user_id == user._id;
    });

    let profile;
    let isMuted;
    let isHidden;
    let isAdmin;

    if (userIndex >= 0) {
        profile = topic.members[userIndex];
        isHidden = profile?.hidden;
        isMuted = profile?.muted;
        isAdmin = profile?.admin;
    }

    if (selectedcomm && user) {
        const findAdmin = selectedcomm.users.findIndex((usr) => {
            return usr.userId == user._id;
        });

        if (findAdmin >= 0) {
            const admin = selectedcomm.users[findAdmin].admin;
            isAdmin = admin;
        }
    }

    /* eslint-disable */

    return (
        <div ref={contextRef} className={styles.TopicButtonWrapper}>
            <OutsideClickHandler
                className={styles.TopicButtonClickWrapper}
                onClickOutside={closeModal}
                onFocusOutside={closeModal}
            >
                <div
                    className={styles.CustomContextMenu}
                    style={
                        pos
                            ? { top: `${pos.y}px`, left: `${pos.x}px` }
                            : {
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate3d(-50%,-50%,0)",
                              }
                    }
                >
                    {!isHiddenTopic ? (
                        <button
                            className={styles.CustomContextMenuButton}
                            onClick={onMuteHandler}
                        >
                            {isMuted ? (
                                <>
                                    <IconNotificationsNoFill fill="#fff" />
                                    Unmute
                                </>
                            ) : (
                                <>
                                    <IconNotificationsNoFill fill="#fff" />
                                    Mute
                                </>
                            )}
                        </button>
                    ) : null}

                    <button
                        className={styles.CustomContextMenuButton}
                        onClick={onHideHandler}
                    >
                        {isHidden ? (
                            <>
                                <IconVisibilityNoFill fill="#fff" />
                                Unhide
                            </>
                        ) : (
                            <>
                                <IconVisibilityNoFill fill="#fff" />
                                Hide
                            </>
                        )}
                    </button>
                    {isAdmin ? (
                        <>
                            <button
                                className={styles.CustomContextMenuButton}
                                onClick={onRenameHandler}
                            >
                                <IconEditNoFill fill="#fff" />
                                Rename
                            </button>
                            <button
                                className={styles.CustomContextMenuButton}
                                onClick={onDeleteHandler}
                            >
                                <IconDeleteNoFill fill="#fff" />
                                Delete
                            </button>
                        </>
                    ) : null}
                </div>
            </OutsideClickHandler>
        </div>
    );
};

// import { useEffect, useState, useCallback, useRef } from "react";
// import OutsideClickHandler from "../Common/Modals/OutsideClick";

// import { IconNotificationsNoFill } from "../../resources/icons/IconNotificationsNoFill";
// import styles from "./CustomContextMenu.module.scss";
// import { IconVisibilityNoFill } from "../../resources/icons/IconVisibilityNoFill";
// import { IconEditNoFill } from "../../resources/icons/IconEditNoFill";
// import { IconDeleteNoFill } from "../../resources/icons/IconDeleteNoFill";

// export const CustomContextMenu = ({ children, targetID, pos }) => {
//   const [showModal, setShowModal] = useState(false);
//   const contextRef = useRef(null);

//   const toggleEditMenu = (evt) => {
//     if (evt.button === 2) {
//       const targetElement = document.getElementById(targetID);
//       if (targetElement && targetElement.contains(evt.target)) {
//         evt.preventDefault();
//         setShowModal((prevState) => !prevState);
//       }
//     }
//   };

//   const closeModal = () => {
//     setShowModal(false);
//   };

//   return (
//     <OutsideClickHandler
//       className={styles.TopicButtonClickWrapper}
//       onClickOutside={closeModal}
//       onFocusOutside={closeModal}
//     >
//       <div
//         ref={contextRef}
//         // onMouseDown={toggleEditMenu}
//         className={styles.TopicButtonWrapper}
//       >
//         {showModal && (
//           <div className={styles.CustomContextMenu}>
//             <button className={styles.CustomContextMenuButton}>
//               <IconNotificationsNoFill fill="#fff" />
//               Mute
//             </button>
//             <button className={styles.CustomContextMenuButton}>
//               <IconVisibilityNoFill fill="#fff" />
//               Hide
//             </button>
//             <button className={styles.CustomContextMenuButton}>
//               <IconEditNoFill fill="#fff" />
//               Rename
//             </button>
//             <button className={styles.CustomContextMenuButton}>
//               <IconDeleteNoFill fill="#fff" />
//               Delete
//             </button>
//           </div>
//         )}
//         {children}
//       </div>
//     </OutsideClickHandler>
//   );
// };
