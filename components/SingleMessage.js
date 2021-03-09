import React, { useState } from "react";
import { useComms } from "../contexts/comms";
import { useAuth } from "../contexts/auth";

const Message = (props) => {
  const { user } = useAuth();
  const {
    comms,
    setComm,
    selectedcomm,
    topics,
    addNewTopic,
    setTopic,
    selectedTopic,
  } = useComms();

  return <></>;
};

export default Message;
