import { useState, useEffect, useRef } from "react";

import ChatSingleMessage from "../ChatSingleMessage/ChatSingleMessage";
import ChatAttachment from "../ChatInput/chatAttachmentsGeneral";
import { DiceAlert } from "../Gathering/GatherTools/DiceAlert";

import styles from "./ChatMessages.module.scss";

const GeneralMessageWrapper = ({ messages, userName }) => {
  const [bottom, setBottom] = useState(null);
  const [displayScrollButton, setDisplayScrollButton] = useState(false);
  const [inview, setInview] = useState(null);

  const messagesEndRef = useRef(null);
  const bottomObserver = useRef(null);

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
    if (messages && messages.length) {
      if (inview === false) {
        setDisplayScrollButton(true);
      } else {
        scrollToBottom("smooth");
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const ScrollButton = () => {
    if (displayScrollButton) {
      return (
        <button onClick={scrollToBottom} className={styles.ScrollButton}>
          New
        </button>
      );
    }
    return null;
  };

  const chatClassname = (creator) => {
    if (creator === "Admin") {
      return styles.AdminMessage;
    }
    if (creator === userName) {
      return styles.SelfMessage;
    }
    return styles.IncomingMessage;
  };

  return (
    <>
      <div id={styles.ChatMessages}>
        <div ref={messagesEndRef} />
        <div ref={setBottom} />
        {messages &&
          messages.map((chat, idx) => {
            if (chat.creator_name === "Admin") {
              console.log("chat", chat);
              if (chat?.code == 7 && chat?.data) {
                // chat.data should have everything the
                return (
                  <div>
                    <DiceAlert
                      rollResult={chat?.data?.number}
                      profileImage={chat?.data?.userIcon}
                      dice={chat?.data?.sides}
                      roll={chat?.data}
                      removeDiceALert={() => {}}
                    />
                  </div>
                );
              }
              return (
                <div key={idx} className={chatClassname(chat.creator_name)}>
                  <p>{chat.value}</p>
                </div>
              );
            }
            const date = new Date(chat.date);
            return (
              <div key={idx} className={chatClassname(chat.creator_name)}>
                <p>
                  {chat.attachments.length ? (
                    <ChatAttachment attachments={chat.attachments} />
                  ) : null}
                  {chat.value}
                </p>
                <span className={styles.TimeStamp}>
                  {chat.creator_name !== userName ? (
                    <img src={chat.creator_image} loading="lazy" />
                  ) : null}
                  {date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
      </div>
      <ScrollButton />
    </>
  );
};

export default GeneralMessageWrapper;
