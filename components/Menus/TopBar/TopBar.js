import { useContext, useState, useEffect } from "react";
import { useComms } from "../../../contexts/comms";
import { MobileContext } from "../../../contexts/mobile";
import { IconBroadcasting } from "resources/icons/IconBroadcasting";
import styles from "./TopBar.module.scss";
import HarthProfileEditModal from "../../HarthProfileEditModal";
import UserIcon from "../../UserIcon/userIcon";
import { getFullReportAlerts } from "../../../requests/community";
import ReportIcon from "resources/icons/Report";
import SpinnerIcon from "resources/icons/Spinner";
import ReportALertPosts from "components/ReportALertPosts/ReportALertPosts";
import { useSocket } from "contexts/socket";
import { useTourManager } from "contexts/tour";
import {
  fetchImage,
  getAttachment,
  openDB,
  saveAttachment,
} from "services/helper";
import { getDownloadURL } from "requests/s3";

const TopBar = (props) => {
  //const { children, onToggleMenu, currentPage } = props;
  const { children, onToggleMenu } = props;
  const [showEditUserModal, setShowEditUserModal] = useState(null);
  const [isPullingReports, setIsPullingReports] = useState(false);
  const [reportPosts, setReportPosts] = useState(null);
  const [cachedIcon, setCachedIcon] = useState(null);

  const { startTour, lastStepIndex, endTour, activeTour, tourKey } =
    useTourManager();

  const {
    selectedcomm,
    profile,
    hasRoomMinimized,
    handleOpenMInimizedRoom,
    hasFinishedFirstUseTour,
    hasApprovedTos,
    initialLoadAllGood,
  } = useComms();
  const { isMobile } = useContext(MobileContext);
  const { showAdminReportIcon, pullForIcon } = useSocket();

  useEffect(() => {
    if (profile) {
      pullForIcon();
    }
  }, [profile]);

  useEffect(() => {
    if (profile && isMobile && initialLoadAllGood) {
      if (hasApprovedTos && !hasFinishedFirstUseTour && lastStepIndex == null) {
        startTour("fisrtUse", 0);
      }
    }
  }, [
    profile,
    hasApprovedTos,
    hasFinishedFirstUseTour,
    tourKey,
    isMobile,
    initialLoadAllGood,
  ]);

  useEffect(() => {
    if (
      initialLoadAllGood &&
      hasApprovedTos &&
      isMobile &&
      !hasFinishedFirstUseTour &&
      showEditUserModal != null &&
      lastStepIndex == 1
    ) {
      if (showEditUserModal) {
        if (activeTour) {
          endTour();
        }
      } else {
        if (!activeTour) {
          startTour("fisrtUse", 2);
        }
      }
    }
  }, [
    initialLoadAllGood,
    showEditUserModal,
    hasApprovedTos,
    hasFinishedFirstUseTour,
    tourKey,
    isMobile,
  ]);

  useEffect(() => {
    const dbName = "CommunityIcons";
    const storeName = "icons";

    const extractFileNameFromUrl = (url) => {
      const s3BucketUrl =
        "https://community-profile-images.s3.us-east-2.amazonaws.com/";

      if (url.startsWith(s3BucketUrl)) {
        return url.substring(s3BucketUrl.length);
      }

      const lastSlashIndex = url.lastIndexOf("/");
      if (lastSlashIndex !== -1) {
        return url.substring(lastSlashIndex + 1);
      }

      return null;
    };

    const checkAndCacheIcon = async () => {
      if (selectedcomm?.iconKey) {
        const keyName = extractFileNameFromUrl(selectedcomm.iconKey);
        const db = await openDB(dbName, storeName);
        const cachedIcon = await getAttachment(db, storeName, keyName).catch(
          () => null
        );

        if (cachedIcon && cachedIcon.data) {
          setCachedIcon(URL.createObjectURL(cachedIcon.data));
        } else {
          if (
            selectedcomm?.iconKey.startsWith(
              "https://community-profile-images.s3.us-east-2.amazonaws.com/"
            )
          ) {
            try {
              const fileType = keyName.split(".").pop() || "jpg";
              const fetchedData = await getDownloadURL(
                keyName,
                fileType,
                "community-profile-images"
              );
              if (fetchedData && fetchedData.ok) {
                const imageBlob = await fetchImage(fetchedData.downloadURL);
                try {
                  saveAttachment(db, storeName, keyName, imageBlob);
                  setCachedIcon(URL.createObjectURL(imageBlob));
                } catch (error) {
                  console.log("Failed to save attachment:", error);
                }
              }
            } catch (error) {
              console.log("Failed to fetch or save image:", error);
            }
          } else {
            setCachedIcon(selectedcomm?.iconKey);
          }
        }
      }
    };

    checkAndCacheIcon();
  }, [selectedcomm?.iconKey]);

  const editUserModalHandler = () => {
    setShowEditUserModal((prevState) => !prevState);
  };
  const handlerStartReportPull = async () => {
    if (!isPullingReports) {
      setIsPullingReports(true);
      const { messages, ok } = await getFullReportAlerts({
        comm_id: selectedcomm?._id,
      });
      if (ok && messages.length) {
        setReportPosts(messages);
      }
      setIsPullingReports(false);
    }
  };
  const cancelReport = () => {
    setIsPullingReports(false);
    setReportPosts(null);
    pullForIcon();
  };

  if (!profile) {
    return null;
  }

  let { iconKey } = profile;

  return (
    <>
      {reportPosts ? (
        <div
          className={`${styles.notificationTray} ${
            isMobile ? styles.notificationTrayMobile : ""
          }`}
        >
          <ReportALertPosts
            initialReportPosts={reportPosts}
            cancelReport={cancelReport}
          />
        </div>
      ) : null}
      <HarthProfileEditModal
        hidden={!showEditUserModal}
        setHidden={editUserModalHandler}
        harth={{
          ...(selectedcomm || {}),
        }}
        profile={profile}
      />
      <div
        className={`
                    ${styles.TopBar}
                    ${isMobile && styles.TopBarMobile}
                    `}
      >
        <div className={isMobile ? styles.backgroundMobile : styles.background}>
          {isMobile ? (
            <div className={styles.MobileNavTitle}>
              <button
                id="tourFirstUse_harthIcon"
                className={`
                  ${styles.HarthButton}
                  `}
                onClick={onToggleMenu}
                aria-label="Current Harth"
              >
                <img
                  src={cachedIcon || selectedcomm?.iconKey}
                  loading="eager"
                />
              </button>

              <div className={styles.titleHolder}>
                <div className={styles.TopBarName}>{selectedcomm?.name}</div>
              </div>
            </div>
          ) : null}
          {children}

          <div className={styles.holder}>
            {showAdminReportIcon ? (
              <button
                className={styles.TopBarReport}
                onClick={handlerStartReportPull}
                aria-label="Admin Report Alert"
                title="Admin alert"
              >
                <div
                  className={`${styles.reportSVG} ${
                    isPullingReports ? styles.clicked : ""
                  }`}
                >
                  <ReportIcon />
                </div>
                <div
                  className={`${styles.loadingSVG} ${
                    isPullingReports ? styles.clicked : ""
                  }`}
                >
                  <SpinnerIcon />
                </div>
              </button>
            ) : null}
            {isMobile && hasRoomMinimized ? (
              <button
                className={styles.TopBarStreaming}
                onClick={handleOpenMInimizedRoom}
              >
                <IconBroadcasting />
              </button>
            ) : null}

            <div
              id="tourFirstUse_harthProfile"
              className={isMobile ? styles.avatarMobile : styles.avatarDesktop}
            >
              <UserIcon
                img={iconKey || ""}
                showName={false}
                size={isMobile ? "regular" : "small"}
                isPressable
                pressHandler={editUserModalHandler}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopBar;
