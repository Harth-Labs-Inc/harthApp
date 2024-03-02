import { useState, useEffect, useContext } from "react";
import { useComms } from "../../../contexts/comms";
import { CloseButton } from "Common";
import { IconNotificationsNoFill } from "../../../resources/icons/IconNotificationsNoFill";
import { IconNotificationsFill } from "../../../resources/icons/IconNotificationsFill";
import { IconSpaceFill } from "resources/icons/IconSpaceFill";
import { IconSpaceNoFill } from "resources/icons/IconSpaceNoFill";
import { IconAccountNoFill } from "../../../resources/icons/IconAccountNoFill";
import { IconAccountFill } from "../../../resources/icons/IconAccountFill";
import { getHarthByID } from "../../../requests/community";
import { MobileContext } from "contexts/mobile";
import HarthNotificationSettings from "./HarthNotificationSettings/HarthNotificationSettings";
import HarthAdminSettings from "./HarthAdminSettings/HarthAdminSettings";
import HarthMembersSettings from "./HarthMembersSettings/HarthMembersSettings";

import styles from "./HarthSettings.module.scss";

const HarthSettings = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("admin");
  const { communityName, onToggleModal, communityId,} = props;
  const { updateLocalSelectedHarth } = useComms();
  const { isMobile } = useContext(MobileContext);
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
    return (
      <div className={styles.mainContainer}>
        <div className={styles.Loading}>
          <p>Loading Settings...</p>
        </div>
      </div>
    );
  }

  /* eslint-disable */

  let page;
  switch (currentPage) {
    case "members":
      page = <HarthMembersSettings />;
      break;
    case "notifications":
      page = <HarthNotificationSettings onToggleModal={onToggleModal} />;
      break;
    default:
      page = <HarthAdminSettings />;
      break;
  }

  return (
    <>
      <div className={` ${styles.mainContainer} ${isMobile ? styles.mainContainerFull : null} `}>
        <div className={styles.topBar}>
          <div className={styles.harthName}>{communityName}</div>
          <div className={styles.title}>Settings</div>
          <div className={styles.buttonHolder}>
            <CloseButton onClick={onToggleModal} />
          </div>
        </div>

        <div className={styles.navTabs} role="nav">

          <button
            className={`
              ${styles.tabButton}
              ${currentPage == "admin" && styles.tabButtonActive}
            `}
            onClick={() => {
              changePageHandler("admin");
            }}
          >
            {currentPage == "admin" ? <IconSpaceFill /> : <IconSpaceNoFill />}
            Details
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
            {currentPage == "members" ? (
              <IconAccountFill />
            ) : (
              <IconAccountNoFill />
            )}
            Members
          </button>

          <button
            className={`
            ${styles.tabButton}
            ${currentPage == "notifications" && styles.tabButtonActive}
          `}
            onClick={() => {
              changePageHandler("notifications");
            }}
          >
            {currentPage == "notifications" ? (
              <IconNotificationsFill />
            ) : (
              <IconNotificationsNoFill />
            )}
            Notifications
          </button>

        </div>
        <div className={styles.content}>{page}</div>
      </div>
    </>
  );
};

export default HarthSettings;
