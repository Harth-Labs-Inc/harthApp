import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import Dashboad from "../dashboard/index";

const Chat = (prop) => {
  const { user, loading } = useAuth();
  if (user) {
    console.log(user);
  }

  return (
    <Dashboad>
      <p>chat</p>
    </Dashboad>
  );
};

export default Chat;
