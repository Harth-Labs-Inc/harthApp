import { useState } from "react";

import { Toggle } from "../../../Common/Toggle/Toggle";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";
import { useSocket } from "../../../../contexts/socket";
import { IconMoreDots } from "../../../../resources/icons/IconMoreDots";
import { Button } from "../../../Common/Buttons/Button";

import { getHarthByID, leaveHarthByID } from "../../../../requests/community";
import styles from "./harthadminsettings.module.scss";

const HarthAdminSettings = () => {
  const { selectedcomm, updateSelectedHarth, updateLocalSelectedHarth } =
    useComms();
  const { user } = useAuth();
  const { emitUpdate } = useSocket();


  const leaveHandler = async () => {

  };


  return (
    <>
    <div className={styles.contentHolder}>
        <div className={styles.title}>Leave this härth</div>
        <Button tier="primary" size="small" onClick={leaveHandler} text="leave härth" className={styles.leaveButton}/>


    </div>

    </>
  );
};

export default HarthAdminSettings;
