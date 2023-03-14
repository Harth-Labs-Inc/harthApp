import { useContext, useState } from "react";

import { MobileContext } from "../../../contexts/mobile";
import { useAuth } from "../../../contexts/auth";
import { IconSettings } from "../../../resources/icons/IconSettings";
import { IconAdd } from "../../../resources/icons/IconAdd";
import { IconFireFill } from "../../../resources/icons/IconFireFill";
import { Modal } from "../../Common/Modals/Modal";
import HarthSettings from "../../Menus/HarthSettings/HarthSettings";

import styles from "./HarthList.module.scss";

const HarthList = ({
    comms,
    selectedcomm,
    unreadMsgs,
    toggleCreateComm,
    changeSelectedCom,
    toggleHarthEditModal,
}) => {
    const { isMobile } = useContext(MobileContext);
    const { user } = useAuth();
    const [modal, setModal] = useState(false);

    const toggleEditMenu = (evt, id, harth) => {
        if (evt.button === 2) {
            const targetElement = document.getElementById(id);
            if (targetElement && targetElement.contains(evt.target)) {
                evt.preventDefault();
                toggleHarthEditModal({
                    harth,
                    pos: {
                        x: evt.clientX,
                        y: evt.clientY,
                    },
                });
            }
        }
    };

    const handleHarthMenu = () => {
        setModal((prevState) => !prevState);
    };

    const showModal = () => {
        setModal((prevState) => !prevState);
    };

    return (
        <ul
            className={isMobile ? styles.HarthListMobile : styles.HarthList}
            id="left_nav_comms"
        >
            {comms &&
                comms.map((com) => {
                    let active = false;
                    let newMessage = false;
                    if (selectedcomm && com._id === selectedcomm._id) {
                        active = true;
                    } else {
                        let owner = com?.users.find(
                            (usr) => usr?.userId === user._id
                        );
                        unreadMsgs.forEach((msg) => {
                            if (
                                msg.comm_id === com._id &&
                                msg.creator_id !== user._id &&
                                owner &&
                                !owner.muted
                            ) {
                                newMessage = true;
                            }
                        });
                    }

                    return (
                        <div
                            className={`
            ${styles.Item}
            ${active ? styles.ItemActive : null}
            ${newMessage && !active ? styles.ItemUnreadMessage : null}
          `}
                            key={com?._id}
                            id={com._id}
                        >
                            <li>
                                <button
                                    onClick={() => {
                                        let imgs =
                                            document.getElementsByClassName(
                                                "active-image"
                                            );

                                        for (let img of imgs) {
                                            if (img) {
                                                img.setAttribute("src", "");
                                            }
                                        }
                                        changeSelectedCom(com);
                                    }}
                                    onMouseUp={(e) =>
                                        toggleEditMenu(e, com._id, com)
                                    }
                                    aria-label={com.name}
                                    className={styles.ItemButton}
                                >
                                    {com.iconKey ? (
                                        <span className={styles.ItemImage}>
                                            <img
                                                src={com.iconKey}
                                                loading="lazy"
                                                height={40}
                                                width={40}
                                            />
                                        </span>
                                    ) : (
                                        <span className={styles.ItemIcon}>
                                            <span
                                                className={
                                                    styles.ItemIconFiller
                                                }
                                            >
                                                <IconFireFill />
                                            </span>
                                        </span>
                                    )}
                                    {isMobile ? (
                                        <span className={styles.ItemName}>
                                            {com.name}
                                        </span>
                                    ) : null}
                                </button>
                                {isMobile ? (
                                    <button
                                        className={styles.ItemSettingsButton}
                                        onClick={handleHarthMenu}
                                        aria-label="Current Harth Settings"
                                    >
                                        <IconSettings />
                                    </button>
                                ) : null}
                            </li>
                            {modal ? (
                                <Modal onToggleModal={() => {}}>
                                    <HarthSettings
                                        communityName={selectedcomm?.name}
                                        communityId={selectedcomm?._id}
                                        onToggleModal={showModal}
                                    />
                                </Modal>
                            ) : (
                                ""
                            )}
                        </div>
                    );
                })}
            {isMobile ? (
                <li className={styles.NewHarth}>
                    <button onClick={toggleCreateComm}>
                        <IconAdd />
                    </button>
                </li>
            ) : null}
        </ul>
    );
};

export default HarthList;
