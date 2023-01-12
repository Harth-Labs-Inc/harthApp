import { useState, useContext } from "react";
import { MobileContext } from "../../../contexts/mobile";
import { Modal } from "../../Common/Modals/Modal";
import { LeaveButtonMobile } from "../Controls/LeaveButtonMobile";
import { HDSwitch } from "../HDSwitch/HDSwitch";
import { Toggle } from "../../Common/Toggle/Toggle";

import styles from "./gatherHeader.module.scss";

const GatherHeader = (props) => {
  const { gatheringName, selectedHarthIcon, toggleHDSwitch } = props;
  const [modal, setModal] = useState();
  const { isMobile } = useContext(MobileContext);

  const showMobileMenu = () => {
    setModal(!modal);
  };

  const toggleAction = () => {
    //nothing here yet
  };

  return (
    <>
      {modal ? (
        <Modal show={modal} onToggleModal={showMobileMenu}>
          leave menu
        </Modal>
      ) : (
        ""
      )}

      <div className={isMobile ? styles.mobile : styles.desktop}>
        {isMobile && <LeaveButtonMobile onClick={showMobileMenu} />}
        <div className={styles.labelHolder}>
          <img className={styles.harthImage} src={selectedHarthIcon || ""} />
          {gatheringName}
        </div>
        <div className={styles.hdPosition}>
          <HDSwitch onToggleChange={toggleHDSwitch} isChecked={false} />
        </div>
      </div>
    </>
  );
};

export default GatherHeader;
