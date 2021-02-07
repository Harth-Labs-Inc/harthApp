import React, { createContext, useState, useContext, useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "./auth";

const SocketContext = createContext({});

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setSocket(
        io.connect("http://localhost:3030", {
          secure: true,
          reconnection: true,
          rejectUnauthorized: false,
          transports: ["websocket"],
        })
      );
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on("time", function (timeString) {
        console.log("time", timeString);
      });
    }
  }, [socket]);

  console.log(socket);

  const registerHandler = (onMessageReceived) => {
    socket.on("message", onMessageReceived);
  };

  const unregisterHandler = () => {
    socket.off("message");
  };

  //   socket.on("error", function (err) {
  //     console.log("received socket error:");
  //     console.log(err);
  //   });

  const register = (name, cb) => {
    socket.emit("register", name, cb);
  };

  const join = (chatroomName, cb) => {
    socket.emit("join", chatroomName, cb);
  };

  const leave = (chatroomName, cb) => {
    socket.emit("leave", chatroomName, cb);
  };

  const message = (chatroomName, msg, cb) => {
    socket.emit("message", { chatroomName, message: msg }, cb);
  };

  const getChatrooms = (cb) => {
    socket.emit("chatrooms", null, cb);
  };

  const getAvailableUsers = (cb) => {
    socket.emit("availableUsers", null, cb);
  };

  return (
    <SocketContext.Provider
      value={{
        registerHandler,
        unregisterHandler,
        register,
        join,
        leave,
        message,
        getChatrooms,
        getAvailableUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
