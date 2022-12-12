import { useContext } from "react";

import { MobileContext } from "../../../contexts/mobile";
import { IconAdd } from "../../../resources/icons/IconAdd";
import { IconFireFill } from "../../../resources/icons/IconFireFill";

import styles from "./HarthList.module.scss";

const HarthList = ({
    comms,
    selectedcomm,
    unreadMsgs,
    toggleCreateComm,
    changeSelectedCom,
}) => {
    const { isMobile } = useContext(MobileContext);
    return (
        <ul className={styles.HarthList} id="left_nav_comms">
            {isMobile ? (
                <p className="left_nav_title">Your H&auml;rths</p>
            ) : null}

            {comms &&
                comms.map((com) => {
                    let active = false;
                    let newMessage = true; // for dev, change to false for prod
                    if (selectedcomm && com._id === selectedcomm._id) {
                        active = true;
                    } else {
                        unreadMsgs.forEach((msg) => {
                            if (
                                msg.comm_id === com._id &&
                                msg.creator_id !== user._id
                            ) {
                                newMessage = true;
                            }
                        });
                    }

                    return (
                        <li
                            className={`
                              ${styles.HarthListItem}
                              ${active ? styles.Active : null}
                              ${newMessage ? styles.UnreadMessage : null}
                            `}
                            key={com?._id}
                        >
                            <button
                                onClick={() => {
                                    changeSelectedCom(com);
                                }}
                                aria-label={com.name}
                                className={styles.HarthListItemButton}
                            >
                                {com.iconKey ? (
                                    <span className={styles.HarthListItemIcon}>
                                        <img src={com.iconKey} />
                                    </span>
                                ) : (
                                    <span className={styles.HarthListItemIcon}>
                                        <span
                                            className={
                                                styles.HarthListItemIconFiller
                                            }
                                        >
                                            <IconFireFill />
                                        </span>
                                    </span>
                                )}
                                {isMobile ? (
                                    <span className={styles.HarthListItemName}>
                                        {com.name}
                                    </span>
                                ) : null}
                            </button>
                        </li>
                    );
                })}
            <li className={styles.HarthListNewHarth}>
                <button
                    className={styles.HarthListItemButton}
                    onClick={toggleCreateComm}
                ></button>
            </li>
        </ul>
    );
};

export default HarthList;
