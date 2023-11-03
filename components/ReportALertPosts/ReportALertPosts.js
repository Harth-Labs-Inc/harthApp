import { Fragment, useRef, useState } from "react";
import styles from "./ReportALertPosts.module.scss";
import ChatSingleMessage from "components/ChatSingleMessage/ChatSingleMessage";
import { IconChevronLeft } from "resources/icons/IconChevronLeft";
import ReportIcon from "resources/icons/Report";
import { deleteMessage, updateFlaggedPost } from "../../requests/chat";
import { useSocket } from "contexts/socket";
import { deleteConversationMessage } from "requests/conversations";
/* eslint-disable */
const ReportALertPosts = ({ initialReportPosts, cancelReport }) => {
  const [reportPosts, setReportPosts] = useState(initialReportPosts);
  const [msgReload, triggerMsgReload] = useState(0);

  const { emitUpdate } = useSocket();

  const slideshowURLRef = useRef([]);

  const ignore = () => {
    return;
  };
  const approveHandler = async (msg) => {
    const { topic_id, conversation_id } = msg;

    const postCollection = topic_id
      ? "messages"
      : conversation_id
      ? "conversation_messages"
      : "";

    msg.flagged = true;
    msg.approvedByAdmin = true;
    msg.approvedByAdminKeepBlurred = false;

    await updateFlaggedPost({ msg, postCollection });

    if (postCollection == "messages") {
      msg.updateType = "message update";
      msg.action = "update";
    } else {
      msg.updateType = "conversation message update";
      msg.action = "update";
    }
    emitUpdate(msg.comm_id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
      setReportPosts((currentPosts) =>
        currentPosts.filter((m) => m._id !== msg._id)
      );
    });
  };
  const aprroveStayBlurredHandler = async (msg) => {
    const { topic_id, conversation_id } = msg;

    const postCollection = topic_id
      ? "messages"
      : conversation_id
      ? "conversation_messages"
      : "";

    msg.flagged = true;
    msg.approvedByAdmin = false;
    msg.approvedByAdminKeepBlurred = true;

    await updateFlaggedPost({ msg, postCollection });

    if (postCollection == "messages") {
      msg.updateType = "message update";
      msg.action = "update";
    } else {
      msg.updateType = "conversation message update";
      msg.action = "update";
    }
    emitUpdate(msg.comm_id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
      setReportPosts((currentPosts) =>
        currentPosts.filter((m) => m._id !== msg._id)
      );
    });
  };

  const removeHandler = async (msg) => {
    const { topic_id, conversation_id, comm_id, _id } = msg;

    const postCollection = topic_id
      ? "messages"
      : conversation_id
      ? "conversation_messages"
      : "";

    if (postCollection == "messages") {
      await deleteMessage(_id, `${comm_id}-${topic_id}-${_id}`);

      msg.action = "delete";
      msg.updateType = "message update";
    }
    if (postCollection == "conversation_messages") {
      await deleteConversationMessage(
        _id,
        `${comm_id}-${conversation_id}-${_id}`
      );
      msg.action = "delete";
      msg.updateType = "conversation message update";
    }
    emitUpdate(comm_id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
      setReportPosts((currentPosts) =>
        currentPosts.filter((m) => m._id !== msg._id)
      );
    });
  };
  // const removeFlagHandler = async (msg) => {
  //   const { topic_id, conversation_id } = msg;

  //   const postCollection = topic_id
  //     ? "messages"
  //     : conversation_id
  //     ? "conversation_messages"
  //     : "";

  //   delete msg.flagged;
  //   delete msg.approvedByAdmin;
  //   delete msg.approvedByAdminKeepBlurred;

  //   await unflagPost({ msg, postCollection });
  //   if (postCollection == "messages") {
  //     msg.updateType = "message update";
  //     msg.action = "update";
  //   } else {
  //     msg.updateType = "conversation message update";
  //     msg.action = "update";
  //   }
  //   emitUpdate(msg.comm_id, msg, async (err) => {
  //     if (err) {
  //       console.error(err);
  //     }
  //     setReportPosts((currentPosts) =>
  //       currentPosts.filter((m) => m._id !== msg._id)
  //     );
  //   });
  // };

  if (reportPosts) {
    return (
      <div className={styles.Holder} id="messageResizer">
        <div className={styles.Header} id="chatHeader">
          <button onClick={cancelReport} aria-label="back">
            <IconChevronLeft />
          </button>
          <p>
            <span className={styles.emojiHolder}>
              <ReportIcon />
            </span>
            <span>Flagged Content</span>
          </p>
          <button onClick={ignore} aria-label="topic menu"></button>
        </div>
        <div className={styles.ChatMessages}>
          {reportPosts.map((msg, index) => (
            <Fragment key={msg?._id}>
              <div className={styles.messageWrapper}>
                <ChatSingleMessage
                  slideshowURLRef={slideshowURLRef}
                  msgReload={msgReload}
                  editMessageText={ignore}
                  msg={msg}
                  messageID={msg?._id}
                  openImageSlideShow={ignore}
                  showImageSlideShow={false}
                  imageSlideshowURL={null}
                  resetImageSLideshow={ignore}
                  resetEdit={ignore}
                  isEditing={false}
                  toggleEditing={ignore}
                  messageIndex={index}
                  postCollection=""
                  isReportPost={true}
                />
                <div className={styles.overlay}></div>
                <div className={styles.buttonBar}>
                  <button onClick={() => approveHandler(msg)}>Approve</button>
                  <button onClick={() => aprroveStayBlurredHandler(msg)}>
                    Approve / stay blurred
                  </button>
                  <button onClick={() => removeHandler(msg)}>Remove</button>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default ReportALertPosts;
