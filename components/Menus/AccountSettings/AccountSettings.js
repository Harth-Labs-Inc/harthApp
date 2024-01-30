import { useContext, useState } from "react";
import { MobileContext } from "../../../contexts/mobile";
import InviteComp from "../AccountSettings/Invite";
import { HarthLogoLight } from "public/images/harth-logo-light";
import { HarthLogoDark } from "public/images/harth-logo-dark";
import { IconChevronRight } from "../../../resources/icons/IconChevronRight";
import styles from "./SettingsMenu.module.scss";
import SubSettings from "./SubSettings";
import { useSocket } from "contexts/socket";
import { FeedbackModal } from "components/FeedbackModal/FeedbackModal";
import { IconInviteEmail } from "resources/icons/IconInviteEmail";
import Cookies from "js-cookie";

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

  const DisplayLogo = () => {
    let theme = Cookies.get("theme");
    if (theme == "light-mode") {
      return <HarthLogoDark />;
    }
    return <HarthLogoLight />;
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
          <DisplayLogo />
        </div>
      ) : null}

      <button
        className={` ${styles.menuItem} ${styles.menuItemInvites}`}
        onClick={toggleInviteModal}
      >
        <div className={styles.iconInvite}>
          <IconInviteEmail />
        </div>
        Send an Invite
      </button>

      <a
        className={styles.menuItem}
        href={
          "https://harthsocial.com/checkout/donate?donatePageId=65402036e63e6a28d704a3ec"
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        Donate
      </a>

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

      <p className={styles.appVersion}>App version: {APP_VERSION}</p>
    </div>
  );
};

export default SettingsList;
