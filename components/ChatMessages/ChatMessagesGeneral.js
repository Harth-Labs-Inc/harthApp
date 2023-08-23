import { useRef } from "react";

import ChatAttachment from "../ChatInput/chatAttachmentsGeneral";
import { DiceAlert } from "../Gathering/GatherTools/DiceAlert";

import styles from "./ChatMessages.module.scss";

const GeneralMessageWrapper = ({ messages, userName }) => {
  const messagesEndRef = useRef(null);

  const formatMessage = (text) => {
    if (typeof text !== "string") {
      return "";
    }

    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    // Regex to match emojis
    const emojiRegex = /([\uD800-\uDBFF][\uDC00-\uDFFF])/g;

    // Split the text into parts containing URLs and non-URLs
    const urlParts = text.split(urlRegex);

    // Map over the URL parts and wrap URLs with <a> tags
    const wrappedText = urlParts.map((urlPart, urlIndex) => {
      if (urlPart.match(urlRegex)) {
        // Construct proper URL
        const properURL = urlPart.startsWith("www")
          ? "http://" + urlPart
          : urlPart;

        // Wrap the URL in an <a> tag
        return (
          <a
            key={`url_${urlIndex}`}
            href={properURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {urlPart}
          </a>
        );
      } else {
        // Split each URL part into parts containing emojis and non-emojis
        const emojiParts = urlPart.split(emojiRegex);

        // Map over the emoji parts and wrap emojis with <span> tags
        const modifiedUrlPart = emojiParts.map((emojiPart, emojiIndex) => {
          if (emojiRegex.test(emojiPart)) {
            return (
              <span key={`emoji_${emojiIndex}`} className={styles.MessageEmoji}>
                {emojiPart}
              </span>
            );
          } else {
            // Return non-emoji parts as they are
            return emojiPart;
          }
        });

        return <>{modifiedUrlPart}</>;
      }
    });

    return wrappedText;
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
        {messages &&
          messages.map((chat, idx) => {
            if (chat.creator_name === "Admin") {
              if (chat?.code == 7 && chat?.data) {
                return (
                  <div key={`${idx}_${chat?.data}`}>
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
                <div
                  key={chat.date + chat.value}
                  className={chatClassname(chat.creator_name)}
                >
                  <p>{chat.value}</p>
                </div>
              );
            }
            const date = new Date(chat.date);
            return (
              <div
                key={chat.date + chat.value}
                className={chatClassname(chat.creator_name)}
              >
                <span className={styles.TimeStamp}>
                  {chat.creator_name !== userName ? (
                    <>
                      <img src={chat.creator_image} loading="lazy" />
                      <span className={styles.Creator}>
                        {chat.creator_name}
                      </span>
                    </>
                  ) : null}
                  {date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <p>
                  {chat.attachments.length ? (
                    <ChatAttachment attachments={chat.attachments} />
                  ) : null}
                  {formatMessage(chat.value)}
                </p>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default GeneralMessageWrapper;
