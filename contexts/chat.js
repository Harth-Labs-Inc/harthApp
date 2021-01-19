import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "../contexts/auth";
import socketIOClient from "socket.io-client";

const ChatContext = createContext({});

export const ChatProvider = ({ children }) => {
  const [userList, setUserList] = useState({
    usersList: null,
  });
  const [msg, setMsg] = useState("");
  const [recMsg, setRecMsg] = useState({
    listMsg: [],
  });
  const [loggedUser, setLoggedUser] = useState();

  const { user, loading } = useAuth();

  const ENDPOINT = "http://127.0.0.1:4001";
  const socket = socketIOClient(ENDPOINT);

  useEffect(() => {
    // subscribe a new user
    socket.emit("login", "test");
    // list of connected users
    socket.on("users", (data) => {
      console.log(data);
      setUserList({ usersList: JSON.parse(data) });
    });
    // get the logged user
    socket.on("connecteduser", (data) => {
      console.log(data);
      setLoggedUser(JSON.parse(data));
    });

    // we get the messages
    socket.on("getMsg", (data) => {
      console.log(data);
      let listMessages = recMsg.listMsg;
      listMessages.push(JSON.parse(data));
      setRecMsg({ listMsg: listMessages });
    });
  }, []);

  const sendMessage = () => {
    socket.emit("sendMsg", JSON.stringify({ id: loggedUser.id, msg: msg }));
  };

  return <ChatContext.Provider value={{}}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
