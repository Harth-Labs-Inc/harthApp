import { useContext, useState, useEffect } from "react";

import { useComms } from "../../../contexts/comms";

import TopicsNav from "../../../components/Menus/TopicsMenu/TopicsSideNav";
import MobileChatHeader from "../../../components/Topics/MobileChatHeader/MobileChatHeader";
// import TopicsMenu from "../../../components/TopicsMenu";
import ChatMessages from "../../../components/ChatMessages/ChatMessages";
import { MobileContext } from "../../../contexts/mobile.js";

import styles from "./chatPage.module.scss";

const Chat = () => {
  // const { topicChange } = useComms();
  const { isMobile } = useContext(MobileContext);
  const { selectedTopic } = useComms();
  const [chatVisible, setChatVisible] = useState(false);

  // useEffect(() => {
  //   const element = document.getElementById("mainchatContainer");
  //   element.classList.add(styles.rendering);
  //   setTimeout(() => {
  //     element.classList.remove(styles.rendering);
  //     element.classList.add(styles.entered);
  //   }, 100);

  //   return () => {
  //     element.classList.remove(styles.entered);
  //     element.classList.remove(styles.rendering);
  //   };
  // }, []);
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
