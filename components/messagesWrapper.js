import React, { useState, useEffect } from "react";
import { useComms } from "../contexts/comms";
import { useChat } from "../contexts/chat";
import { useSocket } from "../contexts/socket";

import ChatTextEntry from "../components/chatTextEntry";
import Message from "./Common/SingleMessage";

const MessageWrapper = (props) => {
  const [currentMessages, setCurrentMessages] = useState([]);

  const { messages, setMessages } = useChat();
  const { selectedTopic } = useComms();
  const { incomingMsg } = useSocket();

  useEffect(() => {
    if (messages && selectedTopic) {
      setCurrentMessages(messages[selectedTopic._id]);
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (messages && selectedTopic) {
      setCurrentMessages(messages[selectedTopic._id]);
    }
  }, [messages]);

  useEffect(() => {
    if (incomingMsg && selectedTopic) {
      const { topic_id } = incomingMsg;
      let tempMsgs;
      if (topic_id === selectedTopic._id) {
        tempMsgs = [...(currentMessages || []), incomingMsg];
        setCurrentMessages(tempMsgs);
      }

      setMessages({
        ...messages,
        [topic_id]: tempMsgs,
      });
    }
  }, [incomingMsg]);

  return (
    <>
      {(currentMessages || []).reverse().map((msg, index) => (
        <Message msg={msg} key={index} />
      ))}

      <ChatTextEntry></ChatTextEntry>
    </>
  );
};

export default MessageWrapper;
