import { useRef, useEffect, useState } from "react";

import OutsideClickHandler from "./OutsideClick";
import styles from "./Modal.module.scss";

export const SideModal = (props) => {
  const { children, id, onToggleModal } = props;

  const [isClosing, setIsClosing] = useState(false);

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
    if (!isClosing) {
      setIsClosing(true);
      const element = document.getElementById(id);
      element.classList.add(styles.rendering);
      element.classList.remove(styles.entered);
      setTimeout(() => {
        onToggleModal();
      }, 400);
    }
  };

  return (
    <div
      className={`${styles.Modal} modal modal_open sideModalContainer ${styles.sideModalContainer}`}
    >
      <OutsideClickHandler
        onClickOutside={closeToolTip}
        onFocusOutside={closeToolTip}
      >
        <section id={id} ref={ref} className={styles.ModalLeft}>
          {children}
        </section>
      </OutsideClickHandler>
    </div>
  );
};
