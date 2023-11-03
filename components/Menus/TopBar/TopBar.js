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

const TopBar = (props) => {
  const { children, onToggleMenu, currentPage } = props;
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [isPullingReports, setIsPullingReports] = useState(false);
  const [reportPosts, setReportPosts] = useState(null);

  const { selectedcomm, profile, hasRoomMinimized, handleOpenMInimizedRoom } =
    useComms();
  const { isMobile } = useContext(MobileContext);
  const { showAdminReportIcon, pullForIcon } = useSocket();

  useEffect(() => {
    pullForIcon();
  }, [profile]);

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
        {isMobile ? (
          <div className={styles.MobileNavTitle}>
            <button
              className={`
                ${styles.HarthButton}
                `}
              onClick={onToggleMenu}
              aria-label="Current Harth"
            >
              <img src={selectedcomm?.iconKey} loading="eager" />
            </button>

            <div className={styles.titleHolder}>
              <div className={styles.TopBarName}>{selectedcomm?.name}</div>
              <div className={styles.SectionMobile}>
                {currentPage == "chat" && "chats"}
                {currentPage == "gather" && "gather"}
                {currentPage == "message" && "messages"}
              </div>
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
    </>
  );
};

export default TopBar;
