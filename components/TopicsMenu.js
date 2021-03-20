import React, { useState } from "react";
import { useComms } from "../contexts/comms";

const TopicsMenu = (props) => {
  const { selectedTopic } = useComms();
  const { on_toggle_panel } = props;
  const { on_bookmark } = props;

  return (
    <header>
      <p id="topic_title">{(selectedTopic || {}).title}</p>{" "}
      <span>
        <button id="topic_bookmark" onClick={on_bookmark}>
          bookmark
        </button>
        <button id="topic_menu_toggle" onClick={on_toggle_panel}>
          menu
        </button>
      </span>
    </header>
  );
};

export default TopicsMenu;
