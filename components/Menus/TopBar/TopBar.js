import { useContext, useState } from "react";
import { useComms } from "../../../contexts/comms";
import { MobileContext } from "../../../contexts/mobile";
import { IconBroadcasting } from "resources/icons/IconBroadcasting";
import { IconMenu } from "resources/icons/IconMenu";
import styles from "./TopBar.module.scss";
import HarthProfileEditModal from "../../HarthProfileEditModal";
import UserIcon from "../../UserIcon/userIcon";

const TopBar = (props) => {
  const { children, onToggleMenu } = props;
  const [showEditUserModal, setShowEditUserModal] = useState(false);

  const { selectedcomm, profile, hasRoomMinimized, handleOpenMInimizedRoom } =
    useComms();
  const { isMobile } = useContext(MobileContext);

  const editUserModalHandler = () => {
    setShowEditUserModal((prevState) => !prevState);
  };

  if (!profile) {
    return null;
  }

  let { iconKey } = profile;

  return (
    <>
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
              <img src={selectedcomm?.iconKey} loading="lazy" />
              {/* <div className={styles.menuIcon}>
                <IconMenu />
              </div> */}
            </button>

            <div className={styles.TopBarName}>{selectedcomm?.name}</div>
          </div>
        ) : null}
        {children}

        <div className={styles.holder}>
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
