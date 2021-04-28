import React, { useState, useRef, useEffect } from "react";
import { saveMessage } from "../requests/chat";
import { useComms } from "../contexts/comms";
import { useAuth } from "../contexts/auth";
import { useSocket } from "../contexts/socket";
import { getUploadURL, putImageInBucket } from "../requests/s3";
import { addKeyToDB } from "../requests/chat";

import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
// use @giphy/js-fetch-api to fetch gifs, instantiate with your api key
const gf = new GiphyFetch("WjzExVfWh0193VlCJbn1Z1L3tEG4Zrv0");
// configure your fetch: fetch 10 gifs at a time as the user scrolls (offset is handled by the grid)
const fetchGifs = (offset) => gf.trending({ offset, limit: 10 });

const chatTextEntry = (props) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [emojiPickerState, setEmojiPicker] = useState(false);
  const { user } = useAuth();
  const { selectedcomm, selectedTopic } = useComms();
  const { emitMessage } = useSocket();

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

  let emojiPicker;

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
        reactions: [],
        attachments: [],
      };

      const data = await saveMessage(newMessage);
      setAttachments([]);
      setMessage("");
      let { id, ok } = data;
      if (ok) {
        if (attachments.length > 0) {
          uploadAttacments(id, newMessage);
        } else {
          broadcastMessage(newMessage);
        }
      }
    }
  };
  const broadcastMessage = (message) => {
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
  const uploadAttacments = (id, message) => {
    attachments.forEach(async (file, idx) => {
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
            message.attachments.push(name);
          }
        });
        reader.readAsArrayBuffer(file);
      }
    });
    broadcastMessage(message);
  };
  const addEmoji = (e) => {
    setMessage(message + e.native);
    setEmojiPicker(!emojiPickerState);
  };
  if (emojiPickerState) {
    emojiPicker = (
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
  function triggerPicker(event) {
    event.preventDefault();
    setEmojiPicker(!emojiPickerState);
  }

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
          {emojiPicker}
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

        <div className="chat-controls">
          <button className="cancel-edit" onClick={sendMessagge}>
            cancel
          </button>
          <button className="send-message" onClick={sendMessagge}>
            send
          </button>
        </div>
      </div>
    </div>
  );
};

export default chatTextEntry;
