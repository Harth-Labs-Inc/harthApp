import {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import io from "socket.io-client";
import { useAuth } from "./auth";
import { useComms } from "./comms";
import {
  getTopics,
  getExistingUnreadMessages,
  getExistingUnreadConvMessages,
  getHarthByID,
  checkForAdminReports,
} from "../requests/community";
import { saveNewRelicEvent } from "../requests/newRelic";
import { getConversations } from "../requests/conversations";

import { socketUrls } from "../constants/urls";
import {
  replaceHarthChatProfileNames,
  replaceHarthChatProfileIcons,
} from "requests/chat";

const SocketContext = createContext({});

// -------------------- update version here ------------------------------------------------------------------------------
const APP_VERSION = "1.1.2";
// -----------------------------------------------------------------------------------------------------------------------

/* eslint-disable */
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const [finalMessageForPreview, setFinalMessageForPreview] = useState({});
  const [incomingMsg, setIncomingMsg] = useState({});
  const [incomingMsgPreview, setIncomingMsgPreview] = useState({});
  const [incomingMsgUpdate, setIncomingMsgUpdate] = useState({});
  const [incomingRoomUpdate, setIncomingRoomUpdate] = useState({});
  const [incomingTopic, setIncomingTopic] = useState({});
  const [incomingRoom, setIncomingRoom] = useState({});
  const [unreadMsg, setUnreadMsg] = useState({});
  const [unusedValue, triggerUpdate] = useState(0);
  const [mainAlerts, setMainAlerts] = useState({});
  const [reconnected, setReconnected] = useState(false);
  const [ispullingUnreads, setIspullingUnreads] = useState(false);
  const [showHasUpdateButton, setShowHasUpdateButton] = useState(false);
  const [showAdminReportIcon, setShowAdminReportIcon] = useState(false);

  const { user, setContextUser } = useAuth();
  const {
    setTopics,
    setSelectedTopic,
    comms,
    setComm,
    refetchComms,
    selectedcomm,
    setConversations,
    setIncomingConversationMessagesHandler,
    setIncomingConversationMsgUpdate,
    setProfile,
    profileRef,
    fetchConversations,
    changeSelectedCommFromChild,
    selectedCommRef,
    setSelectedcomm,
    profile,
  } = useComms();

  const socketRef = useRef(null);
  const selectedHarthRef = useRef();
  const unreadMessagesRef = useRef([]);
  const unreadConvMessagesRef = useRef([]);
  const newMessageIndicators = useRef({});
  const mainAlertsRef = useRef({});

  // ------------------------ socket connection logic --------------------------------

  const INITIAL_RECONNECT_INTERVAL = 500;
  let currentReconnectInterval = INITIAL_RECONNECT_INTERVAL;
  const MAX_RECONNECT_INTERVAL = 1500;

  let isReconnecting = false;
  let ispullingVersioning = false;
  // let isCacheUpdateScheduled = false;

  const connectSocket = useCallback(() => {
    if (document.hidden || !user || !navigator.onLine) return;
    isReconnecting = true;
    const token = localStorage.getItem("token");
    const URL = socketUrls[process.env.NODE_ENV];

    disconnectSocket();

    const tempSocket = io.connect(URL, {
      transports: ["websocket"],
      query: { token },
      reconnection: false,
    });

    tempSocket.on("connect", () => {
      if (document.hidden) {
        tempSocket.close();
        return;
      }

      socketRef.current = tempSocket;
      setSocket(tempSocket);
      setReconnected((prev) => !prev);
      setupListeners(tempSocket, user);
      // checkForCacheUpdate();
      isReconnecting = false;
      currentReconnectInterval = INITIAL_RECONNECT_INTERVAL;
      if (user) {
        const timestamp = new Date();
        saveNewRelicEvent("activeUserConnect", {
          userId: user._id,
          createdAt: timestamp.toISOString(),
        });
      }
    });

    const handleErrorOrDisconnect = (message) => {
      isReconnecting = false;
      disconnectSocket();
      setTimeout(() => {
        tryReconnect();
      }, currentReconnectInterval);
      currentReconnectInterval = Math.min(
        currentReconnectInterval * 2,
        MAX_RECONNECT_INTERVAL
      );
    };

    tempSocket.on("connect_error", (error) => {
      handleErrorOrDisconnect("Connection error: " + error);
    });
    tempSocket.on("error", (err) => {
      handleErrorOrDisconnect("Socket encountered an error: " + err);
    });
    tempSocket.on("disconnect", (reason) => {
      handleErrorOrDisconnect("Socket disconnected due to: " + reason);
    });

    return tempSocket;
  }, [user]);

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  const tryReconnect = useCallback(() => {
    if (
      !isReconnecting &&
      !document.hidden &&
      user &&
      navigator.onLine &&
      !socketRef.current?.connected
    ) {
      rebuildData(true);
      connectSocket();
    }
  }, [connectSocket]);

  useEffect(() => {
    if (user) {
      fetchUnreadData(user);
      connectSocket();

      function handleChange() {
        tryReconnect();
        // if (!isCacheUpdateScheduled) {
        //   isCacheUpdateScheduled = true;
        //   requestAnimationFrame(() => {
        //     checkForCacheUpdate();
        //     isCacheUpdateScheduled = false;
        //   });
        // }
      }

      window.addEventListener("visibilitychange", handleChange);
      window.addEventListener("online", handleChange);
      window.addEventListener("focus", handleChange);
      return () => {
        window.removeEventListener("visibilitychange", handleChange);
        window.removeEventListener("online", handleChange);
        window.addEventListener("focus", handleChange);
        disconnectSocket();
      };
    }
  }, [connectSocket, tryReconnect, user]);

  // ------------------------ socket logic --------------------------------

  useEffect(() => {
    if (selectedcomm) {
      selectedHarthRef.current = selectedcomm;
    }
  }, [selectedcomm]);

  useEffect(() => {
    if (socket?.connected) {
      join([...(comms || [])]);
    }
  }, [comms, socket?.connected, reconnected]);

  const pullForIcon = async () => {
    const isAdmin = profile?.admin || profile?.owner || false;

    if (isAdmin) {
      if (selectedcomm?._id) {
        const { ok } = await checkForAdminReports({
          comm_id: selectedcomm._id,
        });
        setShowAdminReportIcon(!!ok);
      }
    } else {
      setShowAdminReportIcon(false);
    }
  };
  const setupListeners = (socket, user) => {
    if (!socket || !user) return;
    socket.off("new update");
    socket.on("new update", async ({ updateType, ...incomingUpdate }) => {
      let activeTopicId = localStorage.getItem("selectedTopicId");
      switch (updateType) {
        case "new message":
          if (
            incomingUpdate.creator_id !== user._id ||
            incomingUpdate.socketID !== socket.id
          ) {
            const blockedUserIds = user.BlockedList
              ? user.BlockedList.map((blocked) => blocked.userId)
              : [];

            if (!blockedUserIds.includes(incomingUpdate.creator_id)) {
              setIncomingMsg(incomingUpdate);
              getExistingUnreadMessages(user._id).then((results) => {
                const { data } = results;

                if (data && data.length) {
                  const hasMatchingCommId = data.some(
                    (message) => message.comm_id === selectedCommRef.current._id
                  );

                  if (hasMatchingCommId) {
                    setNewAlerts(incomingUpdate, "chat");
                  }
                }
              });
            }
          }
          break;
        case "message update":
          const blockedUserIdstemp = user.BlockedList
            ? user.BlockedList.map((blocked) => blocked.userId)
            : [];

          if (!blockedUserIdstemp.includes(incomingUpdate.creator_id)) {
            setIncomingMsgUpdate(incomingUpdate);
            setNewAlerts(incomingUpdate, "chat");
            if (
              selectedCommRef.current?._id == incomingUpdate.comm_id &&
              incomingUpdate.flagged &&
              !incomingUpdate.approvedByAdmin &&
              !incomingUpdate.approvedByAdminKeepBlurred &&
              (profileRef?.owner || profileRef?.admin)
            ) {
              setShowAdminReportIcon(true);
            }
          }

          break;
        case "message profile icon update":
          if (incomingUpdate.userid == user._id && profileRef) {
            setProfile({
              ...profileRef,
              iconKey: incomingUpdate.newIconKey,
            });
          }
          let elements = document.getElementsByClassName(
            `${incomingUpdate?.harthid}_${incomingUpdate?.userid}`
          );
          for (let imgELement of elements) {
            imgELement.setAttribute(
              "src",
              incomingUpdate.newIconKey + "?timestamp=" + new Date().getTime()
            );
          }
          break;
        case "message profile name update":
          if (incomingUpdate.userid == user._id && profileRef) {
            setProfile({
              ...profileRef,
              name: incomingUpdate.newName,
            });
          }
          let nameElements = document.getElementsByClassName(
            `${incomingUpdate?.harthid}_${incomingUpdate?.userid}_name`
          );
          for (let nameELement of nameElements) {
            nameELement.innerHTML = incomingUpdate?.newName;
          }
          break;
        case "new topic":
          let newTopicResult = await getTopics(
            incomingUpdate?.comm_id,
            user._id
          );
          if (newTopicResult.topics) {
            let filteredTopics = newTopicResult.topics.sort((a, b) => {
              const removeEmoji = (str) => {
                return str
                  .replace(
                    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
                    ""
                  )
                  .replace(/\s+/g, " ")
                  .trim();
              };
              const nameA = removeEmoji(a.title);
              const nameB = removeEmoji(b.title);

              if (nameA.toLowerCase() < nameB.toLowerCase()) {
                return -1;
              }
              if (nameA.toLowerCase() > nameB.toLowerCase()) {
                return 1;
              }

              return 0;
            });
            setTopics(filteredTopics);
          }

          break;
        case "topic deleted":
          let deleteResult = getTopics(incomingUpdate?.comm?._id, user._id);

          deleteResult.then(({ topics }) => {
            if (topics) {
              if (activeTopicId === incomingUpdate?.topic?._id) {
                setSelectedTopic(topics[0] || {});
              }
              setTopics(topics);
            }
          });

          break;
        case "topic edited":
          let editResult = await getTopics(incomingUpdate?.comm?._id, user._id);

          editResult?.topics?.filter(Boolean).forEach((topic) => {
            if (topic?._id === activeTopicId) {
              setSelectedTopic(topic);
            }
          });
          setTopics(editResult.topics);
          break;
        case "harth edited":
          refetchComms(incomingUpdate?.comm);
          break;
        case "harth deleted":
          refetchComms();

          break;
        case "selected harth reload":
          if (incomingUpdate?.comm._id == selectedHarthRef?.current?._id) {
            setComm(incomingUpdate?.comm);
          }
          break;
        case "selected user reload":
          if (incomingUpdate?.comm?.selectedUserID == user?._id) {
            refetchComms();
          }

          break;
        case "selected user full user reload":
          if (incomingUpdate?.userID == user?._id) {
            setContextUser(incomingUpdate?.newUser);
            partialReloadFromBlock();
          }

          break;
        case "new room":
          setIncomingRoom(incomingUpdate);
          break;
        case "room update":
          setIncomingRoomUpdate(incomingUpdate);
          break;
        case "new conversation":
          let isForYou = incomingUpdate.users?.find(
            (usr) => usr.userId == user._id
          );
          let shouldBeBlocked = false;

          const newblockedUserIds = user.BlockedList
            ? user.BlockedList.map((blocked) => blocked.userId)
            : [];
          const otherUsers = incomingUpdate.users?.filter(
            (u) => u.userId !== user._id.toString()
          );

          if (
            otherUsers.length === 1 &&
            newblockedUserIds.includes(otherUsers[0].userId)
          ) {
            shouldBeBlocked = true;
          }
          if (otherUsers.every((u) => newblockedUserIds.includes(u.userId))) {
            shouldBeBlocked = true;
          }
          if (isForYou && !shouldBeBlocked) {
            setNewAlerts(incomingUpdate, "message");
            let newConversationsResult = await getConversations(
              incomingUpdate?.harthId,
              user._id
            );
            setConversations(newConversationsResult.conversations);
          }
          break;
        case "new conversation message":
          if (incomingUpdate?.creator_type == "Admin") {
            fetchConversations(
              incomingUpdate?.harthId ||
                incomingUpdate?.comm_id ||
                selectedHarthRef.current._id
            );
          }
          const blockedUserIds = user.BlockedList
            ? user.BlockedList.map((blocked) => blocked.userId)
            : [];

          if (!blockedUserIds.includes(incomingUpdate.creator_id)) {
            if (
              (incomingUpdate.creator_id !== user._id ||
                incomingUpdate.socketID !== socket.id) &&
              incomingUpdate.userIDS?.includes(user._id)
            ) {
              setIncomingConversationMessagesHandler(incomingUpdate);
              setNewAlerts(incomingUpdate, "message");
            }
          }

          break;
        case "conversation message update":
          setIncomingConversationMsgUpdate(incomingUpdate);
          setNewAlerts(incomingUpdate, "message");
          if (
            selectedCommRef.current?._id == incomingUpdate.comm_id &&
            incomingUpdate.flagged &&
            !incomingUpdate.approvedByAdmin &&
            !incomingUpdate.approvedByAdminKeepBlurred &&
            (profileRef?.owner || profileRef?.admin)
          ) {
            setShowAdminReportIcon(true);
          }
          break;
        case "gather alert":
          setNewAlerts(incomingUpdate, "gather");

          break;
        case "userLeftConversation":
          break;
        case "reload unreads":
          getUnreadMessages(user);
          break;
        case "reload same User unreads":
          if (incomingUpdate.user_id === user._id) {
            getUnreadMessages(user);
          }
          break;
        case "reload conv unreads":
          getUnreadConvMessages(user);
          break;
        case "reload same User conv unreads":
          if (incomingUpdate.user_id === user._id) {
            getUnreadConvMessages(user);
          }
          break;
        case "new user joined":
          refetchComms();
          if (selectedCommRef.current?._id === incomingUpdate.harthID) {
            getHarthByID(incomingUpdate.harthID).then((result) => {
              const { ok, data } = result;
              if (ok) {
                setSelectedcomm(data);
                selectedCommRef.current = data;
              }
            });
          }
          break;
        case "user left":
          refetchComms();
          if (selectedCommRef.current?._id === incomingUpdate.harthID) {
            getHarthByID(incomingUpdate.harthID).then((result) => {
              const { ok, data } = result;
              if (ok) {
                setSelectedcomm(data);
                selectedCommRef.current = data;
              }
            });
          }
          break;
        default:
          break;
      }
    });

    return;
  };
  const rebuildData = (shouldPullNewData) => {
    fetchUnreadData(user);
    if (shouldPullNewData) {
      changeSelectedCommFromChild(selectedCommRef.current, true, true);
    }
  };
  const partialReloadFromBlock = async () => {
    const selectedPage = localStorage.getItem("selectedPage");
    if (selectedPage == "message" && selectedCommRef.current?._id) {
      let newConversationsResult = await getConversations(
        selectedCommRef.current?._id,
        user._id
      );
      setConversations(newConversationsResult.conversations);
    }
  };
  const fetchUnreadData = (user) => {
    getUnreadMessages(user, true);
    getUnreadConvMessages(user);
  };
  // const checkForCacheUpdate = () => {
  //   if (!ispullingVersioning) {
  //     ispullingVersioning = true;
  //     fetch("/version.txt?" + new Date().getTime())
  //       .then((response) => response.text())
  //       .then((version) => {
  //         if (
  //           typeof APP_VERSION === "undefined" ||
  //           APP_VERSION.trim() !== version.trim()
  //         ) {
  //           if (
  //             navigator &&
  //             "serviceWorker" in navigator &&
  //             navigator.serviceWorker.controller
  //           ) {
  //             const channel = new MessageChannel();
  //             channel.port1.onmessage = (event) => {
  //               if (event.data && event.data.type === "FORCE_UPDATE") {
  //                 setShowHasUpdateButton(true);
  //               }
  //             };
  //             navigator.serviceWorker.controller.postMessage(
  //               { type: "UPDATE_VERSION" },
  //               [channel.port2]
  //             );
  //           } else {
  //             ispullingVersioning = false;
  //             setShowHasUpdateButton(false);
  //           }
  //         }
  //         ispullingVersioning = false;
  //       })
  //       .catch(() => {
  //         ispullingVersioning = false;
  //         if (showHasUpdateButton) {
  //           setShowHasUpdateButton(false);
  //         }
  //       });
  //   }
  // };
  const setNewAlerts = (incomingUpdate, alertType) => {
    let alerts = { ...mainAlertsRef.current };
    let id =
      incomingUpdate.harthId ||
      incomingUpdate.harthID ||
      incomingUpdate.harthid ||
      incomingUpdate.comm_id;
    if (id) {
      if (!alerts[id]) {
        alerts[id] = {
          gather: { hasLive: false, schedules: [] },
          chat: false,
          messages: false,
        };
      }
      if (alertType !== "gather") {
        alerts[id][alertType] = true;
      } else {
        let gather = alerts[id].gather;
        let hasLive = gather?.hasLive;
        let schedules = gather?.schedules;
        alerts[id][alertType] = {
          hasLive: hasLive || false,
          schedules: [...(schedules || []), incomingUpdate._id],
        };
      }
      setMainAlerts(alerts);
      mainAlertsRef.current = alerts;
    }
  };
  const getUnreadConvMessages = (user) => {
    getExistingUnreadConvMessages(user._id).then((results) => {
      let { data } = results;
      if (data) {
        if (data.length) {
          setNewAlerts(data[0], "message");
        }
        unreadConvMessagesRef.current = data;
        triggerUpdate((prevValue) => (prevValue += 1));
      }
    });
  };
  const getUnreadMessages = (user, overideALL) => {
    if (!ispullingUnreads) {
      setIspullingUnreads(true);
      getExistingUnreadMessages(user._id).then((results) => {
        let { data, unfilteredData } = results;
        if (data) {
          if (data.length) {
            setNewAlerts(data[0], "chat");
          }
          if (unfilteredData.length) {
            let storedselectedTopicId =
              localStorage.getItem("selectedTopicId") || "";
            unfilteredData.forEach((message) => {
              if (
                !newMessageIndicators.current[message.topic_id] &&
                (message.topic_id !== storedselectedTopicId ||
                  document.hidden ||
                  overideALL)
              ) {
                newMessageIndicators.current = {
                  ...newMessageIndicators.current,
                  [message.topic_id]: message.message_id,
                };
              }
            });
          }
          unreadMessagesRef.current = data;
          triggerUpdate((prevValue) => (prevValue += 1));
          setIspullingUnreads(false);
        }
      });
    }
  };
  const join = async (harths) => {
    const promises = harths.map(
      ({ _id }) =>
        new Promise((resolve) => {
          socket.emit("joinRooms", _id, (_, response) => {
            resolve(true);
          });
        })
    );
    await Promise.all(promises);
    return;
  };
  const leave = (chatroomName, cb) => {
    socket.emit("leave", chatroomName, cb);
  };
  const emitUpdate = (chatroomName, update, cb) => {
    socketRef.current?.emit("Update", chatroomName, update, cb);
  };
  const emitUpdateFromRef = (chatroomName, update, cb) => {
    socketRef.current?.emit("Update", chatroomName, update, cb);
  };
  const setMainAlertsFromChild = (alerts) => {
    setMainAlerts(alerts);
    mainAlertsRef.current = alerts;
  };
  const refreshTopicsChatName = async (id, userID, newName) => {
    let elements = document.getElementsByClassName(`${id}_${userID}_name`);
    for (let nameElement of elements) {
      nameElement.innerHTML = newName;
    }
  };
  const refreshTopicsChatIcon = async (id, userID, newIconKey) => {
    let elements = document.getElementsByClassName(`${id}_${userID}`);
    for (let imgELement of elements) {
      imgELement.setAttribute("src", newIconKey);
    }
  };
  const sendNewUserJoined = (id, newProfile) => {
    let msg = {};
    msg.updateType = "new user joined";
    msg.user = newProfile;
    msg.harthID = id;
    emitUpdate(id, msg, () => {});
    // update name in all references
    replaceHarthChatProfileNames(id, newProfile.name, newProfile.userId);
    refreshTopicsChatName(id, newProfile.name, newProfile.userId);
    let namemessage = {
      harthid: id,
      userid: newProfile.userId,
      newName: newProfile.name,
    };
    namemessage.updateType = "message profile name update";
    emitUpdate(id, namemessage, async (err) => {
      if (err) {
        console.error(err);
      }
    });

    // update image in all references
    replaceHarthChatProfileIcons(id, newProfile.iconKey, newProfile.userId);
    refreshTopicsChatIcon(id, newProfile.userId, newProfile.iconKey);
    let message = {
      harthid: id,
      userid: newProfile.userId,
      newIconKey: newProfile.iconKey,
    };
    message.updateType = "message profile icon update";
    emitUpdate(id, message, async (err) => {
      if (err) {
        console.error(err);
      }
    });
  };

  return (
    <SocketContext.Provider
      value={{
        emitUpdate,
        emitUpdateFromRef,
        incomingMsgUpdate,
        incomingTopic,
        incomingMsg,
        setIncomingMsgPreview,
        incomingMsgPreview,
        setFinalMessageForPreview,
        finalMessageForPreview,
        incomingRoom,
        incomingRoomUpdate,
        unreadMsg,
        join,
        leave,
        unreadMessagesRef: unreadMessagesRef.current,
        unreadConvMessagesRef: unreadConvMessagesRef.current,
        mainAlerts,
        setMainAlertsFromChild,
        setMainAlerts,
        mainAlertsRef: mainAlertsRef.current,
        setIncomingMsg,
        setNewAlerts,
        socketID: socket?.id,
        getUnreadMessages,
        getUnreadConvMessages,
        newMessageIndicators: newMessageIndicators.current,
        socketRef: socketRef.current,
        showHasUpdateButton,
        setShowHasUpdateButton,
        APP_VERSION,
        sendNewUserJoined,
        showAdminReportIcon,
        setShowAdminReportIcon,
        pullForIcon,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
