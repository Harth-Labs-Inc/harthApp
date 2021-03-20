import React, { useState, useEffect } from "react";
import TopicsSideNav from "components/TopicsSideNav";
import TopicsMenu from "components/TopicsMenu";
import MessagesWrapper from "components/messagesWrapper";

const Chat = (prop) => {
  const [showEditPanel, setShowEditPanel] = useState(false);

  const toggleEditPanel = () => {
    setShowEditPanel(!showEditPanel);
    console.log(showEditPanel);
  };

  return (
    <main>
      <TopicsSideNav></TopicsSideNav>
      <section>
        <TopicsMenu on_toggle_panel={toggleEditPanel}></TopicsMenu>
        <div>
          <MessagesWrapper></MessagesWrapper>
        </div>
      </section>
    </main>
  );
};

export default Chat;
