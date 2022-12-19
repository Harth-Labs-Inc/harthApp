import { useEffect, useState, useCallback, useRef } from "react";
import OutsideClickHandler from "../Common/Modals/OutsideClick";

import { IconNotificationsNoFill } from "../../resources/icons/IconNotificationsNoFill";
import styles from "./CustomContextMenu.module.scss";
import { IconVisibilityNoFill } from "../../resources/icons/IconVisibilityNoFill";
import { IconEditNoFill } from "../../resources/icons/IconEditNoFill";
import { IconDeleteNoFill } from "../../resources/icons/IconDeleteNoFill";

export const CustomContextMenu = ({ children, targetID }) => {
    const [showModal, setShowModal] = useState(false);
    const contextRef = useRef(null);

    const toggleEditMenu = (evt) => {
        if (evt.button === 2) {
            const targetElement = document.getElementById(targetID);
            if (targetElement && targetElement.contains(evt.target)) {
                evt.preventDefault();
                setShowModal((prevState) => !prevState);
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <OutsideClickHandler
            className={styles.TopicButtonClickWrapper}
            onClickOutside={closeModal}
            onFocusOutside={closeModal}
        >
            <div
                ref={contextRef}
                onMouseDown={toggleEditMenu}
                className={styles.TopicButtonWrapper}
            >
                {showModal && (
                    <div className={styles.CustomContextMenu}>
                        <button className={styles.CustomContextMenuButton}>
                            <IconNotificationsNoFill fill="#fff" />
                            Mute
                        </button>
                        <button className={styles.CustomContextMenuButton}>
                            <IconVisibilityNoFill fill="#fff" />
                            Hide
                        </button>
                        <button className={styles.CustomContextMenuButton}>
                            <IconEditNoFill fill="#fff" />
                            Rename
                        </button>
                        <button className={styles.CustomContextMenuButton}>
                            <IconDeleteNoFill fill="#fff" />
                            Delete
                        </button>
                    </div>
                )}
                {children}
            </div>
        </OutsideClickHandler>
    );
};
