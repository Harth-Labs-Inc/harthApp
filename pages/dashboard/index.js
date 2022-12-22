import { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import { CommsProvider } from "../../contexts/comms";
import { SocketProvider } from "../../contexts/socket";
import { ChatProvider } from "../../contexts/chat";
import { useAuth } from "../../contexts/auth";
import { sendWelcomeEmailToUser } from "../../requests/userApi";
import Cookies from "js-cookie";

import { VideoProvider } from "../../contexts/video";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";

import Chat from "./chat";
import Party from "./party";
import Voice from "./voice";
import Stream from "./stream";
import Video from "./video";
import Messages from "./messages";

import CreateHarthName from "../../components/createHarthName/createHarthName";
import CreateHarthProfile from "../../components/createHarthProfile/createHarthProfile";
import HarthInviteAcceptModal from "../../components/harthInviteAcceptModal/harthInviteAcceptModal";

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

  const { user, loading, inviteTKN } = useAuth();

  const router = useRouter();
  const {
    query: { tkn },
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
    // const showFirstTimeUser = Cookies.get("showFirstTimeUser");
    // if (showFirstTimeUser) {
    //   if (!inviteTKN && !tkn) {
    //     setShowCreateHarthNameModal(true);
    //   }
    // }

    // return () => {
    //   setShowCreateHarthProfileModal(false);
    //   setShowCreateHarthNameModal(false);
    // };
  }, []);

  // useEffect(() => {
  //   const showFirstTimeUser = Cookies.get("showFirstTimeUser");

  //   if (inviteTKN || tkn) {
  //     if (showFirstTimeUser) {
  //       Cookies.remove("showFirstTimeUser");
  //     }
  //     setShowCreateHarthNameModal(false);
  //     setShowInviteAcceptModal(true);
  //   }
  //   return () => {
  //     setShowInviteAcceptModal(false);
  //   };
  // }, [inviteTKN, tkn]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else {
        const showFirstTimeUser = Cookies.get("showFirstTimeUser");
        if (showFirstTimeUser) {
          sendWelcomeEmailToUser({ user, subject: "Welcome To Harth" });
          if (!inviteTKN && !tkn) {
            setShowCreateHarthNameModal(true);
          } else {
            Cookies.remove("showFirstTimeUser");
            setShowCreateHarthNameModal(false);
            setShowInviteAcceptModal(true);
          }
        } else {
          if (inviteTKN || tkn) {
            setShowCreateHarthNameModal(false);
            setShowInviteAcceptModal(true);
          }
        }
      }
    }
  }, [loading]);

  // useEffect(() => {
  //   if (!loading && !user) router.push("/");
  // }, [loading]);

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
    if (inviteTKN || tkn) {
      setShowCreateHarthNameModal(false);
      setShowInviteAcceptModal(true);
    }
  };
  const resetNewInviteHarth = () => {
    setInvitedHarth(null);
    setShowInviteProfileModal(false);
  };
  const goodInviteHandler = (harth) => {
    console.log(harth, "goodInviteHandler");
    setShowInviteAcceptModal(false);
    setInvitedHarth({ ...harth });
    setShowInviteProfileModal(true);
  };

  if (user) {
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
            {showCreateHarthNameModal ? (
              <CreateHarthName
                talkingHeadMsg="Give your härth a name and and image"
                footer="Tip: You can change your härth name and image at any time"
                placeholder="härth name"
                submitText="Create"
                closeHandler={() => setShowCreateHarthNameModal(false)}
                submitHandler={harthNameCreationHandler}
              />
            ) : null}
            {showCreateHarthProfileModal ? (
              <CreateHarthProfile
                talkingHeadMsg="Enter the name you would like to be called in your new härth and add a profile picture"
                footer="Familiar Tip: You can change your profile name nad picture at any time"
                placeholder="your profile name"
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
                invite={true}
              />
            ) : null}
            {GatherWindow ? (
              page
            ) : (
              <DashboardLayout
                changePage={changePageHandler}
                currentPage={currentPage}
                setShowCreateHarthNameModal={setShowCreateHarthNameModal}
              >
                {page}
              </DashboardLayout>
            )}
          </SocketProvider>
        </ChatProvider>
      </CommsProvider>
    );
  }

  return <p>...loading</p>;
};

export default dashboard;
