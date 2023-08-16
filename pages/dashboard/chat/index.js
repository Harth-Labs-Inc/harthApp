import { useContext, useEffect } from "react";
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
                <div id="mainchatContainer" className={styles.chatHolderMobile}>
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
