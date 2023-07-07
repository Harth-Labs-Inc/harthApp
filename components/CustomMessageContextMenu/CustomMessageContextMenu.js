import { useRef, useState } from "react";

import OutsideClickHandler from "../Common/Modals/OutsideClick";

import styles from "./CustomMessageContextMenu.module.scss";
import { copyToClipboard } from "services/helper";

export const CustomMessageContextMenu = ({
  closeModal,
  openEmojiPicker,
  hasTextForClipboard,
  EditSelectCB,
  showEditButton,
  removeCB,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const contextRef = useRef(null);

  const addReactionHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
    openEmojiPicker(e);
  };
  const copyTextHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await copyToClipboard("test");
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 500);
  };
  const editHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
    EditSelectCB();
  };
  const removeHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
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
            className={styles.CustomContextMenuButton}
            onClick={addReactionHandler}
          >
            Add Reaction
          </button>
          {hasTextForClipboard ? (
            <button
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
              className={styles.CustomContextMenuButton}
              onClick={editHandler}
            >
              Edit
            </button>
          ) : null}

          <button
            className={styles.CustomContextMenuButton}
            onClick={removeHandler}
          >
            Remove
          </button>
        </div>
      </OutsideClickHandler>
    </div>
  );
};
