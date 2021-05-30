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
  const [incomingRoomUpdate, setIncomingRoomUpdate] = useState({});
  const [incomingTopic, setIncomingTopic] = useState({});
  const [incomingRoom, setIncomingRoom] = useState({});
  const [unreadMsg, setUnreadMsg] = useState({});
  const [unreadMsgs, setUnreadMsgs] = useState([]);

  const { user } = useAuth();
  const { selectedTopic, grabTopics, comms } = useComms();
  const { messages, setMessages } = useChat();

  useEffect(() => {
    if (user) {
      let urls = {
        development: "http://localhost:3030",
        production: "https://project-blarg-socket.herokuapp.com",
      };
      setSocket(
        io.connect(urls[process.env.NODE_ENV], {
          transports: ["websocket"],
        })
      );
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      join([...user.comms], (err, status) => {
        let { ok } = status;
        if (ok) {
          console.log("connected");
        }
      });

      socket.on("error", function (err) {
        console.log("received socket error:");
        console.log(err);
      });

      socket.on("new update", ({ updateType, ...incomingUpdate }) => {
        console.log(updateType, incomingUpdate);
        switch (updateType) {
          case "new message":
            setIncomingMsg(incomingUpdate);
            if (incomingUpdate.topic_id !== (selectedTopic || {})._id) {
              setUnreadMsg(incomingUpdate);
              setUnreadMsgs([...unreadMsgs, incomingUpdate]);
            }
            break;

          case "message update":
            setIncomingMsgUpdate(incomingUpdate);
            break;

          case "new topic":
            setIncomingTopic(incomingUpdate);
            break;

          case "new room":
            setIncomingRoom(incomingUpdate);
            break;

          case "room update":
            setIncomingRoomUpdate(incomingUpdate);
            break;
          default:
            break;
        }
      });
    }
  }, [socket]);

  const join = (chatroomName, cb) => {
    socket.emit("joinRooms", chatroomName, cb);
  };
  const leave = (chatroomName, cb) => {
    socket.emit("leave", chatroomName, cb);
  };
  const emitUpdate = (chatroomName, update, cb) => {
    socket.emit("Update", chatroomName, update, cb);
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
        unreadMsgs,
        setUnreadMsgs,
        join,
        leave,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
