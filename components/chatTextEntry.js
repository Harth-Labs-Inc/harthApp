import React, { useState, useRef } from "react";
import { saveMessage } from "../requests/chat";
import { useComms } from "../contexts/comms";
import { useAuth } from "../contexts/auth";
import { useSocket } from "../contexts/socket";

const chatTextEntry = (props) => {
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { selectedcomm, selectedTopic } = useComms();
  const { emitMessage } = useSocket();

  const textRef = useRef();

  const calcHeight = (value) => {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length;
    // min-height + lines x line-height + padding + border
    let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;
    return newHeight;
  };

  const inputHandler = (e) => {
    const { value } = e.target;
    setMessage(value);
  };
  const sendMessagge = () => {
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
      console.log("emit click");
      emitMessage(selectedTopic._id, newMessage, async (err, status) => {
        let { ok } = status;
        if (ok) {
          const data = await saveMessage(newMessage);
        }
      });
    }
  };
  const getSelectedText = () => {
    let text = "";
    if (window.getSelection) {
      text = window.getSelection().toString();
    }
  };
  const getPastedData = (e) => {
    console.log(e);
  };
  return (
    <div id="chat_input_container">
      <textarea
        ref={textRef}
        style={{ height: "50px" }}
        onInput={inputHandler}
        placeholder={`Message ${(selectedTopic || {}).title || ""}`}
        onMouseUp={getSelectedText}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessagge();
          }
        }}
        onKeyUp={() => {
          textRef.current.style.height =
            calcHeight(textRef.current.value) + "px";
        }}
        onPaste={getPastedData}
      ></textarea>
      <div>
        <div className="input-style-wrapper">
          <button className="style-bold">B</button>
          <button className="style-italic">I</button>
          <button className="style-strike">S</button>
        </div>
        <div className="chat-insert-additional-wrapper">
          <button className="attach-file">attach file</button>
          <button className="attach-gif">attach gif</button>
          <button className="attach-emoji">attach emoji</button>
          <button onClick={sendMessagge}>send</button>
        </div>
      </div>
    </div>
  );
};

export default chatTextEntry;
