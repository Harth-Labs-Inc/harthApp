import { useContext } from "react";

import { MobileContext } from "../../../contexts/mobile";

import { HarthLogoLight } from "public/images/harth-logo-light";
import { IconChevronRight } from "../../../resources/icons/IconChevronRight";
import styles from "./SettingsMenu.module.scss";
import SubSettings from "./SubSettings";
import { useSocket } from "contexts/socket";

const SettingsList = ({ toggleCurrentTab }) => {
  const { isMobile } = useContext(MobileContext);

  const { APP_VERSION } = useSocket();

  const signOut = () => {
    localStorage.removeItem("token");
    window.location.pathname = "/";
  };

  return (
    <div className={styles.SettingsContainer}>
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

      <button className={styles.menuItem} onClick={() => signOut()}>
        Sign Out
      </button>

      <p>App version: {APP_VERSION}</p>
    </div>
  );
};

export default SettingsList;
