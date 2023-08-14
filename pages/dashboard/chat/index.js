import { useContext, useEffect } from "react";
import { useComms } from "../../../contexts/comms";
import TopicsNav from "../../../components/Menus/TopicsMenu/TopicsSideNav";
import MobileChatHeader from "../../../components/Topics/MobileChatHeader/MobileChatHeader";
import ChatMessages from "../../../components/ChatMessages/ChatMessages";
import { MobileContext } from "../../../contexts/mobile.js";
import styles from "./chatPage.module.scss";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useRouter } from "next/router";

const Chat = ({ setOpenFromPushState }) => {
  const { isMobile } = useContext(MobileContext);
  const { selectedTopic, setSelectedTopic } = useComms();

  const router = useRouter();
  const {
    query: { topic_id },
  } = router;

  function handleMobileChat() {
    if (Object.keys(selectedTopic || {})?.length && isMobile) {
      setSelectedTopic(null);
    }
  }

  useEffect(() => {
    if (topic_id && selectedTopic?._id == topic_id) {
      window.history.replaceState(null, null, "/");
      setOpenFromPushState(false);
    }
  }, [selectedTopic?._id]);

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
