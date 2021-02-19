import React, { useState } from "react";
import { useComms } from "../contexts/comms";
import Modal from "./Modal";

const TopicsNav = (props) => {
  const { topics, setSelected, selectedtopic } = useComms();

  const changeSelectedTopic = (topic) => {
    setSelected(topic);
  };

  const openCreateTopic = () => {
    setOpenCommBuilder(true);
  };
  return (
    <>
      {openTopicBUilder ? (
        <Modal>
          <TopicBuilder />
        </Modal>
      ) : (
        ""
      )}
      <aside id="left_nav">
        <header>
          <p>Topics</p>
          <button onClick={openCreateTopic}></button>
        </header>
        {/* <ul id="left_nav_topics">
          {topics &&
            topics.map((topic) => {
              return (
                <li
                  className={setSelected ? "active" : ""}
                  aria-label="nav-item"
                  key={topic._id}
                >
                  <button
                    onClick={() => {
                      changeSelectedTopic(topic);
                    }}
                    aria-label={topic.name}
                  >
                    {topic.iconKey ? (
                      <img
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                        }}
                        src={com.iconKey}
                      />
                    ) : (
                      ""
                    )}
                  </button>
                </li>
              );
            })}
          <li id="left_nav_topics_new" aria-label="nav-item"></li>
        </ul> */}

        <button
          onClick={props.onToggleMenu}
          aria-label="Toggle Main Menu"
          id="menu-toggle"
        >
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </button>
      </aside>
    </>
  );
};

export default TopicsNav;
