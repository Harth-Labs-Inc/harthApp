import { useContext, useState } from "react";
import { useComms } from "../../../contexts/comms";
import TopicsNav from "../../../components/Menus/TopicsMenu/TopicsSideNav";
import MobileChatHeader from "../../../components/Topics/MobileChatHeader/MobileChatHeader";
import ChatMessages from "../../../components/ChatMessages/ChatMessages";
import { MobileContext } from "../../../contexts/mobile.js";

import styles from "./chatPage.module.scss";

const Chat = () => {
  const { isMobile } = useContext(MobileContext);
  const { selectedTopic } = useComms();
  const [chatVisible, setChatVisible] = useState(false);

  function handleMobileChat(newValue) {
    setChatVisible(newValue);
  }

  return (
    <>
      {isMobile ? (
        <>
          {!chatVisible ? (
            <div
              id="mainchatContainer"
              style={{ width: "100%", position: "relative" }}
            >
              <div className={styles.topicHolderMobile}>
                <TopicsNav handleMobileChat={handleMobileChat} />
              </div>
            </div>
          ) : (
            <div id="mainchatContainer" className={styles.chatHolderMobile}>
              <MobileChatHeader
                selectedTopic={selectedTopic}
                handleMobileChat={handleMobileChat}
                toggleTopicEditModal
              />
              <ChatMessages />
            </div>
          )}
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
