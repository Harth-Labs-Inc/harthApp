import React, { useState, useEffect } from "react";
import TopicsNav from "../../../components/TopicsMenu";
import { useAuth } from "../../../contexts/auth";

const Chat = (prop) => {
  return (
    <main>
      <TopicsNav></TopicsNav>
    </main>
  );
};

export default Chat;
