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
      <aside id="nav_topics">
        {comms &&
          comms.map((com) => {
            return (
              <button
                style={{ height: "40px", width: "40px" }}
                onClick={() => {
                  changeSelectedCom(com);
                }}
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
            );
          })}

        <button onClick={openCreateComm}></button>
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
