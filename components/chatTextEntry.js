import React, { useState, useRef, useEffect } from "react";
import { saveMessage, updateMessage } from "../requests/chat";
import { useComms } from "../contexts/comms";
import { useAuth } from "../contexts/auth";
import { useSocket } from "../contexts/socket";
import { getUploadURL, putImageInBucket } from "../requests/s3";
import { addKeyToDB } from "../requests/chat";

import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
const gf = new GiphyFetch("WjzExVfWh0193VlCJbn1Z1L3tEG4Zrv0");
const fetchGifs = (offset) => gf.trending({ offset, limit: 10 });

const chatTextEntry = (props) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [emojiPickerState, setEmojiPicker] = useState(false);
  const [selectedEditMsg, setSelectedEditMsg] = useState({});

  const { user } = useAuth();
  const { selectedcomm, selectedTopic } = useComms();
  const { emitMessage, emitMessageUpdate } = useSocket();

  const { selectedEdit, isReply } = props;

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
    setMessage(selectedEdit.message);
    setSelectedEditMsg(selectedEdit);
  }, [selectedEdit]);

  const calcHeight = (value) => {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length;
    let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;
    return newHeight;
  };
  const inputHandler = (e) => {
    const { value } = e.target;
    setMessage(value);
  };
  const sendMessagge = async () => {
    if (selectedTopic) {
      let creator = selectedcomm.users.find((usr) => usr.userId === user._id);

      let newMessage = {
        creator_id: user._id,
        creator_name: creator.name,
        creator_image: creator.iconKey,
        topic_id: selectedTopic._id,
        comm_id: selectedcomm._id,
        bookmarked: false,
        date: new Date(),
        message: message,
        flames: [],
        reactions: [],
        attachments: [],
        replies: [],
      };

      const data = await saveMessage(newMessage);

      setMessage("");
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
    emitMessage(selectedTopic._id, message, async (err, status) => {
      if (err) {
        console.log(err);
      }
      let { ok } = status;
      if (ok) {
        console.log("message sent");
      }
    });
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
  const uploadAttacments = async (id, message) => {
    let promises = [];
    attachments.forEach((file, idx) => {
      promises.push(
        new Promise(async (res, rej) => {
          let extention = file.name.split(".").pop();
          let name = `${id}_${idx + 1}.${extention}`;
          let bucket = "topic-message-attachments";
          const data = await getUploadURL(name, file.type, bucket);
          const { ok, msg, uploadURL } = data;
          if (ok) {
            let reader = new FileReader();
            reader.addEventListener("loadend", async (event) => {
              let result = await putImageInBucket(uploadURL, reader, file.type);
              let { status } = result;
              if (status == 200) {
                let add = await addKeyToDB(id, name, file.type);
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
  const addEmoji = (e) => {
    setMessage(message + e.native);
    setEmojiPicker(!emojiPickerState);
  };
  const EmojiPicker = () => {
    if (emojiPickerState) {
      return (
        <Picker
          className="attach-emoji"
          native={true}
          onSelect={addEmoji}
          emoji=""
          color="#1d0a6c"
          autoFocus={true}
        />
      );
    }
    return null;
  };
  const triggerPicker = (event) => {
    event.preventDefault();
    setEmojiPicker(!emojiPickerState);
  };
  const ImageHolder = () => {
    if (attachments.length > 0) {
      return (
        <div className="image-holder">
          {(attachments || []).map((file, idx) => (
            <div className="image-to-attach">
              <img
                id={file.name}
                key={file.name}
                ref={(el) => (attRefs.current[idx] = el)}
                alt=""
                style={{ height: "100px", width: "100px" }}
              />
              <button
                className="remove-image"
                onClick={() => {
                  removeAttachment(idx);
                }}
              >
                remove image
              </button>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };
  const cancelEdit = () => {
    setMessage("");
    setSelectedEditMsg({});
  };
  const updateMsg = async () => {
    let msg = selectedEditMsg;
    msg.message = message;
    const data = await updateMessage(msg);
    msg.action = "update";
    emitMessageUpdate(selectedEditMsg.topic_id, msg, async (err, status) => {
      if (err) {
        console.log(err);
      }
      let { ok } = status;
      if (ok) {
        console.log("message sent");
        cancelEdit();
      }
    });
  };
  const MessageSubmits = () => {
    if (Object.keys(selectedEditMsg).length > 0) {
      return (
        <div className="chat-controls">
          <button className="cancel-edit" onClick={cancelEdit}>
            cancel
          </button>
          <button className="send-message" onClick={updateMsg}>
            send
          </button>
        </div>
      );
    } else {
      return (
        <div className="chat-controls">
          <button className="send-message" onClick={sendMessagge}>
            send
          </button>
        </div>
      );
    }
  };

  return (
    <div id="chat_input_container">
      <ImageHolder />
      <textarea
        ref={textRef}
        placeholder={`Say something...`}
        onChange={inputHandler}
        value={message}
        onKeyUp={() => {
          textRef.current.style.height =
            calcHeight(textRef.current.value) + "px";
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
      <div>
        <div className="chat-insert-additional-wrapper">
          <button className="attach-emoji" onClick={triggerPicker}>
            attach emoji
          </button>
          <EmojiPicker />
          <button className="attach-gif">attach gif</button>
          {/* <Grid width={500} columns={3} fetchGifs={fetchGifs} /> */}
          <button onClick={openFileSelector} className="attach-file">
            attach file
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

export default chatTextEntry;
