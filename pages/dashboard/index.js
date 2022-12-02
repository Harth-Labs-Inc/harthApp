import { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import { CommsProvider } from "../../contexts/comms";
import { SocketProvider } from "../../contexts/socket";
import { ChatProvider } from "../../contexts/chat";
import { useAuth } from "../../contexts/auth";

import { VideoProvider } from "../../contexts/video";
import NavLayout from "../../components/dashLayout";
import { checkIfInviteTokenIsGood } from "../../requests/community";

import Chat from "./chat";
import Party from "./party";
import Voice from "./voice";
import Stream from "./stream";
import Video from "./video";
import Messages from "./messages";

const dashboard = (props) => {
    const [currentPage, setCurrentPage] = useState("chat");
    const [GatherWindow, setGatherWindow] = useState("");
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
    const [invitedHarth, setInvitedHarth] = useState(null);

    const { inviteTKN } = useAuth();
    const router = useRouter();
    const {
        query: { tkn, fistTimeUser },
    } = router;

    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const gatherWindow = urlParams.get("gather_window");
        const roomType = urlParams.get("room_type");
        if (gatherWindow) setGatherWindow(gatherWindow);
        if (roomType) {
            changePageHandler(roomType);
        }
        return () => {
            setInvitedHarth(null);
        };
    }, []);

    useEffect(() => {
        if (inviteTKN || tkn) {
            setShowInviteModal(true);
            return () => {
                setShowInviteModal(false);
            };
        }
    }, [inviteTKN, tkn]);

    useEffect(() => {
        if (fistTimeUser) {
            setShowFirstTimeModal(true);
            return () => {
                setShowFirstTimeModal(false);
            };
        }
    }, [fistTimeUser]);

    const changePageHandler = (pg) => {
        setCurrentPage(pg);
    };

    const invitationAcceptHandler = async () => {
        let token = "";
        if (tkn) {
            token = tkn;
        }
        if (inviteTKN && !token) {
            token = inviteTKN;
        }
        let results = await checkIfInviteTokenIsGood({ token });
        let { ok, harth } = results;
        if (ok) {
            setShowInviteModal(false);
            setInvitedHarth(harth);
            console.log("good to name your profile in harth:", harth);
        }
    };

    let page;
    switch (currentPage) {
        case "chat":
            page = <Chat />;
            break;
        case "gather":
            page = (
                <VideoProvider>
                    <Video />
                </VideoProvider>
            );
            break;
        case "party":
            page = <Party />;
            break;
        case "voice":
            page = <Voice />;
            break;
        case "stream":
            page = <Stream />;
            break;
        case "messages":
            page = <Messages />;
            break;
        default:
            page = <Chat />;
            break;
    }

    return (
        <CommsProvider>
            <ChatProvider>
                <SocketProvider>
                    {invitedHarth ? (
                        <div
                            style={{
                                position: "absolute",
                                zIndex: 2,
                                background: "white",
                                padding: "100px",
                            }}
                        >
                            <p>by what name would you like to be know</p>
                            <input type="text" />
                            <button
                                onClick={() => setShowFirstTimeModal(false)}
                            >
                                Join
                            </button>
                        </div>
                    ) : null}
                    {showFirstTimeModal ? (
                        <div
                            style={{
                                position: "absolute",
                                zIndex: 2,
                                background: "white",
                                padding: "100px",
                            }}
                        >
                            <p>name your first harth!!</p>
                            <button
                                onClick={() => setShowFirstTimeModal(false)}
                            >
                                ACCEPT
                            </button>
                        </div>
                    ) : null}
                    {showInviteModal ? (
                        <div
                            style={{
                                position: "absolute",
                                zIndex: 1,
                                background: "white",
                                padding: "100px",
                            }}
                        >
                            <p>an invitation arrived do you accept?</p>
                            <button onClick={invitationAcceptHandler}>
                                ACCEPT
                            </button>
                        </div>
                    ) : null}
                    {GatherWindow ? (
                        page
                    ) : (
                        <NavLayout
                            changePage={changePageHandler}
                            currentPage={currentPage}
                        >
                            {page}
                        </NavLayout>
                    )}
                </SocketProvider>
            </ChatProvider>
        </CommsProvider>
    );
};

export default dashboard;
