import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import NavLayout from "../../components/navLayout";
import { ChatProvider } from "../../contexts/chat";

const dashboard = ({ props, children }) => {
  const { user, loading } = useAuth();
  if (user) {
    console.log("user", user);
  }

  return (
    // <ChatProvider>
    //   <NavLayout>{children}</NavLayout>
    // </ChatProvider>
    <NavLayout>{children}</NavLayout>
  );
};

export default dashboard;
