import React, { useState } from "react";

const Message = (props) => {
  const { msg } = props;

  return (
    <div className="message">
      {msg.creator_image ? (
        <img src={msg.creator_image} alt={msg.creator_name} />
      ) : (
        <span className="message_no_image"></span>
      )}
      <div>
        <span>
          <p className="message_creator">{msg.creator_name}</p>
          <p className="message_timestamp">
            {new Date(msg.date).toLocaleTimeString([], { timeStyle: "short" })}
          </p>
        </span>
        <p className="message_content">{msg.message}</p>
      </div>
    </div>
  );
};

export default Message;
