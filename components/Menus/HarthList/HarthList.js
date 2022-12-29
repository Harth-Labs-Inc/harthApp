import { useContext } from "react";

import { MobileContext } from "../../../contexts/mobile";
import { useAuth } from "../../../contexts/auth";

import { IconAdd } from "../../../resources/icons/IconAdd";
import { IconFireFill } from "../../../resources/icons/IconFireFill";

import styles from "./HarthList.module.scss";

const HarthList = ({
  comms,
  selectedcomm,
  unreadMsgs,
  toggleCreateComm,
  changeSelectedCom,
  toggleHarthEditModal,
}) => {
  const { isMobile } = useContext(MobileContext);
  const { user } = useAuth();

  const toggleEditMenu = (evt, id, harth) => {
    if (evt.button === 2) {
      const targetElement = document.getElementById(id);
      if (targetElement && targetElement.contains(evt.target)) {
        console.log("clicked");
        evt.preventDefault();
        toggleHarthEditModal({
          harth,
          pos: {
            x: evt.clientX,
            y: evt.clientY,
          },
        });
      }
    }
  };

  return (
    <ul
      className={isMobile ? styles.HarthListMobile : styles.HarthList}
      id="left_nav_comms"
    >
      {comms &&
        comms.map((com) => {
          let active = false;
          let newMessage = false;
          if (selectedcomm && com._id === selectedcomm._id) {
            active = true;
          } else {
            let owner = com?.users.find((usr) => usr?.userId === user._id);
            unreadMsgs.forEach((msg) => {
              if (
                msg.comm_id === com._id &&
                msg.creator_id !== user._id &&
                owner &&
                !owner.muted
              ) {
                newMessage = true;
              }
            });
          }

          return (
            <li
              className={`
                              ${styles.Item}
                              ${active ? styles.ItemActive : null}
                              ${
                                newMessage && !active
                                  ? styles.ItemUnreadMessage
                                  : null
                              }
                            `}
              key={com?._id}
              id={com._id}
            >
              <button
                onClick={() => {
                  changeSelectedCom(com);
                }}
                onMouseUp={(e) => toggleEditMenu(e, com._id, com)}
                aria-label={com.name}
                className={styles.ItemButton}
              >
                {com.iconKey ? (
                  <span className={styles.ItemImage}>
                    <img src={com.iconKey} />
                  </span>
                ) : (
                  <span className={styles.ItemIcon}>
                    <span className={styles.ItemIconFiller}>
                      <IconFireFill />
                    </span>
                  </span>
                )}
                {isMobile ? (
                  <span className={styles.ItemName}>{com.name}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      {isMobile ? (
        <li className={styles.NewHarth}>
          <button className={styles.ItemButton} onClick={toggleCreateComm}>
            <IconAdd />
          </button>
        </li>
      ) : null}
    </ul>
  );
};

export default HarthList;
