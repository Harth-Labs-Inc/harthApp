import { useState, useContext } from "react";
import { MobileContext } from "../../../contexts/mobile";
import { Modal } from "../../Common/Modals/Modal";
import { LeaveButtonMobile } from "../Controls/LeaveButtonMobile";
import { RoomStream } from "resources/icons/RoomStream";
import { RoomVoice } from "resources/icons/RoomVoice";
import { RoomParty } from "resources/icons/RoomParty";
import { IconPower } from "../../../resources/icons/IconPower";
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
        <Modal show={modal} onToggleModal={showMobileMenu} isDark={true}>
          <div className={styles.leaveMenu}>
            <button className={styles.menuItem} onClick={minimizeHandler}>
              <IconCloseFullScreen />
              <p>Minimize Gathering</p>
            </button>
            <button className={styles.menuItem} onClick={leaveMethod}>
              <IconPower />
              <p>Leave Gathering</p>
            </button>
          </div>
        </Modal>
      ) : (
        ""
      )}

      {type == "stream" ? (

        <div className={`
          ${styles.stream}
          ${isMobile ? styles.streamMobile : styles.streamDesktop}
        `}>
          {isMobile ? <LeaveButtonMobile onClick={showMobileMenu} /> : null}
          <div className={styles.iconHolder}><RoomStream /></div>
          <div className={styles.labelHolder}>{gatheringName} hello</div>

          {isMobile ? <div className={styles.mobileSpacer} /> : null}
        </div>
      ) : ( 
        <div className={`
          ${styles.basic}
          ${isMobile ? styles.mobile : styles.desktop}
        `}>          
          
          {isMobile ? <LeaveButtonMobile onClick={showMobileMenu} /> : null}

          <div className={styles.labelHolder}>{gatheringName}</div>

          {isMobile ? <div className={styles.mobileSpacer} /> : null}
        </div>        
      )}
    </>
  );
};

export default GatherHeader;
