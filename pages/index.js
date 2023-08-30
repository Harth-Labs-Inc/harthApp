import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { SpinningLoader } from "components/Common/SpinningLoader/SpinningLoader";
import { sendWelcomeEmailToUser } from "requests/userApi";
import { checkIfInviteTokenIsGood, getComms } from "requests/community";
import { VideoProvider } from "contexts/video";
import { CommsProvider } from "contexts/comms";
import { SocketProvider } from "contexts/socket";
import { useAuth } from "contexts/auth";
import { generateID, urlBase64ToUint8Array } from "services/helper";
import { saveUserSubscription } from "requests/subscriptions";
import { SetNotifications } from "components/Alerts/SetNotifications/SetNotifications";

/* eslint-disable */

const DashboardLayout = dynamic(
  () => import("components/DashboardLayout/DashboardLayout"),
  {
    loading: () => null,
  }
);
const CreateHarthName = dynamic(
  () => import("components/createHarthName/createHarthName"),
  {
    loading: () => null,
  }
);
const CreateHarthProfile = dynamic(
  () => import("components/createHarthProfile/createHarthProfile"),
  {
    loading: () => null,
  }
);
const HarthInviteAcceptModal = dynamic(
  () => import("components/harthInviteAcceptModal/harthInviteAcceptModal"),
  {
    loading: () => null,
  }
);

const dashboard = () => {
  const [swReg, setSwReg] = useState(null);
  const [invitedHarth, setInvitedHarth] = useState(null);
  const [newHarth, setNewHarth] = useState(null);
  const [showCreateHarthNameModal, setShowCreateHarthNameModal] =
    useState(false);
  const [showCreateHarthProfileModal, setShowCreateHarthProfileModal] =
    useState(false);
  const [showInviteAcceptModal, setShowInviteAcceptModal] = useState(false);
  const [showInviteProfileModal, setShowInviteProfileModal] = useState(false);
  const [inviteTKN, setInviteTKN] = useState(false);
  const [showNotButton, setShowNotButton] = useState(false);
  const [hasNotificationsDisabled, setHasNotificationsDisabled] =
    useState(false);
  const [keepSpinning, setKeepSpinning] = useState(true);

  const {
    user,
    loading,
    Comms,
    CREATOR,
    SELECTEDCOMM,
    TOPICS,
    Conversations,
    SUBSCRIPTION,
  } = useAuth();

  const router = useRouter();
  const {
    query: { tkn, openFromPush, type },
  } = router;

  const [currentPage, setCurrentPage] = useState(null);

  useEffect(() => {
    if (navigator && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          setSwReg(registration);
        })
        .catch((err) => {
          console.log(err);
          setSwReg({});
        });
    }
    function handleNetworkChange() {
      if (navigator && navigator.onLine) {
        location.reload();
      }
    }
    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);
    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
      setSwReg(null);
    };
  }, []);

  useEffect(() => {
    async function checkSubscription() {
      if (swReg && "pushManager" in swReg && user) {
        const subscription = await swReg.pushManager.getSubscription();

        if (
          subscription &&
          (!SUBSCRIPTION || subscription.endpoint !== SUBSCRIPTION.sub.endpoint)
        ) {
          saveCurrentSubscription(subscription);
        } else if (!subscription) {
          showNotificationButtonIfNotDenied();
        }
      }
    }

    function saveCurrentSubscription(subscription) {
      let deviceKey = localStorage.getItem("deviceKey");
      if (!deviceKey) {
        deviceKey = generateID();
        localStorage.setItem("deviceKey", deviceKey);
      }
      saveUserSubscription({
        sub: subscription,
        userId: user._id,
        deviceKey,
      });
    }

    function showNotificationButtonIfNotDenied() {
      const hasDeniedNotifications = localStorage.getItem(
        "hasDeniedNotifications"
      );
      if (!hasDeniedNotifications) {
        setShowNotButton(true);
      }
    }

    checkSubscription();
  }, [swReg, user, SUBSCRIPTION]);

  useEffect(() => {
    let storedinviteTKN = localStorage.getItem("inviteToken");
    if (storedinviteTKN) {
      setInviteTKN(storedinviteTKN);
    }

    if (!loading && user) {
      let shouldOpenFromPush = new URL(window?.location.href).searchParams.get(
        "openFromPush"
      );
      if (!shouldOpenFromPush) {
        setKeepSpinning(false);
      } else if (shouldOpenFromPush && !keepSpinning) {
        setKeepSpinning(true);
      }

      let prevPage = localStorage.getItem("selectedPage");
      let page = prevPage || "chat";
      if (openFromPush && type) {
        page = type;
      }
      changePageHandler(page);

      const showFirstTimeUser = localStorage.getItem("showFirstTimeUser");
      if (showFirstTimeUser) {
        sendWelcomeEmailToUser({
          user,
          subject: "Welcome To Härth",
        });
        localStorage.removeItem("showFirstTimeUser");
      }

      if (storedinviteTKN || tkn) {
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
            localStorage.removeItem("inviteToken");
            setInviteTKN(null);
            setShowInviteAcceptModal(false);
            if (!user.comms || user?.comms.length == 0) {
              setShowCreateHarthNameModal(true);
            } else {
              setShowCreateHarthNameModal(false);
            }
          }
        }
        testToken();
      } else if (!user.comms || user?.comms.length == 0) {
        setShowCreateHarthNameModal(true);
      } else {
        if (showCreateHarthNameModal) {
          setShowCreateHarthNameModal(false);
        }
      }
    }

    return () => {
      setInviteTKN(null);
      setShowCreateHarthNameModal(false);
      setInvitedHarth(null);
    };
  }, [loading]);

  const subcribeToPushService = async () => {
    const existingSubscription = await swReg.pushManager.getSubscription();

    if (existingSubscription) {
      await existingSubscription.unsubscribe();
    }

    const vapidPublicKey =
      "BNxESwOfseEuMPBHwc_vwFox8oJ_SjmrFZ_hkcCX9wx9iS7hc120NxGS4twGAhBXvxqbUFUuigykVWFHiYOP8Mg";
    const convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
    const newSub = await swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidPublicKey,
    });
    let deviceKey = generateID();
    localStorage.setItem("deviceKey", deviceKey);
    saveUserSubscription({
      sub: newSub,
      userId: user._id,
      deviceKey,
    });
    setShowNotButton(false);
  };
  const requestNotificationPermisson = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        subcribeToPushService();
      } else {
        setHasNotificationsDisabled(true);
      }
    } catch (error) {
      console.log(error);
      setHasNotificationsDisabled(true);
    }
  };
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
    localStorage.removeItem("inviteToken");
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
  const refuseNotifcations = () => {
    localStorage.setItem("hasDeniedNotifications", true);
    setShowNotButton(false);
  };

  if (loading) {
    return <SpinningLoader />;
  }
  if (user && currentPage) {
    let page;
    switch (currentPage) {
      case "chat":
        const DynamicChat = dynamic(() => import("./dashboard/chat"), {
          loading: () => null,
        });
        page = DynamicChat ? <DynamicChat /> : null;
        break;
      case "gather":
        const DynamicVideo = dynamic(() => import("./dashboard/video"), {
          loading: () => null,
        });
        page = DynamicVideo ? <DynamicVideo /> : null;
        break;
      case "message":
        const DynamicMessage = dynamic(() => import("./dashboard/message"), {
          loading: () => null,
        });
        page = DynamicMessage ? <DynamicMessage /> : null;
        break;
      default:
        page = null;
        break;
    }

    return (
      <>
        {keepSpinning ? (
          <div id="pushSpinner">
            <SpinningLoader />
          </div>
        ) : null}
        <CommsProvider
          keepSpinning={keepSpinning}
          CommsArr={Comms}
          CREATOR={CREATOR}
          SELECTEDCOMM={SELECTEDCOMM}
          TOPICS={TOPICS}
          currentPage={currentPage}
          ConversationsArray={Conversations}
        >
          {showNotButton ? (
            <SetNotifications
              permissionDenied={hasNotificationsDisabled}
              request={requestNotificationPermisson}
              refuseNotifcations={refuseNotifcations}
            />
          ) : null}

          <SocketProvider swReg={swReg}>
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
                    window.history.replaceState(null, null, "/");
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
                  placeholder="avatar name"
                  submitText="Join"
                  submitHandler={resetNewInviteHarth}
                  harth={invitedHarth}
                  invite={true}
                  closeHandler={async () => {
                    resetNewInviteHarth();
                    window.history.replaceState(null, null, "/");
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
      </>
    );
  }
  return null;
};

export default dashboard;
