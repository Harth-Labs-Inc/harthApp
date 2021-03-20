import React, { useState } from "react";
import { useComms } from "../contexts/comms";

const TopicsMenu = (props) => {
  const { selectedTopic } = useComms();
  const { on_toggle_panel } = props;

  return (
    <header>
      {(selectedTopic || {}).title} <p onClick={on_toggle_panel}>menu</p>
    </header>
  );
};

export default TopicsMenu;
