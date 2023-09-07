import { useContext, useState } from "react";

import { MobileContext } from "../../../contexts/mobile";

import { HarthLogoLight } from "public/images/harth-logo-light";
import { IconChevronRight } from "../../../resources/icons/IconChevronRight";
import styles from "./SettingsMenu.module.scss";
import SubSettings from "./SubSettings";
import { useSocket } from "contexts/socket";
import { FeedbackModal } from "components/FeedbackModal/FeedbackModal";

const SettingsList = ({ toggleCurrentTab }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const { isMobile } = useContext(MobileContext);
  const { APP_VERSION } = useSocket();

  const signOut = () => {
    localStorage.removeItem("token");
    window.location.pathname = "/";
  };
  const toggleFeedbackModal = () => {
    setShowFeedbackModal(!showFeedbackModal);
  };

  return (
    <div className={styles.SettingsContainer}>
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
        onClick={() => toggleCurrentTab("invites")}
      >
        Invites
        <div className={styles.iconHolder}>
          <IconChevronRight />
        </div>
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
      {isMobile ? (
        <button
          className={styles.menuItem}
          onClick={() => toggleCurrentTab("accountprofile")}
        >
          Account
          <div className={styles.iconHolder}>
            <IconChevronRight />
          </div>
        </button>
      ) : (
        <SubSettings toggleCurrentTab={toggleCurrentTab} />
      )}

      <button
        style={{ color: "#d96fab" }}
        className={styles.menuItem}
        onClick={toggleFeedbackModal}
      >
        Submit Feedback
      </button>

      <button className={styles.menuItem} onClick={() => signOut()}>
        Sign Out
      </button>

      <p className={styles.appVersion}>App version: {APP_VERSION}</p>
    </div>
  );
};

export default SettingsList;
