import { useState, useEffect, useContext, useRef } from "react";
import Image from "next/image";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { MobileContext } from "contexts/mobile";
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
import { IconAddReactionNoFill } from "resources/icons/IconAddReactionNoFill";
import { generateID } from "services/helper";
import { CustomMessageContextMenu } from "components/CustomMessageContextMenu/CustomMessageContextMenu";

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
  const { isMobile } = useContext(MobileContext);
  const [hoveredEmojiData, setHoveredEmojiData] = useState(null);
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);

  const longPressTimeOut = useRef();

  let {
    _id,
    date,
    creator_image,
    creator_id,
    creator_name,
    message,
    attachments = [],
    reactionsData = [],
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
  const { selectedcomm, selectedTopic, profile } = useComms();

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

        return <div key={urlIndex}>{modifiedUrlPart}</div>;
      }
    });

    return wrappedText;
  };

  useEffect(() => {
    return () => {
      if (longPressTimeOut.current) {
        clearTimeout(longPressTimeOut.current);
      }
    };
  }, []);

  useEffect(() => {
    const FetchDownloadURL = async () => {
      if (attachments.length > 0) {
        const data = await Promise.all(
          attachments.map(async (att) => {
            return await getDownloadURL(att.name, att.fileType, bucket);
          })
        );

        const outputs = data
          .filter((item) => item && item.ok)
          .map((item) => item.downloadURL);

        setUrls(outputs);
      }
    };

    FetchDownloadURL();

    return () => {
      setUrls([]);
    };
  }, [attachments]);

  const handleTouchStart = () => {
    if (!showLongPressMenu) {
      longPressTimeOut.current = setTimeout(() => {
        setShowLongPressMenu(true);
        setLongPressActive(true);
      }, 300);
    }
  };
  const handleTouchEnd = (e) => {
    if (longPressTimeOut.current) {
      clearTimeout(longPressTimeOut.current);
    }
    if (longPressActive) {
      e.preventDefault();
    }
    setLongPressActive(false);
  };

  const move = () => {
    if (longPressTimeOut.current) {
      clearTimeout(longPressTimeOut.current);
    }
    if (longPressActive) {
      setLongPressActive(false);
    }
  };

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
    });
  };
  const updateConversation = async () => {
    let msg = props.msg;
    await updateConversationMessage(msg);
    msg.updateType = "conversation message update";
    msg.action = "update";
    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
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
    e.stopPropagation();
    setEmojiPicker(!emojiPickerState);
  };
  const addEmoji = (e) => {
    if (!props.msg.reactionsData) {
      props.msg.reactionsData = [];
    }
    props.msg.reactionsData.push({
      id: generateID(),
      reaction: e.native,
      name: profile?.name,
      iconKey: profile?.iconKey,
      userId: profile.userId,
    });
    setEmojiPicker(!emojiPickerState);
    if (chatType == "gather") {
      updateConversation();
    } else {
      updateMsg();
    }
  };
  const EmojiPicker = () => {
    const [transition, setTransition] = useState(false);

    useEffect(() => {
      setTransition(true);
    }, []);

    if (emojiPickerState) {
      if (isMobile) {
        return (
          <div className={styles.EmojiMobile}>
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
              // eslint-disable-next-line
              <style jsx global>{`
                em-emoji-picker {
                  width: 100vw;
                  min-width: 250px;
                  resize: horizontal;
                  overflow: auto;
                  left: 0;
                  position: fixed;
                  bottom: 0;
                  border-radius: none;
                  transform: translateY(${transition ? "0%" : "100%"});
                  transition: transform 0.2s ease-out;
                  --border-radius: 0px;
                }
              `}</style>
              <Picker
                data={data}
                className={"attach-emoji"}
                onEmojiSelect={addEmoji}
                dynamicWidth={true}
                emojiButtonColors={[
                  "rgba(187, 126, 196, 0.8)",
                  "rgb(13, 161, 181, .8)",
                  "rgba(240, 101, 115, 0.8)",
                  "rgb(0, 163, 150, 0.8)",
                ]}
              />
            </OutsideClickHandler>
          </div>
        );
      }
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
            />
          </OutsideClickHandler>
        </div>
      );
    }
    return null;
  };
  const ExistingReactionClickHandler = (data, isReactionOwner, e) => {
    e.stopPropagation();
    if (!isReactionOwner) {
      props.msg.reactionsData.push({
        id: generateID(),
        reaction: data.reaction,
        name: profile?.name,
        iconKey: profile?.iconKey,
        userId: profile.userId,
      });
    } else {
      let index = -1;
      for (let i = 0; i < props.msg.reactionsData.length; i++) {
        if (props.msg.reactionsData[i].id === data.id) {
          index = i;
          break;
        }
      }
      if (index !== -1) {
        props.msg.reactionsData.splice(index, 1);
      }
    }
    updateMsg();
  };
  const displayEmojiData = (data, e) => {
    e.stopPropagation();
    setHoveredEmojiData(data);
  };
  const removeEmojiData = (e) => {
    e.stopPropagation();
    setHoveredEmojiData(null);
  };
  const closeLongPressMenu = () => {
    if (!longPressActive) {
      setShowLongPressMenu(false);
    }
  };

  let timeStamp = getTimeStamp();
  if (!selectedcomm) {
    return null;
  }
  if (isMobile) {
    return (
      <div
        className={`${styles.ChatParentContainer} ${
          isEditing ? styles.Editing : null
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={move}
      >
        {showLongPressMenu ? (
          <CustomMessageContextMenu
            closeModal={closeLongPressMenu}
            openEmojiPicker={triggerPicker}
            hasTextForClipboard={!!props.msg?.message}
            EditSelectCB={editBarSelection}
            showEditButton={creator_id == user._id}
            removeCB={deleteMsg}
          />
        ) : null}
        <EmojiPicker />
        <div
          className={` 
                      ${styles.SingleMessage}
                      ${styles.SingleMessageMobile}
                  `}
        >
          <span className={styles.UserIcon}>
            <UserIcon
              img={creator_image}
              showName={false}
              size="regular"
              iconClass={`${selectedcomm._id}_${creator_id}`}
              shouldIgnoreUserId={true}
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
                  width={280}
                  height={280 / ratio}
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(
                    shimmer(280, 280 / ratio)
                  )}`}
                  alt="message image"
                  onClick={(e) => {
                    e.stopPropagation();
                    openImageSlideShow(idx, attachments);
                  }}
                  onLoadingComplete={({ naturalWidth, naturalHeight }) =>
                    setRatio(naturalHeight / naturalWidth)
                  }
                  onTouchStart={(event) => event.stopPropagation()}
                  onTouchEnd={(event) => event.stopPropagation()}
                />
              ))}

              <div id={`message-content${messageID}`}>
                {formatMessage(message)}
                <LinkPreview
                  message={message}
                  messageID={messageID}
                  onTouchStart={(event) => event.stopPropagation()}
                  onTouchEnd={(event) => event.stopPropagation()}
                />
              </div>
            </div>
            {reactionsData && reactionsData.length > 0 ? (
              <div
                className={styles.BodyReactions}
                onTouchStart={(event) => event.stopPropagation()}
                onTouchEnd={(event) => event.stopPropagation()}
              >
                {[...(reactionsData || [])].map((data, index) => {
                  const { reaction, userId } = data;
                  let isReactionOwner = false;
                  if (userId == user._id) {
                    isReactionOwner = true;
                  }

                  return (
                    <button
                      onClick={(e) =>
                        ExistingReactionClickHandler(data, isReactionOwner, e)
                      }
                      className={` 
                                                ${styles.BodyReactionsEmoji}
                                                ${
                                                  styles.BodyReactionsEmojiMobile
                                                } 
                                                ${
                                                  isReactionOwner
                                                    ? styles.BodyReactionsEmojiOwner
                                                    : null
                                                }
                                            `}
                      key={index}
                    >
                      {reaction}
                    </button>
                  );
                })}

                <button
                  className={` 
                                      ${styles.BodyReactionsAddReaction}
                                      ${styles.BodyReactionsAddReactionMobile}
                                  `}
                  onClick={triggerPicker}
                >
                  <IconAddReactionNoFill />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`${styles.ChatParentContainer} ${
        isEditing ? styles.Editing : null
      }`}
    >
      <div
        className={` 
                    ${styles.SingleMessage}
                    ${styles.SingleMessageDesktop}
                `}
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
            shouldIgnoreUserId={true}
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
                width={280}
                height={280 / ratio}
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(
                  shimmer(280, 280 / ratio)
                )}`}
                alt="message image"
                onClick={() => openImageSlideShow(idx, attachments)}
                onLoadingComplete={({ naturalWidth, naturalHeight }) =>
                  setRatio(naturalHeight / naturalWidth)
                }
              />
            ))}

            <div id={`message-content${messageID}`}>
              {formatMessage(message)}
              <LinkPreview message={message} messageID={messageID} />
            </div>
          </div>
          {reactionsData && reactionsData.length > 0 ? (
            <div className={styles.BodyReactions}>
              {[...(reactionsData || [])].map((data, index) => {
                const { reaction, userId, id } = data;
                let isReactionOwner = false;
                if (userId == user._id) {
                  isReactionOwner = true;
                }

                return (
                  <button
                    onMouseEnter={(e) =>
                      displayEmojiData({ ...data, index }, e)
                    }
                    onMouseLeave={(e) => {
                      handleTouchEnd(e);
                      removeEmojiData(e);
                    }}
                    onClick={(e) =>
                      ExistingReactionClickHandler(data, isReactionOwner, e)
                    }
                    className={` 
                                            ${styles.BodyReactionsEmoji}
                                            ${styles.BodyReactionsEmojiDesktop} 
                                            ${
                                              isReactionOwner
                                                ? styles.BodyReactionsEmojiOwner
                                                : null
                                            }
                                        `}
                    key={id}
                  >
                    {hoveredEmojiData && hoveredEmojiData?.id == id ? (
                      <span className={styles.BodyReactionsEmojiData}>
                        <span>{hoveredEmojiData?.reaction}</span>{" "}
                        {hoveredEmojiData?.name}
                      </span>
                    ) : null}
                    {reaction}
                  </button>
                );
              })}

              <button
                className={` 
                                    ${styles.BodyReactionsAddReaction}
                                    ${styles.BodyReactionsAddReactionDesktop}
                                `}
                onClick={triggerPicker}
              >
                <IconAddReactionNoFill />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
  // return (
  //   <div
  //     className={`${styles.ChatParentContainer} ${
  //       isEditing ? styles.Editing : null
  //     }`}
  //   >
  //     <div
  //       className={`
  //                   ${styles.SingleMessage}
  //                   ${
  //                     isMobile
  //                       ? styles.SingleMessageMobile
  //                       : styles.SingleMessageDesktop
  //                   }
  //               `}
  //       onMouseEnter={() => toggleEdit(true)}
  //       onMouseLeave={() => {
  //         if (!emojiPickerState) {
  //           toggleEdit(false);
  //         }
  //       }}
  //     >
  //       <EmojiPicker />

  //       <EditBar
  //         showEditBar={showEditBar}
  //         _id={_id}
  //         creator_id={creator_id}
  //         user_id={user._id}
  //         deleteMsg={deleteMsg}
  //         editBarSelection={editBarSelection}
  //         triggerPicker={triggerPicker}
  //       />
  //       <span className={styles.UserIcon}>
  //         <UserIcon
  //           img={creator_image}
  //           showName={false}
  //           size="regular"
  //           iconClass={`${selectedcomm._id}_${creator_id}`}
  //           shouldIgnoreUserId={true}
  //         />
  //       </span>

  //       <div className={styles.Body}>
  //         <span className={styles.Info}>
  //           <p
  //             className={[
  //               styles.Creator,
  //               `${selectedcomm._id}_${creator_id}_name`,
  //             ].join(" ")}
  //           >
  //             {creator_name}
  //           </p>
  //           <p className={styles.Timestamp}>{timeStamp}</p>
  //         </span>
  //         <div className={styles.Content}>
  //           {(urls || []).map((url, idx) => (
  //             <Image
  //               key={url}
  //               className="active-image"
  //               src={url}
  //               width={280}
  //               height={280 / ratio}
  //               placeholder="blur"
  //               blurDataURL={`data:image/svg+xml;base64,${toBase64(
  //                 shimmer(280, 280 / ratio)
  //               )}`}
  //               alt="message image"
  //               onClick={() => openImageSlideShow(idx, attachments)}
  //               onLoadingComplete={({ naturalWidth, naturalHeight }) =>
  //                 setRatio(naturalHeight / naturalWidth)
  //               }
  //             />
  //           ))}

  //           <div id={`message-content${messageID}`}>
  //             {formatMessage(message)}
  //             <LinkPreview message={message} messageID={messageID} />
  //           </div>
  //         </div>
  //         {reactionsData && reactionsData.length > 0 ? (
  //           <div className={styles.BodyReactions}>
  //             {isLongPressing ? (
  //               <div className={styles.BodyReactionsEmojiDataGroup}>
  //                 <ul>
  //                   {[...(reactionsData || [])].map((data) => {
  //                     const { reaction, name, id } = data;
  //                     return (
  //                       <li key={id}>
  //                         <span>{reaction}</span>
  //                         <span>{name}</span>
  //                       </li>
  //                     );
  //                   })}
  //                 </ul>
  //               </div>
  //             ) : null}
  //             {[...(reactionsData || [])].map((data, index) => {
  //               const { reaction, userId, id } = data;
  //               let isReactionOwner = false;
  //               if (userId == user._id) {
  //                 isReactionOwner = true;
  //               }

  //               if (isMobile) {
  //                 return (
  //                   <button
  //                     onTouchStart={handleTouchStart}
  //                     onTouchEnd={handleTouchEnd}
  //                     onClick={(e) =>
  //                       ExistingReactionClickHandler(data, isReactionOwner, e)
  //                     }
  //                     className={`
  //                                             ${styles.BodyReactionsEmoji}
  //                                             ${
  //                                               isMobile
  //                                                 ? styles.BodyReactionsEmojiMobile
  //                                                 : styles.BodyReactionsEmojiDesktop
  //                                             }
  //                                             ${
  //                                               isReactionOwner
  //                                                 ? styles.BodyReactionsEmojiOwner
  //                                                 : null
  //                                             }
  //                                         `}
  //                     key={index}
  //                   >
  //                     {hoveredEmojiData && hoveredEmojiData?.index == index ? (
  //                       <span className={styles.BodyReactionsEmojiData}>
  //                         <span>{hoveredEmojiData?.reaction}</span>
  //                         {hoveredEmojiData?.name}
  //                       </span>
  //                     ) : null}
  //                     {reaction}
  //                   </button>
  //                 );
  //               }
  //               return (
  //                 <button
  //                   onMouseEnter={(e) =>
  //                     displayEmojiData({ ...data, index }, e)
  //                   }
  //                   onMouseLeave={(e) => {
  //                     handleTouchEnd(e);
  //                     removeEmojiData(e);
  //                   }}
  //                   onClick={(e) =>
  //                     ExistingReactionClickHandler(data, isReactionOwner, e)
  //                   }
  //                   className={`
  //                                           ${styles.BodyReactionsEmoji}
  //                                           ${
  //                                             isMobile
  //                                               ? styles.BodyReactionsEmojiMobile
  //                                               : styles.BodyReactionsEmojiDesktop
  //                                           }
  //                                           ${
  //                                             isReactionOwner
  //                                               ? styles.BodyReactionsEmojiOwner
  //                                               : null
  //                                           }
  //                                       `}
  //                   key={id}
  //                 >
  //                   {hoveredEmojiData && hoveredEmojiData?.id == id ? (
  //                     <span className={styles.BodyReactionsEmojiData}>
  //                       <span>{hoveredEmojiData?.reaction}</span>{" "}
  //                       {hoveredEmojiData?.name}
  //                     </span>
  //                   ) : null}
  //                   {reaction}
  //                 </button>
  //               );
  //             })}

  //             <button
  //               className={`
  //                                   ${styles.BodyReactionsAddReaction}
  //                                   ${
  //                                     isMobile
  //                                       ? styles.BodyReactionsAddReactionMobile
  //                                       : styles.BodyReactionsAddReactionDesktop
  //                                   }
  //                               `}
  //               onClick={triggerPicker}
  //             >
  //               <IconAddReactionNoFill />
  //             </button>
  //           </div>
  //         ) : null}
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default ChatSingleMessage;
