import { useState } from "react";

import { Toggle } from "../../../Common/Toggle/Toggle";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";
import { useSocket } from "../../../../contexts/socket";
import { IconMoreDots } from "../../../../resources/icons/IconMoreDots";
import { Button } from "../../../Common/Buttons/Button";
import { Modal } from "../../../Common";
import HarthDeleteModal from "../../../HarthDeleteModal";
import HarthLeaveModal from "../../../HarthLeaveModal";

import {
  getHarthByID,
  leaveHarthByID,
  deleteHarthByID,
} from "../../../../requests/community";
import styles from "./harthadminsettings.module.scss";

const HarthAdminSettings = ({ onToggleModal }) => {
  const [showDeleteHarthModal, setShowDeleteHarthModal] = useState(false);

  const { selectedcomm, refetchComms, setComm } = useComms();
  const { user } = useAuth();
  const { emitUpdate } = useSocket();

  const onOpenDeleteModal = async () => {
    setShowDeleteHarthModal(true);
  };
  const onCloseDeleteModal = () => {
    setShowDeleteHarthModal(false);
  };
  const submitHarthDeleteHandler = async (newHarth) => {
    console.log(newHarth);
    await deleteHarthByID(newHarth._id);
    let msg = {};
    msg.updateType = "harth deleted";
    msg.comm = newHarth;
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.log(err);
      }
      onCloseDeleteModal();
      onToggleModal();
    });
  };
  const submitHarthLeaveHandler = async (newHarth) => {
    await leaveHarthByID({ harth: newHarth, user });
    let comms = await refetchComms();
    setComm(comms[0]);
    onCloseDeleteModal();
    onToggleModal();
  };

  let isSuperUser = false;

  if (selectedcomm && user) {
    let userIndex = selectedcomm.users.findIndex((usr) => {
      return usr.userId == user._id;
    });

    if (userIndex >= 0) {
      let profile = selectedcomm.users[userIndex];
      isSuperUser = profile?.owner;
    }
  }

  return (
    <>
      {showDeleteHarthModal ? (
        <Modal onToggleModal={() => {}}>
          {isSuperUser ? (
            <HarthDeleteModal
              submitHarthChange={submitHarthDeleteHandler}
              hidden={!showDeleteHarthModal}
              setHidden={onCloseDeleteModal}
              harth={{
                ...(selectedcomm || {}),
              }}
            />
          ) : (
            <HarthLeaveModal
              submitHarthChange={submitHarthLeaveHandler}
              hidden={!showDeleteHarthModal}
              setHidden={onCloseDeleteModal}
              harth={{
                ...(selectedcomm || {}),
              }}
            />
          )}
        </Modal>
      ) : null}
      {isSuperUser ? <p>image uploader</p> : null}
      <div className={styles.contentHolder}>
        <div className={styles.title}>
          {isSuperUser ? "Delete" : "Leave"} this härth
        </div>
        <Button
          tier="primary"
          size="small"
          onClick={onOpenDeleteModal}
          text={`${isSuperUser ? "Delete" : "Leave"} ${selectedcomm?.name}`}
          className={styles.leaveButton}
        />
      </div>
    </>
  );
};

export default HarthAdminSettings;
