import { useState, useRef, useEffect, useContext } from "react";
import { IconSend } from "../../resources/icons/IconSend";
import { IconAddReactionNoFill } from "../../resources/icons/IconAddReactionNoFill";
import { IconImage } from "../../resources/icons/IconImage";
import { MobileContext } from "contexts/mobile";

import {
  saveMessage,
  sendUnreadMessages,
  updateMessage,
  getTopicsRecieverIds,
} from "../../requests/chat";
import { useComms } from "../../contexts/comms";
import { useAuth } from "../../contexts/auth";
import { useSocket } from "../../contexts/socket";

import {
  getUploadURL,
  putImageInBucket,
  compressImage,
  putVideoInBucket,
} from "../../requests/s3";
import { addKeyToDB } from "../../requests/chat";

import ImageHolder from "./ImageHolder";
import styles from "./ChatInput.module.scss";
import { sendPushNotification } from "requests/subscriptions";
import { EmojiWrapper } from "components/EmojiWrapper/EmojiWrapper";
import { generatePushMessage } from "services/helper";

const ChatInput = (props) => {
  const [attachments, setAttachments] = useState([]);
  const [emojiPickerState, setEmojiPicker] = useState(false);
  const [selectedEditMsg, setSelectedEditMsg] = useState({});
  const [uploadingAttachments, setUploadingAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isMobile } = useContext(MobileContext);
  const [altKey, setAltKey] = useState(false);
  const [allowBlur, setAllowBlur] = useState(false);
  const [offsetY, setOffsetY] = useState(0);

  const { user } = useAuth();
  const { selectedcomm, selectedTopic, selectedCommRef } = useComms();
  const { emitUpdate, setIncomingMsg, setNewAlerts, socketID } = useSocket();

  const {
    selectedEdit,
    topicInputs,
    setTopicInputs,
    resetEdit,
    toggleEditing,
    toggleOverlay,
  } = props;

  const inputBoxContainerRef = useRef();
  const textRef = useRef();
  const fileRef = useRef();
  const attRefs = useRef([]);
  const originalHeightRef = useRef();
  const lastTriggered = useRef(null);
  const lastTriggeredImage = useRef(null);
  const resizeInitialShift = useRef(false);
  const currentHeightRef = useRef(0);
  const ignoreNextResize = useRef(false);
  let closeTimer = null;

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
    if (isMobile) {
      const handleChange = () => {
        if (document.hidden) {
          const messageContainer = document.getElementById("messageResizer");
          const chatHeaderContainer = document.getElementById("chatHeader");
          setAllowBlur(true);
          setOffsetY(0);
          ignoreNextResize.current = false;
          resizeInitialShift.current = false;
          if (messageContainer) {
            messageContainer.style.transform = "";
          }
          if (chatHeaderContainer) {
            chatHeaderContainer.style.transform = "";
          }
          if (textRef.current) {
            textRef.current.blur();
          }
        }
      };
      const handleResize = () => {
        const vh = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--vh"),
          10
        );

        const heightDifference = vh - window.innerHeight;
        let isFocused = textRef.current === document.activeElement;
        const messageContainer = document.getElementById("messageResizer");
        const chatHeaderContainer = document.getElementById("chatHeader");
        console.log(resizeInitialShift.current, ignoreNextResize.current);
        if (isFocused) {
          if (!resizeInitialShift.current) {
            if (heightDifference > 0) {
              setOffsetY(-heightDifference);
              if (messageContainer) {
                messageContainer.style.transform = `translateY(${-heightDifference}px)`;
              }
              if (chatHeaderContainer) {
                chatHeaderContainer.style.transform = `translateY(${-heightDifference}px)`;
              }
            } else {
              setOffsetY(heightDifference);
              if (messageContainer) {
                messageContainer.style.transform = `translateY(${heightDifference}px)`;
              }
              if (chatHeaderContainer) {
                chatHeaderContainer.style.transform = `translateY(${heightDifference}px)`;
              }
            }
            if (heightDifference !== 0) {
              resizeInitialShift.current = true;
            }
          } else {
            if (ignoreNextResize.current) {
              if (closeTimer) {
                clearTimeout(closeTimer);
              }
              ignoreNextResize.current = false;
              setOffsetY(0);
              if (messageContainer) {
                messageContainer.style.transform = "";
              }
              if (chatHeaderContainer) {
                chatHeaderContainer.style.transform = "";
              }
              resizeInitialShift.current = false;
            } else {
              ignoreNextResize.current = true;
              closeTimer = setTimeout(() => {
                ignoreNextResize.current = false;
                setOffsetY(0);
                if (messageContainer) {
                  messageContainer.style.transform = "";
                }
                if (chatHeaderContainer) {
                  chatHeaderContainer.style.transform = "";
                }
                resizeInitialShift.current = false;
              }, 150);
            }
          }
        } else {
          setOffsetY(0);
          if (messageContainer) {
            messageContainer.style.transform = "";
          }
          if (chatHeaderContainer) {
            chatHeaderContainer.style.transform = "";
          }
        }
        currentHeightRef.current = window.innerHeight;
      };
      const preventTouchScroll = (e) => {
        if (
          textRef.current &&
          textRef.current === document.activeElement &&
          window.innerWidth <= 640
        ) {
          e.preventDefault();
        }
      };

      window.addEventListener("visibilitychange", handleChange);
      window.addEventListener("resize", handleResize);
      window.addEventListener("touchmove", preventTouchScroll, {
        passive: false,
      });

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("visibilitychange", handleChange);
        window.removeEventListener("touchmove", preventTouchScroll);
      };
    }
  }, [isMobile]);

  useEffect(() => {
    setTopicInputs({
      ...topicInputs,
      [selectedTopic?._id]: selectedEdit?.message,
    });
    setSelectedEditMsg(selectedEdit);
  }, [selectedEdit]);

  useEffect(() => {
    if (selectedEditMsg?._id) {
      textRef.current.focus();
    }
  }, [selectedEditMsg?._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputBoxContainerRef.current &&
        !inputBoxContainerRef.current.contains(event.target)
      ) {
        console.log("allow blur clicked outside");
        setAllowBlur(true);
      }
    };

    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [inputBoxContainerRef]);

  const calcHeight = (reset) => {
    const textarea = textRef.current;

    if (reset) {
      textarea.style.height = "48px";
      textarea.style.overflowY = "auto";
      return;
    }

    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const paddingTop = parseInt(getComputedStyle(textarea).paddingTop);
    const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom);
    const minHeight = lineHeight + paddingTop + paddingBottom;

    textarea.style.height = "auto";
    textarea.style.overflowY = "hidden"; // Temporarily hide the scrollbar to get accurate scrollHeight

    textarea.offsetHeight; // Forces a reflow

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
  const handleBlur = (e) => {
    const messageContainer = document.getElementById("messageResizer");
    const chatHeaderContainer = document.getElementById("chatHeader");

    if (!isMobile || allowBlur) {
      if (toggleOverlay) {
        toggleOverlay(false);
      }
      resizeInitialShift.current = false;
      ignoreNextResize.current = false;
      setOffsetY(0);
      if (messageContainer) {
        messageContainer.style.transform = "";
      }
      if (chatHeaderContainer) {
        chatHeaderContainer.style.transform = "";
      }
      return;
    }

    e.preventDefault();
    textRef.current.focus();

    setAllowBlur(false);
  };
  const resetHeight = () => {
    textRef.current.style.height = originalHeightRef.current;
    textRef.current.style.overflowY = "auto";
  };
  const getPastedData = (e) => {
    const { files } = e.clipboardData;
    if (files[0]) {
      addAttachment(files[0]);
    }
  };
  const openFileSelector = () => {
    const now = Date.now();
    if (lastTriggeredImage.current && now - lastTriggeredImage.current < 300) {
      return;
    }

    lastTriggeredImage.current = now;
    setAllowBlur(true);
    fileRef.current.click();
  };
  const addAttachment = (file) => {
    setAttachments((prevAttch) => [...prevAttch, file]);
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
  const inputHandler = (e) => {
    const { value } = e.target;
    setTopicInputs({ ...topicInputs, [selectedTopic?._id]: value });
    setAllowBlur(false);
  };
  const cancelEdit = () => {
    setUploadingAttachments([]);
    setAttachments([]);
    setTopicInputs({ ...topicInputs, [selectedTopic?._id]: "" });
    setSelectedEditMsg({});
    resetEdit();
    toggleEditing();
    calcHeight(true);
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
        const hasAttachments = attachments.length > 0;
        let { id, ok } = data;
        if (ok) {
          if (id) {
            newMessage._id = id;
          }
          if (hasAttachments) {
            uploadAttacments(id, newMessage);
          } else {
            broadcastMessage(newMessage);
            resetHeight();
          }
        }
        try {
          let pushmessage = generatePushMessage({
            ...newMessage,
            pushTitle: `New message from ${newMessage.creator_name}`,
            env: process.env.NODE_ENV,
            ignoreSelf: true,
            type: "chat",
          });

          if (!pushmessage.message) {
            pushmessage.message = "";

            if (hasAttachments) {
              pushmessage.message = "Check out the new image!";
            }
          }

          getTopicsRecieverIds(newMessage).then(({ userIDsToNotify }) => {
            if (userIDsToNotify && userIDsToNotify.length) {
              pushmessage.receiverIds = userIDsToNotify;
              sendPushNotification(pushmessage);
            }
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
    return true;
  };
  const broadcastMessage = async (message) => {
    setAllowBlur(true);
    setUploadingAttachments([]);
    setAttachments([]);
    message.updateType = "new message";
    message.socketID = socketID;
    setTopicInputs({ ...topicInputs, [selectedTopic?._id]: "" });
    setIncomingMsg(message);
    setNewAlerts(message, "chat");
    setIsSubmitting(false);
    calcHeight(true);
    let { ok } = await sendUnreadMessages(message);
    if (ok) {
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
          const baseName = `${selectedcomm._id}-${selectedTopic._id}-${id}_${
            idx + 1
          }`;
          const bucket = "topic-message-attachments";
          const isVideo = file.type.includes("video");
          if (isVideo) {
            const name = `${baseName}.${extention}`;
            const data = await getUploadURL(name, file.type, bucket);
            const { uploadURL } = data;
            const result = await putVideoInBucket(uploadURL, file);
            console.log(result);
            await addKeyToDB(id, name, file.type);
            res({
              name: name,
              fileType: file.type,
            });
          } else {
            const isGif = file.type === "image/gif";
            const name = isGif
              ? `${baseName}.${extention}`
              : `${baseName}_full.${extention}`;
            const thumbnail = isGif
              ? name
              : `${baseName}_thumbnail.${extention}`;

            const data = await getUploadURL(name, file.type, bucket);
            const { ok, uploadURL } = data;
            if (ok) {
              let reader = new FileReader();
              reader.addEventListener("loadend", async () => {
                let result = await putImageInBucket(
                  uploadURL,
                  reader,
                  file.type
                );
                let { status } = result;
                if (status == 200) {
                  if (isGif) {
                    await addKeyToDB(id, thumbnail, file.type);
                    res({
                      name: thumbnail,
                      fileType: file.type,
                    });
                  } else {
                    let { desiredHeight, desiredWidth } = await compressImage(
                      name,
                      thumbnail,
                      bucket,
                      file.type
                    );
                    await addKeyToDB(
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
                }
              });
              reader.readAsArrayBuffer(file);
            }
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
    let isDisabled =
      ((topicInputs && topicInputs[selectedTopic?._id]) || "").trim().length ===
        0 && attachments.length == 0;

    if (isSubmitting) {
      isDisabled = true;
    }

    if (!isDisabled) {
      if (Object.keys(selectedEditMsg).length > 0) {
        updateMsg();
      } else {
        sendMessagge();
      }
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
          <div
            id={
              isMobile
                ? styles.ChatInputMobileControlsRight
                : styles.ChatInputControlsRight
            }
          >
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
              onClick={() => {
                if (isDisabled) {
                  cancelEdit();
                } else {
                  updateMsg();
                }
              }}
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
  const triggerPicker = () => {
    const now = Date.now();
    if (lastTriggered.current && now - lastTriggered.current < 300) {
      return;
    }

    lastTriggered.current = now;
    setAllowBlur(true);
    setEmojiPicker((prevState) => !prevState);
  };

  return (
    <div
      ref={inputBoxContainerRef}
      id={isMobile ? styles.ChatInputMobile : styles.ChatInput}
      style={{ transform: `translateY(${offsetY}px)`, zIndex: 2 }}
    >
      <div className={styles.entryBox}>
        <ImageHolder
          attachments={attachments}
          removeAttachment={removeAttachment}
          attRefs={attRefs}
          uploading={uploadingAttachments}
        />
        <textarea
          id={styles.ChatInputText}
          placeholder="say something"
          ref={textRef}
          autoComplete="off"
          autoCorrect="off"
          onBlur={handleBlur}
          onChange={(e) => {
            inputHandler(e);
            calcHeight();
          }}
          onFocus={() => {
            if (toggleOverlay) {
              toggleOverlay(true);
            }

            setAllowBlur(false);
            calcHeight();
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
            } else if (e.key === "Enter" && isMobile) {
              input = input + "\n";
              setTopicInputs({
                ...topicInputs,
                [selectedTopic?._id]: input,
              });
            } else if (
              e.key === "Enter" &&
              !e.shiftKey &&
              input.trim().length > 0
            ) {
              e.preventDefault();
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
      <div
        id={
          isMobile ? styles.ChatInputMobileControls : styles.ChatInputControls
        }
      >
        <div
          id={
            isMobile
              ? styles.ChatInputMobileControlsLeft
              : styles.ChatInputControlsLeft
          }
        >
          <button
            onMouseDown={triggerPicker}
            onTouchStart={triggerPicker}
            aria-label="add emoji reaction"
          >
            <IconAddReactionNoFill />
          </button>
          <EmojiPicker />
          <button
            aria-label="attach an image"
            onMouseDown={openFileSelector}
            onTouchStart={openFileSelector}
          >
            <IconImage />
          </button>
          <input
            ref={fileRef}
            type="file"
            id="file-input"
            accept="image/*,video/mp4,video/webm,video/ogg,video/x-msvideo,video/quicktime,video/x-matroska,video/x-flv,video/3gpp,video/3gpp2,video/mpeg,video/x-ms-wmv"
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
