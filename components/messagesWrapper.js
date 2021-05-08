import React, { useState, useEffect, useRef } from "react";
import { useComms } from "../contexts/comms";
import { useChat } from "../contexts/chat";
import { useSocket } from "../contexts/socket";

import ChatTextEntry from "../components/chatTextEntry";
import Message from "./Common/SingleMessage";

const MessageWrapper = (props) => {
  const [currentMessages, setCurrentMessages] = useState([]);
  const [currentReplies, setCurrentReplies] = useState([]);

  const [editMessageObj, setEditMessageObj] = useState({});

  const messageEl = useRef();
  const {
    messages,
    setMessages,
    replies,
    setReplies,
    selectedReplyOwner,
    setSelectedReplyOwner,
  } = useChat();
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
      const { topic_id, owner_id } = incomingMsg;
      if (owner_id) {
        let tempReplyObj = {};
        let tempReplies = replies[owner_id];
        if (tempReplies) {
          let msgs = [...tempReplies, incomingMsg];
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
          let msgs = [...tempMsgs, incomingMsg];
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
      console.log(incomingMsgUpdate);
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

      setCurrentReplies(tempReplies);
    }
  }, [replies, selectedReplyOwner]);

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

  const sortMessages = (msgs) => {
    return msgs.sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  const editMessage = (msg) => {
    setEditMessageObj(msg);
  };
  const removeReplyOwner = () => {
    setSelectedReplyOwner({});
  };

  const DisplayedMessages = () => {
    if (Object.keys(selectedReplyOwner).length > 0) {
      return (
        <>
          <button onClick={removeReplyOwner}>back</button>
          {sortMessages([selectedReplyOwner, ...(currentReplies || [])]).map(
            (msg, index) => (
              <Message
                editMessageText={editMessage}
                msg={msg}
                key={index}
                isReply={true}
              />
            )
          )}
        </>
      );
    }
    return (
      (currentMessages || []).length > 0 &&
      sortMessages(currentMessages || []).map((msg, index) => (
        <Message editMessageText={editMessage} msg={msg} key={index} />
      ))
    );
  };

  return (
    <>
      <div id="topic_active_messages" ref={messageEl}>
        <DisplayedMessages />
      </div>
      <ChatTextEntry
        selectedEdit={editMessageObj}
        isReply={Object.keys(selectedReplyOwner).length > 0}
        replyOwner={selectedReplyOwner}
      ></ChatTextEntry>
    </>
  );
};

export default MessageWrapper;
