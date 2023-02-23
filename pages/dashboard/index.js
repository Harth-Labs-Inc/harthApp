import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { sendWelcomeEmailToUser } from "../../requests/userApi";
import { checkIfInviteTokenIsGood } from "../../requests/community";
import { VideoProvider } from "../../contexts/video";
import { CommsProvider } from "../../contexts/comms";
import { SocketProvider } from "../../contexts/socket";
import { ChatProvider } from "../../contexts/chat";
import { useAuth } from "../../contexts/auth";

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

// import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
// import Chat from "./chat";
// import Party from "./party";
// import Voice from "./voice";
// import Stream from "./stream";
// import Video from "./video";
// import Message from "./message";
// import CreateHarthName from "../../components/createHarthName/createHarthName";
// import CreateHarthProfile from "../../components/createHarthProfile/createHarthProfile";
// import HarthInviteAcceptModal from "../../components/harthInviteAcceptModal/harthInviteAcceptModal";

const dashboard = (props) => {
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
        changePageHandler("chat");
        const showFirstTimeUser = localStorage.getItem("showFirstTimeUser");
        if (showFirstTimeUser) {
          sendWelcomeEmailToUser({
            user,
            subject: "Welcome To Harth",
          });
          if (!inviteTKN && !tkn) {
            setShowCreateHarthNameModal(true);
          } else {
            localStorage.removeItem("showFirstTimeUser");
            setShowCreateHarthNameModal(false);
            setShowInviteAcceptModal(true);
          }
        } else {
          console.log("inviteTKN || tkn", inviteTKN, tkn);
          if (inviteTKN || tkn) {
            async function testToken() {
              let results = await checkIfInviteTokenIsGood({
                token: tkn || inviteTKN,
                user,
              });
              if (results?.ok) {
                console.log("harth", results?.harth);
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
          }
        }
      }
      if (gatherWindow) setGatherWindow(gatherWindow);
    }
  }, [loading]);

  const changePageHandler = (pg) => {
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
        page = DynamicVideo ? (
          <VideoProvider>
            <DynamicVideo />
          </VideoProvider>
        ) : null;
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
      return <CommsProvider>{page}</CommsProvider>;
    } else {
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
                  talkingHeadMsg="You have been invited to join a new härth"
                  footer="Remember to be safe and only accept invites from people that you know."
                  submitText="Accept Invite"
                  submitHandler={goodInviteHandler}
                  tkn={tkn || inviteTKN || ""}
                  user={user}
                  closeHandler={() => {
                    resetNewInviteHarth();
                    window.history.replaceState(null, null, "dashboard");
                  }}
                  invitedHarth={invitedHarth}
                />
              ) : null}
              {showInviteProfileModal ? (
                <CreateHarthProfile
                  header="harth"
                  talkingHeadMsg="And by what name would you like to be known"
                  footer="Set your name and profile pic for this härth. You can change these at any time"
                  placeholder={`${"First Name"}`}
                  submitText="Join"
                  submitHandler={resetNewInviteHarth}
                  harth={invitedHarth}
                  invite={true}
                />
              ) : null}

              <DashboardLayout
                changePage={changePageHandler}
                currentPage={currentPage}
                setShowCreateHarthNameModal={setShowCreateHarthNameModal}
                user={user}
              >
                {page}
              </DashboardLayout>
            </SocketProvider>
          </ChatProvider>
        </CommsProvider>
      );
    }
  }

  return <p>...loading</p>;
};

export default dashboard;
