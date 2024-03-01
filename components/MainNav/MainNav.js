import { useState, useContext, useEffect } from "react";
import { MobileContext } from "../../contexts/mobile";
import { IconHome } from "resources/icons/IconHome";
import { Modal } from "../Common/Modals/Modal";
import HarthSettings from "../Menus/HarthSettings/HarthSettings";
import { useComms } from "../../contexts/comms";
import { IconTopicFill } from "resources/icons/IconTopicFill";
import { IconTopicNoFill } from "resources/icons/IconTopicNoFill";
import { IconFireFill } from "resources/icons/IconFireFill";
import { IconFireNoFill } from "resources/icons/IconFireNoFill";
import { IconForumFill } from "resources/icons/IconForumFill";
import { IconForumNoFill } from "resources/icons/IconForumNoFill";
import styles from "./mainNav.module.scss";
import { useSocket } from "../../contexts/socket";
import { useTourManager } from "contexts/tour";

/* eslint-disable */
const MainNav = (props) => {
  const { changePage, currentPage, onToggleMenu } = props;
  const [modal, setModal] = useState(false);

  const { isMobile } = useContext(MobileContext);
  const {
    selectedcomm,
    selectedCommRef,
    hasApprovedTos,
    hasFinishedFirstUseTour,
  } = useComms();
  const {
    mainAlerts,
    setMainAlertsFromChild,
    unreadConvMessagesRef,
    unreadMessagesRef,
  } = useSocket();

  const { skipStep, activeTour, lastStepIndex, tourKey } = useTourManager();

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
        onClick={() => {
          if (
            hasApprovedTos &&
            !hasFinishedFirstUseTour &&
            tourKey == "fisrtUse" &&
            activeTour &&
            lastStepIndex == 2
          ) {
            skipStep();
          }
        }}
        id="tourFirstUse_harthPageSwitcher"
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
              <div className={styles.iconHolder}>
                <IconHome />
              </div>
            </button>
            <span className={styles.title}>{selectedcomm?.name}</span>
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
                            ${styles.MainNavPageButtonChat} 
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
              {(currentPage == "chat") ? <IconTopicFill /> : <IconTopicNoFill />}
            </div>
            <div className={styles.title}>Topics</div>
          </button>

          <button
            role="nav-item"
            id="gather"
            aria-label="Gather"
            className={`
                            ${styles.MainNavPageButton} 
                            ${styles.MainNavPageButtonGather} 
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
              {(currentPage == "gather") ? <IconFireFill /> : <IconFireNoFill />}
            </div>
            <div className={styles.title}>Gather</div>
          </button>

          <button
            role="nav-item"
            id="message"
            aria-label="Private Messages"
            className={`
                            ${styles.MainNavPageButton} 
                            ${styles.MainNavPageButtonMessage} 
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
              {(currentPage == "message") ? <IconForumFill /> : <IconForumNoFill />}
            </div>
            <div className={styles.title}>Messages</div>
          </button>
        </div>
      </header>
    </>
  );
};

export default MainNav;
