import { useState, useContext } from "react";
import { MobileContext } from "../../../contexts/mobile";
import { Modal } from "../../Common/Modals/Modal";
import { RoomStream } from "resources/icons/RoomStream";
import { RoomVoice } from "resources/icons/RoomVoice";
import { RoomParty } from "resources/icons/RoomParty";
import { IconHangUp } from "resources/icons/IconHangUp";
import { IconCloseFullScreen } from "../../../resources/icons/IconCloseFullScreen";
import styles from "./gatherHeader.module.scss";

const GatherHeader = (props) => {
  const { gatheringName, leaveMethod, minimizeHandler, type } = props;
  const [modal, setModal] = useState();
  const { isMobile } = useContext(MobileContext);

  const showMobileMenu = () => {
    setModal(!modal);
  };

  return (
    <>
      {modal ? (
        <Modal show={modal} onToggleModal={showMobileMenu}>
          <div className={styles.leaveMenu}>
            <button
              className={styles.menuItem}
              onClick={() => {
                setModal(false);
                minimizeHandler();
              }}
            >
              <IconCloseFullScreen />
              <p>Minimize Gathering</p>
            </button>
            <button className={styles.menuItem} onClick={leaveMethod}>
              <IconHangUp />
              <p>Leave Gathering</p>
            </button>
          </div>
        </Modal>
      ) : (
        ""
      )}

      {type == "stream" && (
        <div
          className={`
          ${styles.stream}
          ${isMobile ? styles.streamMobile : styles.streamDesktop}
        `}
        >
          <div className={styles.iconHolder}>
            <RoomStream />
          </div>
          <div className={styles.labelHolder}>{gatheringName}</div>

          {isMobile ? (
            <>
              <button className={styles.leave} onClick={showMobileMenu}>
                <IconHangUp />
              </button>
            </>
          ) : null}
        </div>
      )}

      {type == "voice" && (
        <div
          className={`
          ${styles.voice}
          ${isMobile ? styles.voiceMobile : styles.voiceDesktop}
        `}
        >
          <div className={styles.iconHolder}>
            <RoomVoice />
          </div>
          <div className={styles.labelHolder}>{gatheringName}</div>

          {isMobile ? (
            <>
              <button className={styles.leave} onClick={showMobileMenu}>
                <IconHangUp />
              </button>
            </>
          ) : null}
        </div>
      )}

      {type == "party" && (
        <div
          className={`
          ${styles.basic}
          ${isMobile ? styles.basicMobile : styles.basicDesktop}
        `}
        >
          <div className={styles.iconHolder}>
            <RoomParty />
          </div>
          <div className={styles.labelHolder}>{gatheringName}</div>

          {isMobile ? (
            <>
              <button className={styles.leave} onClick={showMobileMenu}>
                <IconHangUp />
              </button>
            </>
          ) : null}
        </div>
      )}
    </>
  );
};

export default GatherHeader;
