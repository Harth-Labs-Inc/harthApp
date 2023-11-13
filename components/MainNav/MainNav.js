import { useState, useContext, useEffect } from "react";
import { MobileContext } from "../../contexts/mobile";
import { IconGather } from "resources/icons/IconGather";
import { IconGatherMuted } from "resources/icons/IconGatherMuted";
import { IconMessage } from "resources/icons/IconMessage";
import { IconMessageMuted } from "resources/icons/IconMessageMuted";
import { IconChat } from "resources/icons/IconChat";
import { IconChatMuted } from "resources/icons/IconChatMuted";
import { IconHome } from "resources/icons/IconHome";
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
  const {
    mainAlerts,
    setMainAlertsFromChild,
    unreadConvMessagesRef,
    unreadMessagesRef,
  } = useSocket();

  // const unreadMessagesOther = true;
 
  useEffect(() => {
    if (selectedCommRef.current && mainAlerts[selectedCommRef.current?._id]) {
      let alerts = mainAlerts[selectedCommRef.current?._id];
      if (alerts) {
        for (let [key, value] of Object.entries(alerts)) {
          if (currentPage == key && value) {
            if (key === "gather") {
              let schedules = alerts.gather?.schedules;
              if (schedules && schedules.length) {
                alerts.gather.schedules = [];
                setMainAlertsFromChild({
                  ...mainAlerts,
                  [selectedCommRef.current?._id]: alerts,
                });
              }
            }
            if (key === "chat") {
              if (!unreadMessagesRef.length) {
                alerts[key] = false;
                setMainAlertsFromChild({
                  ...mainAlerts,
                  [selectedCommRef.current?._id]: alerts,
                });
              }
            }
            if (key === "message") {
              if (!unreadConvMessagesRef.length) {
                alerts[key] = false;
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
  }, [
    mainAlerts,
    currentPage,
    selectedcomm,
    unreadConvMessagesRef,
    unreadMessagesRef,
  ]);

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
        {isMobile ? null : (
          <div className={styles.MainNavTitleHolder}>
            <button
              className={styles.MainNavHarthButton}
              onClick={handleHarthMenu}
              aria-label="Current Harth Settings"
            >
               <p>{selectedcomm?.name}</p>
                <div className={styles.iconHolder}>
                  <IconHome />
                </div>
            </button>
          </div>
        )}
        <div
          className={`
                    ${styles.MainNavPages} 
                    ${isMobile && styles.MainNavPagesMobile}
                    ${currentPage == "gather" && styles.MainNavPagesRounded}

                `}
        >
          <button
            role="nav-item"
            id="chat"
            aria-label="Community Chat"
            className={`
                            ${styles.MainNavPageButton} 
                            ${currentPage == "chat" && styles.Active}

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
              <IconChat />
            </div>
            <div className={styles.title}>Topics</div>
          </button>

          <button
            role="nav-item"
            id="gather"
            aria-label="Gather"
            className={`
                            ${styles.MainNavPageButton} 
                            ${currentPage == "gather" ? styles.Active : null} 
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
              <IconGather />
            </div>
            <div className={styles.title}>Gather</div>
          </button>

          <button
            role="nav-item"
            id="message"
            aria-label="Private Messages"
            className={`
                            ${styles.MainNavPageButton} 
                            ${currentPage == "message" ? styles.Active : null} 
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
                <IconMessage />
            </div>
            <div className={styles.title}>Messages</div>
          </button>
        </div>
        
      </header>
    </>
  );
};

export default MainNav;
