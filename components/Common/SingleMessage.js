import React, { useState, useEffect } from "react";
import { getDownloadURL } from "../../requests/s3";
import { deleteMessage, updateMessage, updateReply } from "../../requests/chat";
import { useAuth } from "../../contexts/auth";
import { useSocket } from "../../contexts/socket";
import { useChat } from "../../contexts/chat";
import { useComms } from "../../contexts/comms";
import Modal from "../Modal";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

const Message = (props) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emojiPickerState, setEmojiPicker] = useState(false);
  const [urls, setUrls] = useState([]);
  const [showEditBar, setShowEditBar] = useState("");

  const {
    _id,
    date,
    creator_image,
    creator_id,
    creator_name,
    message,
    attachments = [],
    reactions = [],
    flames = [],
    replies = [],
    topic_id,
  } = props.msg;
  const { editMessageText, isReply } = props;

  const { user } = useAuth();
  const { emitMessageUpdate } = useSocket();
  const { selectedcomm } = useComms();
  const { setSelectedReplyOwner } = useChat();

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
  }, [_id]);

  const toggleEdit = (show) => {
    if (show) {
      setShowEditBar(_id);
    } else {
      setShowEditBar("");
    }
  };
  const toggleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal);
  };
  const deleteMsg = async () => {
    const data = await deleteMessage(_id);
    let msg = props.msg;
    msg.action = "delete";
    emitMessageUpdate(topic_id, props.msg, async (err, status) => {
      if (err) {
        console.log(err);
      }
      let { ok } = status;
      if (ok) {
        console.log("message sent");
      }
    });
    toggleDeleteModal();
  };
  const updateMsg = async () => {
    let msg = props.msg;
    if (isReply) {
      const data = await updateReply(msg);
    } else {
      const data = await updateMessage(msg);
    }

    msg.action = "update";
    emitMessageUpdate(topic_id, msg, async (err, status) => {
      if (err) {
        console.log(err);
      }
      let { ok } = status;
      if (ok) {
        console.log("message sent");
      }
    });
  };
  const editBarSelection = () => {
    editMessageText(props.msg);
  };
  const getTimeStamp = () => {
    let timeStamp;
    let today = new Date();
    let weekBefore = today.setDate(today.getDate() - 6);

    if (
      new Date(date).toLocaleDateString() === new Date().toLocaleDateString()
    ) {
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
    return timeStamp;
  };
  const addFlame = () => {
    let index;
    flames.forEach((flame, idx) => {
      if (flame.id == user._id) {
        index = idx;
      }
    });
    if (index >= 0) {
      flames.splice(index, 1);
    } else {
      let creator = selectedcomm.users.find((usr) => usr.userId === user._id);
      flames.push({ name: creator.name, id: user._id });
    }

    updateMsg();
  };
  const triggerPicker = (e) => {
    e.preventDefault();
    setEmojiPicker(!emojiPickerState);
  };
  const addEmoji = (e) => {
    reactions.push(e.native);
    updateMsg();
    setEmojiPicker(!emojiPickerState);
  };
  const addReplyOwner = () => {
    setSelectedReplyOwner(props.msg);
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
  const DeleteModal = () => {
    if (showDeleteModal) {
      return (
        <Modal>
          <h4>You are about to DELETE this post</h4>
          <br />
          <p>this content will be permanetly deleted. This cannot be undone</p>
          <div>
            <button onClick={deleteMsg}>DELETE</button>
            <button onClick={toggleDeleteModal}>CANCEL</button>
          </div>
        </Modal>
      );
    }
    return null;
  };
  const CreatorImage = () => {
    if (creator_image) {
      return <img src={creator_image} alt={creator_name} loading="lazy" />;
    }
    return <span className="message_no_image"></span>;
  };
  const EditBar = () => {
    if (showEditBar && showEditBar == _id) {
      if (creator_id == user._id) {
        return (
          <div className="message-edit-bar">
            <button
              value="flame"
              title="flame"
              className="flame"
              onClick={addFlame}
            >
              flame
            </button>
            <button
              value="reaction"
              title="reaction"
              className="react"
              onClick={triggerPicker}
            >
              react
            </button>
            <button
              value="reply"
              title="reply"
              className="reply"
              onClick={addReplyOwner}
            >
              reply
            </button>
            <button
              value="edit"
              onClick={editBarSelection}
              title="edit"
              className="edit"
            >
              edit
            </button>
            <button
              value="delete"
              onClick={toggleDeleteModal}
              title="delete"
              className="delete"
            >
              delete
            </button>
          </div>
        );
      } else {
        return (
          <div className="message-edit-bar">
            <button
              value="flame"
              title="flame"
              className="flame"
              onClick={addFlame}
            >
              flame
            </button>
            <button
              value="reaction"
              title="reaction"
              className="react"
              onClick={triggerPicker}
            >
              react
            </button>
            <button
              value="reply"
              title="reply"
              className="reply"
              onClick={addReplyOwner}
            >
              reply
            </button>
          </div>
        );
      }
    }

    return null;
  };

  let timeStamp = getTimeStamp();

  return (
    <div
      className="message"
      onMouseEnter={() => toggleEdit(true)}
      onMouseLeave={() => toggleEdit(false)}
    >
      <DeleteModal />
      <CreatorImage />
      <EmojiPicker />
      <EditBar />
      <div className="message-body">
        <span>
          <p className="message_creator">{creator_name}</p>
          <p className="message_timestamp">{timeStamp}</p>
        </span>
        {(urls || []).map((url) => (
          <img src={url} key={url} />
        ))}
        <p className="message_content">{message}</p>
        <div className="message_reaction_wrapper">
          {[...(replies || [])].length > 0 ? (
            <p className="message_reply_count">{replies.length}</p>
          ) : null}
          <div className="message_flame_wrapper">
            {[...(flames || [])].map((flame) => (
              <p className="message_reaction_flame" title={flame.name}></p>
            ))}
          </div>
          {[...(reactions || [])].map((reaction) => (
            <p>{reaction}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Message;
