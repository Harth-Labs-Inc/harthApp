import React, { useState, useEffect } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { getDownloadURL } from "../../requests/s3";
import { deleteMessage, updateMessage } from "../../requests/chat";

import {
  updateConversationMessage,
  deleteConversationMessage,
} from "../../requests/conversations";
import { useAuth } from "../../contexts/auth";
import { useSocket } from "../../contexts/socket";
import { useComms } from "../../contexts/comms";

import EditBar from "./EditBar";
import styles from "./ChatSingleMessage.module.scss";
import { LinkPreview } from "./LinkPreview";

const ChatSingleMessage = (props) => {
  const [emojiPickerState, setEmojiPicker] = useState(false);
  const [urls, setUrls] = useState([]);
  const [showEditBar, setShowEditBar] = useState("");

  const {
    _id,
    date,
    creator_image,
    creator_id,
    creator_name,
    message,
    attachments = [],
    reactions = [],
    topic_id,
  } = props.msg;
  const {
    editMessageText,
    messageID,
    msgReload,
    bucket = "topic-message-attachments",
    chatType = "topic",
    openImageSlideShow,
  } = props;

  const { user } = useAuth();
  const { emitUpdate } = useSocket();
  const { selectedcomm } = useComms();

  useEffect(() => {
    async function fetchDownloadURL() {
      if (attachments.length > 0) {
        let promises = [];
        attachments.forEach((att) => {
          promises.push(
            new Promise(async (res, rej) => {
              const data = await getDownloadURL(att.name, att.fileType, bucket);
              if (data) {
                const { ok, downloadURL } = data;
                if (ok) {
                  res(downloadURL);
                }
              }
            })
          );
        });

        Promise.all(promises).then((outputs) => setUrls(outputs));
      }
    }
    fetchDownloadURL();
    return () => {
      setUrls([]);
    };
  }, [_id]);

  // useEffect(() => {
  //     replaceURLs();
  // }, []);

  // useEffect(() => {
  //     replaceURLs();
  // }, [msgReload]);

  // chat specific
  const deleteMsg = async () => {
    if (chatType == "gather") {
      deleteConversation();
    } else {
      const data = await deleteMessage(_id);
      let msg = props.msg;
      msg.action = "delete";
      msg.updateType = "message update";
      emitUpdate(selectedcomm._id, msg, async (err, status) => {
        if (err) {
          console.error(err);
        }
        let { ok } = status;
        if (ok) {
        }
      });
    }
  };
  const updateMsg = async () => {
    let msg = props.msg;
    const data = await updateMessage(msg);
    msg.updateType = "message update";
    msg.action = "update";
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.error(err);
      }
      let { ok } = status;
      if (ok) {
      }
    });
  };

  // gather/conversation specific
  const updateConversation = async () => {
    let msg = props.msg;
    const data = await updateConversationMessage(msg);
    msg.updateType = "conversation message update";
    msg.action = "update";
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.error(err);
      }
      let { ok } = status;
      if (ok) {
      }
    });
  };
  const deleteConversation = async () => {
    const data = await deleteConversationMessage(_id);
    let msg = props.msg;
    msg.action = "delete";
    msg.updateType = "conversation message update";
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.error(err);
      }
      let { ok } = status;
      if (ok) {
      }
    });
  };

  const editBarSelection = () => {
    editMessageText(props.msg);
  };
  const getTimeStamp = () => {
    let timeStamp;
    let today = new Date();
    let weekBefore = today.setDate(today.getDate() - 6);

    if (
      new Date(date).toLocaleDateString() === new Date().toLocaleDateString()
    ) {
      timeStamp = new Date(date).toLocaleTimeString([], {
        timeStyle: "short",
      });
    } else if (new Date(date) >= new Date(weekBefore)) {
      timeStamp = `${new Date(date).toLocaleDateString("default", {
        weekday: "long",
      })} @ ${new Date(date).toLocaleTimeString([], {
        timeStyle: "short",
      })}`;
    } else {
      timeStamp = `${new Date(date).toLocaleDateString("default", {
        weekday: "long",
      })}, ${new Date(date).toLocaleDateString("default", {
        month: "short",
      })} ${new Date(date).toLocaleDateString("default", {
        day: "numeric",
      })} @ ${new Date(date).toLocaleTimeString([], {
        timeStyle: "short",
      })}`;
    }
    return timeStamp;
  };
  const toggleEdit = (show) => {
    if (show) {
      setShowEditBar(_id);
    } else {
      setShowEditBar("");
    }
  };
  const triggerPicker = (e) => {
    e.preventDefault();
    setEmojiPicker(!emojiPickerState);
  };
  const addEmoji = (e) => {
    reactions.push(e.native);
    setEmojiPicker(!emojiPickerState);
    if (chatType == "gather") {
      updateConversation();
    } else {
      updateMsg();
    }
  };
  const EmojiPicker = () => {
    if (emojiPickerState) {
      return (
        <div className={styles.EmojiPicker}>
          <Picker
            data={data}
            className={`attach-emoji`}
            onEmojiSelect={addEmoji}
            autoFocus={true}
            emojiButtonColors={[
              "rgba(187, 126, 196, 0.8)",
              "rgb(13, 161, 181, .8)",
              "rgba(240, 101, 115, 0.8)",
              "rgb(0, 163, 150, 0.8)",
            ]}
            //onClickOutside={setEmojiPicker(!emojiPickerState)}
          />
        </div>
      );
    }
    return null;
  };
  const CreatorImage = () => {
    if (creator_image) {
      return (
        <img
          className={styles.SingleMessageAvatar}
          src={creator_image}
          alt={creator_name}
          loading="lazy"
        />
      );
    }
    return <span className={styles.SingleMessageAvatarNo}></span>;
  };

  // const wrapLink = (innerHtml, urlRegex) => {
  //     let rawurl = "";
  //     let replacedURL = innerHtml.replace(urlRegex, function (url) {
  //         rawurl = url;
  //         if (!url.match("^https?://")) {
  //             url = "http://" + url;
  //         }

  //         return (
  //             '<a href="' +
  //             url +
  //             '" target="_blank" rel="noopener noreferrer">' +
  //             url +
  //             "</a>"
  //         );
  //     });

  //     return { rawURL: rawurl, alteredURL: replacedURL };
  // };

  // const replaceURLs = async () => {
  //     let messageBody = document.getElementById(
  //         `message-content${messageID}`
  //     );
  //     let innerHtml = message;
  //     if (messageBody) {
  //         const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  //         if (urlRegex.test(innerHtml)) {
  //             let { rawURL, alteredURL } = wrapLink(innerHtml, urlRegex);
  //             let ogWrapper = document.getElementById("ogCard");

  //             innerHtml = `<span>${alteredURL}</span>`;
  //             messageBody.innerHTML = innerHtml;

  //             getURLMetaData(rawURL).then((pullResult) => {

  //             });
  //             // let pullResult = await getURLMetaData(rawURL);

  //             // if (!ogWrapper && pullResult?.data?.ok) {
  //             //     ogWrapper = document.createElement("article");
  //             //     ogWrapper.id = "ogCard";
  //             //     ogWrapper.className = styles.ogCard;

  //             //     const ogTitle = document.createElement("span");
  //             //     const ogTitleText = document.createTextNode(
  //             //         result?.ogTitle
  //             //     );
  //             //     ogTitle.appendChild(ogTitleText);

  //             //     const ogDescription = document.createElement("span");
  //             //     const ogDescriptionText = document.createTextNode(
  //             //         result?.ogDescription
  //             //     );
  //             //     ogDescription.appendChild(ogDescriptionText);

  //             //     const ogImage = document.createElement("img");
  //             //     ogImage.setAttribute("src", result?.ogImage?.url);

  //             //     ogWrapper.appendChild(ogTitle);
  //             //     ogWrapper.appendChild(ogDescription);
  //             //     ogWrapper.appendChild(ogImage);

  //             //     messageBody.append(ogWrapper);
  //             // }
  //         } else {
  //             if (innerHtml !== undefined) {
  //                 messageBody.innerHTML = `<span>${innerHtml}</span>`;
  //             }
  //         }
  //     }
  // };

  let timeStamp = getTimeStamp();

  return (
    <div id="chat-parent-container">
      <EmojiPicker />
      <div
        className={styles.SingleMessage}
        onMouseEnter={() => toggleEdit(true)}
        onMouseLeave={() => {
          toggleEdit(false);
          setEmojiPicker(false);
        }}
      >
        <EditBar
          showEditBar={showEditBar}
          _id={_id}
          creator_id={creator_id}
          user_id={user._id}
          deleteMsg={deleteMsg}
          editBarSelection={editBarSelection}
          triggerPicker={triggerPicker}
        />
        <CreatorImage />

        <div className={styles.Body}>
          <span className={styles.Info}>
            <p className={styles.Creator}>{creator_name}</p>
            <p className={styles.Timestamp}>{timeStamp}</p>
          </span>
          <div className={styles.Content}>
            {(urls || []).map((url, idx) => (
              <img
                className="active-image"
                src={url}
                width={200}
                height={100}
                key={url}
                loading="lazy"
                style={{ objectFit: "contain" }}
                alt=""
                onClick={() => openImageSlideShow(idx, attachments)}
              />
            ))}

            <div id={`message-content${messageID}`}>
              {message}
              <LinkPreview message={message} messageID={messageID} />
            </div>
          </div>
          <div className={styles.BodyReactions}>
            {[...(reactions || [])].map((reaction, index) => (
              <p className={styles.BodyReactionsEmoji} key={index}>
                {reaction}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSingleMessage;
