import React, { useState } from "react";
import TopicsSideNav from "../../../components/TopicsSideNav";
import TopicsMenu from "../../../components/TopicsMenu";
import MessagesWrapper from "../../../components/messagesWrapper";
import { useSocket } from "../../../contexts/socket";

const Chat = (prop) => {
  const [showEditPanel, setShowEditPanel] = useState(false);

  const { incomingMsg } = useSocket();

  const toggleEditPanel = () => {
    setShowEditPanel(!showEditPanel);
  };

  return (
    <>
      <TopicsSideNav></TopicsSideNav>
      <section id="topic_active">
        <TopicsMenu on_toggle_panel={toggleEditPanel}></TopicsMenu>
        <div id="topic_active_messages">
          <MessagesWrapper></MessagesWrapper>
        </div>
      </section>
    </>
  );
};

export default Chat;
