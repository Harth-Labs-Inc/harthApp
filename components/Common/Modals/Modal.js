import { useRef } from "react";
// import ReactCSSTransitionGroup from "react-transition-group";

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
    } = props;

    const ref = useRef();

    const closeModal = () => {
        onToggleModal();
    };

    return (
        // <ReactCSSTransitionGroup
        //     transitionName="modalTransition"
        //     transitionAppear={true}
        // >
        <div id={id} className={`${styles.Modal} ${classNames}`}>
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
        // </ReactCSSTransitionGroup>
    );
};
