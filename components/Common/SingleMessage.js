import React, { useState } from "react";

const Message = (props) => {
  const { msg } = props;

  return (
    <>
      <p>{msg.message}</p>
    </>
  );
};

export default Message;
