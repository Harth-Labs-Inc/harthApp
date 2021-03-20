import React, { useState, useRef, useEffect } from "react";
import TopicsSideNav from "../../../components/TopicsSideNav";
import TopicsMenu from "../../../components/TopicsMenu";
import MessagesWrapper from "../../../components/messagesWrapper";
import { useSocket } from "../../../contexts/socket";

const Chat = (prop) => {
  const [showEditPanel, setShowEditPanel] = useState(false);

  const autoScroll = useRef(null);
  const { incomingMsg } = useSocket();

  useEffect(() => {
    scrollToBottom();
  }, [incomingMsg]);

  const toggleEditPanel = () => {
    setShowEditPanel(!showEditPanel);
    console.log(showEditPanel);
  };

  const scrollToBottom = () => {
    autoScroll.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <TopicsSideNav></TopicsSideNav>
      <section id="topic_active">
        <TopicsMenu on_toggle_panel={toggleEditPanel}></TopicsMenu>
        <div id="topic_active_messages">
          <MessagesWrapper></MessagesWrapper>
          <a ref={autoScroll} id="auto-scroll" />
        </div>
      </section>
    </>
  );
};

export default Chat;
