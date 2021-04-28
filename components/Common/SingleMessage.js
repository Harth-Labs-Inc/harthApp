import React, { useState, useEffect } from "react";
import { getDownloadURL } from "../../requests/s3";

const Message = (props) => {
  const [urls, setUrls] = useState([]);
  const [showEditBar, setShowEditBar] = useState(false);
  const { date, creator_image, creator_name, message, attachments } = props.msg;

  useEffect(() => {
    (async () => {
      if (attachments.length > 0) {
        let promises = [];
        attachments.forEach((att) => {
          promises.push(
            new Promise(async (res, rej) => {
              let bucket = "topic-message-attachments";
              const data = await getDownloadURL(att.name, att.fileType, bucket);
              const { ok, downloadURL } = data;
              if (ok) {
                res(downloadURL);
              }
            })
          );
        });

        const outputs = await Promise.all(promises);
        setUrls(outputs);
      }
    })();
  }, [attachments]);

  const toggleEdit = () => {
    setShowEditBar(!showEditBar);
  };

  const EditBar = () => {
    if (showEditBar) {
      return (
        <div className="message-edit-bar">
          <button title="flame" className="flame">
            flame
          </button>
          <button title="reaction" className="react">
            react
          </button>
          <button title="share" className="share">
            share
          </button>
          <button title="edit" className="edit">
            edit
          </button>
          <button title="delete" className="delete">
            delete
          </button>
        </div>
      );
    }

    return null;
  };

  let timeStamp;
  let today = new Date();
  let weekBefore = today.setDate(today.getDate() - 6);

  if (new Date(date).toLocaleDateString() === new Date().toLocaleDateString()) {
    timeStamp = new Date(date).toLocaleTimeString([], {
      timeStyle: "short",
    });
  } else if (new Date(date) >= new Date(weekBefore)) {
    timeStamp = `${new Date(date).toLocaleDateString("default", {
      weekday: "long",
    })} @ ${new Date(date).toLocaleTimeString([], {
      timeStyle: "short",
    })}`;
  } else {
    timeStamp = `${new Date(date).toLocaleDateString("default", {
      weekday: "long",
    })}, ${new Date(date).toLocaleDateString("default", {
      month: "short",
    })} ${new Date(date).toLocaleDateString("default", {
      day: "numeric",
    })} @ ${new Date(date).toLocaleTimeString([], {
      timeStyle: "short",
    })}`;
  }

  return (
    <div
      className="message"
      onMouseEnter={toggleEdit}
      onMouseLeave={toggleEdit}
    >
      {creator_image ? (
        <img src={creator_image} alt={creator_name} loading="lazy" />
      ) : (
        <span className="message_no_image"></span>
      )}
      <EditBar />
      <div className="message-body">
        <span>
          <p className="message_creator">{creator_name}</p>

          <p className="message_timestamp">{timeStamp}</p>
        </span>
        {(urls || []).map((url) => (
          <img src={url} />
        ))}
        <p className="message_content">{message}</p>
      </div>
    </div>
  );
};

export default Message;
