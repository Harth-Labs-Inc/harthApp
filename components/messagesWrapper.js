import React, { useState, useEffect, useRef } from "react";
import { useComms } from "../contexts/comms";
import { useChat } from "../contexts/chat";
import { useSocket } from "../contexts/socket";

import ChatTextEntry from "../components/chatTextEntry";
import Message from "./Common/SingleMessage";

const MessageWrapper = (props) => {
  const [currentMessages, setCurrentMessages] = useState([]);
  const [editMessageObj, setEditMessageObj] = useState({});

  const messageEl = useRef();
  const { messages, setMessages } = useChat();
  const { selectedTopic, selectedcomm } = useComms();
  const {
    incomingMsg,
    unreadMsg,
    unreadMsgs,
    setUnreadMsgs,
    incomingMsgUpdate,
  } = useSocket();

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

  useEffect(() => {
    if (incomingMsgUpdate && messages) {
      console.log(incomingMsgUpdate);
      const { topic_id, action, _id } = incomingMsgUpdate;
      let tempMsgs = messages[topic_id];
      if (tempMsgs && topic_id) {
        if (action == "delete") {
          let filteredMsgs = tempMsgs.filter((msg) => msg._id !== _id);
          setMessages({
            ...messages,
            [topic_id]: filteredMsgs,
          });
        }
        if (action == "update") {
          let index;
          tempMsgs.forEach((msg, idx) => {
            if (msg._id === _id) {
              index = idx;
            }

            tempMsgs[index].reactions = incomingMsgUpdate.reactions;
            tempMsgs[index].flames = incomingMsgUpdate.flames;
            tempMsgs[index].message = incomingMsgUpdate.message;

            setMessages({
              ...messages,
              [topic_id]: tempMsgs,
            });
          });
        }
      }
    }
  }, [incomingMsgUpdate]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     if (messageEl && messageEl.current) {
  //       messageEl.current.addEventListener("DOMNodeInserted", (event) => {
  //         const { currentTarget: target } = event;
  //         target.scroll({ top: target.scrollHeight, behavior: "auto" });
  //       });
  //     }
  //   }, 1000);
  // }, []);

  const getAttachments = (msgs) => {
    return sortMessages(msgs);
  };
  const sortMessages = (msgs) => {
    return msgs.sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  const editMessage = (msg) => {
    setEditMessageObj(msg);
  };

  return (
    <>
      <div id="topic_active_messages" ref={messageEl}>
        {currentMessages &&
          currentMessages.length > 0 &&
          getAttachments(currentMessages || []).map((msg, index) => (
            <Message editMessageText={editMessage} msg={msg} key={index} />
          ))}
      </div>
      <ChatTextEntry selectedEdit={editMessageObj}></ChatTextEntry>
    </>
  );
};

export default MessageWrapper;
