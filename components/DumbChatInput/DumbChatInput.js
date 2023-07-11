import { useState, useRef, useEffect } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import { IconSend } from "../../resources/icons/IconSend";
import { IconAddReactionNoFill } from "../../resources/icons/IconAddReactionNoFill";
import { IconImage } from "../../resources/icons/IconImage";

// import { updateConversationMessage } from "../../requests/conversations";

import ImageHolder from "../ChatInput/ImageHolder";
import styles from "./DumbChatInput.module.scss";
import { EmojiWrapper } from "components/EmojiWrapper/EmojiWrapper";

const DumbChatInput = (props) => {
  const [attachments, setAttachments] = useState([]);
  const [emojiPickerState, setEmojiPicker] = useState(false);
  const [selectedEditMsg, setSelectedEditMsg] = useState({});

  const [altKey, setAltKey] = useState(false);

  const {
    selectedEdit,
    Inputs,
    setInputs,
    selectedInputID,
    sendMessage,
    updateMessage,
    disableChat,
    resetEdit,
    toggleEditing,
    uploading,
    isSubmitting,
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
    if (!isSubmitting && attachments.length) {
      setAttachments([]);
    }
  }, [isSubmitting]);

  useEffect(() => {
    if (setInputs) {
      setInputs({
        ...Inputs,
        [selectedInputID]: selectedEdit?.message,
      });
    }

    setSelectedEditMsg(selectedEdit);
  }, [selectedEdit]);

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
  const triggerPicker = (event) => {
    event.preventDefault();
    setEmojiPicker(!emojiPickerState);
  };

  const inputHandler = (e) => {
    const { value } = e.target;
    setInputs({ ...Inputs, [selectedInputID]: value });
  };
  const cancelEdit = () => {
    setInputs({ ...Inputs, [selectedInputID]: "" });
    setSelectedEditMsg({});
    resetEdit();
    toggleEditing();
  };
  const addEmoji = (e) => {
    let text = Inputs[selectedInputID];
    if (!text || text == "undefined") {
      text = "";
    }
    let msg = text + e.native;
    setInputs({ ...Inputs, [selectedInputID]: msg });
    setEmojiPicker(!emojiPickerState);
  };
  const MessageSubmits = () => {
    let isDisabled =
      ((Inputs && Inputs[selectedInputID]) || "").trim().length === 0 &&
      attachments.length == 0;

    if (isSubmitting) {
      isDisabled = true;
    }
    if (!isSubmitting) {
      if (Object.keys(selectedEditMsg).length > 0) {
        return (
          <div id={styles.ChatInputControlsRight}>
            <button
              onClick={cancelEdit}
              aria-label="cancel chat message"
              className={styles.EditCancel}
            >
              cancel
            </button>
            <button
              className={styles.SendActive}
              aria-label="send chat message"
              disabled={isDisabled}
              onClick={() => {
                updateMessage(selectedEditMsg, selectedInputID);
                setSelectedEditMsg({});
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
              aria-label="send chat message"
              className={Inputs[selectedInputID] ? styles.SendActive : ""}
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
  const submitMessageLogic = () => {
    // setAttachments([]);

    sendMessage({
      msg: Inputs[selectedInputID],
      atts: attachments,
      parentID: selectedInputID,
    });
    resetHeight();
  };

  return (
    <div id={styles.ChatInput}>
      <div className={styles.entryBox}>
        <ImageHolder
          attachments={attachments}
          removeAttachment={removeAttachment}
          attRefs={attRefs}
          uploading={uploading}
        />
        <textarea
          id={styles.ChatInputText}
          ref={textRef}
          onChange={(e) => {
            inputHandler(e);
            calcHeight(e.target.value);
          }}
          value={(Inputs && Inputs[selectedInputID]) || ""}
          disabled={disableChat}
          onKeyDown={(e) => {
            let input = Inputs[selectedInputID] || "";
            if (e.altKey) {
              setAltKey(true);
            }
            if (e.key == "Enter" && altKey) {
              input = input + "\r\n";
              setInputs({
                ...Inputs,
                [selectedInputID]: input,
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

export default DumbChatInput;
