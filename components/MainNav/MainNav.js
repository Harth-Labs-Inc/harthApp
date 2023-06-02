import { useState, useContext, useEffect } from "react";
import { MobileContext } from "../../contexts/mobile";
import { IconChatNoFill } from "../../resources/icons/IconChatNoFill";
import { IconFireNoFill } from "../../resources/icons/IconFireNoFill";
import { IconForumNoFill } from "../../resources/icons/IconForumNoFill";
import { IconChatFill } from "../../resources/icons/IconChatFill";
import { IconFireFill } from "../../resources/icons/IconFireFill";
import { IconForumFill } from "../../resources/icons/IconForumFill";
import { Modal } from "../Common/Modals/Modal";
import HarthSettings from "../Menus/HarthSettings/HarthSettings";
import { useComms } from "../../contexts/comms";

import styles from "./mainNav.module.scss";
import { useSocket } from "../../contexts/socket";

const MainNav = (props) => {
    const { changePage, currentPage, onToggleMenu } = props;
    const [modal, setModal] = useState(false);

    const { isMobile } = useContext(MobileContext);
    const { selectedcomm, selectedCommRef } = useComms();
    const { mainAlerts, setMainAlertsFromChild } = useSocket();

    const unreadMessagesOther = true;

    useEffect(() => {
        if (
            selectedCommRef.current &&
            mainAlerts[selectedCommRef.current?._id]
        ) {
            let alerts = mainAlerts[selectedCommRef.current?._id];
            if (alerts) {
                for (let [key, value] of Object.entries(alerts)) {
                    if (currentPage == key && value) {
                        if (key !== "gather") {
                            alerts[key] = false;
                            setMainAlertsFromChild({
                                ...mainAlerts,
                                [selectedCommRef.current?._id]: alerts,
                            });
                        } else {
                            let schedules = alerts.gather?.schedules;
                            if (schedules && schedules.length) {
                                alerts.gather.schedules = [];
                                setMainAlertsFromChild({
                                    ...mainAlerts,
                                    [selectedCommRef.current?._id]: alerts,
                                });
                            }
                        }
                    }
                }
            }
        }
    }, [mainAlerts, currentPage, selectedcomm]);

    const handleHarthMenu = () => {
        if (!isMobile) {
            setModal((prevState) => !prevState);
        }
        if (isMobile) {
            onToggleMenu();
        }
    };

    const showModal = () => {
        setModal((prevState) => !prevState);
    };

    let hasLive = false;
    let schedules = [];
    /* eslint-disable */
    if (currentPage !== "gather") {
        let gather = mainAlerts[selectedCommRef.current?._id]?.gather;
        hasLive = gather?.hasLive;
        schedules = gather?.schedules;
    }
    return (
        <>
            {modal ? (
                <Modal onToggleModal={showModal}>
                    <HarthSettings
                        communityName={selectedcomm?.name}
                        communityId={selectedcomm?._id}
                        onToggleModal={showModal}
                    />
                </Modal>
            ) : (
                ""
            )}

            <header
                className={`${styles.MainNav} ${
                    isMobile ? styles.Mobile : styles.Desktop
                }`}
            >

                <div
                    className={`
                    ${styles.MainNavPages} 
                    ${isMobile && styles.MainNavPagesMobile}

                `}
                >
                    <button
                        role="nav-item"
                        id="chat"
                        aria-label="Community Chat"
                        className={`
                            ${styles.MainNavPageButton} 
                            ${currentPage == "chat" && styles.Active}

                        `}
                        onClick={() => {
                            changePage("chat");
                        }}
                    >
                        <div
                            className={`
                            ${styles.iconHolder} 
                            ${
                                mainAlerts[selectedCommRef.current?._id] &&
                                mainAlerts[selectedCommRef.current?._id]
                                    ?.chat &&
                                currentPage != "chat" &&
                                styles.iconHolderUnreadMessage
                            }

                            `}
                        >
                            <IconChatNoFill />
                        </div>
                        <div className={styles.title}>Chat</div>
                    </button>

                    <button
                        role="nav-item"
                        id="gather"
                        aria-label="Gather"
                        className={`
                            ${styles.MainNavPageButton} 
                            ${
                                currentPage == "gather"
                                    ? styles.Active
                                    : null
                            } 
                        `}
                        onClick={() => {
                            changePage("gather");
                        }}
                    >
                        <div
                            className={`
                            ${styles.iconHolder} 
                            ${
                                currentPage != "gather" &&
                                (hasLive || schedules?.length)
                                    ? styles.iconHolderUnreadMessage
                                    : null
                            }
                            `}
                        >

                            <IconFireNoFill />
                        </div>
                        <div className={styles.title}>Gather</div>
                    </button>

                    <button
                        role="nav-item"
                        id="message"
                        aria-label="Private Messages"
                        className={`
                            ${styles.MainNavPageButton} 
                            ${
                                currentPage == "message"
                                    ? styles.Active
                                    : null
                            } 
                        `}
                        onClick={() => {
                            changePage("message");
                        }}
                    >
                        <div
                            className={`
                            ${styles.iconHolder} 
                            ${
                                mainAlerts[selectedCommRef.current?._id] &&
                                mainAlerts[selectedCommRef.current?._id]
                                    ?.message &&
                                currentPage != "message" &&
                                styles.iconHolderUnreadMessage
                            }
                            `}
                        >
                            <IconForumNoFill />
                        </div>
                        <div className={styles.title}>Message</div>
                    </button>
                </div>
                {isMobile ? (
                    null
                ) : (
                    <div className={styles.MainNavTitleHolder}>
                        <button
                            className={styles.MainNavHarthButton}
                            onClick={handleHarthMenu}
                            aria-label="Current Harth Settings"
                        >
                            {selectedcomm?.name}
                        </button>

                    </div>
                )}

                
            </header>
        </>
    );
};

export default MainNav;
