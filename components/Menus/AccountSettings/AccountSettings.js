import { useContext } from "react";

import { MobileContext } from "../../../contexts/mobile";

import { HarthLogoDark } from "public/images/harth-logo-dark";
import { IconChevronRight } from "../../../resources/icons/IconChevronRight";
import styles from "./SettingsMenu.module.scss";
import SubSettings from "./SubSettings";
import Cookies from "js-cookie";

const SettingsList = ({ toggleCurrentTab }) => {
  const { isMobile } = useContext(MobileContext);
  const signOut = () => {
    localStorage.removeItem("token");
    Cookies.remove("authToken");

    window.location.pathname = "/";
  };

  return (
    <div className={styles.SettingsContainer}>
      {!isMobile ? (
        <div className={styles.headerImage}>
          <HarthLogoDark />
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

      {/* {isMobile ? null : (
        <button className={styles.menuItem} onClick={() => window.close()}>
          Exit
        </button>
      )} */}
    </div>
  );
};

export default SettingsList;
