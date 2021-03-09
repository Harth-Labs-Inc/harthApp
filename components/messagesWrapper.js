import React, { useState, useEffect } from "react";
import { useComms } from "../contexts/comms";
import { useChat } from "../contexts/chat";
import { useSocket } from "../contexts/socket";

const MessageWrapper = (props) => {
  const [currentMessages, setCurrentMessages] = useState([]);

  const { messages } = useChat();
  const { selectedTopic } = useComms();
  const { incomingMsg } = useSocket();

  useEffect(() => {
    if (messages && selectedTopic) {
      setCurrentMessages(messages[selectedTopic._id]);
    }
  }, [selectedTopic]);

  useEffect(() => {
    console.log("asdfasd");
    if (incomingMsg && selectedTopic) {
      console.log(incomingMsg);
      if (incomingMsg.topic_id === selectedTopic._id) {
        let tempMsgs = [...currentMessages, incomingMsg];
        setCurrentMessages(tempMsgs);
      }
    }
  }, [incomingMsg]);

  return (
    <>
      {(currentMessages || []).map((msg) => {
        return <p>{msg.message}</p>;
      })}
    </>
  );
};

export default MessageWrapper;
