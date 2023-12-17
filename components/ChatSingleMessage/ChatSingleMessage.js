import { useState, useEffect, useContext, useRef, Fragment } from "react";
import Image from "next/image";
import { MobileContext } from "contexts/mobile";
import { getDownloadURL } from "../../requests/s3";
import { deleteMessage, updateMessage, flagPost } from "../../requests/chat";
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
import { IconAddReactionNoFill } from "resources/icons/IconAddReactionNoFill";
import {
  fetchImage,
  generateID,
  getAttachment,
  openDB,
  saveAttachment,
} from "services/helper";
import { CustomMessageContextMenu } from "components/CustomMessageContextMenu/CustomMessageContextMenu";
import { EmojiWrapper } from "components/EmojiWrapper/EmojiWrapper";
import emojiRegex from "emoji-regex";
import NewMessageIcon from "components/NewMessageIcon/NewMessageIcon";
import FlagConfirmationModal from "components/FlagConfirmationModal/FlagConfirmationModal";
import BlockUserModal from "components/Menus/HarthSettings/BlockUserModal/BlockUserModal";
import { Modal } from "Common";
import { useTourManager } from "contexts/tour";

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="rgba(200, 200, 200, .1)" offset="20%" />
      <stop stop-color="rgba(200, 200, 200, .2)" offset="50%" />
      <stop stop-color="rgba(200, 200, 200, .1)" offset="70%" />
    </linearGradient>
  </defs>
  
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
</svg>`;

const toBase64 = (str) =>
  typeof window === "undefined"
    ? // eslint-disable-next-line
      Buffer.from(str).toString("base64")
    : window.btoa(str);

/* eslint-disable */
const ChatSingleMessage = (props) => {
  const [emojiPickerState, setEmojiPicker] = useState(false);
  const [urls, setUrls] = useState([]);
  const [showEditBar, setShowEditBar] = useState("");
  const { isMobile } = useContext(MobileContext);
  const [isPressing, setIsPressing] = useState(false);
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const [showMessageInfoMobile, setShowMessageInfoMobile] = useState(false);
  const [showFlagConfirmation, setShowFlagConfirmation] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const touchEndTimestamp = useRef(0);
  const touchThreshold = 100;
  const longPressTimeOut = useRef();
  const messageInfoRef = useRef();
  const pressStartTimestamp = useRef();

  const LONG_PRESS_DURATION = 300;

  let {
    _id,
    date,
    creator_image,
    creator_id,
    creator_name,
    message,
    attachments = [],
    reactionsData = [],
    flagged,
    approvedByAdmin,
  } = props.msg;
  const {
    editMessageText,
    messageID,
    bucket = "topic-message-attachments",
    chatType = "topic",
    openImageSlideShow,
    isEditing,
    toggleEditing,
    showImageSlideShow,
    slideshowURLRef,
    postCollection,
    isReportPost,
    isFirst,
    longPressCoverId,
  } = props;

  const { user } = useAuth();
  const { emitUpdate, newMessageIndicators } = useSocket();
  const {
    selectedcomm,
    selectedTopic,
    profile,
    selectedConversation,
    hasFinishedFirstUseTour,
    hasFinishedFirstPostTour,
    hasApprovedTos,
    initialLoadAllGood,
  } = useComms();

  const { activeTour, startTour, skipStep, tourKey } = useTourManager();

  const newMessageIndicatorRef = useRef();

  const formatMessage = (text) => {
    if (typeof text !== "string") {
      return "";
    }

    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const emojiRegexPattern = emojiRegex();
    const parts =
      text.match(
        /(https?:\/\/[^\s]+|www\.[^\s]+|[\p{Emoji_Presentation}\uFE0F]+|\s+|[^\p{Emoji_Presentation}\uFE0F\s]+)/gu
      ) || [];

    const allEmojis = parts.every((part) =>
      emojiRegexPattern.test(part.trim())
    );

    const wrappedText = parts.map((part, index) => {
      if (!part) return "";

      const isURL = urlRegex.test(part);
      const isEmoji = emojiRegexPattern.test(part);
      const isEmojiTrimmed = emojiRegexPattern.test(part.trim());
      const isWhitespace = /^\s+$/.test(part);

      if (isURL) {
        const properURL = part.startsWith("www") ? "http://" + part : part;
        return (
          <a
            key={`url_${index}`}
            href={properURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {part}
          </a>
        );
      } else if (isEmoji) {
        return (
          <span
            key={`emoji_${index}`}
            className={styles.MessageEmoji}
            style={{
              display: "inline-block",
              fontSize: allEmojis ? "26px" : "20px",
              margin: allEmojis ? "10px 0px" : "",
            }}
          >
            {part}
          </span>
        );
      } else if (isEmojiTrimmed) {
        return (
          <span
            key={`emoji_${index}`}
            className={styles.MessageEmoji}
            style={{
              display: "inline-block",
              fontSize: allEmojis ? "26px" : "20px",
              margin: allEmojis ? "10px 0px 0px 0px" : "",
            }}
          >
            {part}
          </span>
        );
      } else if (!isWhitespace) {
        return (
          <span key={`text_${index}`} style={{ display: "inline-block" }}>
            {part}
          </span>
        );
      }

      return part;
    });

    return <div style={{ display: "block", width: "100%" }}>{wrappedText}</div>;
  };

  useEffect(() => {
    const dbName = "Attachments";
    const storeName = "chat";
    const FetchDownloadURL = async () => {
      if (attachments.length > 0) {
        const db = await openDB(dbName, storeName);
        let tempAttch = [...attachments].reverse();
        slideshowURLRef?.current?.push(...tempAttch);
        const data = await Promise.all(
          attachments.map(async (att) => {
            const cachedData = await getAttachment(
              db,
              storeName,
              att.name
            ).catch(() => null);
            if (cachedData && cachedData.data) {
              const url = URL.createObjectURL(cachedData.data);
              return { ok: 1, downloadURL: url };
            } else {
              const fetchedData = await getDownloadURL(
                att.name,
                att.fileType,
                bucket
              );
              if (fetchedData && fetchedData.ok) {
                const imageBlob = await fetchImage(fetchedData.downloadURL);
                try {
                  saveAttachment(db, storeName, att.name, imageBlob);
                } catch (error) {
                  console.log("Failed to save attachment:", error);
                }
                return fetchedData;
              }
            }
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

  useEffect(() => {
    if (
      initialLoadAllGood &&
      _id &&
      isMobile &&
      hasApprovedTos &&
      hasFinishedFirstUseTour &&
      !activeTour &&
      !hasFinishedFirstPostTour
    ) {
      setTimeout(() => {
        startTour("firstPost", 0);
      }, 150);
    }
  }, [
    _id,
    hasApprovedTos,
    hasFinishedFirstUseTour,
    isMobile,
    initialLoadAllGood,
  ]);

  useEffect(() => {
    if (
      showLongPressMenu &&
      activeTour &&
      hasApprovedTos &&
      hasFinishedFirstUseTour &&
      !hasFinishedFirstPostTour &&
      tourKey == "firstPost"
    ) {
      skipStep();
    }
  }, [showLongPressMenu]);

  useEffect(() => {
    const element = longPressCoverId
      ? document.getElementById(longPressCoverId)
      : null;

    if (element) {
      if (showLongPressMenu) {
        element.style.position = "absolute";
        element.style.top = "0";
        element.style.left = "0";
        element.style.height = "100vh";
        element.style.width = "100vw";
        element.style.zIndex = "2";
      } else {
        setTimeout(() => {
          element.style.position = "";
          element.style.top = "";
          element.style.left = "";
          element.style.height = "";
          element.style.width = "";
          element.style.zIndex = "";
        }, 200);
      }
    }
  }, [showLongPressMenu, longPressCoverId]);

  useEffect(() => {
    return () => {
      if (longPressTimeOut.current) {
        clearTimeout(longPressTimeOut.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleTouchMove = () => {
      if (showMessageInfoMobile) {
        setShowMessageInfoMobile(false);
      }
      if (longPressTimeOut.current) {
        clearTimeout(longPressTimeOut.current);
      }
    };

    document.addEventListener("touchmove", handleTouchMove);

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [showMessageInfoMobile]);

  useEffect(() => {
    const clickOutside = (e) => {
      if (
        showMessageInfoMobile &&
        messageInfoRef.current &&
        !messageInfoRef.current.contains(e.target)
      ) {
        setShowMessageInfoMobile(false);
      }
    };

    if (showMessageInfoMobile) {
      document.addEventListener("click", clickOutside);
    } else {
      document.removeEventListener("click", clickOutside);
    }

    return () => {
      document.removeEventListener("click", clickOutside);
    };
  }, [showMessageInfoMobile]);

  const handleTouchStart = () => {
    if (!showLongPressMenu) {
      pressStartTimestamp.current = Date.now();
      longPressTimeOut.current = setTimeout(() => {
        setShowLongPressMenu(true);
      }, LONG_PRESS_DURATION);
    } else {
      setShowMessageInfoMobile(false);
    }

    setIsPressing(true);
  };

  const handleTouchEnd = () => {
    if (!showLongPressMenu) {
      clearTimeout(longPressTimeOut.current);
      let pressDuration = Date.now() - pressStartTimestamp.current;
      if (pressDuration < LONG_PRESS_DURATION) {
        setShowMessageInfoMobile(!showMessageInfoMobile);
      }
    }

    touchEndTimestamp.current = Date.now();
    setIsPressing(false);
  };

  const move = () => {
    if (longPressTimeOut.current) {
      clearTimeout(longPressTimeOut.current);
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
    await deleteConversationMessage(
      _id,
      `${selectedcomm._id}-${selectedConversation._id}-${_id}`
    );
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
    if (emojiPickerState) {
      return (
        <div className={styles.EmojiPicker}>
          <EmojiWrapper
            addEmoji={addEmoji}
            closeWrapper={() => {
              toggleEdit(false);
              setEmojiPicker(false);
            }}
          ></EmojiWrapper>
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
  const toggleShowFlagConfirmation = () => {
    setShowFlagConfirmation((prev) => !prev);
  };
  const flagMessageHandler = () => {
    toggleShowFlagConfirmation();
  };
  const closeLongPressMenu = (e, isDisabled) => {
    if (
      Date.now() - touchEndTimestamp.current > touchThreshold ||
      isDisabled === false
    ) {
      touchEndTimestamp.current = 0;
      setShowLongPressMenu(false);
    }
  };
  const flagSubmitHandler = async () => {
    props.msg.flagged = true;
    props.msg.approvedByAdmin = false;
    props.msg.approvedByAdminKeepBlurred = false;
    let msg = props.msg;
    await flagPost({ msg, postCollection });
    if (postCollection == "messages") {
      msg.updateType = "message update";
      msg.action = "update";
    } else {
      msg.updateType = "conversation message update";
      msg.action = "update";
    }
    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
      toggleShowFlagConfirmation();
      if (showLongPressMenu) {
        setShowLongPressMenu(false);
      }
    });
  };
  const blockUserHandler = async () => {
    setShowBlockModal(!showBlockModal);
  };
  const closeInviteFromBlock = () => {
    setShowBlockModal(false);
  };

  let addNewIndicator =
    newMessageIndicators[props.msg.topic_id] == props.msg._id &&
    !document.getElementById("addnewindicator");

  let timeStamp = getTimeStamp();

  if (!selectedcomm) {
    return null;
  }

  if (isMobile) {
    return (
      <Fragment>
        {showBlockModal ? (
          <Modal>
            <BlockUserModal
              setHidden={setShowBlockModal}
              closeHandler={closeInviteFromBlock}
              usr={{
                name: creator_name,
                userId: creator_id,
                iconKey: creator_image,
              }}
              activeUser={user}
            />
          </Modal>
        ) : null}
        {showFlagConfirmation ? (
          <FlagConfirmationModal
            setHidden={toggleShowFlagConfirmation}
            flagSubmitHandler={flagSubmitHandler}
          />
        ) : null}
        {showLongPressMenu ? (
          <CustomMessageContextMenu
            closeModal={closeLongPressMenu}
            openEmojiPicker={triggerPicker}
            hasTextForClipboard={!!props.msg?.message}
            TextForClipboard={props.msg?.message}
            EditSelectCB={editBarSelection}
            showEditButton={creator_id == user._id}
            removeCB={deleteMsg}
            isPressing={isPressing}
            flagMessageHandler={flagMessageHandler}
            disableFLagIcon={flagged}
            isSuperAdmin={profile?.owner || profile?.admin || false}
            blockUserHandler={blockUserHandler}
            blockName={creator_name}
          />
        ) : null}
        <EmojiPicker />
        <div
          id={isFirst ? "tourFirstUse_post" : ""}
          ref={messageInfoRef}
          className={`
            ${styles.ChatParentContainer}
            ${isEditing && styles.Editing}
            ${styles.noselect}
          `}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={move}
        >
          <div
            className={` 
                      ${styles.SingleMessage}
                      ${styles.SingleMessageMobile} ${
              showMessageInfoMobile ? styles.mobileInfo : ""
            }
                  `}
          >
            <span className={styles.UserIcon}>
              <UserIcon
                img={creator_image}
                showName={false}
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
              <div className={styles.postWrapper}>
                <div
                  className={
                    flagged && !approvedByAdmin && !isReportPost
                      ? styles.blur
                      : ""
                  }
                >
                  <div
                    className={`
                ${styles.Content}
                ${isMobile ? styles.ContentMobile : null}
              `}
                  >
                    {(attachments || []).map(
                      ({ desiredWidth, desiredHeight, fileType }, idx) => {
                        if (fileType.includes("video")) {
                          return (
                            <video
                              key={idx}
                              width="280"
                              height="280"
                              controls
                              playsInline
                              muted
                              src={urls[idx]}
                              type={fileType}
                            ></video>
                          );
                        }

                        return urls[idx] ? (
                          <Image
                            key={idx}
                            className="active-image"
                            src={urls[idx]}
                            width={
                              desiredWidth && desiredWidth <= 280
                                ? desiredWidth
                                : 280
                            }
                            height={desiredHeight || 280}
                            placeholder="blur"
                            blurDataURL={`data:image/svg+xml;base64,${toBase64(
                              shimmer(
                                desiredWidth && desiredWidth <= 280
                                  ? desiredWidth
                                  : 280,
                                desiredHeight || 280
                              )
                            )}`}
                            alt="message image"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!showImageSlideShow) {
                                openImageSlideShow(attachments[idx]);
                              }
                            }}
                            onTouchStart={(event) => event.stopPropagation()}
                            onTouchEnd={(event) => event.stopPropagation()}
                          />
                        ) : (
                          <Image
                            key={idx}
                            className="active-image"
                            src={`data:image/svg+xml;base64,${toBase64(
                              shimmer(
                                desiredWidth && desiredWidth <= 280
                                  ? desiredWidth
                                  : 280,
                                desiredHeight || 280
                              )
                            )}`}
                            width={
                              desiredWidth && desiredWidth <= 280
                                ? desiredWidth
                                : 280
                            }
                            height={desiredHeight || 280}
                            alt="message image"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onTouchStart={(event) => event.stopPropagation()}
                            onTouchEnd={(event) => event.stopPropagation()}
                          />
                        );
                      }
                    )}

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
                        const { reaction, userId, name } = data;
                        let isReactionOwner = false;
                        if (userId == user._id) {
                          isReactionOwner = true;
                        }

                        return (
                          <button
                            onClick={(e) =>
                              ExistingReactionClickHandler(
                                data,
                                isReactionOwner,
                                e
                              )
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
                            <span className={styles.label}>{name}</span>
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
                {flagged && !approvedByAdmin && !isReportPost && (
                  <div className={styles.overlay}>
                    <div className={styles.flagMessage}>
                      This post has been flagged by a user as inappropriate.
                      <br /> 
                      Your group's owner can review it for approval.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {addNewIndicator || newMessageIndicatorRef.current ? (
          <div ref={newMessageIndicatorRef}>
            <NewMessageIcon />
          </div>
        ) : null}
      </Fragment>
    );
  }
  return (
    <>
      {showBlockModal ? (
        <Modal>
          <BlockUserModal
            setHidden={setShowBlockModal}
            closeHandler={closeInviteFromBlock}
            usr={{
              name: creator_name,
              userId: creator_id,
              iconKey: creator_image,
            }}
            activeUser={user}
          />
        </Modal>
      ) : null}
      {showFlagConfirmation ? (
        <FlagConfirmationModal
          setHidden={toggleShowFlagConfirmation}
          flagSubmitHandler={flagSubmitHandler}
        />
      ) : null}
      <div
        className={`
    ${styles.ChatParentContainer}
    ${isEditing && styles.Editing}
    ${emojiPickerState && styles.EmojiActive}  
  `}
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
            flagMessageHandler={flagMessageHandler}
            disableFLagIcon={flagged}
            isSuperAdmin={profile?.owner || profile?.admin || false}
            blockUserHandler={blockUserHandler}
            blockName={creator_name}
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
            <div className={styles.postWrapper}>
              <div
                className={
                  flagged && !approvedByAdmin && !isReportPost
                    ? styles.blur
                    : ""
                }
              >
                <div className={styles.Content}>
                  {(attachments || []).map(
                    ({ desiredWidth, desiredHeight, fileType }, idx) => {
                      if (fileType.includes("video")) {
                        return (
                          <video
                            key={idx}
                            width="320"
                            height="240"
                            controls
                            playsInline
                            muted
                            src={urls[idx]}
                            type={fileType}
                          ></video>
                        );
                      }

                      return urls[idx] ? (
                        <Image
                          key={idx}
                          className="active-image"
                          src={urls[idx]}
                          width={
                            desiredWidth && desiredWidth <= 280
                              ? desiredWidth
                              : 280
                          }
                          height={desiredHeight || 280}
                          placeholder="blur"
                          blurDataURL={`data:image/svg+xml;base64,${toBase64(
                            shimmer(
                              desiredWidth && desiredWidth <= 280
                                ? desiredWidth
                                : 280,
                              desiredHeight || 280
                            )
                          )}`}
                          alt="message image"
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageSlideShow(attachments[idx]);
                          }}
                          onTouchStart={(event) => event.stopPropagation()}
                          onTouchEnd={(event) => event.stopPropagation()}
                        />
                      ) : (
                        <Image
                          key={idx}
                          className="active-image"
                          src={`data:image/svg+xml;base64,${toBase64(
                            shimmer(
                              desiredWidth && desiredWidth <= 280
                                ? desiredWidth
                                : 280,
                              desiredHeight || 280
                            )
                          )}`}
                          width={
                            desiredWidth && desiredWidth <= 280
                              ? desiredWidth
                              : 280
                          }
                          height={desiredHeight || 280}
                          alt="message image"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onTouchStart={(event) => event.stopPropagation()}
                          onTouchEnd={(event) => event.stopPropagation()}
                        />
                      );
                    }
                  )}
                  <div id={`message-content${messageID}`}>
                    {formatMessage(message)}
                    <LinkPreview message={message} messageID={messageID} />
                  </div>
                </div>
                {reactionsData && reactionsData.length > 0 ? (
                  <div className={styles.BodyReactions}>
                    {[...(reactionsData || [])].map((data, index) => {
                      const { reaction, userId, id, name } = data;
                      let isReactionOwner = false;
                      if (userId == user._id) {
                        isReactionOwner = true;
                      }

                      return (
                        <button
                          onClick={(e) =>
                            ExistingReactionClickHandler(
                              data,
                              isReactionOwner,
                              e
                            )
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
                          {reaction}
                          <span className={styles.label}>{name}</span>
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
              {flagged && !approvedByAdmin && !isReportPost && (
                <div className={styles.overlay}>
                  <div className={styles.flagMessage}>
                      This post has been flagged by a user as inappropriate.
                      <br /> 
                      Your group's owner can review it for approval.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {addNewIndicator || newMessageIndicatorRef.current ? (
        <div ref={newMessageIndicatorRef}>
          <NewMessageIcon />
        </div>
      ) : null}
    </>
  );
};

export default ChatSingleMessage;
