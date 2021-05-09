import React, { useState, useEffect, useRef } from "react";
import { useComms } from "../contexts/comms";
import { useChat } from "../contexts/chat";
import { useSocket } from "../contexts/socket";

import ChatTextEntry from "../components/chatTextEntry";
import Message from "./Common/SingleMessage";

const MessageWrapper = (props) => {
  const [currentMessages, setCurrentMessages] = useState([]);
  const [currentReplies, setCurrentReplies] = useState([]);
  const [topicInputs, setTopicInputs] = useState({});
  const [editMessageObj, setEditMessageObj] = useState({});
  const [bottom, setBottom] = useState(null);
  const [inview, setInview] = useState(null);
  const [displayScrollButton, setDisplayScrollButton] = useState(false);
  const bottomObserver = useRef(null);
  const {
    messages,
    setMessages,
    replies,
    setReplies,
    selectedReplyOwner,
  } = useChat();
  const { selectedTopic, selectedcomm } = useComms();
  const {
    incomingMsg,
    unreadMsgs,
    setUnreadMsgs,
    incomingMsgUpdate,
  } = useSocket();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          console.log("in view");
          setInview(true);
          setDisplayScrollButton(false);
        } else {
          console.log("out of view");
          setInview(false);
        }
      },
      { threshold: 0.25, rootMargin: "50px" }
    );
    bottomObserver.current = observer;
  }, []);

  useEffect(() => {
    const observer = bottomObserver.current;
    if (bottom) {
      observer.observe(bottom);
    }
    return () => {
      if (bottom) {
        observer.unobserve(bottom);
      }
    };
  }, [bottom]);

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
      if (inview) {
        scrollToBottom("smooth");
      } else {
        setDisplayScrollButton(true);
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
      const { topic_id, owner_id } = incomingMsg;
      if (owner_id) {
        let tempReplyObj = {};
        let tempReplies = replies[owner_id];
        if (tempReplies) {
          let msgs = [incomingMsg, ...tempReplies];
          tempReplyObj = { ...replies, [owner_id]: msgs };
          for (let [owner, arr] of Object.entries(tempReplyObj || [])) {
            arr.forEach((rply) => {
              if (rply._id == owner_id) {
                let index;
                let temp = tempReplyObj[owner];
                temp.forEach((msg, idx) => {
                  if (msg._id === owner_id) {
                    index = idx;
                  }
                  if (index) {
                    temp[index].replies = [
                      ...new Set([...temp[index].replies, incomingMsg._id]),
                    ];
                  }
                  tempReplyObj[owner] = temp;
                });
              }
            });
          }
          setReplies(tempReplyObj);
        }
        let tempMsgs = messages[topic_id];
        if (tempMsgs && topic_id) {
          let index;
          tempMsgs.forEach((msg, idx) => {
            if (msg._id === owner_id) {
              index = idx;
            }
            if (index) {
              tempMsgs[index].replies = [
                ...new Set([...tempMsgs[index].replies, incomingMsg._id]),
              ];
            }
            setMessages({
              ...messages,
              [topic_id]: tempMsgs,
            });
          });
        }
      } else {
        let tempMsgs = messages[topic_id];
        if (tempMsgs && topic_id) {
          let msgs = [incomingMsg, ...tempMsgs];
          setMessages({
            ...messages,
            [topic_id]: msgs,
          });
        }
      }
    }
  }, [incomingMsg]);

  useEffect(() => {
    if (incomingMsgUpdate && messages) {
      const { topic_id, action, _id, owner_id } = incomingMsgUpdate;
      if (owner_id) {
        let tempReplies = replies[owner_id];
        if (tempReplies) {
          if (action == "delete") {
            let filteredReplies = tempReplies.filter((msg) => msg._id !== _id);
            setReplies({ ...replies, [owner_id]: filteredReplies });
          }
          if (action == "update") {
            let index;
            tempReplies.forEach((msg, idx) => {
              if (msg._id === _id) {
                index = idx;
              }
              if (tempReplies[index]) {
                tempReplies[index].reactions = incomingMsgUpdate.reactions;
                tempReplies[index].flames = incomingMsgUpdate.flames;
                tempReplies[index].message = incomingMsgUpdate.message;
                tempReplies[index].replies = incomingMsgUpdate.replies;
              }
              setReplies({ ...replies, [owner_id]: tempReplies });
            });
          }
        }
      } else {
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
              if (tempMsgs[index]) {
                tempMsgs[index].reactions = incomingMsgUpdate.reactions;
                tempMsgs[index].flames = incomingMsgUpdate.flames;
                tempMsgs[index].message = incomingMsgUpdate.message;
              }
              setMessages({
                ...messages,
                [topic_id]: tempMsgs,
              });
            });
          }
        }
      }
    }
  }, [incomingMsgUpdate]);

  useEffect(() => {
    if (replies && selectedReplyOwner) {
      let tempReplies = [...(replies[selectedReplyOwner._id] || [])];
      if (inview) {
        scrollToBottom("smooth");
      } else {
        setDisplayScrollButton(true);
      }
      setCurrentReplies(tempReplies);
    }
  }, [replies, selectedReplyOwner]);

  const editMessage = (msg) => {
    setEditMessageObj(msg);
  };
  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const ScrollButton = () => {
    if (displayScrollButton) {
      return (
        <button onClick={scrollToBottom} className="scroll-to-bottom">
          New Message
        </button>
      );
    }
    return null;
  };
  return (
    <>
      <div id="topic_active_messages">
        <div ref={messagesEndRef} />
        <div ref={setBottom} />
        {Object.keys(selectedReplyOwner).length > 0
          ? [
              ...(currentReplies || []),
              selectedReplyOwner,
            ].map((msg, index) => (
              <Message
                editMessageText={editMessage}
                msg={msg}
                key={msg._id}
                isReply={true}
              />
            ))
          : (currentMessages || []).length > 0 &&
            (currentMessages || []).map((msg, index) => (
              <Message editMessageText={editMessage} msg={msg} key={msg._id} />
            ))}
        <ScrollButton />
      </div>
      <ChatTextEntry
        selectedEdit={editMessageObj}
        isReply={Object.keys(selectedReplyOwner).length > 0}
        replyOwner={selectedReplyOwner}
        topicInputs={topicInputs}
        setTopicInputs={setTopicInputs}
      ></ChatTextEntry>
    </>
  );
};

export default MessageWrapper;
