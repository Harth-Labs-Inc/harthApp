import { useState, useContext, useEffect } from "react";
import { MobileContext } from "../../contexts/mobile";
import { IconChatNoFill } from "../../resources/icons/IconChatNoFill";
import { IconFireNoFill } from "../../resources/icons/IconFireNoFill";
import { IconForumNoFill } from "../../resources/icons/IconForumNoFill";
import { IconChatFill } from "../../resources/icons/IconChatFill";
import { IconFireFill } from "../../resources/icons/IconFireFill";
import { IconForumFill } from "../../resources/icons/IconForumFill";
import { Modal } from "../Common/Modals/Modal";
import HarthSettings from "../Menus/HarthSettings/HarthSettings";
import { useComms } from "../../contexts/comms";

import styles from "./mainNav.module.scss";
import { useSocket } from "../../contexts/socket";

const MainNav = (props) => {
  const { changePage, currentPage, onToggleMenu } = props;
  const [modal, setModal] = useState(false);

  const { isMobile } = useContext(MobileContext);
  const { selectedcomm, selectedCommRef } = useComms();
  const { mainAlerts, setMainAlertsFromChild } = useSocket();

  const unreadMessagesOther = true;

  useEffect(() => {
    if (selectedCommRef.current && mainAlerts[selectedCommRef.current?._id]) {
      let alerts = mainAlerts[selectedCommRef.current?._id];
      if (alerts) {
        for (let [key, value] of Object.entries(alerts)) {
          if (currentPage == key && value) {
            if (key !== "gather") {
              alerts[key] = false;
              setMainAlertsFromChild({
                ...mainAlerts,
                [selectedCommRef.current?._id]: alerts,
              });
            } else {
              let schedules = alerts.gather?.schedules;
              if (schedules && schedules.length) {
                alerts.gather.schedules = [];
                setMainAlertsFromChild({
                  ...mainAlerts,
                  [selectedCommRef.current?._id]: alerts,
                });
              }
            }
          }
        }
      }
    }
  }, [mainAlerts, currentPage, selectedcomm]);

  const handleHarthMenu = () => {
    if (!isMobile) {
      setModal((prevState) => !prevState);
    }
    if (isMobile) {
      onToggleMenu();
    }
  };

  const showModal = () => {
    setModal((prevState) => !prevState);
  };

  let hasLive = false;
  let schedules = [];
  /* eslint-disable */
  if (currentPage !== "gather") {
    let gather = mainAlerts[selectedCommRef.current?._id]?.gather;
    hasLive = gather?.hasLive;
    schedules = gather?.schedules;
  }
  return (
    <>
      {modal ? (
        <Modal onToggleModal={showModal}>
          <HarthSettings
            communityName={selectedcomm?.name}
            communityId={selectedcomm?._id}
            onToggleModal={showModal}
          />
        </Modal>
      ) : (
        ""
      )}

      <header
        className={`${styles.MainNav} ${
          isMobile ? styles.Mobile : styles.Desktop
        }`}
      >
        {isMobile ? (
          <button
            className={`
                        ${styles.MainNavHarthButton}
                        ${
                          unreadMessagesOther
                            ? styles.MainNavHarthButtonUnreadMessage
                            : null
                        }
                        `}
            onClick={handleHarthMenu}
            aria-label="Current Harth"
          >
            <img
              className={styles.MainNavHarthButtonImage}
              src={selectedcomm?.iconKey}
              loading="lazy"
            />
          </button>
        ) : (
          <div className={styles.MainNavTitleHolder}>
            <button
              className={styles.MainNavHarthButton}
              onClick={handleHarthMenu}
              aria-label="Current Harth Settings"
            >
              {selectedcomm?.name}
            </button>
            <span className={`
              ${styles.Section}
              ${currentPage == "chat" && styles.SectionChat}
              ${currentPage == "gather" && styles.SectionGather}
              ${currentPage == "message" && styles.SectionMessage}
              `}>\ {currentPage}</span>
          </div>
        )}

        <div
          className={`
                    ${styles.MainNavPages} 
                    ${isMobile && styles.MainNavPagesMobile}

                `}
        >
          <button
            role="nav-item"
            id="chat"
            aria-label="Community Chat"
            className={`
                            ${styles.MainNavPageButton} 
                            ${styles.MainNavPageButtonChat} 
                            ${currentPage == "chat" && styles.ActiveChat}

                        `}
            onClick={() => {
              changePage("chat");
            }}
          >
            <div
              className={`
                            ${styles.iconHolder} 
                            ${
                              mainAlerts[selectedCommRef.current?._id] &&
                              mainAlerts[selectedCommRef.current?._id]?.chat &&
                              currentPage != "chat" &&
                              styles.iconHolderUnreadMessage
                            }

                            `}
            >
              {currentPage == "chat" ? <IconChatFill /> : <IconChatNoFill />}
            </div>
            {isMobile && <div className={styles.mobileTitle}>Chat</div>}
          </button>

          <button
            role="nav-item"
            id="gather"
            aria-label="Gather"
            className={`
                            ${styles.MainNavPageButton} 
                            ${styles.MainNavPageButtonGather} 
                            ${
                              currentPage == "gather"
                                ? styles.ActiveGather
                                : null
                            } 
                        `}
            onClick={() => {
              changePage("gather");
            }}
          >
            <div
              className={`
                            ${styles.iconHolder} 
                            ${
                              currentPage != "gather" &&
                              (hasLive || schedules?.length)
                                ? styles.iconHolderUnreadMessage
                                : null
                            }
                            `}
            >
              {currentPage == "gather" ? <IconFireFill /> : <IconFireNoFill />}
              
            </div>
            {isMobile && <div className={styles.mobileTitle}>Gather</div>}
          </button>

          <button
            role="nav-item"
            id="message"
            aria-label="Private Messages"
            className={`
                            ${styles.MainNavPageButton} 
                            ${styles.MainNavPageButtonMessage} 
                            ${
                              currentPage == "message"
                                ? styles.ActiveMessage
                                : null
                            } 
                        `}
            onClick={() => {
              changePage("message");
            }}
          >
            <div
              className={`
                            ${styles.iconHolder} 
                            ${
                              mainAlerts[selectedCommRef.current?._id] &&
                              mainAlerts[selectedCommRef.current?._id]
                                ?.message &&
                              currentPage != "message" &&
                              styles.iconHolderUnreadMessage
                            }
                            `}
            >
              {currentPage == "message" ? (
                <IconForumFill />
              ) : (
                <IconForumNoFill />
              )}
            </div>
            {isMobile && <div className={styles.mobileTitle}>Message</div>}
          </button>
        </div>
      </header>
    </>
  );
};

export default MainNav;
