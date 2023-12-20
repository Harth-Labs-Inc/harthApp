import { useContext, useEffect, useRef } from "react";
import { useComms } from "../../../contexts/comms";
import TopicsNav from "../../../components/Menus/TopicsMenu/TopicsSideNav";
import MobileChatHeader from "../../../components/Topics/MobileChatHeader/MobileChatHeader";
import ChatMessages from "../../../components/ChatMessages/ChatMessages";
import { MobileContext } from "../../../contexts/mobile.js";
import styles from "./chatPage.module.scss";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const Chat = () => {
  const { isMobile } = useContext(MobileContext);
  const { selectedTopic, setSelectedTopic } = useComms();
  const mainChatContainerRef = useRef(null);

  let touchStartX = 0;
  let touchStartY = 0;
  let isHorizontalSwipe = null;

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isHorizontalSwipe = null;
  }

  function handleTouchMove(e) {
    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const deltaX = touchCurrentX - touchStartX;
    const deltaY = touchCurrentY - touchStartY;

    if (isHorizontalSwipe === null) {
      isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    }

    if (isHorizontalSwipe && deltaX >= 0 && mainChatContainerRef.current) {
      mainChatContainerRef.current.style.left = `${deltaX}px`;
    }
  }

  function handleTouchEnd(e) {
    if (isHorizontalSwipe && mainChatContainerRef.current) {
      const endSwipeX = e.changedTouches[0].clientX;
      const swipeDistance = endSwipeX - touchStartX;

      if (swipeDistance > 50) {
        handleMobileChat();
      } else {
        mainChatContainerRef.current.style.left = "0px";
      }
    }

    isHorizontalSwipe = null;
  }

  useEffect(() => {
    const mainChatContainer = mainChatContainerRef.current;
    if (mainChatContainer) {
      mainChatContainer.addEventListener("touchstart", handleTouchStart);
      mainChatContainer.addEventListener("touchmove", handleTouchMove);
      mainChatContainer.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      if (mainChatContainer) {
        mainChatContainer.removeEventListener("touchstart", handleTouchStart);
        mainChatContainer.removeEventListener("touchmove", handleTouchMove);
        mainChatContainer.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [selectedTopic]);

  function handleMobileChat() {
    if (Object.keys(selectedTopic || {})?.length && isMobile) {
      setSelectedTopic(null);
    }
  }

  return (
    <>
      {isMobile ? (
        <>
          <div
            id="mainchatContainer"
            style={{ width: "100%", position: "relative" }}
          >
            <div className={styles.topicHolderMobile}>
              <TopicsNav handleMobileChat={handleMobileChat} />
            </div>
          </div>
          <TransitionGroup>
            <CSSTransition
              key={Object.keys(selectedTopic || {})?.length ? "chat" : "topics"}
              timeout={300}
              classNames="slide"
            >
              {Object.keys(selectedTopic || {})?.length ? (
                <div
                  ref={mainChatContainerRef}
                  id="mainchatContainer"
                  className={styles.chatHolderMobile}
                >
                  <MobileChatHeader
                    selectedTopic={selectedTopic}
                    handleMobileChat={handleMobileChat}
                    toggleTopicEditModal
                  />
                  <ChatMessages />
                </div>
              ) : (
                <></>
              )}
            </CSSTransition>
          </TransitionGroup>
        </>
      ) : (
        <div id="mainchatContainer" className={styles.MainChatContainer}>
          <TopicsNav />
          <ChatMessages />
        </div>
      )}
    </>
  );
};

export default Chat;
