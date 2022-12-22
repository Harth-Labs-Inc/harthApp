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
        <ul className={isMobile ? styles.HarthListMobile : styles.HarthList} id="left_nav_comms">
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
                              ${styles.Item}
                              ${active ? styles.ItemActive : null}
                              ${(newMessage && !active) ? styles.ItemUnreadMessage : null}
                            `}
                            key={com?._id}
                        >
                            <button
                                onClick={() => {
                                    changeSelectedCom(com);
                                }}
                                aria-label={com.name}
                                className={styles.ItemButton}
                            >
                                {com.iconKey ? (
                                    <span className={styles.ItemImage}>
                                        <img src={com.iconKey} />
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
                        </li>
                    );
                })}
            {isMobile ? (
                <li className={styles.NewHarth}>
                    <button
                        className={styles.ItemButton}
                        onClick={toggleCreateComm}
                    >
                        <IconAdd />
                    </button>
                </li>
                ) : ( null)}
        </ul>
    );
};

export default HarthList;
