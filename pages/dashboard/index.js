import { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import { CommsProvider } from "../../contexts/comms";
import { SocketProvider } from "../../contexts/socket";
import { ChatProvider } from "../../contexts/chat";
import { useAuth } from "../../contexts/auth";

import Cookies from "js-cookie";

import { VideoProvider } from "../../contexts/video";
import NavLayout from "../../components/dashLayout";
import { checkIfInviteTokenIsGood } from "../../requests/community";

import Chat from "./chat";
import Party from "./party";
import Voice from "./voice";
import Stream from "./stream";
import Video from "./video";
import Messages from "./messages";

// import CreateHarthName from "../../components/CreateHarthName/CreateHarthName";
// import CreateHarthProfile from "../../components/CreateHarthProfile/CreateHarthProfile";
// import HarthInviteAcceptModal from "../../components/HarthInviteAcceptModal/HarthInviteAcceptModal";
import CreateHarthName from "../../components/createHarthName/createHarthName";
import CreateHarthProfile from "../../components/createHarthProfile/createHarthProfile";
import HarthInviteAcceptModal from "../../components/HarthInviteAcceptModal/HarthInviteAcceptModal";

const dashboard = (props) => {
    const [currentPage, setCurrentPage] = useState("chat");
    const [GatherWindow, setGatherWindow] = useState("");

    const [invitedHarth, setInvitedHarth] = useState(null);
    const [newHarth, setNewHarth] = useState(null);

    const [showCreateHarthNameModal, setShowCreateHarthNameModal] =
        useState(false);
    const [showCreateHarthProfileModal, setShowCreateHarthProfileModal] =
        useState(false);

    const [showInviteAcceptModal, setShowInviteAcceptModal] = useState(false);
    const [showInviteProfileModal, setShowInviteProfileModal] = useState(false);

    const { inviteTKN } = useAuth();

    const router = useRouter();
    const {
        query: { tkn },
    } = router;

    useEffect(() => {
        const showFirstTimeUser = Cookies.get("showFirstTimeUser");
        if (showFirstTimeUser) {
            setShowCreateHarthNameModal(true);
        }
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const gatherWindow = urlParams.get("gather_window");
        const roomType = urlParams.get("room_type");
        if (gatherWindow) setGatherWindow(gatherWindow);
        if (roomType) {
            changePageHandler(roomType);
        }
        return () => {
            setShowCreateHarthProfileModal(false);
            setShowCreateHarthNameModal(false);
        };
    }, []);

    useEffect(() => {
        if (inviteTKN || tkn) {
            setShowCreateHarthNameModal(false);
            setShowInviteAcceptModal(true);
            return () => {
                setShowInviteAcceptModal(false);
            };
        }
    }, [inviteTKN, tkn]);

    const changePageHandler = (pg) => {
        setCurrentPage(pg);
    };
    const harthNameCreationHandler = async (harth) => {
        setNewHarth(harth);
        setShowCreateHarthNameModal(false);
        setShowCreateHarthProfileModal(true);
    };
    const resetNewHarth = () => {
        const showFirstTimeUser = Cookies.get("showFirstTimeUser");
        if (showFirstTimeUser) {
            Cookies.remove("showFirstTimeUser");
        }
        setNewHarth(null);
        setShowCreateHarthProfileModal(false);
    };
    const resetNewInviteHarth = () => {
        setInvitedHarth(null);
        setShowInviteProfileModal(false);
    };
    const goodInviteHandler = (harth) => {
        setShowInviteAcceptModal(false);
        setInvitedHarth(harth);
        setShowInviteProfileModal(true);
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
    showCreateHarthNameModal;
    return (
        <CommsProvider>
            <ChatProvider>
                <SocketProvider>
                    {showCreateHarthNameModal ? (
                        <CreateHarthName
                            talkingHeadMsg="Let's create your harth. Once it's created you can invite your friends"
                            footer="Give your harth a name and a cool sigil. No need to think too hard, you can change them at any time."
                            placeholder={`${"First Name"}'s harth`}
                            submitText="Create"
                            submitHandler={harthNameCreationHandler}
                        />
                    ) : null}
                    {showCreateHarthProfileModal ? (
                        <CreateHarthProfile
                            talkingHeadMsg="And by what name would you like to be known"
                            footer="Set your name and profile pic for this harth. You can change these at any time"
                            placeholder={`${"First Name"}`}
                            submitText="Join"
                            submitHandler={resetNewHarth}
                            harth={newHarth}
                        />
                    ) : null}
                    {showInviteAcceptModal ? (
                        <HarthInviteAcceptModal
                            talkingHeadMsg="An invitation arrives. Do you accept?"
                            footer="You have been invited to join this harth by [profile name]"
                            submitText="Accept Invite"
                            submitHandler={goodInviteHandler}
                            tkn={tkn || inviteTKN || ""}
                        />
                    ) : null}
                    {showInviteProfileModal ? (
                        <CreateHarthProfile
                            header="harth"
                            talkingHeadMsg="And by what name would you like to be known"
                            footer="Set your name and profile pic for this harth. You can change these at any time"
                            placeholder={`${"First Name"}`}
                            submitText="Join"
                            submitHandler={resetNewInviteHarth}
                            harth={invitedHarth}
                        />
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
