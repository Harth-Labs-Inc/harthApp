import { useRef, useEffect } from "react";

import OutsideClickHandler from "./OutsideClick";
import styles from "./Modal.module.scss";

export const SideModal = (props) => {
  const { children, id, onToggleModal } = props;

  const ref = useRef();

  useEffect(() => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add(styles.rendering);
      setTimeout(() => {
        element.classList.remove(styles.rendering);
        element.classList.add(styles.entered);
      }, 100);
    }

    return () => {
      if (element) {
        element.classList.remove(styles.entered);
        element.classList.remove(styles.rendering);
      }
    };
  }, [id]);

  const closeToolTip = () => {
    onToggleModal();
  };

  return (
    <div
      id={id}
      className={`${styles.Modal} modal modal_open sideModalContainer`}
    >
      <OutsideClickHandler
        onClickOutside={closeToolTip}
        onFocusOutside={closeToolTip}
      >
        <section ref={ref} className={styles.ModalLeft} id="modal_side">
          {children}
        </section>
      </OutsideClickHandler>
    </div>
  );
};
