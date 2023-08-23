import { createContext, useState, useContext, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "./auth";
import { useComms } from "./comms";
import {
  getTopics,
  getExistingUnreadMessages,
  getExistingUnreadConvMessages,
} from "../requests/community";
import { getConversations } from "../requests/conversations";

import { socketUrls } from "../constants/urls";

const SocketContext = createContext({});

/* eslint-disable */

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [incomingMsg, setIncomingMsg] = useState({});
  const [incomingMsgUpdate, setIncomingMsgUpdate] = useState({});
  const [incomingRoomUpdate, setIncomingRoomUpdate] = useState({});
  const [incomingTopic, setIncomingTopic] = useState({});
  const [incomingRoom, setIncomingRoom] = useState({});
  const [unreadMsg, setUnreadMsg] = useState({});
  const [unusedValue, triggerUpdate] = useState(0);
  const [mainAlerts, setMainAlerts] = useState({});
  const [reconnected, setReconnected] = useState(false);
  const [ispullingUnreads, setIspullingUnreads] = useState(false);

  const { user } = useAuth();
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
  } = useComms();

  const socketRef = useRef(null);
  const selectedHarthRef = useRef();
  const unreadMessagesRef = useRef([]);
  const unreadConvMessagesRef = useRef([]);
  const newMessageIndicators = useRef({});
  const mainAlertsRef = useRef({});

  const connectSocket = (user) => {
    if (!user) return;

    if (socketRef.current) {
      socketRef.current.io.reconnection(false);
      socketRef.current.disconnect();
    }

    const token = localStorage.getItem("token");
    const URLS = socketUrls;
    const tempSocket = io.connect(URLS[process.env.NODE_ENV], {
      transports: ["websocket"],
      query: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    tempSocket.on("connect", () => {
      socketRef.current = tempSocket;
      setSocket(tempSocket);
      setReconnected((prev) => !prev);
      fetchUnreadData(user);
      setupListeners(tempSocket, user);
    });

    return tempSocket;
  };

  const setupListeners = (socket, user) => {
    if (!socket || !user) return;
    socket.off("new update");
    socket.on("new update", async ({ updateType, ...incomingUpdate }) => {
      let activeTopic = JSON.parse(localStorage.getItem("selected_topic"));
      switch (updateType) {
        case "new message":
          if (
            incomingUpdate.creator_id !== user._id ||
            incomingUpdate.socketID !== socket.id
          ) {
            setIncomingMsg(incomingUpdate);
            setNewAlerts(incomingUpdate, "chat");
          }
          break;
        case "message update":
          setIncomingMsgUpdate(incomingUpdate);
          setNewAlerts(incomingUpdate, "chat");

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
              if (activeTopic?._id === incomingUpdate?.topic?._id) {
                setSelectedTopic(topics[0] || {});
              }
              setTopics(topics);
            }
          });

          break;
        case "topic edited":
          let editResult = await getTopics(incomingUpdate?.comm?._id, user._id);

          editResult?.topics?.filter(Boolean).forEach((topic) => {
            if (topic?._id === activeTopic?._id) {
              localStorage.setItem("selected_topic", JSON.stringify(topic));
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
          if (isForYou) {
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
          if (
            (incomingUpdate.creator_id !== user._id ||
              incomingUpdate.socketID !== socket.id) &&
            incomingUpdate.userIDS?.includes(user._id)
          ) {
            setIncomingConversationMessagesHandler(incomingUpdate);
            setNewAlerts(incomingUpdate, "message");
          }

          break;
        case "conversation message update":
          setIncomingConversationMsgUpdate(incomingUpdate);
          setNewAlerts(incomingUpdate, "message");

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

        default:
          break;
      }
    });

    return;
  };

  const fetchUnreadData = (user) => {
    getUnreadMessages(user, true);
    getUnreadConvMessages(user);
  };

  useEffect(() => {
    function handleVisibilityChange() {
      if (!document.hidden) {
        console.log("visibility change", { selectedCommRef, selectedcomm });
        if (selectedCommRef.current?._id) {
          changeSelectedCommFromChild(selectedCommRef.current, true);
        }
        manageSocketConnection();
      } else {
        if (socketRef.current) {
          socketRef.current.io.reconnection(false);
          socketRef.current.disconnect();
        }
      }
    }

    function handleOnline() {
      console.log("online change", { selectedCommRef, selectedcomm });
      if (selectedCommRef.current?._id) {
        changeSelectedCommFromChild(selectedCommRef.current, true);
      }
      manageSocketConnection();
    }

    const manageSocketConnection = () => {
      if (navigator.onLine && !document.hidden) {
        connectSocket(user);
      }
    };

    manageSocketConnection();

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);

      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [user]);

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
        let { data } = results;
        if (data) {
          if (data.length) {
            setNewAlerts(data[0], "chat");
            let storedselectedTopicId =
              localStorage.getItem("selectedTopicId") || "";
            data.forEach((message) => {
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
    socket.emit("Update", chatroomName, update, cb);
  };
  const emitUpdateFromRef = (chatroomName, update, cb) => {
    socketRef.current?.emit("Update", chatroomName, update, cb);
  };
  const setMainAlertsFromChild = (alerts) => {
    setMainAlerts(alerts);
    mainAlertsRef.current = alerts;
  };

  return (
    <SocketContext.Provider
      value={{
        emitUpdate,
        emitUpdateFromRef,
        incomingMsgUpdate,
        incomingTopic,
        incomingMsg,
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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
