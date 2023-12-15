import { useState, useRef, useEffect } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { IconSend } from "../../resources/icons/IconSend";
import { IconImage } from "../../resources/icons/IconImage";
import { IconAddReactionNoFill } from "../../resources/icons/IconAddReactionNoFill";
import ImageHolder from "./ImageHolder";
import styles from "./ChatInputGeneral.module.scss";

const ChatInputGeneral = ({ onSubmitHandler, uploadingAttachments = [] }) => {
  const [attachments, setAttachments] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [altKey, setAltKey] = useState(false);
  const [emojiPickerState, setEmojiPicker] = useState(false);
  const textRef = useRef();
  const fileRef = useRef();
  const attRefs = useRef([]);
  const originalHeightRef = useRef();
  const [hasInput, setHasInput] = useState(false);

  useEffect(() => {
    if (attachments.length > 0) {
      attachments.forEach((file, idx) => {
        var reader = new FileReader();
        reader.onload = function (e) {
          const { result } = e.target;
          attRefs.current[idx].src = result;
        };
        if (file) {
          reader.readAsDataURL(file);
        }
      });
    }
  }, [attachments]);

  useEffect(() => {
    originalHeightRef.current = textRef.current.style.height;
  }, []);

  useEffect(() => {
    if (!uploadingAttachments.length) {
      resetInput();
    }
  }, [uploadingAttachments]);

  const removeAttachment = (idx) => {
    const tempAttachments = [...attachments];
    tempAttachments.splice(idx, 1);
    setAttachments([...tempAttachments]);
  };

  const inputHandler = (e) => {
    const { value } = e.target;
    setMessageText(value);
    setHasInput(value.trim().length > 0);
  };

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
      setHasInput(false);
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

  const dropHandler = (e) => {
    e.preventDefault();
    const { files } = e.dataTransfer;
    addAttachment(files[0]);
  };

  const addAttachment = (file) => {
    setAttachments([...attachments, file]);
  };

  const triggerPicker = (event) => {
    event.preventDefault();
    setEmojiPicker(!emojiPickerState);
  };

  const EmojiPicker = () => {
    if (emojiPickerState) {
      return (
        <div className={styles.EmojiPicker}>
          <Picker
            data={data}
            className={`attach-emoji ${styles.emojiPicker}`}
            onEmojiSelect={addEmoji}
            autoFocus={true}
            emojiButtonColors={[
              "rgba(187, 126, 196, 0.8)",
              "rgb(13, 161, 181, .8)",
              "rgba(240, 101, 115, 0.8)",
              "rgb(0, 163, 150, 0.8)",
            ]}
            // onClickOutside={setEmojiPicker(!emojiPickerState)}
          />
        </div>
      );
    }
    return null;
  };

  const addEmoji = (e) => {
    let msg = messageText + e.native;
    setMessageText(msg);
    setEmojiPicker(!emojiPickerState);
  };

  const openFileSelector = () => {
    fileRef.current.click();
  };

  const MessageSubmits = () => {
    const isDisabled =
      messageText.trim().length === 0 && attachments.length == 0;

    return (
      <div id={styles.ChatInputControlsRight}>
        <button
          className={hasInput ? styles.SendActive : styles.SendMessage}
          disabled={isDisabled}
          onClick={() => {
            sendMessagge();
          }}
          aria-label="send chat message"
        >
          <IconSend />
        </button>
      </div>
    );
  };

  const sendMessagge = () => {
    let message = {
      value: messageText,
      attachments: attachments,
    };
    resetHeight();
    onSubmitHandler(message);
  };

  const resetInput = () => {
    setMessageText("");
    setAttachments([]);
    setEmojiPicker(null);
  };

  return (
    <div id={styles.ChatInput}>
      <div className={styles.entryBox}>
        <ImageHolder
          attachments={attachments}
          removeAttachment={removeAttachment}
          attRefs={attRefs}
          uploading={uploadingAttachments}
          isDark={true}
        />
        <textarea
          id={styles.ChatInputText}
          ref={textRef}
          spellCheck="true"
          onChange={(e) => {
            inputHandler(e);
            calcHeight(e.target.value);
          }}
          value={messageText}
          onKeyDown={(e) => {
            let input = messageText;
            if (e.altKey) {
                setAltKey(true);
            }
            if (e.key === "Enter" && altKey) {
                input = input + "\r\n";
                setMessageText(input);
            } else if (e.key === "Enter" && !e.shiftKey && input.trim().length > 0) {
                e.preventDefault(); // Prevents the default behavior of sending the message
                sendMessagge();
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
          placeholder="say something"
        ></textarea>
      </div>
        <div id={styles.ChatInputControls}>
          <div id={styles.ChatInputControlsLeft}>
            <button
              className={styles.AttachEmoji}
              onClick={triggerPicker}
              aria-label="add emoji reaction"
            >
              <IconAddReactionNoFill />
            </button>
            <EmojiPicker />
            {/* <button className={styles.AttachGif}>attach gif</button> */}
            <button
              onClick={openFileSelector}
              className={styles.AttachFile}
              aria-label="attach image"
            >
              <IconImage />
            </button>
            <input
              ref={fileRef}
              type="file"
              id="file-input"
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

export default ChatInputGeneral;
