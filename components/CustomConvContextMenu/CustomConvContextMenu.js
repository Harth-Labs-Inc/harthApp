import { useRef } from "react";
import { useContext } from "react";
import { MobileContext } from "contexts/mobile";
import { IconDeleteNoFill } from "../../resources/icons/IconDeleteNoFill";
import OutsideClickHandler from "../Common/Modals/OutsideClick";
import styles from "./CustomContextMenu.module.scss";

export const CustomConvContextMenu = ({ pos, closeModal, onDeleteHandler }) => {
  const contextRef = useRef(null);
  const { isMobile } = useContext(MobileContext);

  /* eslint-disable */

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
          <button
            className={styles.CustomContextMenuButton}
            onClick={onDeleteHandler}
          >
            <IconDeleteNoFill />
            Remove
          </button>
        </div>
      </OutsideClickHandler>
    </div>
  );
};
