import { useEffect, useRef, useState } from "react";

import OutsideClickHandler from "../Common/Modals/OutsideClick";

import styles from "./CustomMessageContextMenu.module.scss";
import { copyToClipboard } from "services/helper";

export const CustomMessageContextMenu = ({
  closeModal,
  openEmojiPicker,
  hasTextForClipboard,
  TextForClipboard,
  EditSelectCB,
  showEditButton,
  removeCB,
  isPressing,
  disableFLagIcon,
  flagMessageHandler,
  isSuperAdmin,
  blockUserHandler,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const contextRef = useRef(null);

  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (!isPressing && isDisabled) {
      setTimeout(() => {
        setIsDisabled(false);
      }, 100);
    }
  }, [isPressing]);

  const addReactionHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal(null, isDisabled);
    openEmojiPicker(e);
  };
  const copyTextHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await copyToClipboard(TextForClipboard);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 500);
  };
  const editHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal(null, isDisabled);

    EditSelectCB();
  };
  const removeHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal(null, isDisabled);

    removeCB();
  };

  return (
    <div ref={contextRef} className={styles.TopicButtonWrapper}>
      <OutsideClickHandler
        className={styles.TopicButtonClickWrapper}
        onClickOutside={closeModal}
        onFocusOutside={closeModal}
      >
        <div
          className={` ${styles.CustomContextMenu} ${styles.CustomContextMenuMobile} `}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate3d(-50%,-50%,0)",
          }}
        >
          <button
            disabled={isDisabled}
            className={styles.CustomContextMenuButton}
            onClick={addReactionHandler}
          >
            Add Reaction
          </button>
          {hasTextForClipboard ? (
            <button
              disabled={isDisabled}
              id="copyButton"
              className={styles.CustomContextMenuButton}
              onClick={copyTextHandler}
              style={{ backgroundColor: isCopied ? "green" : "" }}
            >
              {isCopied ? "Copied!" : "Copy Text"}
            </button>
          ) : null}
          {showEditButton ? (
            <button
              disabled={isDisabled}
              className={styles.CustomContextMenuButton}
              onClick={editHandler}
            >
              Edit
            </button>
          ) : null}
          {showEditButton || isSuperAdmin ? (
            <button
              disabled={isDisabled}
              className={styles.CustomContextMenuButton}
              onClick={removeHandler}
            >
              Remove
            </button>
          ) : null}

          <button
            disabled={disableFLagIcon}
            className={`${styles.CustomContextMenuButton} ${
              disableFLagIcon ? styles.isDisabled : ""
            }`}
            onClick={flagMessageHandler}
          >
            Flag
          </button>
          {!showEditButton ? (
            <button
              disabled={isDisabled}
              className={`${styles.CustomContextMenuButton}`}
              onClick={blockUserHandler}
            >
              Block
            </button>
          ) : null}
        </div>
      </OutsideClickHandler>
    </div>
  );
};
