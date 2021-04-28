import React, { useState } from "react";
import TopicsSideNav from "../../../components/TopicsSideNav";
import TopicsMenu from "../../../components/TopicsMenu";
import MessagesWrapper from "../../../components/messagesWrapper";
import EditPanel from "../../../components/TopicEditPanel";
import { useSocket } from "../../../contexts/socket";

const Chat = (prop) => {
  const [showEditPanel, setShowEditPanel] = useState(false);

  const { incomingMsg } = useSocket();

  const toggleEditPanel = () => {
    setShowEditPanel(!showEditPanel);
  };

  return (
    <>
      <TopicsSideNav />
      <section
        id="topic_active"
        className={showEditPanel && "topic-edit-active"}
      >
        <TopicsMenu on_toggle_panel={toggleEditPanel} />
        <div id="topic_messages_container">
          <MessagesWrapper />
        </div>
      </section>
      {showEditPanel && <EditPanel />}
    </>
  );
};

export default Chat;
