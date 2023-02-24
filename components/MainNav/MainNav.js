import { useState, useContext } from "react";
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
import { IconSettings } from "../../resources/icons/IconSettings";

import styles from "./mainNav.module.scss";

const MainNav = (props) => {
  const { changePage, currentPage, onToggleMenu } = props;
  const [modal, setModal] = useState(false);

  const { isMobile } = useContext(MobileContext);
  const { selectedcomm } = useComms();

  const hasAlert = true;
  const unreadMessagesOther = true;

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
          <button
            className={styles.MainNavHarthButton}
            onClick={handleHarthMenu}
            aria-label="Current Harth Settings"
          >
            {selectedcomm?.name}
            <div className={styles.icon}>
              <IconSettings />
            </div>
          </button>
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
                              hasAlert &&
                              currentPage != "chat" &&
                              styles.iconHolderUnreadMessage
                            }

                            `}
            >
              {currentPage == "chat" ? <IconChatFill /> : <IconChatNoFill />}
            </div>
            <div>Chat</div>
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
                              hasAlert &&
                              currentPage != "gather" &&
                              styles.iconHolderUnreadMessage
                            }
                            `}
            >
              {currentPage == "gather" ? <IconFireFill /> : <IconFireNoFill />}
            </div>
            <div>Gather</div>
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
                              hasAlert &&
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
            <div>Message</div>
          </button>
        </div>
      </header>
    </>
  );
};

export default MainNav;
