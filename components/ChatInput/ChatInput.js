import { useState, useRef, useEffect } from "react";
import { IconSend } from "../../resources/icons/IconSend";
import { IconAddReactionNoFill } from "../../resources/icons/IconAddReactionNoFill";
import { IconImage } from "../../resources/icons/IconImage";

import {
  saveMessage,
  saveUnreadMessage,
  updateMessage,
} from "../../requests/chat";
import { useComms } from "../../contexts/comms";
import { useAuth } from "../../contexts/auth";
import { useSocket } from "../../contexts/socket";

import {
  getUploadURL,
  putImageInBucket,
  compressImage,
} from "../../requests/s3";
import { addKeyToDB } from "../../requests/chat";

import ImageHolder from "./ImageHolder";
import styles from "./ChatInput.module.scss";
import { sendPushNotification } from "requests/subscriptions";
import { EmojiWrapper } from "components/EmojiWrapper/EmojiWrapper";

const ChatInput = (props) => {
  const [attachments, setAttachments] = useState([]);
  const [emojiPickerState, setEmojiPicker] = useState(false);
  const [selectedEditMsg, setSelectedEditMsg] = useState({});
  const [uploadingAttachments, setUploadingAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [altKey, setAltKey] = useState(false);

  const { user } = useAuth();
  const { selectedcomm, selectedTopic, selectedCommRef } = useComms();
  const { emitUpdate, setIncomingMsg, setNewAlerts, socketID } = useSocket();

  const {
    selectedEdit,
    isReply,
    topicInputs,
    setTopicInputs,
    resetEdit,
    toggleEditing,
  } = props;

  const textRef = useRef();
  const fileRef = useRef();
  const attRefs = useRef([]);
  const originalHeightRef = useRef();

  useEffect(() => {
    if (attachments.length > 0) {
      attachments.forEach((file, idx) => {
        var reader = new FileReader();
        reader.onload = function (e) {
          const { result } = e.target;
          attRefs.current[idx].src = result;
        };
        reader.readAsDataURL(file);
      });
    }
  }, [attachments]);

  useEffect(() => {
    originalHeightRef.current = textRef.current.style.height;
  }, []);

  useEffect(() => {
    setTopicInputs({
      ...topicInputs,
      [selectedTopic?._id]: selectedEdit?.message,
    });

    setSelectedEditMsg(selectedEdit);
  }, [selectedEdit]);

  // input only related
  const calcHeight = () => {
    const textarea = textRef.current;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const paddingTop = parseInt(getComputedStyle(textarea).paddingTop);
    const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom);
    const minHeight = lineHeight + paddingTop + paddingBottom;
    textarea.style.height = "auto";
    textarea.style.overflowY = "hidden"; // Temporarily hide the scrollbar

    // Calculate the scrollHeight and newHeight
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.max(minHeight, scrollHeight);

    if (newHeight > 360) {
      textarea.style.height = "360px";
      textarea.style.overflowY = "scroll";
    } else {
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = "auto";
    }
  };

  const resetHeight = () => {
    textRef.current.style.height = originalHeightRef.current;
    textRef.current.style.overflowY = "auto";
  };
  const getPastedData = (e) => {
    const { files } = e.clipboardData;
    // const text = e.clipboardData.getData("Text");
    if (files[0]) {
      addAttachment(files[0]);
    }
    // if (text) {
    // }
  };
  const openFileSelector = () => {
    fileRef.current.click();
  };
  const addAttachment = (file) => {
    setAttachments([...attachments, file]);
  };
  const removeAttachment = (idx) => {
    const tempAttachments = [...attachments];
    tempAttachments.splice(idx, 1);
    setAttachments([...tempAttachments]);
  };
  const dropHandler = (e) => {
    e.preventDefault();
    const { files } = e.dataTransfer;
    console.log(files, "drop handler");
    addAttachment(files[0]);
  };
  const EmojiPicker = () => {
    if (emojiPickerState) {
      return (
        <div className={styles.EmojiPicker}>
          <EmojiWrapper
            addEmoji={addEmoji}
            closeWrapper={triggerPicker}
          ></EmojiWrapper>
        </div>
      );
    }
    return null;
  };
  const triggerPicker = () => {
    setEmojiPicker(!emojiPickerState);
  };

  // need to update to be input and prop deperndent
  const inputHandler = (e) => {
    const { value } = e.target;
    setTopicInputs({ ...topicInputs, [selectedTopic?._id]: value });
  };
  const cancelEdit = () => {
    setTopicInputs({ ...topicInputs, [selectedTopic?._id]: "" });
    setSelectedEditMsg({});
    resetEdit();
    toggleEditing();
  };
  const addEmoji = (e) => {
    let text = topicInputs[selectedTopic?._id];
    if (!text || text == "undefined") {
      text = "";
    }
    let msg = text + e.native;
    setTopicInputs({ ...topicInputs, [selectedTopic?._id]: msg });
    setEmojiPicker(!emojiPickerState);
  };
  // need to be moved to parent
  const sendMessagge = async () => {
    if (selectedTopic && selectedcomm && user) {
      let creator = selectedcomm.users.find((usr) => usr.userId === user._id);
      if (creator) {
        setIsSubmitting(true);
        let newMessage = {
          creator_id: user?._id,
          creator_name: creator.name,
          creator_image: creator.iconKey,
          topic_id: selectedTopic?._id,
          comm_id: selectedcomm?._id,
          bookmarked: false,
          date: new Date(),
          message: topicInputs[selectedTopic?._id],
          flames: [],
          reactions: [],
          attachments: [],
          replies: [],
          reactionsData: [],
        };

        const data = await saveMessage(newMessage);
        try {
          console.log("sending push...");
          sendPushNotification({ ...newMessage, env: process.env.NODE_ENV });
        } catch (error) {
          console.log(error);
        }
        let { id, ok } = data;
        if (ok) {
          if (id) {
            newMessage._id = id;
          }
          if (attachments.length > 0) {
            uploadAttacments(id, newMessage);
          } else {
            broadcastMessage(newMessage);
            resetHeight();
          }
        }
      }
    }
    return true;
  };
  const broadcastMessage = async (message) => {
    setUploadingAttachments([]);
    setAttachments([]);
    message.updateType = "new message";
    message.socketID = socketID;
    setTopicInputs({ ...topicInputs, [selectedTopic?._id]: "" });
    setIncomingMsg(message);
    setNewAlerts(message, "chat");
    setIsSubmitting(false);
    const users = selectedCommRef.current?.users?.filter(
      (usr) => usr.userId !== user._id
    );
    if (users) {
      const promises = [];
      users.forEach((usr) => {
        promises.push(
          new Promise(async (res) => {
            let data = {
              topic_id: message.topic_id,
              creator_id: message.creator_id,
              user_id: usr.userId,
              creator_name: message.creator_name,
              creator_image: message.creator_image,
              comm_id: message.comm_id,
              date: message.date,
            };
            await saveUnreadMessage(data);
            res(true);
          })
        );
      });
      await Promise.all(promises);
      let unreadmessage = {};
      unreadmessage.updateType = "reload unreads";
      unreadmessage.topic_id = selectedTopic._id;
      unreadmessage.user_id = user._id;
      emitUpdate(selectedCommRef.current?._id, unreadmessage, () => {});
    }
    emitUpdate(selectedcomm?._id, message, async (err) => {
      if (err) {
        console.error(err);
      }
    });
  };
  const uploadAttacments = async (id, message) => {
    let promises = [];
    attachments.forEach((file, idx) => {
      setUploadingAttachments((prevAttchs) => [...prevAttchs, file.name]);
      promises.push(
        new Promise(async (res) => {
          let extention = file.name.split(".").pop();
          let name = `${selectedcomm._id}-${selectedTopic._id}-${id}_${
            idx + 1
          }_full.${extention}`;
          let thumbnail = `${selectedcomm._id}-${selectedTopic._id}-${id}_${
            idx + 1
          }_thumbnail.${extention}`;

          let bucket = "topic-message-attachments";
          const data = await getUploadURL(name, file.type, bucket);
          const { ok, uploadURL } = data;
          if (ok) {
            let reader = new FileReader();
            reader.addEventListener("loadend", async () => {
              let result = await putImageInBucket(uploadURL, reader, file.type);
              let { status } = result;
              if (status == 200) {
                await compressImage(name, thumbnail, bucket, file.type);
                await addKeyToDB(id, thumbnail, file.type);
                res({ name: thumbnail, fileType: file.type });
              }
            });
            reader.readAsArrayBuffer(file);
          }
        })
      );
    });

    const outputs = await Promise.all(promises);
    message.attachments = outputs;
    broadcastMessage(message);
    resetHeight();
  };
  const updateMsg = async () => {
    let msg = selectedEditMsg;
    msg.message = topicInputs[selectedTopic?._id];
    await updateMessage(msg);
    msg.updateType = "message update";
    msg.action = "update";
    emitUpdate(selectedcomm?._id, msg, async (err, status) => {
      if (err) {
        console.error(err);
      }
      let { ok } = status;
      if (ok) {
        cancelEdit();
      }
    });
  };
  const submitMessageLogic = () => {
    if (isReply) {
      // sendReply();
    } else {
      sendMessagge();
    }
  };
  const MessageSubmits = () => {
    let isDisabled =
      ((topicInputs && topicInputs[selectedTopic?._id]) || "").trim().length ===
        0 && attachments.length == 0;

    if (isSubmitting) {
      isDisabled = true;
    }
    if (!isSubmitting) {
      if (Object.keys(selectedEditMsg).length > 0) {
        return (
          <div id={styles.ChatInputControlsRight}>
            <button
              onClick={cancelEdit}
              className={styles.EditCancel}
              aria-label="cancel edit chat message"
            >
              cancel
            </button>
            <button
              className={styles.SendActive}
              aria-label="send chat message"
              disabled={isDisabled}
              onClick={updateMsg}
            >
              <IconSend />
            </button>
          </div>
        );
      } else {
        return (
          <div id={styles.ChatInputControlsRight}>
            <button
              disabled={isDisabled}
              className={
                topicInputs[selectedTopic?._id] ? styles.SendActive : ""
              }
              aria-label="send chat message"
              onClick={() => {
                submitMessageLogic();
              }}
            >
              <IconSend />
            </button>
          </div>
        );
      }
    }
  };
  return (
    <div id={styles.ChatInput}>
      <div className={styles.entryBox}>
        <ImageHolder
          attachments={attachments}
          removeAttachment={removeAttachment}
          attRefs={attRefs}
          uploading={uploadingAttachments}
        />
        <textarea
          id={styles.ChatInputText}
          ref={textRef}
          onChange={(e) => {
            inputHandler(e);
            calcHeight(e.target.value);
          }}
          value={(topicInputs && topicInputs[selectedTopic?._id]) || ""}
          onKeyDown={(e) => {
            let input = topicInputs[selectedTopic?._id] || "";
            if (e.altKey) {
              setAltKey(true);
            }
            if (e.key === "Enter" && altKey) {
              input = input + "\r\n";
              setTopicInputs({
                ...topicInputs,
                [selectedTopic?._id]: input,
              });
            } else if (
              e.key === "Enter" &&
              !e.shiftKey &&
              input.trim().length > 0
            ) {
              e.preventDefault(); // Prevents the default behavior of sending the message
              submitMessageLogic();
            }
          }}
          onKeyUp={() => {
            setAltKey(false);
          }}
          onPaste={getPastedData}
          onDragEnter={(e) => {
            e.preventDefault();
            return false;
          }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            dropHandler(e);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
          }}
        ></textarea>
      </div>
      <div id={styles.ChatInputControls}>
        <div id={styles.ChatInputControlsLeft}>
          <button onClick={triggerPicker} aria-label="add emoji reaction">
            <IconAddReactionNoFill />
          </button>
          <EmojiPicker />
          <button aria-label="attach an image" onClick={openFileSelector}>
            <IconImage />
          </button>
          <input
            ref={fileRef}
            type="file"
            id="file-input"
            accept="image/*"
            onChange={(e) => {
              const { files } = e.target;
              addAttachment(files[0]);
            }}
            style={{ display: "none" }}
          />
        </div>
        <MessageSubmits />
      </div>
    </div>
  );
};

export default ChatInput;
