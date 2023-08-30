import { useState, useRef, useContext, useEffect, Fragment } from "react";
import ImageViewer from "react-simple-image-viewer";
import { useComms } from "../../contexts/comms";
import styles from "./ConversationMessages.module.scss";
import { MobileContext } from "../../contexts/mobile";
import ChatSingleMessage from "../ChatSingleMessage/ChatSingleMessage";
import DumbChatInput from "../DumbChatInput/DumbChatInput";
import { useAuth } from "../../contexts/auth";
import { useSocket } from "../../contexts/socket";
import {
  removeUnsavedConvMessages,
  sendUnreadConvMessages,
  getconversationMessagesByID,
  saveConversationMessage,
  addKeyToConversationDB,
  updateConversationMessage,
} from "../../requests/conversations";
import {
  getUploadURL,
  putImageInBucket,
  getDownloadURL,
  compressImage,
} from "../../requests/s3";
import { SpinningLoader } from "components/Common/SpinningLoader/SpinningLoader";
import TalkingHead from "components/TalkingHead/TalkingHead";
import { sendPushNotification } from "requests/subscriptions";
import { generatePushMessage } from "services/helper";
import { useRouter } from "next/router";

/* eslint-disable */
export const ConversationMessages = () => {
  const [currentMessages, setCurrentMessages] = useState([]);
  const [conversationInputs, setConversationInputs] = useState({});
  const [editMessageObj, setEditMessageObj] = useState({});
  const [msgReload, triggerMsgReload] = useState(0);
  const [showImageSlideShow, setShowImageSlideShow] = useState(false);
  const [imageSlideshowURL, setImageSlideshowURL] = useState();
  const [messageEditing, setMessageEditing] = useState();
  const [scrollLock, setScrollLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [disableChat, setDisableChat] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    selectedcomm,
    selectedCommRef,
    selectedConversation,
    incomingConversationMsg,
    incomingConversationMsgUpdate,
    setIncomingConversationMessagesHandler,
    keepSpinning,
  } = useComms();
  const { user } = useAuth();
  const { emitUpdate, socketID, setNewAlerts, emitUpdateFromRef } = useSocket();

  const uploadingAttchmts = useRef([]);
  const messagesEndRef = useRef(null);
  const { isMobile } = useContext(MobileContext);

  const router = useRouter();
  const {
    query: { conversation_id },
  } = router;

  useEffect(() => {
    localStorage.setItem("isInChatOrDM", true);

    const handleBeforeUnload = () => {
      localStorage.removeItem("isInChatOrDM");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      localStorage.removeItem("isInChatOrDM");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (selectedConversation && page > 1) {
      setLoading(true);
      (async () => {
        let data = await getconversationMessagesByID(
          selectedConversation._id,
          page,
          25
        );
        const { ok, fetchResults } = data;
        if (ok) {
          const sortedMessages = sortMessages([...fetchResults]);
          setCurrentMessages((prevState) => [...prevState, ...sortedMessages]);
          setHasMore(fetchResults.length > 0);
          setLoading(false);
          setScrollLock(false);
        } else {
          setCurrentMessages([]);
          setPage(1);
          setLoading(false);
          setScrollLock(false);
        }
      })();
    } else {
      setPage(1);
      setCurrentMessages([]);
      setLoading(false);
      setScrollLock(false);
    }
  }, [page]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setCurrentMessages([]);
    if (selectedConversation && selectedConversation._id) {
      (async () => {
        let data = await getconversationMessagesByID(
          selectedConversation._id,
          1,
          25
        );
        const { ok, fetchResults } = data;
        if (ok) {
          setCurrentMessages(sortMessages([...fetchResults]));
          setHasMore(fetchResults.length > 0);
          setLoading(false);
        } else {
          setCurrentMessages([]);
          setPage(1);
          setLoading(false);
        }
        removeUnsavedConvMessages(selectedConversation._id, user._id).then(
          () => {
            let message = {};
            message.updateType = "reload same User conv unreads";
            message.user_id = user._id;
            emitUpdateFromRef(
              selectedCommRef.current?._id,
              message,
              async (err) => {
                if (err) {
                  console.error(err);
                }
              }
            );
          }
        );
      })();
    } else {
      setLoading(false);
    }
    if (selectedConversation) {
      const numberOfUsers = selectedConversation.users?.length;

      if (numberOfUsers <= 1) {
        setDisableChat(true);
      }
    }
    if (conversation_id && selectedConversation?._id == conversation_id) {
      window.history.replaceState(null, null, "/");
      setTimeout(() => {
        if (keepSpinning) {
          let spinner = document.getElementById("pushSpinner");
          if (spinner) {
            spinner.remove();
          }
        }
      }, 305);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (
      incomingConversationMsg &&
      Object.keys(incomingConversationMsg).length
    ) {
      if (
        selectedConversation &&
        incomingConversationMsg.conversation_id === selectedConversation._id
      ) {
        setCurrentMessages((prevState) => {
          if (
            prevState.some((msg) => msg._id === incomingConversationMsg._id)
          ) {
            return prevState;
          }
          return [incomingConversationMsg, ...prevState];
        });
        removeUnsavedConvMessages(selectedConversation._id, user._id).then(
          () => {
            let message = {};
            message.updateType = "reload same User conv unreads";
            message.user_id = user._id;
            emitUpdateFromRef(
              selectedCommRef.current?._id,
              message,
              async (err) => {
                if (err) {
                  console.error(err);
                }
              }
            );
          }
        );
      }
    }
  }, [incomingConversationMsg]);

  useEffect(() => {
    if (
      incomingConversationMsgUpdate &&
      selectedConversation &&
      incomingConversationMsgUpdate?.conversation_id ===
        selectedConversation._id
    ) {
      const { conversation_id, action, _id } = incomingConversationMsgUpdate;

      let tempMsgs = currentMessages;
      if (tempMsgs && conversation_id) {
        if (action == "delete") {
          let filteredMsgs = tempMsgs.filter((msg) => msg._id !== _id);
          setCurrentMessages(filteredMsgs);
        }
        if (action == "update") {
          let index;
          tempMsgs.forEach((msg, idx) => {
            if (msg._id === _id) {
              index = idx;
            }
            if (tempMsgs[index]) {
              tempMsgs[index].reactions =
                incomingConversationMsgUpdate.reactions;
              tempMsgs[index].reactionsData =
                incomingConversationMsgUpdate.reactionsData;

              tempMsgs[index].flames = incomingConversationMsgUpdate.flames;
              tempMsgs[index].message = incomingConversationMsgUpdate.message;
            }
            setCurrentMessages(tempMsgs);
          });
        }
        triggerMsgReload((prevState) => (prevState += 1));
      }
    }
  }, [incomingConversationMsgUpdate]);

  const sortMessages = (msgs) => {
    return msgs.sort((a, b) => new Date(a.date) - new Date(b.date)).reverse();
  };
  const editMessage = (msg) => {
    setEditMessageObj(msg);
  };
  const sumbitMessageHandler = async ({ msg, atts, parentID }) => {
    if (parentID) {
      setIsSubmitting(true);
      let creator = selectedConversation.users?.find(
        (usr) => usr.userId === user?._id
      );
      let ids = selectedConversation.users?.map((usr) => usr.userId);
      let newMessage = {
        creator_id: user?._id,
        creator_name: creator.name,
        creator_image: creator.iconKey || "",
        comm_id: selectedcomm?._id,
        bookmarked: false,
        date: new Date(),
        message: msg,
        reactions: [],
        attachments: [],
        userIDS: ids,
        conversation_id: parentID,
      };

      const data = await saveConversationMessage(newMessage);

      let { id, ok } = data;
      if (ok) {
        if (id) {
          newMessage._id = id;
        }
        if (atts.length > 0) {
          uploadAttacments(id, newMessage, atts);
        } else {
          broadcastMessage(newMessage);
        }
      }
      try {
        let pushmessage = generatePushMessage({
          ...newMessage,
          pushTitle: `New message from ${newMessage.creator_name}`,
          env: process.env.NODE_ENV,
          ignoreSelf: true,
          type: "message",
        });
        let receiverIds = selectedConversation.users
          ?.filter((obj) => obj.userId !== user._id)
          .map((obj) => obj.userId);
        pushmessage.receiverIds = receiverIds;
        sendPushNotification(pushmessage);
      } catch (error) {
        console.log(error);
      }
    }
  };
  const broadcastMessage = async (message) => {
    uploadingAttchmts.current = [];
    setUploadingAttachments([]);
    message.updateType = "new conversation message";
    message.socketID = socketID;
    setConversationInputs({
      ...conversationInputs,
      [selectedConversation?._id]: "",
    });
    setIncomingConversationMessagesHandler(message);
    setNewAlerts(message, "message");
    setIsSubmitting(false);
    let { ok } = await sendUnreadConvMessages(message);
    if (ok) {
      let unreadmessage = {};
      unreadmessage.updateType = "reload conv unreads";
      unreadmessage.conversation_id =
        message.conversation_id || selectedConversation._id;
      unreadmessage.user_id = user._id;
      emitUpdate(selectedcomm?._id, unreadmessage, () => {});
    }
    emitUpdate(selectedcomm?._id, message, async (err) => {
      if (err) {
        console.error(err);
      }
    });
  };
  const uploadAttacments = async (id, newMessage, atts) => {
    let promises = [];
    atts.forEach((file, idx) => {
      uploadingAttchmts.current = [...uploadingAttchmts.current, file.name];
      setUploadingAttachments((prevAttchs) => [...prevAttchs, file.name]);
      promises.push(
        new Promise(async (res) => {
          let extention = file.name.split(".").pop();
          let name = `${selectedcomm._id}-${selectedConversation._id}-${id}_${
            idx + 1
          }_full.${extention}`;
          let thumbnail = `${selectedcomm._id}-${
            selectedConversation._id
          }-${id}_${idx + 1}_thumbnail.${extention}`;
          let bucket = "gather-message-attachments";
          const data = await getUploadURL(name, file.type, bucket);
          const { ok, uploadURL } = data;
          if (ok) {
            let reader = new FileReader();
            reader.addEventListener("loadend", async () => {
              let result = await putImageInBucket(uploadURL, reader, file.type);
              let { status } = result;
              if (status == 200) {
                let { desiredHeight, desiredWidth } = await compressImage(
                  name,
                  thumbnail,
                  bucket,
                  file.type
                );
                await addKeyToConversationDB(
                  id,
                  thumbnail,
                  file.type,
                  desiredHeight,
                  desiredWidth
                );
                res({
                  name: thumbnail,
                  fileType: file.type,
                  desiredHeight,
                  desiredWidth,
                });
              }
            });
            reader.readAsArrayBuffer(file);
          }
        })
      );
    });

    const outputs = await Promise.all(promises);
    newMessage.attachments = outputs;
    broadcastMessage(newMessage);
  };
  const updateConversation = async (selectedEditMsg, selectedInputID) => {
    let msg = selectedEditMsg;
    msg.message = conversationInputs[selectedInputID];
    await updateConversationMessage(msg);
    msg.updateType = "conversation message update";
    msg.action = "update";
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.error(err);
      }
      let { ok } = status;
      if (ok) {
        cancelEdit(selectedInputID);
      }
    });
    resetEdit();
    toggleEditing();
  };
  const openImageSlideShow = async (idx, attachments) => {
    let att = attachments[idx];
    let name = { ...att }?.name || "";
    if (name.includes("thumbnail")) {
      name = name.replace("thumbnail", "full");
    }
    const data = await getDownloadURL(
      name,
      att.fileType,
      "gather-message-attachments"
    );
    if (data) {
      const { ok, downloadURL } = data;
      if (ok) {
        setShowImageSlideShow(true);
        setImageSlideshowURL(downloadURL);
      }
    }
  };
  const resetImageSLideshow = () => {
    setImageSlideshowURL(null);
    setShowImageSlideShow(false);
  };
  const cancelEdit = (selectedInputID) => {
    setConversationInputs({ ...conversationInputs, [selectedInputID]: "" });
  };
  const resetEdit = () => {
    setEditMessageObj({});
  };
  const toggleEditing = (msgId) => {
    setMessageEditing(msgId);
  };
  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    const threshold = 100;

    const absScrollTop = Math.abs(scrollTop);
    const isNearBottom =
      absScrollTop + clientHeight + threshold >= scrollHeight;

    if (isNearBottom && !loading && hasMore && !scrollLock) {
      setScrollLock(true);
      setPage((prevState) => prevState + 1);
    }
  };
  return (
    <>
      {showImageSlideShow ? (
        <>
          <div className={styles.imageViewer}>
            <ImageViewer
              src={[imageSlideshowURL]}
              closeOnClickOutside={true}
              onClose={resetImageSLideshow}
              backgroundStyle={{
                backgroundColor: "rgba(0,0,0,0.92)",
              }}
            />
          </div>
        </>
      ) : null}
      <div className={styles.Holder}>
        <div id={styles.ChatMessages} onScroll={handleScroll}>
          <div ref={messagesEndRef} />
          {currentMessages && currentMessages.length > 0 ? (
            currentMessages.map((msg) => (
              <Fragment key={msg?._id}>
                <ChatSingleMessage
                  msgReload={msgReload}
                  editMessageText={editMessage}
                  msg={msg}
                  key={msg?._id}
                  messageID={msg?._id}
                  openImageSlideShow={openImageSlideShow}
                  showImageSlideShow={showImageSlideShow}
                  imageSlideshowURL={imageSlideshowURL}
                  resetImageSLideshow={resetImageSLideshow}
                  bucket="gather-message-attachments"
                  chatType="gather"
                  resetEdit={resetEdit}
                  isEditing={messageEditing === msg?._id ? true : false}
                  toggleEditing={toggleEditing}
                />
              </Fragment>
            ))
          ) : loading ? (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate3d(-50%, -50%, 0)",
              }}
            >
              <SpinningLoader spinnerOnly={true} />
            </div>
          ) : (
            <div className={styles.NoPosts}>
              <TalkingHead
                className={styles.wizard}
                text="Nothing to see here yet. Be the first and share something awesome!"
                isSmall={true}
              />
            </div>
          )}
        </div>

        {isMobile ? (
          <div className={styles.InputMobile}>
            <DumbChatInput
              selectedEdit={editMessageObj}
              Inputs={conversationInputs}
              setInputs={setConversationInputs}
              selectedInputID={selectedConversation?._id}
              sendMessage={sumbitMessageHandler}
              updateMessage={updateConversation}
              disableChat={disableChat}
              resetEdit={resetEdit}
              toggleEditing={toggleEditing}
              uploading={uploadingAttchmts.current}
              isSubmitting={isSubmitting}
            ></DumbChatInput>
          </div>
        ) : (
          <div className={styles.InputDesktop}>
            <DumbChatInput
              selectedEdit={editMessageObj}
              Inputs={conversationInputs}
              setInputs={setConversationInputs}
              selectedInputID={selectedConversation?._id}
              sendMessage={sumbitMessageHandler}
              updateMessage={updateConversation}
              disableChat={disableChat}
              resetEdit={resetEdit}
              toggleEditing={toggleEditing}
              uploading={uploadingAttchmts.current}
              isSubmitting={isSubmitting}
            ></DumbChatInput>
          </div>
        )}
      </div>
    </>
  );
};
