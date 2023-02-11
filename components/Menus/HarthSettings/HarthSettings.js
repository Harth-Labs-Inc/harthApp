import React, { useState, useContext, useEffect } from "react";
import { MobileContext } from "../../../contexts/mobile";
import CloseButton from "../../Common/Buttons/CloseButton";
import { TextBtn } from "../../Common/Button";
import { IconNotificationsNoFill } from "../../../resources/icons/IconNotificationsNoFill";
import IconAdminPanel from "../../../resources/icons/IconAdminPanel";
import { IconAccountNoFill } from "../../../resources/icons/IconAccountNoFill";
import HarthNotificationSettings from "./HarthNotificationSettings/HarthNotificationSettings";
import HarthAdminSettings from "./HarthAdminSettings/HarthAdminSettings";
import HarthMembersSettings from "./HarthMembersSettings/HarthMembersSettings";
import { getHarthByID } from "../../../requests/community";

import styles from "./HarthSettings.module.scss";
import { useComms } from "../../../contexts/comms";

const HarthSettings = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("notifications");
  const { isMobile } = useContext(MobileContext);
  const { communityName, onToggleModal, communityId } = props;
  const { updateLocalSelectedHarth } = useComms();

  useEffect(() => {
    async function getUpdatedHarthData() {
      let result = await getHarthByID(communityId);
      const { ok, data } = result;
      if (ok) {
        await updateLocalSelectedHarth({ newHarth: data });
        setIsLoading(false);
      }
    }
    getUpdatedHarthData();
  }, []);

  const changePageHandler = (pg) => {
    setCurrentPage(pg);
  };

  if (isLoading) {
    return <p>some kind of spinner would be nice</p>;
  }

  let page;
  switch (currentPage) {
    case "members":
      page = <HarthMembersSettings />;
      break;
    case "admin":
      page = <HarthAdminSettings onToggleModal={onToggleModal} />;
      break;
    default:
      page = <HarthNotificationSettings />;
      break;
  }

  return (
    <>
      <div className={styles.mainContainer}>
        <div className={styles.topBar}>
          <div className={styles.title}>{communityName}</div>
          <CloseButton onClick={onToggleModal} />
        </div>

        <div className={styles.navTabs} role="nav">
          <button
            className={`
            ${styles.tabButton}
            ${currentPage == "notifications" && styles.tabButtonActive}
          `}
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
            className={`
            ${styles.tabButton}
            ${currentPage == "members" && styles.tabButtonActive}
          `}
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
            className={`
              ${styles.tabButton}
              ${currentPage == "admin" && styles.tabButtonActive}
            `}
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
        <div className={styles.content}>{page}</div>
      </div>
    </>
  );
};

export default HarthSettings;
