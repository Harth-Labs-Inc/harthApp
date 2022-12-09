
import { useState, useContext } from "react";
import { MobileContext } from "../../../contexts/mobile";
import Modal from "../../Modal";
import { LeaveButtonMobile } from '../Controls/LeaveButtonMobile';
import { HDSwitch } from "../HDSwitch/HDSwitch";
import { Toggle } from "../../Common/Toggle/Toggle";

import styles from './gatherHeader.module.scss';


const GatherHeader = (props) => {
  const { 

    //update with logic for pulling this info
    gatheringName = "Brian's Party"
  } = props
  const [modal, setModal] = useState();
  const { isMobile } = useContext(MobileContext);

  //needs real logic to pull the harth icon
  // const [harthIcon, setHarthIcon] = useState()
  const harthIcon =
  "https://d1mc7wmz9xfkdm.cloudfront.net/eyJidWNrZXQiOiJhc3NldHMud29vZGxhbmRkaXJlY3QuY29tIiwia2V5IjoicHJvZHVjdC1pbWFnZXMvUGV0ZXJzb24tUmVhbC1GeXJlLVJ1c3RpYy1PYWstVmVudGVkLUdhcy1Mb2ctU2V0LW1haW4uanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjoxMjAwLCJoZWlnaHQiOjEyMDAsImZpdCI6ImNvbnRhaW4iLCJiYWNrZ3JvdW5kIjp7InIiOjI1NSwiZyI6MjU1LCJiIjoyNTUsImFscGhhIjoxfX19fQ==";


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
      {isMobile && <LeaveButtonMobile onClick={showMobileMenu}/>}
      <div className={styles.labelHolder}>
        <img className={styles.harthImage} src={harthIcon} />
        {gatheringName}
      </div>
      <div className={styles.hdPosition}>
      <HDSwitch onToggleChange={toggleAction} isChecked={false}/>
      </div>
    </div>
    </>
  )
}

export default GatherHeader

