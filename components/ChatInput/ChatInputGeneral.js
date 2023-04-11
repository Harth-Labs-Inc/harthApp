import { useContext, useState, useRef, useEffect } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import { MobileContext } from "../../contexts/mobile";

import { IconSend } from "../../resources/icons/IconSend";
import { IconImage } from "../../resources/icons/IconImage";
import { IconAddReactionNoFill } from "../../resources/icons/IconAddReactionNoFill";

import ImageHolder from "./ImageHolder";
import styles from "./ChatInput.module.scss";

const GeneralChatInput = ({
  onSubmitHandler,
  uploadingAttachments = [],
  shouldReset,
}) => {
  const [attachments, setAttachments] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [altKey, setAltKey] = useState(false);
  const [emojiPickerState, setEmojiPicker] = useState(false);

  const textRef = useRef();
  const fileRef = useRef();
  const attRefs = useRef([]);

  const { isMobile } = useContext(MobileContext);

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
  };

  const calcHeight = (value) => {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length;
    let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;
    return newHeight;
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
          className={styles.SendMessage}
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
    onSubmitHandler(message);
  };

  const resetInput = () => {
    setMessageText("");
    setAttachments([]);
    setEmojiPicker(null);
  };

  return (
    <div id={styles.ChatInput}>
      <ImageHolder
        attachments={attachments}
        removeAttachment={removeAttachment}
        attRefs={attRefs}
        uploading={uploadingAttachments}
      />
      <textarea
        id={styles.ChatInputText}
        ref={textRef}
        onChange={inputHandler}
        value={messageText}
        onKeyDown={(e) => {
          let input = messageText;
          if (e.altKey) {
            setAltKey(true);
          }
          if (e.key == "Enter" && altKey) {
            input = input + "\r\n";
            setMessageText(input);
            textRef.current.style.height =
              calcHeight(textRef.current.value) + "px";
          } else if (e.key === "Enter" && input.trim().length > 0) {
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
      ></textarea>
      {!isMobile ? (
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
      ) : null}
    </div>
  );
};

export default GeneralChatInput;
