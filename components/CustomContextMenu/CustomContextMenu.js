import { useRef } from "react";
import { useComms } from "../../contexts/comms";
import { useContext } from "react";
import { MobileContext } from "contexts/mobile";
import { IconNotificationsNoFill } from "../../resources/icons/IconNotificationsNoFill";
import { IconVisibilityNoFill } from "../../resources/icons/IconVisibilityNoFill";
import { IconEditNoFill } from "../../resources/icons/IconEditNoFill";
import { IconDeleteNoFill } from "../../resources/icons/IconDeleteNoFill";
import OutsideClickHandler from "../Common/Modals/OutsideClick";

import styles from "./CustomContextMenu.module.scss";

/* eslint-disable */
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
  const { isMobile } = useContext(MobileContext);
  let userIndex = topic.members.findIndex(({ user_id }) => {
    return user_id == user._id;
  });

  let profile;
  let isMuted;
  let isHidden;
  let isAdmin;
  let topicCreator;

  if (userIndex >= 0) {
    profile = topic.members[userIndex];
    isHidden = profile?.hidden;
    isMuted = profile?.muted;
    isAdmin = profile?.admin;
  }

  if (topic?.topic_creator_id == user._id) {
    topicCreator = true;
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

  return (
    <div ref={contextRef} className={styles.TopicButtonWrapper}>
      <OutsideClickHandler
        className={styles.TopicButtonClickWrapper}
        onMouseUpOutside={closeModal}
      >
        <div
          className={` ${styles.CustomContextMenu} ${
            isMobile && styles.CustomContextMenuMobile
          } `}
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
          {isAdmin || topicCreator ? (
            <>
              <button
                className={styles.CustomContextMenuButton}
                onClick={onRenameHandler}
              >
                <IconEditNoFill fill="#fff" />
                Edit
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
