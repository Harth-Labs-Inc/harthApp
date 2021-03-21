import React, { createContext, useState, useContext, useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "./auth";
import { useComms } from "./comms";
import { useChat } from "./chat";

const SocketContext = createContext({});

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [incomingMsg, setIncomingMsg] = useState({});
  const [unreadMsg, setUnreadMsg] = useState({});

  const { user } = useAuth();
  const { selectedTopic } = useComms();
  const { messages, setMessages } = useChat();

  useEffect(() => {
    if (user) {
      //-------------- dev ----------------------
      // setSocket(
      //   io.connect("http://localhost:3030", {
      //     transports: ["websocket"],
      //   })
      // );

      // -------------- production ----------------------
      setSocket(
        io.connect("https://project-blarg-socket.herokuapp.com", {
          transports: ["websocket"],
        })
      );
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      join(user.rooms, (err, status) => {
        let { ok } = status;
        if (ok) {
          console.log("connected");
        }
      });

      socket.on("error", function (err) {
        console.log("received socket error:");
        console.log(err);
      });
    }
  }, [socket]);

  socket &&
    socket.on("new message", (msg) => {
      const { topic_id } = msg;
      let currentMsgs;
      if (messages) {
        currentMsgs = [...(messages[topic_id] || [])];
      }

      if (msg.topic_id !== (selectedTopic || {})._id) {
        setUnreadMsg(msg);
      }

      if (currentMsgs) {
        currentMsgs.push(msg);
        setMessages({
          ...messages,
          [topic_id]: currentMsgs,
        });
      }
      setIncomingMsg(msg);
    });

  const registerHandler = (onMessageReceived) => {
    socket.on("message", onMessageReceived);
  };

  const unregisterHandler = () => {
    socket.off("message");
  };

  const join = (chatroomName, cb) => {
    socket.emit("joinRooms", chatroomName, cb);
  };

  const leave = (chatroomName, cb) => {
    socket.emit("leave", chatroomName, cb);
  };

  const emitMessage = (chatroomName, msg, cb) => {
    socket.emit("message", chatroomName, msg, cb);
  };

  const getChatrooms = (cb) => {
    socket.emit("chatrooms", null, cb);
  };

  return (
    <SocketContext.Provider
      value={{
        incomingMsg,
        unreadMsg,
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
