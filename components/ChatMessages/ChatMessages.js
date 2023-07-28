import { useState, useEffect, useRef, useContext } from "react";
import { useComms } from "../../contexts/comms";
import { useSocket } from "../../contexts/socket";
import { MobileContext } from "../../contexts/mobile";
import { getDownloadURL } from "../../requests/s3";
import { removeUnsavedMessages } from "../../requests/chat";
import ChatInput from "../ChatInput/ChatInput";
import ChatSingleMessage from "../ChatSingleMessage/ChatSingleMessage";
import styles from "./ChatMessages.module.scss";
import ImageViewer from "react-simple-image-viewer";
import TalkingHead from "components/TalkingHead/TalkingHead";
import { getMessagesByTopic } from "requests/chat";
import { useAuth } from "contexts/auth";
import { SpinningLoader } from "components/Common/SpinningLoader/SpinningLoader";

const MessageWrapper = () => {
  const [currentMessages, setCurrentMessages] = useState([]);
  const [topicInputs, setTopicInputs] = useState({});
  const [editMessageObj, setEditMessageObj] = useState({});
  const [bottom, setBottom] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [inview, setInview] = useState(null);
  const [displayScrollButton, setDisplayScrollButton] = useState(false);
  const [msgReload, triggerMsgReload] = useState(0);
  const [showImageSlideShow, setShowImageSlideShow] = useState(false);
  const [imageSlideshowURL, setImageSlideshowURL] = useState();
  const [messageEditing, setMessageEditing] = useState();

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const bottomObserver = useRef(null);
  const { selectedTopic, selectedCommRef } = useComms();
  const { incomingMsg, incomingMsgUpdate, emitUpdateFromRef } = useSocket();
  const { user } = useAuth();

  const messagesEndRef = useRef(null);
  const { isMobile } = useContext(MobileContext);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          setInview(true);
          setDisplayScrollButton(false);
        } else {
          setInview(false);
        }
      },
      { threshold: 0.25, rootMargin: "50px" }
    );
    bottomObserver.current = observer;
  }, []);

  useEffect(() => {
    const observer = bottomObserver.current;
    if (bottom) {
      observer.observe(bottom);
    }
    return () => {
      if (bottom) {
        observer.unobserve(bottom);
      }
    };
  }, [bottom]);

  useEffect(() => {
    if (selectedTopic && page > 1) {
      setLoading(true);
      (async () => {
        let data = await getMessagesByTopic(selectedTopic._id, page, 13);
        const { ok, fetchResults } = data;
        if (ok) {
          const sortedMessages = sortMessages([...fetchResults]);
          setCurrentMessages((prevState) => [...prevState, ...sortedMessages]);
          setHasMore(fetchResults.length > 0);
          setLoading(false);
        } else {
          setCurrentMessages([]);
          setPage(1);
          setLoading(false);
        }
      })();
    } else {
      setPage(1);
      setCurrentMessages([]);
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setCurrentMessages([]);
    if (selectedTopic && selectedTopic._id) {
      (async () => {
        let data = await getMessagesByTopic(selectedTopic._id, 1, 13);
        const { ok, fetchResults } = data;
        if (ok) {
          setCurrentMessages(sortMessages([...fetchResults]));
          setHasMore(fetchResults.length > 0);
          setLoading(false);
        } else {
          setCurrentMessages([]);
          setPage(1);
          setLoading(false);
        }
        removeUnsavedMessages(selectedTopic._id, user._id).then(() => {
          let message = {};
          message.updateType = "reload unreads";
          message.topic_id = selectedTopic._id;
          message.user_id = user._id;
          emitUpdateFromRef(
            selectedCommRef.current?._id,
            message,
            async (err) => {
              if (err) {
                console.error(err);
              }
            }
          );
        });
      })();
    } else {
      setLoading(false);
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (incomingMsg && Object.keys(incomingMsg).length) {
      if (selectedTopic && incomingMsg.topic_id === selectedTopic._id) {
        setCurrentMessages((prevState) => [incomingMsg, ...prevState]);
        removeUnsavedMessages(selectedTopic._id, user._id);
        let message = {};
        message.updateType = "reload unreads";
        message.topic_id = selectedTopic._id;
        message.user_id = user._id;
        emitUpdateFromRef(
          selectedCommRef.current?._id,
          message,
          async (err) => {
            if (err) {
              console.error(err);
            }
          }
        );
      }
    }
  }, [incomingMsg]);

  useEffect(() => {
    if (
      incomingMsgUpdate &&
      selectedTopic &&
      incomingMsgUpdate?.topic_id === selectedTopic._id
    ) {
      const { topic_id, action, _id } = incomingMsgUpdate;

      let tempMsgs = currentMessages;
      if (tempMsgs && topic_id) {
        if (action == "delete") {
          let filteredMsgs = tempMsgs.filter((msg) => msg._id !== _id);
          setCurrentMessages(filteredMsgs);
        }
        if (action == "update") {
          let index;
          tempMsgs.forEach((msg, idx) => {
            if (msg._id === _id) {
              index = idx;
            }
            if (tempMsgs[index]) {
              tempMsgs[index].reactions = incomingMsgUpdate.reactions;
              tempMsgs[index].reactionsData = incomingMsgUpdate.reactionsData;

              tempMsgs[index].flames = incomingMsgUpdate.flames;
              tempMsgs[index].message = incomingMsgUpdate.message;
            }
            setCurrentMessages(tempMsgs);
          });
        }
        triggerMsgReload((prevState) => (prevState += 1));
      }
    }
  }, [incomingMsgUpdate]);

  const sortMessages = (msgs) => {
    return msgs.sort((a, b) => new Date(a.date) - new Date(b.date)).reverse();
  };
  const editMessage = (msg) => {
    setEditMessageObj(msg);
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const ScrollButton = () => {
    if (displayScrollButton) {
      // -- remove style from this needs repositioning and styling sometimes shows when you reload over and over
      return (
        <button
          onClick={scrollToBottom}
          className="scroll-to-bottom hidden"
          style={{
            border: "none",
            background: "none",
            color: "transparent",
          }}
        >
          New Message
        </button>
      );
    }
    return null;
  };
  const openImageSlideShow = async (idx, attachments) => {
    let att = attachments[idx];
    let name = { ...att }?.name || "";
    if (name.includes("thumbnail")) {
      name = name.replace("thumbnail", "full");
    }
    const data = await getDownloadURL(
      name,
      att.fileType,
      "topic-message-attachments"
    );
    if (data) {
      const { ok, downloadURL } = data;
      if (ok) {
        setShowImageSlideShow(true);
        setImageSlideshowURL(downloadURL);
      }
    }
  };
  const resetImageSLideshow = () => {
    setImageSlideshowURL(null);
    setShowImageSlideShow(false);
  };
  const resetEdit = () => {
    setEditMessageObj({});
  };
  const toggleEditing = (msgId) => {
    setMessageEditing(msgId);
  };
  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - Math.abs(e.target.scrollTop) <=
      e.target.clientHeight + 200;

    if (bottom && !loading && hasMore) {
      setPage((prevState) => prevState + 1);
    }
  };
  return (
    <>
      {showImageSlideShow ? (
        <>
          <div className={styles.imageViewer}>
            <ImageViewer
              src={[imageSlideshowURL]}
              closeOnClickOutside={true}
              onClose={resetImageSLideshow}
              backgroundStyle={{
                backgroundColor: "rgba(0,0,0,0.92)",
              }}
            />
          </div>
        </>
      ) : null}

      <div className={styles.Holder}>
        <div id={styles.ChatMessages} onScroll={handleScroll}>
          <div ref={messagesEndRef} />
          <div ref={setBottom} />
          {currentMessages && currentMessages.length > 0 ? (
            currentMessages.map((msg) => (
              <div key={msg?._id}>
                <ChatSingleMessage
                  msgReload={msgReload}
                  editMessageText={editMessage}
                  msg={msg}
                  messageID={msg?._id}
                  openImageSlideShow={openImageSlideShow}
                  showImageSlideShow={showImageSlideShow}
                  imageSlideshowURL={imageSlideshowURL}
                  resetImageSLideshow={resetImageSLideshow}
                  resetEdit={resetEdit}
                  isEditing={messageEditing === msg?._id ? true : false}
                  toggleEditing={toggleEditing}
                />
              </div>
            ))
          ) : loading ? (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate3d(-50%, -50%, 0)",
              }}
            >
              <SpinningLoader spinnerOnly={true} />
            </div>
          ) : (
            <div className={styles.NoPosts}>
              <TalkingHead
                className={styles.wizard}
                text="Nothing to see here yet. Be the first and share something awesome!"
                isSmall={true}
              />
            </div>
          )}
          <ScrollButton />
        </div>

        {!isMobile ? (
          <div className={styles.InputDesktop}>
            <ChatInput
              selectedEdit={editMessageObj}
              isReply={false}
              topicInputs={topicInputs}
              setTopicInputs={setTopicInputs}
              resetEdit={resetEdit}
              toggleEditing={toggleEditing}
            ></ChatInput>
          </div>
        ) : null}
      </div>
      {isMobile ? (
        <div className={styles.InputMobile}>
          <ChatInput
            selectedEdit={editMessageObj}
            isReply={false}
            topicInputs={topicInputs}
            setTopicInputs={setTopicInputs}
            resetEdit={resetEdit}
            toggleEditing={toggleEditing}
          ></ChatInput>
        </div>
      ) : null}
    </>
  );
};

export default MessageWrapper;
