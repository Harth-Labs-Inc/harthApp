import React, { useState, useEffect } from "react";
import { getDownloadURL } from "../../requests/s3";

const Message = (props) => {
  const [urls, setUrls] = useState([]);
  const { date, creator_image, creator_name, message, attachments } = props.msg;

  console.log(urls);
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
    <div className="message">
      {creator_image ? (
        <img src={creator_image} alt={creator_name} loading="lazy" />
      ) : (
        <span className="message_no_image"></span>
      )}
      <div>
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
