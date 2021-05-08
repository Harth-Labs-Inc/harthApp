import React, { createContext, useState, useContext, useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "./auth";
import { useComms } from "./comms";
import { useChat } from "./chat";

const SocketContext = createContext({});

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [incomingMsg, setIncomingMsg] = useState({});
  const [incomingMsgUpdate, setIncomingMsgUpdate] = useState({});
  const [incomingTopic, setIncomingTopic] = useState({});
  const [unreadMsg, setUnreadMsg] = useState({});
  const [unreadMsgs, setUnreadMsgs] = useState([]);

  const { user } = useAuth();
  const { selectedTopic, grabTopics, comms } = useComms();
  const { messages, setMessages } = useChat();

  useEffect(() => {
    if (user) {
      //-------------- dev ----------------------
      setSocket(
        io.connect("http://localhost:3030", {
          transports: ["websocket"],
        })
      );

      // -------------- production ----------------------
      // setSocket(
      //   io.connect("https://project-blarg-socket.herokuapp.com", {
      //     transports: ["websocket"],
      //   })
      // );
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      join([...user.rooms, ...user.comms], (err, status) => {
        let { ok } = status;
        if (ok) {
          console.log("connected");
        }
      });

      socket.on("error", function (err) {
        console.log("received socket error:");
        console.log(err);
      });
      socket.on("new message", (msg) => {
        setIncomingMsg(msg);
        console.log("msg recieve");
        if (msg.topic_id !== (selectedTopic || {})._id) {
          setUnreadMsg(msg);
          setUnreadMsgs([...unreadMsgs, msg]);
        }
      });
      socket.on("new Topic", (comid, newTopic) => {
        setIncomingTopic(newTopic);
        join(newTopic._id, (err, status) => {
          let { ok } = status;
          if (ok) {
            console.log("connected to new Topic");
          }
        });
      });
      socket.on("new message update", (msg) => {
        setIncomingMsgUpdate(msg);
      });
    }
  }, [socket]);

  const registerHandler = (onMessageReceived) => {
    socket.on("message", onMessageReceived);
  };

  const unregisterHandler = () => {
    socket.off("message");
  };

  const newTopic = (id, topic, cb) => {
    socket.emit("newTopic", id, topic, cb);
  };

  const join = (chatroomName, cb) => {
    socket.emit("joinRooms", chatroomName, cb);
  };
  const joinComms = (chatroomName, cb) => {
    socket.emit("joinComms", chatroomName, cb);
  };

  const leave = (chatroomName, cb) => {
    socket.emit("leave", chatroomName, cb);
  };

  const emitMessage = (chatroomName, msg, cb) => {
    socket.emit("message", chatroomName, msg, cb);
  };
  const emitMessageUpdate = (chatroomName, msg, cb) => {
    socket.emit("messageUpdate", chatroomName, msg, cb);
  };

  const getChatrooms = (cb) => {
    socket.emit("chatrooms", null, cb);
  };

  return (
    <SocketContext.Provider
      value={{
        incomingMsgUpdate,
        emitMessageUpdate,
        incomingTopic,
        newTopic,
        incomingMsg,
        unreadMsg,
        unreadMsgs,
        setUnreadMsgs,
        registerHandler,
        unregisterHandler,
        join,
        leave,
        emitMessage,
        getChatrooms,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
