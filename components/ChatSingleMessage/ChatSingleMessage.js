import { useState, useEffect } from "react";
import Image from "next/image";
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

import UserIcon from "../UserIcon/userIcon";

import EditBar from "./EditBar";
import styles from "./ChatSingleMessage.module.scss";
import { LinkPreview } from "./LinkPreview";
import OutsideClickHandler from "components/Common/Modals/OutsideClick";

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#2f1d2a" offset="20%" />
      <stop stop-color="#282828" offset="50%" />
      <stop stop-color="#2f1d2a" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str) =>
  typeof window === "undefined"
    ? // eslint-disable-next-line
      Buffer.from(str).toString("base64")
    : window.btoa(str);

const ChatSingleMessage = (props) => {
  const [emojiPickerState, setEmojiPicker] = useState(false);
  const [urls, setUrls] = useState([]);
  const [showEditBar, setShowEditBar] = useState("");
  const [ratio, setRatio] = useState(16 / 9);

  const {
    _id,
    date,
    creator_image,
    creator_id,
    creator_name,
    // creator_type,
    message,
    attachments = [],
    reactions = [],
  } = props.msg;
  const {
    editMessageText,
    messageID,
    bucket = "topic-message-attachments",
    chatType = "topic",
    openImageSlideShow,
    isEditing,
    toggleEditing,
  } = props;

  const { user } = useAuth();
  const { emitUpdate } = useSocket();
  const { selectedcomm, selectedTopic } = useComms();

  useEffect(() => {
    async function fetchDownloadURL() {
      if (attachments.length > 0) {
        let promises = [];
        attachments.forEach((att) => {
          promises.push(
            new Promise(async (res) => {
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
      await deleteMessage(
        _id,
        `${selectedcomm._id}-${selectedTopic._id}-${_id}`
      );
      let msg = props.msg;
      msg.action = "delete";
      msg.updateType = "message update";
      emitUpdate(selectedcomm._id, msg, async (err) => {
        if (err) {
          console.error(err);
        }
        // let { ok } = status;
        // if (ok) {
        // }
      });
    }
  };
  const updateMsg = async () => {
    let msg = props.msg;
    await updateMessage(msg);
    msg.updateType = "message update";
    msg.action = "update";
    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
      // let { ok } = status;
      // if (ok) {
      // }
    });
  };

  // gather/conversation specific
  const updateConversation = async () => {
    let msg = props.msg;
    await updateConversationMessage(msg);
    msg.updateType = "conversation message update";
    msg.action = "update";
    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
      // let { ok } = status;
      // if (ok) {
      // }
    });
  };
  const deleteConversation = async () => {
    await deleteConversationMessage(_id);
    let msg = props.msg;
    msg.action = "delete";
    msg.updateType = "conversation message update";
    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
      // let { ok } = status;
      // if (ok) {
      // }
    });
  };

  const editBarSelection = () => {
    toggleEditing(messageID);
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
          <OutsideClickHandler
            onClickOutside={() => {
              toggleEdit(false);
              setEmojiPicker(false);
            }}
            onFocusOutside={() => {
              toggleEdit(false);
              setEmojiPicker(false);
            }}
          >
            <Picker
              data={data}
              className={"attach-emoji"}
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
          </OutsideClickHandler>
        </div>
      );
    }
    return null;
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

  if (!selectedcomm) {
    return null;
  }

  return (
    <div
      className={`${styles.ChatParentContainer} ${
        isEditing ? styles.Editing : null
      }`}
    >
      <div
        className={styles.SingleMessage}
        onMouseEnter={() => toggleEdit(true)}
        onMouseLeave={() => {
          if (!emojiPickerState) {
            toggleEdit(false);
          }
        }}
      >
        <EmojiPicker />

        <EditBar
          showEditBar={showEditBar}
          _id={_id}
          creator_id={creator_id}
          user_id={user._id}
          deleteMsg={deleteMsg}
          editBarSelection={editBarSelection}
          triggerPicker={triggerPicker}
        />
        <span className={styles.UserIcon}>
          <UserIcon
            img={creator_image}
            showName={false}
            size="regular"
            iconClass={`${selectedcomm._id}_${creator_id}`}
          />
        </span>

        <div className={styles.Body}>
          <span className={styles.Info}>
            <p
              className={[
                styles.Creator,
                `${selectedcomm._id}_${creator_id}_name`,
              ].join(" ")}
            >
              {creator_name}
            </p>
            <p className={styles.Timestamp}>{timeStamp}</p>
          </span>
          <div className={styles.Content}>
            {(urls || []).map((url, idx) => (
              <Image
                key={url}
                className="active-image"
                src={url}
                width={150}
                height={150 / ratio}
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(
                  shimmer(200, 200 / ratio)
                )}`}
                alt="message image"
                onClick={() => openImageSlideShow(idx, attachments)}
                onLoadingComplete={({ naturalWidth, naturalHeight }) =>
                  setRatio(naturalHeight / naturalWidth)
                }
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
