import React, { useState, useEffect } from "react";
import { useComms } from "../contexts/comms";
import { useChat } from "../contexts/chat";
import { useSocket } from "../contexts/socket";

import ChatTextEntry from "../components/chatTextEntry";
import Message from "./Common/SingleMessage";

const MessageWrapper = (props) => {
  const [currentMessages, setCurrentMessages] = useState([]);

  const { messages, setMessages } = useChat();
  const { selectedTopic, selectedcomm } = useComms();
  const { incomingMsg, unreadMsg, unreadMsgs, setUnreadMsgs } = useSocket();

  useEffect(() => {
    if (messages && selectedTopic) {
      let tempMsgs = [...(messages[selectedTopic._id] || [])];
      if (unreadMsgs.length && tempMsgs && tempMsgs.length) {
        let readIds = [];
        unreadMsgs.forEach((msg) => {
          if (msg.topic_id == selectedTopic._id) {
            readIds.push(msg._id);
          }
        });

        let tempUnread = unreadMsgs.filter((msg) => !readIds.includes(msg._id));
        setUnreadMsgs(tempUnread);
      }
      setCurrentMessages(tempMsgs);
    }
  }, [selectedTopic, messages]);

  useEffect(() => {
    if (selectedcomm) {
      setCurrentMessages([]);
    }
  }, [selectedcomm]);

  useEffect(() => {
    if (incomingMsg && messages) {
      const { topic_id } = incomingMsg;
      let tempMsgs = messages[topic_id];
      if (tempMsgs && topic_id) {
        let msgs = [...tempMsgs, incomingMsg];
        setMessages({
          ...messages,
          [topic_id]: msgs,
        });
      }
    }
  }, [incomingMsg]);

  const sortMessages = (msgs) => {
    return msgs.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  return (
    <>
      {currentMessages &&
        currentMessages.length > 0 &&
        sortMessages(currentMessages || [])
          .reverse()
          .map((msg, index) => <Message msg={msg} key={index} />)}

      <ChatTextEntry></ChatTextEntry>
    </>
  );
};

export default MessageWrapper;
