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
    } = props;

    const ref = useRef();

    const closeModal = () => {
        onToggleModal();
    };

    return (
        <div id={id} className={`${styles.Modal} ${classNames} ${blockBackground && styles.ModalBlock}`}>
            <OutsideClickHandler
                onClickOutside={closeModal}
                onFocusOutside={closeModal}
            >
                <section
                    ref={ref}
                    className={`
                        ${styles.ModalMid} 
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
