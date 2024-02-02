import { useComms } from "../../../contexts/comms";
import { useSocket } from "../../../contexts/socket";
import { SideModal } from "../../Common";
import HarthList from "../HarthList/HarthList";
import { DisplayLogo } from "components/Common/DisplayLogo/DisplayLogo";
import styles from "./SideMenu.module.scss";
import SettingsList from "../AccountSettings/AccountSettings";
import { useState } from "react";
import SettingsMenu from "../AccountSettings";

const MobileSideNav = (props) => {
  const {
    mobileMenuOpen,
    onToggleMenu,
    setShowCreateHarthNameModal,
    changePage,
  } = props;

  const [ShowSettingsNav, setShowSettingsNav] = useState(false);
  const [currentTab, setCurrentTab] = useState("");
  const { comms, selectedcomm, changeHarthFromClick } = useComms();
  const { unreadMessagesRef, unreadConvMessagesRef } = useSocket();

  const changeSelectedCom = (com) => {
    localStorage.setItem("selectedHarthID", com._id);
    changeHarthFromClick(com);
    onToggleMenu();
  };

  const toggleCreateComm = () => {
    setShowCreateHarthNameModal(true);
    onToggleMenu();
  };
  const toggleSettingsNav = () => {
    setShowSettingsNav(!ShowSettingsNav);
  };
  const toggleCurrentTab = (name) => {
    setCurrentTab(name);
    if (!ShowSettingsNav) {
      setShowSettingsNav(!ShowSettingsNav);
    }
  };
  const DisplaySettingsNav = () => {
    if (ShowSettingsNav) {
      return (
        <SideModal
          id="mobileSubSideMenuContainer"
          onToggleModal={toggleSettingsNav}
        >
          <SettingsMenu
            toggleCurrentTab={toggleCurrentTab}
            currentTab={currentTab}
            toggleCurrentTabClosed={() => {
              setShowSettingsNav(false);
              setCurrentTab("");
            }}
          />
        </SideModal>
      );
    }
    return null;
  };

  if (!mobileMenuOpen) return;

  return (
    <SideModal id="mobileSideMenuContainer" onToggleModal={onToggleMenu}>
      <div className={styles.sideNavMobile}>
        <div className={styles.headerImage}>
          <DisplayLogo />
        </div>
        <div className={styles.text}>Your groups</div>
        <DisplaySettingsNav />
        <div className={styles.harthList}>
          <HarthList
            comms={comms}
            selectedcomm={selectedcomm}
            unreadMsgs={unreadMessagesRef}
            unreadConvMsgs={unreadConvMessagesRef}
            toggleCreateComm={toggleCreateComm}
            changeSelectedCom={changeSelectedCom}
            changePage={changePage}
          />
        </div>
        <div className={styles.settings}>
          <SettingsList toggleCurrentTab={toggleCurrentTab} />
        </div>
      </div>
    </SideModal>
  );
};

export default MobileSideNav;
