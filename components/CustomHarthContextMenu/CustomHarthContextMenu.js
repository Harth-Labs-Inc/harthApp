import { useRef } from "react";
import OutsideClickHandler from "../Common/Modals/OutsideClick";

import { IconNotificationsNoFill } from "../../resources/icons/IconNotificationsNoFill";
import styles from "./CustomHarthContextMenu.module.scss";
import { IconVisibilityNoFill } from "../../resources/icons/IconVisibilityNoFill";
import { IconEditNoFill } from "../../resources/icons/IconEditNoFill";
import { IconDeleteNoFill } from "../../resources/icons/IconDeleteNoFill";

export const CustomHarthContextMenu = ({
  user,
  harth,
  pos,
  closeModal,
  onMuteHandler,
  onRenameHandler,
  onDeleteHandler,
}) => {
  const contextRef = useRef(null);

  let userIndex = harth.users.findIndex((usr) => {
    return usr.userId == user._id;
  });

  let profile;
  let isMuted;
  let isHidden;
  let isAdmin;

  if (userIndex >= 0) {
    profile = harth.users[userIndex];
    isHidden = profile?.hidden;
    isMuted = profile?.muted;
    isAdmin = profile?.admin;
  }

  return (
    <OutsideClickHandler
      className={styles.TopicButtonClickWrapper}
      onClickOutside={closeModal}
      onFocusOutside={closeModal}
    >
      <div ref={contextRef} className={styles.TopicButtonWrapper}>
        <div
          className={styles.CustomContextMenu}
          style={{ top: `${pos.y}px`, left: `${pos.x}px` }}
        >
          <button
            className={styles.CustomContextMenuButton}
            onClick={onMuteHandler}
          >
            {isMuted ? (
              <>
                <IconNotificationsNoFill fill="#fff" />
                Unmute notifications
              </>
            ) : (
              <>
                <IconNotificationsNoFill fill="#fff" />
                Mute notifications
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
                Delete or leave
              </button>
            </>
          ) : null}
        </div>
      </div>
    </OutsideClickHandler>
  );
};
