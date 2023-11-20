import { useRef } from "react";

import OutsideClickHandler from "./OutsideClick";
import styles from "./Modal.module.scss";

export const Modal = (props) => {
  const {
    children,
    id,
    onToggleModal,
    isDark = false,
    classNames,
    hasPadding = true,
    containerStyle,
    blockBackground = false,
    ignoreFadeIn,
  } = props;

  const ref = useRef();

  const closeModal = () => {
    onToggleModal();
  };

  return (
    <div
      id={id}
      className={`${styles.Modal} ${classNames} ${
        blockBackground && styles.ModalBlock
      } ${ignoreFadeIn ? styles.ignoreFadeIn : ""}`}
    >
      <OutsideClickHandler onMouseUpOutside={closeModal}>
        <section
          ref={ref}
          className={`
                        ${styles.ModalMid} 
                        ${blockBackground && styles.ModalMidBlock}
                        ${isDark && styles.ModalMidDark}
                        ${hasPadding && styles.ModalMidPadding}
                        ${containerStyle}
                    `}
        >
          <div className="modal_body">{children}</div>
        </section>
      </OutsideClickHandler>
    </div>
  );
};
