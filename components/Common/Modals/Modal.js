import { useEffect, useState, useRef } from "react";

import OutsideClickHandler from "./OutsideClick";
import styles from "./Modal.module.scss";

export const Modal = (props) => {
    const [transitionClass, setTransitionClass] = useState();
    const { show, children, id, onToggleModal, isDark=false, } = props;

    const ref = useRef();

    useEffect(() => {
        setTimeout(() => {
            setTransitionClass("modal_open");
        }, 4);
    }, [show]);

    const closeModal = () => {
        onToggleModal();
    };

    return (
        <div id={id} className={`${styles.Modal} modal ${transitionClass}`}>
            <OutsideClickHandler
                onClickOutside={closeModal}
                onFocusOutside={closeModal}
            >
                <section ref={ref} className={`${styles.ModalMid} 
                                                ${isDark && styles.ModalMidDark}`}>
                    <div className="modal_body">{children}</div>
                </section>
            </OutsideClickHandler>
        </div>
    );
};
