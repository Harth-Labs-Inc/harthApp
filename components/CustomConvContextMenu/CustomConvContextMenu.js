import { useRef } from "react";
import { useComms } from "../../contexts/comms";
import { useContext } from "react";
import { MobileContext } from "contexts/mobile";
import { IconDeleteNoFill } from "../../resources/icons/IconDeleteNoFill";
import OutsideClickHandler from "../Common/Modals/OutsideClick";
import styles from "./CustomContextMenu.module.scss";

export const CustomConvContextMenu = ({
  user,
  topic,
  pos,
  closeModal,
  onDeleteHandler,
}) => {
  const contextRef = useRef(null);
  const { selectedcomm } = useComms();
  const { isMobile } = useContext(MobileContext);
  let userIndex = topic.users.findIndex(({ userId }) => {
    return userId == user._id;
  });

  let profile;
  let isMuted;
  let isHidden;
  let isAdmin;

  if (userIndex >= 0) {
    profile = topic.users[userIndex];
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
          <button
            className={styles.CustomContextMenuButton}
            onClick={onDeleteHandler}
          >
            <IconDeleteNoFill fill="#fff" />
            Remove
          </button>
        </div>
      </OutsideClickHandler>
    </div>
  );
};
