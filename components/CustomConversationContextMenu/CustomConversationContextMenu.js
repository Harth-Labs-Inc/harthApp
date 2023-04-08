import { useRef } from "react";

import OutsideClickHandler from "../Common/Modals/OutsideClick";

import { IconDeleteNoFill } from "../../resources/icons/IconDeleteNoFill";

import styles from "./CustomConversationContextMenu.module.scss";

export const CustomConversationContextMenu = ({
    pos,
    closeModal,
    onLeaveHandler,
}) => {
    const contextRef = useRef(null);

    return (
        <OutsideClickHandler
            className={styles.ConversationButtonClickWrapper}
            onClickOutside={closeModal}
            onFocusOutside={closeModal}
        >
            <div ref={contextRef} className={styles.ConversationButtonWrapper}>
                <div
                    className={styles.CustomContextMenu}
                    style={{ top: `${pos.y}px`, left: `${pos.x}px` }}
                >
                    <button
                        className={styles.CustomContextMenuButton}
                        onClick={onLeaveHandler}
                    >
                        <IconDeleteNoFill fill="#fff" />
                        Remove
                    </button>
                </div>
            </div>
        </OutsideClickHandler>
    );
};
