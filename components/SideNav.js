import React, { useState } from "react";
import { useComms } from "../contexts/comms";
import Modal from "./Modal";
import CommBuilder from "../pages/comm";

const SideNav = (props) => {
  const [openCommBuilder, setOpenCommBuilder] = useState(false);

  const { comms, setComm, selectedcomm, setTopic } = useComms();

  const changeSelectedCom = (com) => {
    setComm(com);
    setTopic({});
  };

  const openCreateComm = () => {
    setOpenCommBuilder(true);
  };
  return (
    <>
      {openCommBuilder ? (
        <Modal>
          <CommBuilder />
        </Modal>
      ) : (
        ""
      )}
      <aside id="left_nav">
        <ul id="left_nav_comms">
          {comms &&
            comms.map((com) => {
              return (
                <li
                  className={
                    selectedcomm && com._id === selectedcomm._id ? "active" : ""
                  }
                  aria-label="nav-item"
                  key={com._id}
                >
                  <button
                    onClick={() => {
                      changeSelectedCom(com);
                    }}
                    aria-label={com.name}
                  >
                    {com.iconKey ? (
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
          <li id="left_nav_comms_new" aria-label="nav-item">
            <button onClick={openCreateComm}></button>
          </li>
        </ul>

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

export default SideNav;
