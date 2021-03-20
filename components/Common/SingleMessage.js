import React, { useState } from "react";

const Message = (props) => {
  const { msg } = props;

  let timeStamp;
  let today = new Date();
  let weekBefore = today.setDate(today.getDate() - 6);

  if (
    new Date(msg.date).toLocaleDateString() === new Date().toLocaleDateString()
  ) {
    timeStamp = new Date(msg.date).toLocaleTimeString([], {
      timeStyle: "short",
    });
  } else if (new Date(msg.date) >= new Date(weekBefore)) {
    timeStamp = `${new Date(msg.date).toLocaleDateString("default", {
      weekday: "long",
    })} @ ${new Date(msg.date).toLocaleTimeString([], {
      timeStyle: "short",
    })}`;
  } else {
    timeStamp = `${new Date(msg.date).toLocaleDateString("default", {
      weekday: "long",
    })}, ${new Date(msg.date).toLocaleDateString("default", {
      month: "short",
    })} @ ${new Date(msg.date).toLocaleTimeString([], {
      timeStyle: "short",
    })}`;
  }

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

          <p className="message_timestamp">{timeStamp}</p>
        </span>
        <p className="message_content">{msg.message}</p>
      </div>
    </div>
  );
};

export default Message;
