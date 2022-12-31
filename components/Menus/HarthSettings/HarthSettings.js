import React, { useState, useContext } from "react";
import { MobileContext } from "../../../contexts/mobile";
import CloseButton from "../../Common/Buttons/CloseButton";
import { TextBtn } from "../../Common/Button";
import { IconNotificationsNoFill } from "../../../resources/icons/IconNotificationsNoFill";
import IconAdminPanel from "../../../resources/icons/IconAdminPanel";
import IconAccountNoFill from "../../../resources/icons/IconAccountNoFill";
import HarthNotificationSettings from "./HarthNotificationSettings/HarthNotificationSettings";
import HarthMembersSettings from "./HarthMembersSettings/HarthMembersSettings";

import styles from "./HarthSettings.module.scss";

const HarthSettings = (props) => {
  const [currentPage, setCurrentPage] = useState("notifications");
  const { isMobile } = useContext(MobileContext);
  const { communityName, onToggleModal } = props;

  const changePageHandler = (pg) => {
    setCurrentPage(pg);
  };

  let page;
  switch (currentPage) {
    case "members":
      page = <HarthMembersSettings />;
      break;
    case "admin":
      page = <p>admin</p>;
      break;
    default:
      page = <HarthNotificationSettings />;
      break;
  }

  return (
    <>
      <div className="modal-top">
        {communityName} Settings
        <div className="close-modal">
          <CloseButton onClick={onToggleModal} />
        </div>
      </div>
      <div className={styles.navTabs} role="nav">
        <button
          className={
            currentPage == "notifications" ? styles.buttonActive : styles.button
          }
          onClick={() => {
            changePageHandler("notifications");
          }}
        >
          <div style={{ height: 24, width: 24, marginRight: 4 }}>
            <IconNotificationsNoFill />
          </div>
          Notifications
        </button>

        <button
          className={
            currentPage == "members" ? styles.buttonActive : styles.button
          }
          onClick={() => {
            changePageHandler("members");
          }}
        >
          <div style={{ height: 24, width: 24, marginRight: 4 }}>
            <IconAccountNoFill />
          </div>
          Members
        </button>

        <button
          className={
            currentPage == "admin" ? styles.buttonActive : styles.button
          }
          onClick={() => {
            changePageHandler("admin");
          }}
        >
          <div style={{ height: 24, width: 24, marginRight: 4 }}>
            <IconAdminPanel />
          </div>
          Admin
        </button>
      </div>
      <div className="modal_right">{page}</div>
    </>
  );
};

export default HarthSettings;
