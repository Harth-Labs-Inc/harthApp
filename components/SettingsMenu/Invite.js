import { useRef, useState, useEffect } from "react";
import { useComms } from "../../contexts/comms";
import { generateInvite, getInviteById } from "../../requests/community";

import { Button } from "../Common";
import Select from "react-select";

const URLS = {
    development: "http://localhost:3000/",
    production: "https://harth.vercel.app/",
};

const InviteComp = (props) => {
    const { comms, selectedcomm, setCommsFromChild } = useComms();
    const [COMMS, SETCOMMS] = useState([]);
    const [selectedHarth, setSelectedHarth] = useState("");
    const { toggleCurrentPage } = props;

    const commsRef = useRef([]);

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

    console.log(comms, "coms");
    return (
        <div>
            <h3>Your Harths</h3>
            <hr />
            <ul>
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
                                    URLS[process.env.NODE_ENV]
                                }/?invite=true&tkn=${invite_tkn}`;
                            }
                        }
                    }

                    return (
                        <li>
                            <img src={iconKey || ""} />
                            <p>{name}</p>
                            {!validCode ? (
                                <button onClick={() => handleClick(comm)}>
                                    Create Invite
                                </button>
                            ) : (
                                <p>
                                    {url}
                                    <button
                                        onClick={() =>
                                            copyInviteToClipboard(url)
                                        }
                                    >
                                        copy
                                    </button>
                                </p>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default InviteComp;
