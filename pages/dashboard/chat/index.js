import React, { useState, useEffect } from "react";
import TopicsSideNav from "components/TopicsSideNav";
import TopicsMenu from "components/TopicsMenu";
import MessagesWrapper from "components/messagesWrapper";
import ChatTextEntry from "components/chatTextEntry";

const Chat = (prop) => {
  return (
    <main>
      <TopicsSideNav></TopicsSideNav>
      <TopicsMenu></TopicsMenu>
      <MessagesWrapper></MessagesWrapper>
      <ChatTextEntry></ChatTextEntry>
    </main>
  );
};

export default Chat;
