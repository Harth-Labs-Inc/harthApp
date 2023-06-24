import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { SpinningLoader } from "components/Common/SpinningLoader/SpinningLoader";
import { sendWelcomeEmailToUser } from "requests/userApi";
import { checkIfInviteTokenIsGood, getComms } from "requests/community";
import { VideoProvider } from "contexts/video";
import { CommsProvider } from "contexts/comms";
import { SocketProvider } from "contexts/socket";
import { urlBase64ToUint8Array } from "services/helper";
import { saveUserSubscription } from "../requests/subscriptions";
import { AuthProvider } from "contexts/auth";
import Cookies from "js-cookie";

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

const dashboard = ({
  badAuth,
  redirectDestination,
  user,
  commsProps,
  selectedCommProp,
  topicsArr,
  roomsArr,
  creator,
  unreadMsgs,
  scheduledRooms,
}) => {
  useEffect(() => {
    if (badAuth) {
      window.location.replace(redirectDestination);
    }
  }, [badAuth]);

  if (!badAuth) {
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
    const [swReg, setSwReg] = useState(null);

    const router = useRouter();
    const {
      query: { tkn, gather_window, room_type },
    } = router;

    let prevPage = Cookies.get("selectedPage");
    let page;
    if (gather_window) {
      page = room_type;
    } else if (prevPage) {
      page = prevPage;
    } else {
      page = "chat";
    }
    const [currentPage, setCurrentPage] = useState(page);

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
        window.removeEventListener("contextmenu", () => {});
        window.removeEventListener("online", handleNetworkChange);
        window.removeEventListener("offline", handleNetworkChange);
        setSwReg(null);
      };
    }, []);

    useEffect(() => {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const gatherWindow = urlParams.get("gather_window");
      const roomType = urlParams.get("room_type");

      let storedinviteTKN = localStorage.getItem("inviteToken");
      if (storedinviteTKN) {
        setInviteTKN(storedinviteTKN);
      }

      if (roomType) {
        changePageHandler(roomType);
      } else {
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
                localStorage.removeItem("inviteToken");
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
              localStorage.removeItem("inviteToken");
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

      return () => {
        setInviteTKN(null);
      };
    }, [user]);

    useEffect(() => {
      if (swReg && "pushManager" in swReg) {
        async function subscribePushServer() {
          try {
            const sub = await swReg.pushManager.getSubscription();
            if (sub === null) {
              const permission = await Notification.requestPermission();
              if (permission === "granted") {
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
            }
          } catch (error) {
            console.error(error);
          }
        }

        subscribePushServer();
      }
    }, [swReg]);

    const changePageHandler = (pg) => {
      if (["gather", "chat", "message"].includes(pg)) {
        localStorage.setItem("selectedPage", pg);
        Cookies.set("selectedPage", pg);
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
    if (currentPage) {
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
        case "party":
          const DynamicParty = dynamic(() => import("./dashboard/party"), {
            loading: () => null,
          });
          page = DynamicParty ? <DynamicParty /> : null;
          break;
        case "voice":
          const DynamicVoice = dynamic(() => import("./dashboard/voice"), {
            loading: () => null,
          });
          page = DynamicVoice ? <DynamicVoice /> : null;
          break;
        case "stream":
          const DynamicStream = dynamic(() => import("./dashboard/stream"), {
            loading: () => null,
          });
          page = DynamicStream ? <DynamicStream /> : null;
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

      if (gather_window) {
        return (
          <AuthProvider user={user}>
            <CommsProvider
              user={user}
              commsProps={commsProps}
              selectedCommProp={selectedCommProp}
              topicsArr={topicsArr}
              roomsArr={roomsArr}
              creator={creator}
            >
              {page}
            </CommsProvider>
          </AuthProvider>
        );
      } else {
        return (
          <AuthProvider user={user}>
            <CommsProvider
              user={user}
              commsProps={commsProps}
              selectedCommProp={selectedCommProp}
              topicsArr={topicsArr}
              roomsArr={roomsArr}
              creator={creator}
            >
              <SocketProvider
                swReg={swReg}
                user={user}
                unreadMsgsProps={unreadMsgs}
              >
                <VideoProvider scheduledRoomProps={scheduledRooms}>
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
                    user={user}
                    changePage={changePageHandler}
                    currentPage={currentPage}
                    setShowCreateHarthNameModal={setShowCreateHarthNameModal}
                    toggleNoHarthDetected={toggleNoHarthDetected}
                    selectedCommProp={selectedCommProp}
                  >
                    {page}
                  </DashboardLayout>
                </VideoProvider>
              </SocketProvider>
            </CommsProvider>
          </AuthProvider>
        );
      }
    }
  }
  return <SpinningLoader />;
};
export async function getServerSideProps(context) {
  const { req } = context;
  const { cookie } = req.headers;
  const cookies = parseCookies(cookie);
  const { authToken, selectedHarthID } = cookies;
  const { url } = req;
  const [_, queryString] = url.split("?");
  const search = queryString ? `?${queryString}` : "";
  const redirectDestination = "/auth/createAccount" + search;

  if (!authToken) {
    return {
      props: {
        badAuth: true,
        redirectDestination: redirectDestination,
      },
    };
  }
  const mongo = require("mongodb");
  const jwt = require("jsonwebtoken");
  const decode = (tokn) => {
    return new Promise((resolve, reject) => {
      resolve(jwt.verify(tokn, process.env.SECRET));
    });
  };
  let decodedToken;
  try {
    decodedToken = await decode(authToken);
  } catch (error) {
    return {
      props: {
        badAuth: true,
        redirectDestination: redirectDestination,
      },
    };
  }

  let { userId } = decodedToken;
  if (!userId) {
    return {
      props: {
        badAuth: true,
        redirectDestination: redirectDestination,
      },
    };
  }

  const clientPromise = require("util/mongodb").default;
  const client = await clientPromise;
  const db = client.db("blarg");

  const findUser = (db, id) => {
    return new Promise((resolve, reject) => {
      let o_id = new mongo.ObjectId(id);
      db.collection("users")
        .find({ _id: o_id })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results[0]);
        });
    });
  };

  let user = await findUser(db, userId);
  if (
    !user ||
    user.token !== authToken ||
    new Date() > new Date(user.token_expiration)
  ) {
    return {
      props: {
        badAuth: true,
        redirectDestination: redirectDestination,
      },
    };
  }

  user._id = user._id.toString();

  const getComms = (db, ids) => {
    return new Promise((resolve, reject) => {
      let oids = [];
      ids.forEach((id) => {
        oids.push(new mongo.ObjectId(id));
      });
      db.collection("communities")
        .find({ _id: { $in: oids } })
        .project({ invites: 0 })
        .toArray(function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results);
        });
    });
  };

  let comms = await getComms(db, user.comms);

  if (!comms) {
    return {
      props: {
        user: user ? JSON.parse(JSON.stringify(user)) : null,
        commsProps: [],
      },
    };
  }

  let selectedComm;
  if (selectedHarthID) {
    selectedComm = comms.find(
      (com) => com._id.toString() === selectedHarthID.toString()
    );
  } else {
    selectedComm = comms[0];
  }

  if (!selectedComm) {
    return {
      props: {
        user: JSON.stringify(user),
        commsProps: JSON.parse(JSON.stringify(comms)),
        selectedCommProp: {},
        topicsArr: [],
        roomsArr: [],
        creator: {},
        unreadMsgs: [],
        scheduledRooms: [],
      },
    };
  }

  let creator = selectedComm.users?.find(
    (usr) => usr.userId === user._id.toString()
  );
  if (!creator) {
    return {
      props: {
        user: user ? JSON.parse(JSON.stringify(user)) : null,
        commsProps: JSON.parse(JSON.stringify(comms)),
        selectedCommProp: JSON.parse(JSON.stringify(selectedComm)),
        topicsArr: [],
        roomsArr: [],
        creator: {},
        unreadMsgs: [],
        scheduledRooms: [],
      },
    };
  }

  const selectedID = selectedComm._id.toString();
  if (selectedID) {
    const getTopics = (id, usrId) => {
      return db
        .collection("topics")
        .find({ comm_id: id, members: { $elemMatch: { user_id: usrId } } })
        .toArray();
    };
    const getExistingUnreadMessages = (id) => {
      return db.collection("unread_messages").find({ user_id: id }).toArray();
    };
    const getScheduledCallRooms = (id) => {
      return db.collection("rooms").find({ harthId: id }).toArray();
    };
    const [topics, unreadResult, scheduleResult] = await Promise.all([
      getTopics(selectedID, user._id),
      getExistingUnreadMessages(user._id),
      getScheduledCallRooms(selectedID),
    ]);

    const { data: unreadMsgs } = unreadResult || { data: [] };
    const { rms: scheduledRooms } = scheduleResult || { rms: [] };

    const props = {
      user: user ? JSON.parse(JSON.stringify(user)) : null,
      commsProps: JSON.parse(JSON.stringify(comms)),
      selectedCommProp: JSON.parse(JSON.stringify(selectedComm)),
      topicsArr: JSON.parse(JSON.stringify(topics || [])),
      roomsArr: JSON.parse(JSON.stringify(scheduledRooms || [])),
      creator: JSON.parse(JSON.stringify(creator || {})),
      unreadMsgs: JSON.parse(JSON.stringify(unreadMsgs || [])),
      scheduledRooms: JSON.parse(JSON.stringify(scheduledRooms || [])),
    };

    return { props };
  }
  const props = {
    user,
    commsProps: [],
    selectedCommProp: {},
    topicsArr: [],
    roomsArr: [],
    creator: {},
    unreadMsgs: [],
    scheduledRooms: [],
  };
  return {
    props,
  };
}
function parseCookies(cookieString) {
  const cookies = {};
  if (cookieString) {
    const cookieArr = cookieString.split(";");
    cookieArr.forEach((cookie) => {
      const [name, value] = cookie.split("=");
      const trimmedName = name.trim();
      cookies[trimmedName] = decodeURIComponent(value);
    });
  }
  return cookies;
}
export default dashboard;
