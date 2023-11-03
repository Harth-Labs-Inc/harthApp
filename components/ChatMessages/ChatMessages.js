import { useState, useEffect, useRef, useContext, Fragment } from "react";
import { useComms } from "../../contexts/comms";
import { useSocket } from "../../contexts/socket";
import { MobileContext } from "../../contexts/mobile";
import { removeUnsavedMessages } from "../../requests/chat";
import ChatInput from "../ChatInput/ChatInput";
import ChatSingleMessage from "../ChatSingleMessage/ChatSingleMessage";
import styles from "./ChatMessages.module.scss";
import TalkingHead from "components/TalkingHead/TalkingHead";
import { getMessagesByTopic } from "requests/chat";
import { useAuth } from "contexts/auth";
import { SpinningLoader } from "components/Common/SpinningLoader/SpinningLoader";
import { useRouter } from "next/router";
import ZoomViewer from "components/ZoomViewer/ZoomViewer";

const MessageWrapper = () => {
  const [currentMessages, setCurrentMessages] = useState([]);
  const [topicInputs, setTopicInputs] = useState({});
  const [editMessageObj, setEditMessageObj] = useState({});
  const [msgReload, triggerMsgReload] = useState(0);
  const [showImageSlideShow, setShowImageSlideShow] = useState(false);
  const [imageSlideshowURL, setImageSlideshowURL] = useState();
  const [messageEditing, setMessageEditing] = useState();
  const [scrollLock, setScrollLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [slideshowImage, setSlideshowImage] = useState(0);

  const { selectedTopic, selectedCommRef, keepSpinning } = useComms();
  const {
    incomingMsg,
    incomingMsgUpdate,
    emitUpdateFromRef,
    newMessageIndicators,
  } = useSocket();
  const { user } = useAuth();

  const messagesEndRef = useRef(null);
  const slideshowURLRef = useRef([]);
  const { isMobile } = useContext(MobileContext);

  const router = useRouter();
  const {
    query: { topic_id },
  } = router;

  useEffect(() => {
    localStorage.setItem("isInChatOrDM", true);

    const handleBeforeUnload = () => {
      localStorage.removeItem("isInChatOrDM");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (selectedTopic?._id) {
        delete newMessageIndicators[selectedTopic._id];
      }
      localStorage.removeItem("isInChatOrDM");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (selectedTopic && page > 1) {
      setLoading(true);
      (async () => {
        let data = await getMessagesByTopic(selectedTopic._id, page, 25);
        const { ok, fetchResults } = data;
        if (ok) {
          const sortedMessages = sortMessages([...fetchResults]);
          setCurrentMessages((prevState) => [...prevState, ...sortedMessages]);
          setHasMore(fetchResults.length > 0);
          setLoading(false);
          setScrollLock(false);
        } else {
          setCurrentMessages([]);
          setPage(1);
          setLoading(false);
          setScrollLock(false);
        }
      })();
    } else {
      setPage(1);
      setCurrentMessages([]);
      setLoading(false);
      setScrollLock(false);
    }
  }, [page]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setCurrentMessages([]);
    if (selectedTopic && selectedTopic._id) {
      (async () => {
        let data = await getMessagesByTopic(selectedTopic._id, 1, 25);
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
          message.updateType = "reload same User unreads";
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
    if (topic_id && selectedTopic?._id == topic_id) {
      window.history.replaceState(null, null, "/");
      setTimeout(() => {
        if (keepSpinning) {
          let spinner = document.getElementById("pushSpinner");
          if (spinner) {
            spinner.remove();
          }
        }
      }, 305);
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (incomingMsg && Object.keys(incomingMsg).length) {
      if (selectedTopic && incomingMsg.topic_id === selectedTopic._id) {
        setCurrentMessages((prevState) => {
          if (prevState.some((msg) => msg._id === incomingMsg._id)) {
            return prevState;
          }
          return [incomingMsg, ...prevState];
        });
        removeUnsavedMessages(selectedTopic._id, user._id).then(() => {
          let message = {};
          message.updateType = "reload same User unreads";
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
              tempMsgs[index].flagged = incomingMsgUpdate.flagged;
              tempMsgs[index].approvedByAdmin =
                incomingMsgUpdate.approvedByAdmin;
              tempMsgs[index].approvedByAdminKeepBlurred =
                incomingMsgUpdate.approvedByAdminKeepBlurred;
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
  const openImageSlideShow = async (url) => {
    const index = slideshowURLRef.current.findIndex(
      (obj) => obj.name === url.name
    );
    setSlideshowImage(index);
    setShowImageSlideShow(true);
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
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    const threshold = 100;

    const absScrollTop = Math.abs(scrollTop);
    const isNearBottom =
      absScrollTop + clientHeight + threshold >= scrollHeight;

    if (isNearBottom && !loading && hasMore && !scrollLock) {
      setScrollLock(true);
      setPage((prevState) => prevState + 1);
    }
  };
  const nextImageInSlideshow = (url) => {
    const index = slideshowURLRef.current.findIndex(
      (obj) => obj.name === url.name
    );
    if (index !== -1) {
      const nextIndex = (index + 1) % slideshowURLRef.current.length;
      setSlideshowImage(nextIndex);
    }
  };
  const prevImageInSlideshow = (url) => {
    const index = slideshowURLRef.current.findIndex(
      (obj) => obj.name === url.name
    );
    if (index !== -1) {
      const prevIndex =
        (index - 1 + slideshowURLRef.current.length) %
        slideshowURLRef.current.length;
      setSlideshowImage(prevIndex);
    }
  };
  const toggleOverlay = (shouldShow) => {
    setShowOverlay(shouldShow);
  };

  return (
    <>
      {showImageSlideShow ? (
        <ZoomViewer
          resetImageSLideshow={resetImageSLideshow}
          url={slideshowURLRef.current[slideshowImage]}
          prevImageInSlideshow={prevImageInSlideshow}
          nextImageInSlideshow={nextImageInSlideshow}
          slideshowURLRef={slideshowURLRef.current}
        />
      ) : null}

      <div className={styles.Holder} id="messageResizer">
        <div id={styles.ChatMessages} onScroll={handleScroll}>
          <div ref={messagesEndRef} />
          {currentMessages && currentMessages.length > 0 ? (
            currentMessages.map((msg, index) => (
              <Fragment key={msg?._id}>
                <ChatSingleMessage
                  slideshowURLRef={slideshowURLRef}
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
                  messageIndex={index}
                  postCollection="messages"
                />
              </Fragment>
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
        <>
          {showOverlay ? (
            <div
              id="overlay"
              style={{
                height: "100vh",
                width: "100vw",
                position: "fixed",
                top: 0,
                left: 0,
                background: "transparent",
                zIndex: 1,
              }}
            ></div>
          ) : null}
          <div className={styles.InputMobile}>
            <ChatInput
              toggleOverlay={toggleOverlay}
              selectedEdit={editMessageObj}
              isReply={false}
              topicInputs={topicInputs}
              setTopicInputs={setTopicInputs}
              resetEdit={resetEdit}
              toggleEditing={toggleEditing}
            ></ChatInput>
          </div>
        </>
      ) : null}
    </>
  );
};

export default MessageWrapper;
