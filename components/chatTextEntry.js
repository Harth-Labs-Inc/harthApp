import React, { useState } from "react";
import { saveMessage } from "../requests/chat";
import { useComms } from "../contexts/comms";
import { useAuth } from "../contexts/auth";
import { useSocket } from "../contexts/socket";

const chatTextEntry = (props) => {
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { selectedcomm, selectedTopic } = useComms();
  const { emitMessage } = useSocket();

  const inputHandler = (e) => {
    const { value } = e.target;
    setMessage(value);
  };
  const sendMessagge = () => {
    if (selectedTopic) {
      let creator = selectedcomm.users.find((usr) => usr.userId === user._id);

      let newMessage = {
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
    <div
      style={{
        position: "fixed",
        bottom: "3%",
        width: "76%",
        background: "white",
        border: "1px solid",
      }}
    >
      <textarea
        style={{ width: "100%", height: "50px" }}
        onInput={inputHandler}
        placeholder={`Message ${(selectedTopic || {}).title || ""}`}
        onMouseUp={getSelectedText}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessagge();
          }
        }}
        onPaste={getPastedData}
      ></textarea>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <p>B</p>
        <p>I</p>
        <p>S</p>
        <button onClick={sendMessagge}>send</button>
      </div>
    </div>
  );
};

export default chatTextEntry;
