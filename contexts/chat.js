import React, { createContext, useState, useContext, useEffect } from "react";
import { useComms } from "./comms";
import { getMessagesByTopic } from "../requests/chat";

const ChatContext = createContext({});

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState({});
  const { selectedTopic } = useComms();

  useEffect(() => {
    if (selectedTopic) {
      if (!(selectedTopic._id in messages)) {
        messages[selectedTopic._id] = [];

        (async () => {
          let data = await getMessagesByTopic(selectedTopic._id);
          console.log(data);
          const { ok, fetchResults } = data;
          if (ok) {
            setMessages({ ...messages, [selectedTopic._id]: fetchResults });
          }
        })();
      }
    }
  }, [selectedTopic]);

  const setComm = async (comm) => {};

  return (
    <ChatContext.Provider
      value={{
        setComm,
        messages,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
