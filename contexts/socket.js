import { createContext, useState, useContext, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "./auth";
import { useComms } from "./comms";
import {
  getTopics,
  getExistingUnreadMessages,
  saveUnsavedMessages,
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

  const { user } = useAuth();
  const {
    selectedTopic,
    setTopics,
    setSelectedTopic,
    comms,
    setComm,
    refetchComms,
    selectedcomm,
    setConversations,
    setUnreadConversationMessagesHandler,
    setIncomingConversationMsgUpdate,
    setProfile,
    profileRef,
  } = useComms();

  const selectedHarthRef = useRef();
  const unreadMessagesRef = useRef([]);
  const mainAlertsRef = useRef({});

  useEffect(() => {
    if (user) {
      const URLS = socketUrls;
      setSocket(
        io.connect(URLS[process.env.NODE_ENV], {
          transports: ["websocket"],
        })
      );
    }
  }, [user]);

  useEffect(() => {
    if (selectedcomm) {
      selectedHarthRef.current = selectedcomm;
    }
  }, [selectedcomm]);

  useEffect(() => {
    if (socket && user && comms) {
      join([...(comms || [])]);
      getUnreadMessages(user);

      socket.on("error", function (err) {});

      socket.on("new update", async ({ updateType, ...incomingUpdate }) => {
        let activeTopic = JSON.parse(localStorage.getItem("selected_topic"));
        switch (updateType) {
          case "new message":
            setIncomingMsg(incomingUpdate);
            setNewAlerts(incomingUpdate, "chat");

            if (incomingUpdate.topic_id !== (selectedTopic || {})._id) {
              setUnreadMsg(incomingUpdate);
              let messages = unreadMessagesRef.current;
              if (!messages) {
                messages = [];
              }
              if (messages) {
                messages = [...messages, incomingUpdate];
              } else {
                messages = [incomingUpdate];
              }
              setUnreadMessagesRef(messages);
            }
            break;
          case "message update":
            setIncomingMsgUpdate(incomingUpdate);
            setNewAlerts(incomingUpdate, "chat");

            break;
          case "message profile icon update":
            if (incomingUpdate.userid == user._id && profileRef) {
              setProfile({ ...profileRef, iconKey: incomingUpdate.newIconKey });
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
              setProfile({ ...profileRef, name: incomingUpdate.newName });
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

                if (nameA < nameB) {
                  return -1;
                }
                if (nameA > nameB) {
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
                  setSelectedTopic(topics[0]);
                }
                setTopics(topics);
              }
            });

            break;
          case "topic edited":
            let editResult = await getTopics(
              incomingUpdate?.comm?._id,
              user._id
            );

            editResult?.topics?.filter(Boolean).forEach((topic) => {
              if (topic?._id === activeTopic?._id) {
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
            setUnreadConversationMessagesHandler(incomingUpdate);
            setNewAlerts(incomingUpdate, "message");

            break;
          case "conversation message update":
            setIncomingConversationMsgUpdate(incomingUpdate);
            setNewAlerts(incomingUpdate, "message");

            break;
          case "gather alert":
            setNewAlerts(incomingUpdate, "gather");

            break;

          case "userLeftConversation":
            console.log("user left", incomingUpdate);

            break;

          default:
            break;
        }
      });
    }
  }, [socket, comms, user]);

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
  const getUnreadMessages = async (user) => {
    let results = await getExistingUnreadMessages(user._id);
    let { data } = results;
    if (data) {
      unreadMessagesRef.current = data.msgs;
      triggerUpdate((prevValue) => (prevValue += 1));
    }
  };
  const join = async (topics) => {
    let promises = [];
    for (let { _id } of topics) {
      promises.push(
        new Promise((resolve) => {
          socket.emit("joinRooms", _id, () => resolve(true));
        })
      );
    }
    await Promise.all(promises);
    return;
  };
  const leave = (chatroomName, cb) => {
    socket.emit("leave", chatroomName, cb);
  };
  const emitUpdate = (chatroomName, update, cb) => {
    socket.emit("Update", chatroomName, update, cb);
  };
  const setUnreadMessagesRef = async (msgs) => {
    unreadMessagesRef.current = msgs;
    saveUnsavedMessages({ user_id: user._id, msgs });
  };
  const setMainAlertsFromChild = (alerts) => {
    setMainAlerts(alerts);
    mainAlertsRef.current = alerts;
  };

  return (
    <SocketContext.Provider
      value={{
        emitUpdate,
        incomingMsgUpdate,
        incomingTopic,
        incomingMsg,
        incomingRoom,
        incomingRoomUpdate,
        unreadMsg,
        join,
        leave,
        unreadMessagesRef: unreadMessagesRef.current,
        setUnreadMessagesRef,
        mainAlerts,
        setMainAlertsFromChild,
        setMainAlerts,
        mainAlertsRef: mainAlertsRef.current,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
