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
import { TourProvider } from "contexts/tour";
import TourComponent from "components/TourComponent/TourComponent";
import WelcomePage from "components/WelcomePage/WelcomePage";
import { Modal } from "Common";
import CreateHarthTopicStep from "components/createHarthTopicStep/createHarthTopicStep";
import CreateHarthProfile from "components/createHarthProfile/createHarthProfile";
import CreateHarthName from "components/createHarthName/createHarthName";
import HarthInviteAcceptModal from "components/harthInviteAcceptModal/harthInviteAcceptModal";

/* eslint-disable */

const DashboardLayout = dynamic(
  () => import("components/DashboardLayout/DashboardLayout"),
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
  const [invitedSender, setInvitedSender] = useState(null);
  const [showInviteProfileModal, setShowInviteProfileModal] = useState(false);
  const [inviteTKN, setInviteTKN] = useState(false);
  const [showNotButton, setShowNotButton] = useState(false);
  const [hasNotificationsDisabled, setHasNotificationsDisabled] =
    useState(false);
  const [keepSpinning, setKeepSpinning] = useState(true);
  const [showCreateHarthTopicModal, setShowCreateHarthTopicModal] =
    useState(false);

  const [IOSDeviceToken, setIOSDeviceToken] = useState(null);

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

  const [allowPastWelcome, setAllowPastWelcome] = useState(false);

  const [
    finishedNotificationChecksApproved,
    setFinishedNotificationChecksApproved,
  ] = useState(false);
  const [
    firstHarthOrInviteChecksApproved,
    setFirstHarthOrInviteChecksApproved,
  ] = useState(false);

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
    if (typeof window !== "undefined") {
      window.receiveDeviceToken = function (deviceToken) {
        setIOSDeviceToken(deviceToken);
      };
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
        } else {
          setFinishedNotificationChecksApproved(true);
        }
      } else {
        setFinishedNotificationChecksApproved(true);
      }
    }

    function saveCurrentSubscription(subscription, isIOSInstall) {
      let deviceKey = localStorage.getItem("deviceKey");
      if (!deviceKey) {
        deviceKey = generateID();
        localStorage.setItem("deviceKey", deviceKey);
      }
      setFinishedNotificationChecksApproved(true);
      saveUserSubscription({
        sub: subscription,
        userId: user._id,
        deviceKey,
        isIOSInstall,
      });
    }

    function showNotificationButtonIfNotDenied() {
      const hasDeniedNotifications = localStorage.getItem(
        "hasDeniedNotifications"
      );
      if (!hasDeniedNotifications) {
        setShowNotButton(true);
      } else {
        setFinishedNotificationChecksApproved(true);
      }
    }

    async function handleIOSWebViewSubscription() {
      if (
        IOSDeviceToken &&
        (!SUBSCRIPTION || IOSDeviceToken !== SUBSCRIPTION.sub)
      ) {
        saveCurrentSubscription(IOSDeviceToken, true);
      } else if (!IOSDeviceToken) {
        requestIOSPushPermission();
      } else {
        setFinishedNotificationChecksApproved(true);
      }
    }

    if (firstHarthOrInviteChecksApproved) {
      const isIOSWebView =
        typeof window !== "undefined" && window.isIOSWebView === true;

      if (!isIOSWebView) {
        checkSubscription();
      } else {
        handleIOSWebViewSubscription();
      }
    }
  }, [
    swReg,
    user,
    SUBSCRIPTION,
    firstHarthOrInviteChecksApproved,
    IOSDeviceToken,
  ]);

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

      let prevPage = localStorage.getItem("selectedPage") || "chat";
      let page = openFromPush && type ? type : prevPage;
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
            setInvitedSender({ ...results?.sender });
            setShowInviteAcceptModal(true);
          } else {
            localStorage.removeItem("inviteToken");
            setInviteTKN(null);
            setShowInviteAcceptModal(false);
            if (!user.comms || user?.comms.length == 0) {
              setShowCreateHarthNameModal(true);
            } else {
              setShowCreateHarthNameModal(false);
              setFirstHarthOrInviteChecksApproved(true);
            }
            router.push(router.pathname, undefined, { shallow: true });
          }
        }
        testToken();
      } else if (!user.comms || user?.comms.length == 0) {
        setShowCreateHarthNameModal(true);
      } else {
        if (showCreateHarthNameModal) {
          setShowCreateHarthNameModal(false);
        }
        setFirstHarthOrInviteChecksApproved(true);
      }
    }

    return () => {
      setInviteTKN(null);
      setShowCreateHarthNameModal(false);
      setInvitedHarth(null);
      setInvitedSender(null);
    };
  }, [loading]);

  const requestIOSPushPermission = () => {
    if (
      window &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.pushPermissionRequest
    ) {
      window.webkit.messageHandlers.pushPermissionRequest.postMessage(null);
    }
  };

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
    setFinishedNotificationChecksApproved(true);
  };
  const requestNotificationPermisson = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        subcribeToPushService();
      } else {
        setHasNotificationsDisabled(true);
        setFinishedNotificationChecksApproved(true);
      }
    } catch (error) {
      console.log(error);
      setHasNotificationsDisabled(true);
      setFinishedNotificationChecksApproved(true);
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
    setShowCreateHarthProfileModal(true);
    setTimeout(() => {
      setShowCreateHarthNameModal(false);
    }, 200);
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
    }
  };
  const resetNewInviteHarth = () => {
    localStorage.removeItem("inviteToken");
    setInvitedHarth(null);
    setInvitedSender(null);
    setShowInviteProfileModal(false);
    setShowInviteAcceptModal(false);
  };
  const goodInviteHandler = (harth) => {
    setInvitedHarth({ ...harth });
    setShowInviteProfileModal(true);
    setTimeout(() => {
      setShowInviteAcceptModal(false);
    }, 200);
  };
  const toggleNoHarthDetected = (bool) => {
    if (bool) {
      setShowCreateHarthNameModal(true);
    }
  };
  const refuseNotifcations = () => {
    localStorage.setItem("hasDeniedNotifications", true);
    setShowNotButton(false);
    setFinishedNotificationChecksApproved(true);
  };
  const toggleAllowPastWelcome = () => {
    setAllowPastWelcome(true);
  };
  const signOutHandler = () => {
    localStorage.removeItem("token");
    window.location.pathname = "/";
  };
  const backToHarthNameModal = () => {
    setShowCreateHarthNameModal(true);
    setTimeout(() => {
      setShowCreateHarthProfileModal(false);
    }, 200);
  };
  const backToInviteNameModal = () => {
    setShowInviteAcceptModal(true);
    setTimeout(() => {
      setShowInviteProfileModal(false);
    }, 200);
  };

  if (loading) {
    return <SpinningLoader />;
  }

  if (user) {
    const shouldSkipWelcomePage = user && user.comms && user.comms.length > 0;

    if (!shouldSkipWelcomePage && !allowPastWelcome) {
      return (
        <Modal onToggleModal={() => {}}>
          <WelcomePage
            submitHandler={toggleAllowPastWelcome}
            signOutHandler={signOutHandler}
          />
        </Modal>
      );
    } else if (currentPage) {
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
            initialLoadAllGood={
              firstHarthOrInviteChecksApproved &&
              (user.firstUseTourApproved || finishedNotificationChecksApproved)
            }
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
                    talkingHeadMsg="give your group a name and upload an image that represents it"
                    footer="Don't stress. You can change your group name and image at any time."
                    placeholder="greedy gamers, spellslingers, etc..."
                    submitText="Next"
                    closeHandler={async () => {
                      let result = await getComms(user);
                      const { ok, comms } = result;
                      if (!ok || !comms || !comms.length) {
                        setShowCreateHarthNameModal(true);
                      } else {
                        setFirstHarthOrInviteChecksApproved(true);
                        setShowCreateHarthNameModal(false);
                      }
                    }}
                    changeCancelToBack={user?.comms?.length ? false : true}
                    submitHandler={harthNameCreationHandler}
                    backHandler={
                      user?.comms?.length
                        ? null
                        : () => {
                            setAllowPastWelcome(false);
                          }
                    }
                    ignoreFadeIn={true}
                    backgroundColor={"purple"}
                  />
                ) : null}
                {showCreateHarthProfileModal ? (
                  <CreateHarthProfile
                    talkingHeadMsg={`Tell me what you want to be called in this group`}
                    footer="You have a different name and profile image for every group you join"
                    placeholder="your name"
                    submitText="Create"
                    submitHandler={() => {
                      setShowCreateHarthTopicModal(true);
                      setTimeout(() => {
                        setFirstHarthOrInviteChecksApproved(true);
                        resetNewHarth();
                      }, 200);
                    }}
                    harth={newHarth}
                    ignoreFadeIn={true}
                    flowStepCount="3"
                    backgroundColor={"purple"}
                    backHandler={backToHarthNameModal}
                  />
                ) : null}
                {showCreateHarthTopicModal ? (
                  <CreateHarthTopicStep
                    submitHandler={() => {
                      setShowCreateHarthTopicModal(false);
                    }}
                    harth={newHarth}
                    ignoreFadeIn={true}
                    flowStepCount="3"
                    backgroundColor={"purple"}
                    closeHandler={() => setShowCreateHarthTopicModal(false)}
                  />
                ) : null}
                {showInviteAcceptModal ? (
                  <HarthInviteAcceptModal
                    talkingHeadMsg="Remember to only accept invites from people you know"
                    footer=""
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
                      } else {
                        setFirstHarthOrInviteChecksApproved(true);
                      }
                    }}
                    invitedHarth={invitedHarth}
                    invitedSender={invitedSender}
                    ignoreFadeIn={true}
                  />
                ) : null}
                {showInviteProfileModal ? (
                  <CreateHarthProfile
                    header="harth"
                    talkingHeadMsg={`Tell me what you want to be called in this group`}
                    footer="You have a different name and profile image for every group you join"
                    placeholder="your name"
                    submitText="Join"
                    submitHandler={() => {
                      setFirstHarthOrInviteChecksApproved(true);
                      resetNewInviteHarth();
                    }}
                    harth={invitedHarth}
                    invite={true}
                    closeHandler={async () => {
                      resetNewInviteHarth();
                      window.history.replaceState(null, null, "/");
                      let result = await getComms(user);
                      const { ok, comms } = result;
                      if (!ok || !comms || !comms.length) {
                        toggleNoHarthDetected(true);
                      } else {
                        setFirstHarthOrInviteChecksApproved(true);
                      }
                    }}
                    ignoreFadeIn={true}
                    flowStepCount="2"
                    backgroundColor={"purple"}
                    backHandler={backToInviteNameModal}
                  />
                ) : null}

                <TourProvider>
                  <TourComponent />
                  <DashboardLayout
                    changePage={changePageHandler}
                    currentPage={currentPage}
                    setShowCreateHarthNameModal={setShowCreateHarthNameModal}
                    user={user}
                    toggleNoHarthDetected={toggleNoHarthDetected}
                    swReg={swReg}
                  >
                    {page}
                  </DashboardLayout>
                </TourProvider>
              </VideoProvider>
            </SocketProvider>
          </CommsProvider>
        </>
      );
    } else {
      return null;
    }
  }

  return null;
};

export default dashboard;
