import { useRef, useState, useEffect } from "react";

import { useComms } from "../../../contexts/comms";
import { generateInvite } from "../../../requests/community";

import { envUrls } from "../../../constants/urls";

import { Button, BackButton } from "../../Common";

import styles from "./SettingsMenu.module.scss";

const URLS = envUrls;

const InviteComp = (props) => {
    const { comms, setCommsFromChild } = useComms();
    const [COMMS, SETCOMMS] = useState([]);
    // const [selectedHarth, setSelectedHarth] = useState("");
    const { toggleCurrentPage } = props;

    const commsRef = useRef([]);

    const handleBack = () => {
        toggleCurrentPage("");
    };

    const handleClick = async (comm) => {
        const data = await generateInvite(comm);
        const { ok, user } = data;
        if (ok) {
            let index = comms.findIndex((com) => {
                return com._id === user._id;
            });
            if (index >= 0) {
                let arr = [...COMMS];
                arr[index] = user;
                commsRef.current = arr;
                SETCOMMS(arr);
            }
        }
    };

    const copyInviteToClipboard = (url) => {
        if ("clipboard" in navigator) {
            navigator.clipboard.writeText(url);
        } else {
            document.execCommand("copy", true, url);
        }
    };

    useEffect(() => {
        if (comms) {
            commsRef.current = comms;
            SETCOMMS(comms);
        }
    }, [comms]);

    useEffect(() => {
        return () => {
            setCommsFromChild(commsRef.current);
        };
    }, []);

    if (!comms) {
        return <p>...loading</p>;
    }

    if (!comms.length) {
        return <p>No harths found</p>;
    }

    return (
        <div className={styles.SettingsContainer}>
            <div className={styles.SettingsContainerHeader}>
                <BackButton clickHandler={handleBack} />
                <p>Invites</p>
            </div>
            <div className={styles.SettingsContainerText}>
                Create an invite and send the link<br />to your friends
            </div>
            
            <div className={styles.InviteList}>
                {COMMS.map((comm) => {
                    let { iconKey, name, invite_tkn, invite_expiration } = comm;
                    let validCode = false;
                    let url = "";
                    if (invite_expiration) {
                        let today = new Date();
                        let expirationDate = new Date(invite_expiration);
                        if (today < expirationDate) {
                            if (invite_tkn) {
                                validCode = true;
                                url = `${
                                    /* eslint-disable-next-line */
                                    URLS[process.env.NODE_ENV]
                                }/?invite=true&tkn=${invite_tkn}`;
                            }
                        }
                    }

                    return (
                        <div key={comm.id} className={styles.InviteListItem}>
                            <div className={styles.InviteListItemInfo}>
                                <img
                                    loading="lazy"
                                    src={iconKey || ""}
                                    className={styles.InviteListItemInfoImage}
                                />
                                <p className={styles.InviteListItemInfoName}>
                                    {name}
                                </p>
                            </div>
                            {!validCode ? (
                                <Button
                                    text="Create Invite"
                                    onClick={() => handleClick(comm)}
                                />
                            ) : (
                                <div className={styles.InviteListItemCode}>
                                    <p className={styles.InviteListItemCodeUrl}>
                                        {url}
                                    </p>
                                    <button
                                        onClick={() =>
                                            copyInviteToClipboard(url)
                                        }
                                    >
                                        Copy
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InviteComp;
