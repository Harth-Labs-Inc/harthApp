import { useRef } from "react";

import OutsideClickHandler from "./OutsideClick";
import styles from "./Modal.module.scss";

export const SideModal = (props) => {
    const { show, children, id, onToggleModal } = props;

    const ref = useRef();

    const closeToolTip = () => {
        onToggleModal();
    };

    return (
        <div id={id} className={`${styles.Modal} modal modal_open`}>
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
