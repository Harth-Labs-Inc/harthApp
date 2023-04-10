import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

import { sendWelcomeEmailToUser } from "../../requests/userApi";
import { checkIfInviteTokenIsGood, getComms } from "../../requests/community";
import { VideoProvider } from "../../contexts/video";
import { CommsProvider } from "../../contexts/comms";
import { SocketProvider } from "../../contexts/socket";
import { ChatProvider } from "../../contexts/chat";
import { useAuth } from "../../contexts/auth";

/* eslint-disable */

const DashboardLayout = dynamic(
  () => import("../../components/DashboardLayout/DashboardLayout"),
  {
    loading: () => null,
  }
);
const CreateHarthName = dynamic(
  () => import("../../components/createHarthName/createHarthName"),
  {
    loading: () => null,
  }
);
const CreateHarthProfile = dynamic(
  () => import("../../components/createHarthProfile/createHarthProfile"),
  {
    loading: () => null,
  }
);
const HarthInviteAcceptModal = dynamic(
  () =>
    import("../../components/harthInviteAcceptModal/harthInviteAcceptModal"),
  {
    loading: () => null,
  }
);

const dashboard = () => {
  const [currentPage, setCurrentPage] = useState();
  const [GatherWindow, setGatherWindow] = useState("");
  const [invitedHarth, setInvitedHarth] = useState(null);
  const [newHarth, setNewHarth] = useState(null);
  const [showCreateHarthNameModal, setShowCreateHarthNameModal] =
    useState(false);
  const [showCreateHarthProfileModal, setShowCreateHarthProfileModal] =
    useState(false);
  const [showInviteAcceptModal, setShowInviteAcceptModal] = useState(false);
  const [showInviteProfileModal, setShowInviteProfileModal] = useState(false);

  const { user, loading, inviteTKN, setInviteTKN } = useAuth();

  const router = useRouter();
  const {
    query: { tkn },
  } = router;

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const gatherWindow = urlParams.get("gather_window");
    const roomType = urlParams.get("room_type");

    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (roomType) {
        changePageHandler(roomType);
      } else {
        let prevPage = localStorage.getItem("selectedPage");
        if (prevPage) {
          changePageHandler(prevPage);
        } else {
          changePageHandler("chat");
        }
        const showFirstTimeUser = localStorage.getItem("showFirstTimeUser");
        if (showFirstTimeUser) {
          sendWelcomeEmailToUser({
            user,
            subject: "Welcome To Härth",
          });
          if (!inviteTKN && !tkn) {
            setShowCreateHarthNameModal(true);
          } else {
            localStorage.removeItem("showFirstTimeUser");
            setShowCreateHarthNameModal(false);
            setShowInviteAcceptModal(true);
          }
        } else if (inviteTKN || tkn) {
          async function testToken() {
            let results = await checkIfInviteTokenIsGood({
              token: tkn || inviteTKN,
              user,
            });
            if (results?.ok) {
              setShowCreateHarthNameModal(false);
              setInvitedHarth({ ...results?.harth });
              setShowInviteAcceptModal(true);
            } else {
              setInviteTKN(null);
              setShowCreateHarthNameModal(false);
              setShowInviteAcceptModal(false);
            }
          }
          testToken();
        } else if (!user.comms || user?.comms.length == 0) {
          setShowCreateHarthNameModal(true);
        }
      }
      if (gatherWindow) setGatherWindow(gatherWindow);
    }
  }, [loading]);

  const changePageHandler = (pg) => {
    if (["gather", "chat", "message"].includes(pg)) {
      localStorage.setItem("selectedPage", pg);
    }

    setCurrentPage(pg);
  };
  const harthNameCreationHandler = async (harth) => {
    setNewHarth(harth);
    setShowCreateHarthNameModal(false);
    setShowCreateHarthProfileModal(true);
  };
  const resetNewHarth = () => {
    const showFirstTimeUser = localStorage.getItem("showFirstTimeUser");
    if (showFirstTimeUser) {
      localStorage.removeItem("showFirstTimeUser");
    }
    setNewHarth(null);
    setShowCreateHarthProfileModal(false);
    if (inviteTKN || tkn) {
      setInviteTKN(null);
      setShowCreateHarthNameModal(false);
      setShowInviteAcceptModal(true);
    }
  };
  const resetNewInviteHarth = () => {
    setInvitedHarth(null);
    setShowInviteProfileModal(false);
    setShowInviteAcceptModal(false);
  };
  const goodInviteHandler = (harth) => {
    setShowInviteAcceptModal(false);
    setInvitedHarth({ ...harth });
    setShowInviteProfileModal(true);
  };
  const toggleNoHarthDetected = (bool) => {
    if (bool) {
      setShowCreateHarthNameModal(true);
    }
  };

  if (user && currentPage) {
    let page;
    switch (currentPage) {
      case "chat":
        const DynamicChat = dynamic(() => import("./chat"), {
          loading: () => null,
        });
        page = DynamicChat ? <DynamicChat /> : null;
        break;
      case "gather":
        const DynamicVideo = dynamic(() => import("./video"), {
          loading: () => null,
        });
        page = DynamicVideo ? <DynamicVideo /> : null;
        break;
      case "party":
        const DynamicParty = dynamic(() => import("./party"), {
          loading: () => null,
        });
        page = DynamicParty ? <DynamicParty /> : null;
        break;
      case "voice":
        const DynamicVoice = dynamic(() => import("./voice"), {
          loading: () => null,
        });
        page = DynamicVoice ? <DynamicVoice /> : null;
        break;
      case "stream":
        const DynamicStream = dynamic(() => import("./stream"), {
          loading: () => null,
        });
        page = DynamicStream ? <DynamicStream /> : null;
        break;
      case "message":
        const DynamicMessage = dynamic(() => import("./message"), {
          loading: () => null,
        });
        page = DynamicMessage ? <DynamicMessage /> : null;
        break;
      default:
        page = null;
        break;
    }

    if (GatherWindow) {
      return (
        <CommsProvider>
          <ChatProvider>{page}</ChatProvider>
        </CommsProvider>
      );
    } else {
      return (
        <CommsProvider>
          <ChatProvider>
            <SocketProvider>
              <VideoProvider>
                {showCreateHarthNameModal ? (
                  <CreateHarthName
                    talkingHeadMsg="Time to make a sweet new härth for you and your crew."
                    footer="Tip: You can change your härth name and image at any time"
                    placeholder="härth name"
                    submitText="Create"
                    closeHandler={async () => {
                      let result = await getComms(user);
                      const { ok, comms } = result;
                      if (!ok || !comms || !comms.length) {
                        setShowCreateHarthNameModal(true);
                      }
                    }}
                    submitHandler={harthNameCreationHandler}
                  />
                ) : null}
                {showCreateHarthProfileModal ? (
                  <CreateHarthProfile
                    talkingHeadMsg="Enter the name you would like to be called and don't forget to add a profile pic."
                    footer="Tip: You can change your profile name nad picture at any time"
                    placeholder="profile name"
                    submitText="Join"
                    submitHandler={resetNewHarth}
                    harth={newHarth}
                  />
                ) : null}
                {showInviteAcceptModal ? (
                  <HarthInviteAcceptModal
                    talkingHeadMsg="You have been invited to join a new härth"
                    footer="Remember to be safe and only accept invites from people that you know."
                    submitText="Accept Invite"
                    submitHandler={goodInviteHandler}
                    tkn={tkn || inviteTKN || ""}
                    user={user}
                    closeHandler={async () => {
                      resetNewInviteHarth();
                      window.history.replaceState(null, null, "dashboard");
                      let result = await getComms(user);
                      const { ok, comms } = result;
                      if (!ok || !comms || !comms.length) {
                        toggleNoHarthDetected(true);
                      }
                    }}
                    invitedHarth={invitedHarth}
                  />
                ) : null}
                {showInviteProfileModal ? (
                  <CreateHarthProfile
                    header="harth"
                    talkingHeadMsg="Enter the name you would like to be called in this härth."
                    footer="Tip: You can change your name and pic for this härth at any time."
                    placeholder={`${"First Name"}`}
                    submitText="Join"
                    submitHandler={resetNewInviteHarth}
                    harth={invitedHarth}
                    invite={true}
                    closeHandler={async () => {
                      resetNewInviteHarth();
                      window.history.replaceState(null, null, "dashboard");
                      let result = await getComms(user);
                      const { ok, comms } = result;
                      if (!ok || !comms || !comms.length) {
                        toggleNoHarthDetected(true);
                      }
                    }}
                  />
                ) : null}

                <DashboardLayout
                  changePage={changePageHandler}
                  currentPage={currentPage}
                  setShowCreateHarthNameModal={setShowCreateHarthNameModal}
                  user={user}
                  toggleNoHarthDetected={toggleNoHarthDetected}
                >
                  {page}
                </DashboardLayout>
              </VideoProvider>
            </SocketProvider>
          </ChatProvider>
        </CommsProvider>
      );
    }
  }

  return <p>...loading</p>;
};

export default dashboard;
