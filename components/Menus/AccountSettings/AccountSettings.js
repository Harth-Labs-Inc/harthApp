import { useContext, useState, useEffect } from "react";
import { MobileContext } from "../../../contexts/mobile";
import InviteComp from "../AccountSettings/Invite";
import { HarthLogoLight } from "public/images/harth-logo-light";
import { IconChevronRight } from "../../../resources/icons/IconChevronRight";
import styles from "./SettingsMenu.module.scss";
import SubSettings from "./SubSettings";
import { useSocket } from "contexts/socket";
import { FeedbackModal } from "components/FeedbackModal/FeedbackModal";
import { IconInviteEmail } from "resources/icons/IconInviteEmail";

const SettingsList = ({ toggleCurrentTab }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { isMobile } = useContext(MobileContext);
  const { APP_VERSION } = useSocket();

  const signOut = () => {
    localStorage.removeItem("token");
    window.location.pathname = "/";
  };
  const toggleFeedbackModal = () => {
    setShowFeedbackModal(!showFeedbackModal);
  };
  const toggleInviteModal = () => {
    setShowInviteModal(!showInviteModal);
  };

  const toggleTheme = () => {
    const body = document.body;
    const currentTheme = body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
    body.classList.remove(currentTheme);
    body.classList.add(currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode');
  };


  return (
    <div className={styles.SettingsContainer}>
      {showInviteModal ? (
        <InviteComp toggleCurrentPage={toggleInviteModal} />
      ) : null}
      {showFeedbackModal ? (
        <FeedbackModal onToggleModal={toggleFeedbackModal} />
      ) : null}
      {!isMobile ? (
        <div className={styles.headerImage}>
          <HarthLogoLight />
        </div>
      ) : null}

      <button
        className={` ${styles.menuItem} ${styles.menuItemInvites}`}
        onClick={toggleInviteModal}
      >
        <div className={styles.iconHolder}>
          <IconInviteEmail />
        </div>
        Send an Invite
      </button>
      {/* <button
        className={styles.menuItem}
        //onClick={() => toggleCurrentTab("invites")}
      >
        Feedback
        <div className={styles.iconHolder}>
          <IconChevronRight />
        </div>
      </button> */}

      
      <a
        className={styles.menuItem}
        href={"https://harthsocial.com/donate"}
        target="_blank"
        rel="noopener noreferrer"
      >
        Donate
      </a>

      {/* <button className={styles.menuItem} onClick={toggleFeedbackModal}>
        Submit Feedback
      </button> */}

      {isMobile ? (
        <button
          className={styles.menuItem}
          onClick={() => toggleCurrentTab("accountprofile")}
        >
          Settings
          <div className={styles.iconHolder}>
            <IconChevronRight />
          </div>
        </button>
      ) : (
        <SubSettings toggleCurrentTab={toggleCurrentTab} />
      )}

      <button className={styles.menuItem} onClick={() => signOut()}>
        Sign Out
      </button>

      <button className={styles.menuItem} onClick={toggleTheme}>
        Toggle
      </button>

      <p className={styles.appVersion}>App version: {APP_VERSION}</p>
    </div>
  );
};

export default SettingsList;
