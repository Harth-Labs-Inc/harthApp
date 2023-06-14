import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { SpinningLoader } from "components/Common/SpinningLoader/SpinningLoader";
import { sendWelcomeEmailToUser } from "../../requests/userApi";
import { checkIfInviteTokenIsGood, getComms } from "../../requests/community";
import { VideoProvider } from "../../contexts/video";
import { CommsProvider } from "../../contexts/comms";
import { SocketProvider } from "../../contexts/socket";
import { useAuth } from "../../contexts/auth";
import { urlBase64ToUint8Array } from "services/helper";
import { saveUserSubscription } from "../../requests/subscriptions";

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
  const [GatherWindow, setGatherWindow] = useState("");
  const [invitedHarth, setInvitedHarth] = useState(null);
  const [newHarth, setNewHarth] = useState(null);
  const [showCreateHarthNameModal, setShowCreateHarthNameModal] =
    useState(false);
  const [showCreateHarthProfileModal, setShowCreateHarthProfileModal] =
    useState(false);
  const [showInviteAcceptModal, setShowInviteAcceptModal] = useState(false);
  const [showInviteProfileModal, setShowInviteProfileModal] = useState(false);
  const [inviteTKN, setInviteTKN] = useState(false);

  const { user, loading } = useAuth();

  const router = useRouter();
  const {
    query: { tkn, gather_window, room_type },
  } = router;

  const [currentPage, setCurrentPage] = useState(
    gather_window ? room_type : null
  );

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const gatherWindow = urlParams.get("gather_window");
    const roomType = urlParams.get("room_type");

    let storedinviteTKN = localStorage.getItem("inviteToken");
    if (storedinviteTKN) {
      setInviteTKN(storedinviteTKN);
    }

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
          if (!storedinviteTKN && !tkn) {
            setShowCreateHarthNameModal(true);
          } else {
            localStorage.removeItem("showFirstTimeUser");
            async function testToken() {
              let results = await checkIfInviteTokenIsGood({
                token: tkn || storedinviteTKN,
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
          }
        } else if (storedinviteTKN || tkn) {
          async function testToken() {
            let results = await checkIfInviteTokenIsGood({
              token: tkn || storedinviteTKN,
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

    return () => {
      setInviteTKN(null);
    };
  }, [loading]);

  useEffect(() => {
    if (user?._id) {
      async function registerSW() {
        if (
          typeof navigator == "undefined" ||
          !("serviceWorker" in navigator)
        ) {
          return;
        }

        try {
          const swReg = await navigator?.serviceWorker.register("/sw.js");
          const sub = await swReg.pushManager.getSubscription();
          if (sub === null) {
            const vapidPublicKey =
              "BLmVZKPUxgCfITiXnsBehXwxHGXXOhDoTSBsQYgEu21Gn6kTicS0viMLkjpyAiP5ewX9xS-jQ3GreXB3-eO0tMA";
            const convertedVapidPublicKey =
              urlBase64ToUint8Array(vapidPublicKey);
            const newSub = await swReg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidPublicKey,
            });
            saveUserSubscription({
              sub: newSub,
              userId: user._id,
            });
          }
        } catch (error) {
          console.error(error);
        }
      }

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, [user]);

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

    if (gather_window) {
      return <CommsProvider>{page}</CommsProvider>;
    } else {
      return (
        <CommsProvider>
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
                    console.log(ok, comms, "test");
                    console.log(!ok, !comms, !comms.length);
                    if (!ok || !comms || !comms.length) {
                      setShowCreateHarthNameModal(true);
                    } else {
                      setShowCreateHarthNameModal(false);
                    }
                  }}
                  submitHandler={harthNameCreationHandler}
                />
              ) : null}
              {showCreateHarthProfileModal ? (
                <CreateHarthProfile
                  talkingHeadMsg={`Enter the name you would like to be called in ${newHarth.name}. Don't forget to add a picture.`}
                  footer="Tip: Since each härth has a unique avatar, choose one that represents who you want to be for this härth."
                  placeholder="avatar name"
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
                  talkingHeadMsg={`Enter the name you would like to be called in ${invitedHarth.name}. Don't forget to add a picture.`}
                  footer="Tip: Since each härth has a unique avatar, choose one that represents who you want to be for this härth."
                  //placeholder={`${"First Name"}`}
                  placeholder="avatar name"
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
        </CommsProvider>
      );
    }
  }
  return <SpinningLoader />;
};

export default dashboard;
