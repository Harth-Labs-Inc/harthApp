import { useContext, useState, useRef, useEffect } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import { IconSend } from "../../resources/icons/IconSend";
import { IconCancelFill } from "../../resources/icons/IconCancelFill";
import { IconAddReactionNoFill } from "../../resources/icons/IconAddReactionNoFill";
import { IconImage } from "../../resources/icons/IconImage";
import { MobileContext } from "../../contexts/mobile";
import { updateConversationMessage } from "../../requests/conversations";

import ImageHolder from "../ChatInput/ImageHolder";
import styles from "./DumbChatInput.module.scss";

const DumbChatInput = (props) => {
    const [attachments, setAttachments] = useState([]);
    const [emojiPickerState, setEmojiPicker] = useState(false);
    const [selectedEditMsg, setSelectedEditMsg] = useState({});
    const [altKey, setAltKey] = useState(false);
    const { isMobile } = useContext(MobileContext);

    const {
        selectedEdit,
        Inputs,
        setInputs,
        selectedInputID,
        sendMessagge,
        updateMessage,
    } = props;

    const textRef = useRef();
    const fileRef = useRef();
    const attRefs = useRef([]);

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
        if (setInputs) {
            setInputs({
                ...Inputs,
                [selectedInputID]: selectedEdit?.message,
            });
        }

        setSelectedEditMsg(selectedEdit);
    }, [selectedEdit]);

    const calcHeight = (value) => {
        let numberOfLineBreaks = (value.match(/\n/g) || []).length;
        let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;
        return newHeight;
    };
    const getPastedData = (e) => {
        const { files } = e.clipboardData;
        const text = e.clipboardData.getData("Text");
        if (files[0]) {
            addAttachment(files[0]);
        }
        if (text) {
        }
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
                    <Picker
                        data={data}
                        className="attach-emoji"
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
    const triggerPicker = (event) => {
        event.preventDefault();
        setEmojiPicker(!emojiPickerState);
    };
    // const ImageHolder = () => {
    //   if (attachments.length > 0) {
    //     return (
    //       <div className={styles.imageBar}>
    //         {(attachments || []).map((file, idx) => (
    //           <div className={styles.imageContainer}>
    //             <button
    //               onClick={() => {
    //                 removeAttachment(idx);
    //               }}
    //             >
    //               <IconClose />
    //             </button>
    //             <img
    //               id={file.name}
    //               key={file.name}
    //               ref={(el) => (attRefs.current[idx] = el)}
    //               alt=""
    //             />
    //           </div>
    //         ))}
    //       </div>
    //     );
    //   }

    //   return null;
    // };
    const inputHandler = (e) => {
        const { value } = e.target;
        setInputs({ ...Inputs, [selectedInputID]: value });
    };
    const cancelEdit = () => {
        setInputs({ ...Inputs, [selectedInputID]: "" });
        setSelectedEditMsg({});
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
        const isDisabled =
            ((Inputs && Inputs[selectedInputID]) || "").trim().length === 0 &&
            attachments.length == 0;
        if (Object.keys(selectedEditMsg).length > 0) {
            return (
                <div id={styles.ChatInputControlsRight}>
                    <button
                        onClick={cancelEdit}
                        aria-label="cancel chat message"
                    >
                        <IconCancelFill />
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
                        onClick={() => {
                            submitMessageLogic();
                        }}
                    >
                        <IconSend />
                    </button>
                </div>
            );
        }
    };
    const submitMessageLogic = () => {
        setAttachments([]);
        sendMessagge({
            msg: Inputs[selectedInputID],
            atts: attachments,
            parentID: selectedInputID,
        });
    };

    return (
        <div id={styles.ChatInput}>
            <div className={styles.entryBox}>
                <ImageHolder
                    attachments={attachments}
                    removeAttachment={removeAttachment}
                    attRefs={attRefs}
                />
                <textarea
                    id={styles.ChatInputText}
                    ref={textRef}
                    onChange={inputHandler}
                    value={(Inputs && Inputs[selectedInputID]) || ""}
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
                            textRef.current.style.height =
                                calcHeight(textRef.current.value) + "px";
                        } else if (
                            e.key === "Enter" &&
                            input.trim().length > 0
                        ) {
                            submitMessageLogic();
                        }
                    }}
                    onKeyUp={(e) => {
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
                    <button
                        onClick={triggerPicker}
                        aria-label="add emoji reaction"
                    >
                        <IconAddReactionNoFill />
                    </button>
                    <EmojiPicker />
                    <button
                        aria-label="attach an image"
                        onClick={openFileSelector}
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

export default DumbChatInput;
