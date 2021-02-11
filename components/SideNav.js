import React, { useState } from "react";
import { useComms } from "../contexts/comms";
import Modal from "./Modal";
import CommBuilder from "../pages/comm";

const SideNav = (props) => {
  const [openCommBUilder, setOpenCommBuilder] = useState(false);

  const { comms, setSelected, selectedcomm } = useComms();

  const changeSelectedCom = (com) => {
    setSelected(com);
  };

  const openCreateComm = () => {
    setOpenCommBuilder(true);
  };
  return (
    <>
      {openCommBUilder ? (
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
                  className={setSelected ? "active" : ""}
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
