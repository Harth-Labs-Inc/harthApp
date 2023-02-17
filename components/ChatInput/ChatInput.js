import { useContext, useState, useRef, useEffect } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import { IconSend } from "../../resources/icons/IconSend";
import { IconCancelFill } from "../../resources/icons/IconCancelFill";
import { IconAddReactionNoFill } from "../../resources/icons/IconAddReactionNoFill";
import { IconImage } from "../../resources/icons/IconImage";

import {
  saveMessage,
  updateMessage,
  saveMessageReply,
  addReplyID,
} from "../../requests/chat";
import { useComms } from "../../contexts/comms";
import { useAuth } from "../../contexts/auth";
import { useSocket } from "../../contexts/socket";
import { MobileContext } from "../../contexts/mobile";
import {
  getUploadURL,
  putImageInBucket,
  compressImage,
} from "../../requests/s3";
import { addKeyToDB } from "../../requests/chat";

import ImageHolder from "./ImageHolder";
import styles from "./ChatInput.module.scss";

const ChatInput = (props) => {
  const [attachments, setAttachments] = useState([]);
  const [emojiPickerState, setEmojiPicker] = useState(false);
  const [selectedEditMsg, setSelectedEditMsg] = useState({});
  const [altKey, setAltKey] = useState(false);
  const { isMobile } = useContext(MobileContext);

  const { user } = useAuth();
  const { selectedcomm, selectedTopic } = useComms();
  const { emitUpdate } = useSocket();

  const { selectedEdit, isReply, replyOwner, topicInputs, setTopicInputs } =
    props;

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
    if (setTopicInputs) {
      setTopicInputs({
        ...topicInputs,
        [selectedTopic?._id]: selectedEdit?.message,
      });
    }

    setSelectedEditMsg(selectedEdit);
  }, [selectedEdit]);

  // input only related
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

  // need to update to be input and prop deperndent
  const inputHandler = (e) => {
    const { value } = e.target;
    setTopicInputs({ ...topicInputs, [selectedTopic?._id]: value });
  };
  const cancelEdit = () => {
    setTopicInputs({ ...topicInputs, [selectedTopic?._id]: "" });
    setSelectedEditMsg({});
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
    if (selectedTopic) {
      let creator = selectedcomm.users.find((usr) => usr.userId === user?._id);

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
      };

      const data = await saveMessage(newMessage);

      let { id, ok } = data;
      if (ok) {
        if (id) {
          newMessage._id = id;
        }
        if (attachments.length > 0) {
          uploadAttacments(id, newMessage);
        } else {
          broadcastMessage(newMessage);
        }
      }
    }
  };
  const broadcastMessage = (message) => {
    setAttachments([]);
    message.updateType = "new message";
    setTopicInputs({ ...topicInputs, [selectedTopic?._id]: "" });
    emitUpdate(selectedcomm?._id, message, async (err, status) => {
      if (err) {
        console.log(err);
      }
    });
  };
  const uploadAttacments = async (id, message) => {
    let promises = [];
    attachments.forEach((file, idx) => {
      promises.push(
        new Promise(async (res, rej) => {
          let extention = file.name.split(".").pop();
          let name = `${id}_${idx + 1}.${extention}`;
          let bucket = "topic-message-attachments";
          const data = await getUploadURL(name, file.type, bucket);
          const { ok, uploadURL } = data;
          if (ok) {
            let reader = new FileReader();
            reader.addEventListener("loadend", async () => {
              let result = await putImageInBucket(uploadURL, reader, file.type);
              let { status } = result;
              if (status == 200) {
                await compressImage(name, bucket, file.type);
                await addKeyToDB(id, name, file.type);

                res({ name, fileType: file.type });
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
  };
  const updateMsg = async () => {
    let msg = selectedEditMsg;
    msg.message = topicInputs[selectedTopic?._id];
    await updateMessage(msg);
    msg.updateType = "message update";
    msg.action = "update";
    emitUpdate(selectedcomm?._id, msg, async (err, status) => {
      if (err) {
        console.log(err);
      }
      let { ok } = status;
      if (ok) {
        cancelEdit();
      }
    });
  };
  const submitMessageLogic = () => {
    if (isReply) {
      sendReply();
    } else {
      sendMessagge();
    }
  };
  const MessageSubmits = () => {
    const isDisabled =
      ((topicInputs && topicInputs[selectedTopic?._id]) || "").trim().length ===
        0 && attachments.length == 0;
    if (Object.keys(selectedEditMsg).length > 0) {
      return (
        <div id={styles.ChatInputControlsRight}>
          <button onClick={cancelEdit} aria-label="cancel chat message">
            <IconCancelFill />
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
          value={(topicInputs && topicInputs[selectedTopic?._id]) || ""}
          onKeyDown={(e) => {
            let input = topicInputs[selectedTopic?._id] || "";
            if (e.altKey) {
              setAltKey(true);
            }
            if (e.key == "Enter" && altKey) {
              input = input + "\r\n";
              setTopicInputs({
                ...topicInputs,
                [selectedTopic?._id]: input,
              });
              textRef.current.style.height =
                calcHeight(textRef.current.value) + "px";
            } else if (e.key === "Enter" && input.trim().length > 0) {
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

export default ChatInput;

// import { useContext, useState, useRef, useEffect } from "react";
// import { IconSend } from "../../resources/icons/IconSend";
// import { IconCancelFill } from "../../resources/icons/IconCancelFill";
// import { IconAddReactionNoFill } from "../../resources/icons/IconAddReactionNoFill";
// import { IconImage } from "../../resources/icons/IconImage";
// import { IconClose } from "../../resources/icons/IconClose";

// import {
//     saveMessage,
//     updateMessage,
//     saveMessageReply,
//     addReplyID,
// } from "../../requests/chat";
// import { useComms } from "../../contexts/comms";
// import { useAuth } from "../../contexts/auth";
// import { useSocket } from "../../contexts/socket";
// import { MobileContext } from "../../contexts/mobile";
// import { getUploadURL, putImageInBucket } from "../../requests/s3";
// import { addKeyToDB } from "../../requests/chat";

// import data from "@emoji-mart/data";
// import Picker from "@emoji-mart/react";
// // import 'emoji-mart/css/emoji-mart.css'

// import styles from "./ChatInput.module.scss";

// const ChatInput = (props) => {
//     const [attachments, setAttachments] = useState([]);
//     const [emojiPickerState, setEmojiPicker] = useState(false);
//     const [selectedEditMsg, setSelectedEditMsg] = useState({});
//     const [altKey, setAltKey] = useState(false);
//     const { isMobile } = useContext(MobileContext);

//     const { user } = useAuth();
//     const { selectedcomm, selectedTopic } = useComms();
//     const { emitUpdate } = useSocket();

//     const { selectedEdit, isReply, replyOwner, topicInputs, setTopicInputs } =
//         props;

//     const textRef = useRef();
//     const fileRef = useRef();
//     const attRefs = useRef([]);

//     useEffect(() => {
//         if (attachments.length > 0) {
//             attachments.forEach((file, idx) => {
//                 var reader = new FileReader();
//                 reader.onload = function (e) {
//                     const { result } = e.target;
//                     attRefs.current[idx].src = result;
//                 };
//                 reader.readAsDataURL(file);
//             });
//         }
//     }, [attachments]);

//     useEffect(() => {
//         if (setTopicInputs) {
//             setTopicInputs({
//                 ...topicInputs,
//                 [selectedTopic?._id]: selectedEdit?.message,
//             });
//         }

//         setSelectedEditMsg(selectedEdit);
//     }, [selectedEdit]);

//     const calcHeight = (value) => {
//         let numberOfLineBreaks = (value.match(/\n/g) || []).length;
//         let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;
//         return newHeight;
//     };
//     const inputHandler = (e) => {
//         const { value } = e.target;
//         setTopicInputs({ ...topicInputs, [selectedTopic?._id]: value });
//     };
//     const sendMessagge = async () => {
//         if (selectedTopic) {
//             let creator = selectedcomm.users.find(
//                 (usr) => usr.userId === user?._id
//             );

//             let newMessage = {
//                 creator_id: user?._id,
//                 creator_name: creator.name,
//                 creator_image: creator.iconKey,
//                 topic_id: selectedTopic?._id,
//                 comm_id: selectedcomm?._id,
//                 bookmarked: false,
//                 date: new Date(),
//                 message: topicInputs[selectedTopic?._id],
//                 flames: [],
//                 reactions: [],
//                 attachments: [],
//                 replies: [],
//             };

//             const data = await saveMessage(newMessage);

//             let { id, ok } = data;
//             if (ok) {
//                 if (id) {
//                     newMessage._id = id;
//                 }
//                 if (attachments.length > 0) {
//                     uploadAttacments(id, newMessage);
//                 } else {
//                     broadcastMessage(newMessage);
//                 }
//             }
//         }
//     };
//     const sendReply = async () => {
//         if (selectedTopic) {
//             let creator = selectedcomm.users.find(
//                 (usr) => usr.userId === user?._id
//             );

//             let newMessage = {
//                 creator_id: user?._id,
//                 creator_name: creator.name,
//                 creator_image: creator.iconKey,
//                 topic_id: selectedTopic?._id,
//                 comm_id: selectedcomm?._id,
//                 bookmarked: false,
//                 date: new Date(),
//                 message: topicInputs[selectedTopic?._id],
//                 owner_id: replyOwner?._id,
//                 flames: [],
//                 reactions: [],
//                 attachments: [],
//                 replies: [],
//             };

//             const data = await saveMessageReply(newMessage);

//             let { id, ok } = data;
//             if (ok) {
//                 if (id) {
//                     newMessage._id = id;
//                     const addReply = await addReplyID(
//                         id,
//                         replyOwner?._id,
//                         replyOwner.owner_id ? true : false
//                     );
//                 }
//                 if (attachments.length > 0) {
//                     uploadAttacments(id, newMessage);
//                 } else {
//                     broadcastMessage(newMessage);
//                 }
//             }
//         }
//     };
//     const broadcastMessage = (message) => {
//         setAttachments([]);
//         message.updateType = "new message";
//         setTopicInputs({ ...topicInputs, [selectedTopic?._id]: "" });
//         emitUpdate(selectedcomm?._id, message, async (err, status) => {
//             if (err) {
//                 console.log(err);
//             }
//         });
//     };
//     const getPastedData = (e) => {
//         const { files } = e.clipboardData;
//         const text = e.clipboardData.getData("Text");
//         if (files[0]) {
//             addAttachment(files[0]);
//         }
//         if (text) {
//         }
//     };
//     const openFileSelector = () => {
//         fileRef.current.click();
//     };
//     const addAttachment = (file) => {
//         setAttachments([...attachments, file]);
//     };
//     const removeAttachment = (idx) => {
//         const tempAttachments = [...attachments];
//         tempAttachments.splice(idx, 1);
//         setAttachments([...tempAttachments]);
//     };
//     const dropHandler = (e) => {
//         e.preventDefault();
//         const { files } = e.dataTransfer;
//         addAttachment(files[0]);
//     };
//     const uploadAttacments = async (id, message) => {
//         let promises = [];
//         attachments.forEach((file, idx) => {
//             promises.push(
//                 new Promise(async (res, rej) => {
//                     let extention = file.name.split(".").pop();
//                     let name = `${id}_${idx + 1}.${extention}`;
//                     let bucket = "topic-message-attachments";
//                     const data = await getUploadURL(name, file.type, bucket);
//                     const { ok, uploadURL } = data;
//                     if (ok) {
//                         let reader = new FileReader();
//                         reader.addEventListener("loadend", async () => {
//                             let result = await putImageInBucket(
//                                 uploadURL,
//                                 reader,
//                                 file.type
//                             );
//                             let { status } = result;
//                             if (status == 200) {
//                                 await addKeyToDB(id, name, file.type);
//                                 res({ name, fileType: file.type });
//                             }
//                         });
//                         reader.readAsArrayBuffer(file);
//                     }
//                 })
//             );
//         });

//         const outputs = await Promise.all(promises);
//         message.attachments = outputs;
//         broadcastMessage(message);
//     };
//     const addEmoji = (e) => {
//         let msg = topicInputs[selectedTopic?._id] + e.native;
//         setTopicInputs({ ...topicInputs, [selectedTopic?._id]: msg });
//         setEmojiPicker(!emojiPickerState);
//     };
//     const EmojiPicker = () => {
//         if (emojiPickerState) {
//             return (
//                 <div className={styles.EmojiPicker}>
//                     <Picker
//                         data={data}
//                         className="attach-emoji"
//                         onEmojiSelect={addEmoji}
//                         autoFocus={true}
//                         emojiButtonColors={[
//                             "rgba(187, 126, 196, 0.8)",
//                             "rgb(13, 161, 181, .8)",
//                             "rgba(240, 101, 115, 0.8)",
//                             "rgb(0, 163, 150, 0.8)",
//                         ]}
//                         // onClickOutside={setEmojiPicker(!emojiPickerState)}
//                     />
//                 </div>
//             );
//         }
//         return null;
//     };
//     const triggerPicker = (event) => {
//         event.preventDefault();
//         setEmojiPicker(!emojiPickerState);
//     };
//     const ImageHolder = () => {
//         if (attachments.length > 0) {
//             return (
//                 <div className={styles.imageBar}>
//                     {(attachments || []).map((file, idx) => (
//                         <div className={styles.imageContainer}>
//                             <button
//                                 onClick={() => {
//                                     removeAttachment(idx);
//                                 }}
//                             >
//                                 <IconClose />
//                             </button>
//                             <img
//                                 id={file.name}
//                                 key={file.name}
//                                 ref={(el) => (attRefs.current[idx] = el)}
//                                 alt=""
//                             />
//                         </div>
//                     ))}
//                 </div>
//             );
//         }

//         return null;
//     };
//     const cancelEdit = () => {
//         setTopicInputs({ ...topicInputs, [selectedTopic?._id]: "" });
//         setSelectedEditMsg({});
//     };
//     const updateMsg = async () => {
//         let msg = selectedEditMsg;
//         msg.message = topicInputs[selectedTopic?._id];
//         await updateMessage(msg);
//         msg.updateType = "message update";
//         msg.action = "update";
//         emitUpdate(selectedcomm?._id, msg, async (err, status) => {
//             if (err) {
//                 console.log(err);
//             }
//             let { ok } = status;
//             if (ok) {
//                 cancelEdit();
//             }
//         });
//     };
//     const submitMessageLogic = () => {
//         if (isReply) {
//             sendReply();
//         } else {
//             sendMessagge();
//         }
//     };
//     const MessageSubmits = () => {
//         const isDisabled =
//             ((topicInputs && topicInputs[selectedTopic?._id]) || "").trim()
//                 .length === 0 && attachments.length == 0;
//         if (Object.keys(selectedEditMsg).length > 0) {
//             return (
//                 <div id={styles.ChatInputControlsRight}>
//                     <button
//                         onClick={cancelEdit}
//                         aria-label="cancel chat message"
//                     >
//                         <IconCancelFill />
//                     </button>
//                     <button
//                         className={styles.SendActive}
//                         aria-label="send chat message"
//                         disabled={isDisabled}
//                         onClick={updateMsg}
//                     >
//                         <IconSend />
//                     </button>
//                 </div>
//             );
//         } else {
//             return (
//                 <div id={styles.ChatInputControlsRight}>
//                     <button
//                         disabled={isDisabled}
//                         aria-label="send chat message"
//                         onClick={() => {
//                             submitMessageLogic();
//                         }}
//                     >
//                         <IconSend />
//                     </button>
//                 </div>
//             );
//         }
//     };
//     return (
//         <div id={styles.ChatInput}>
//             <div className={styles.entryBox}>
//                 <ImageHolder />
//                 <textarea
//                     id={styles.ChatInputText}
//                     ref={textRef}
//                     onChange={inputHandler}
//                     value={
//                         (topicInputs && topicInputs[selectedTopic?._id]) || ""
//                     }
//                     onKeyDown={(e) => {
//                         let input = topicInputs[selectedTopic?._id] || "";
//                         if (e.altKey) {
//                             setAltKey(true);
//                         }
//                         if (e.key == "Enter" && altKey) {
//                             input = input + "\r\n";
//                             setTopicInputs({
//                                 ...topicInputs,
//                                 [selectedTopic?._id]: input,
//                             });
//                             textRef.current.style.height =
//                                 calcHeight(textRef.current.value) + "px";
//                         } else if (
//                             e.key === "Enter" &&
//                             input.trim().length > 0
//                         ) {
//                             submitMessageLogic();
//                         }
//                     }}
//                     onKeyUp={(e) => {
//                         setAltKey(false);
//                     }}
//                     onPaste={getPastedData}
//                     onDragEnter={(e) => {
//                         e.preventDefault();
//                         return false;
//                     }}
//                     onDragOver={(e) => {
//                         e.preventDefault();
//                     }}
//                     onDrop={(e) => {
//                         e.preventDefault();
//                         dropHandler(e);
//                     }}
//                     onDragLeave={(e) => {
//                         e.preventDefault();
//                     }}
//                 ></textarea>
//             </div>
//             <div id={styles.ChatInputControls}>
//                 <div id={styles.ChatInputControlsLeft}>
//                     <button
//                         onClick={triggerPicker}
//                         aria-label="add emoji reaction"
//                     >
//                         <IconAddReactionNoFill />
//                     </button>
//                     <EmojiPicker />
//                     <button
//                         aria-label="attach an image"
//                         onClick={openFileSelector}
//                     >
//                         <IconImage />
//                     </button>
//                     <input
//                         ref={fileRef}
//                         type="file"
//                         id="file-input"
//                         onChange={(e) => {
//                             const { files } = e.target;
//                             addAttachment(files[0]);
//                         }}
//                         style={{ display: "none" }}
//                     />
//                 </div>
//                 <MessageSubmits />
//             </div>
//         </div>
//     );
// };

// export default ChatInput;
