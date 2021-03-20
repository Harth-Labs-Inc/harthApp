import React, { useState, useEffect } from "react";
import { useComms } from "../contexts/comms";
import { useChat } from "../contexts/chat";

import ChatTextEntry from "../components/chatTextEntry";
import Message from "./Common/SingleMessage";

const MessageWrapper = (props) => {
  const [currentMessages, setCurrentMessages] = useState([]);

  const { messages } = useChat();
  const { selectedTopic } = useComms();

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

  // useEffect(() => {
  //   // if (incomingMsg && selectedTopic) {
  //   //   console.log(incomingMsg);
  //   //   if (incomingMsg.topic_id === selectedTopic._id) {
  //   //     let tempMsgs = [...(currentMessages || []), incomingMsg];
  //   //     setCurrentMessages(tempMsgs);
  //   //   }
  //   // }
  // }, [incomingMsg]);

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
