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

  return (
    <div style={{ position: "fixed", bottom: "3%", left: "50%" }}>
      <input
        onInput={inputHandler}
        placeholder={`Message [${(selectedTopic || {}).title || ""}]`}
      />
      <button onClick={sendMessagge}>send</button>
    </div>
  );
};

export default chatTextEntry;
