import { useState } from "react";
import { useForm } from "react-hook-form";
import { compressImage } from "../../../../requests/s3";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";
import { useSocket } from "../../../../contexts/socket";
import { uploadFile } from "../../../../services/helper";
import {
  leaveHarthByID,
  deleteHarthByID,
  updateHarthData,
} from "../../../../requests/community";

import { Button, Modal } from "Common";

import HarthDeleteModal from "../HarthDeleteModal";
import HarthLeaveModal from "../HarthLeaveModal";
import IconUploader from "../../../IconUploader";

import styles from "./harthadminsettings.module.scss";

const HarthAdminSettings = ({ onToggleModal }) => {
  const [showDeleteHarthModal, setShowDeleteHarthModal] = useState(false);
  const [newFile, setNewFile] = useState(null);

  const { selectedcomm, refetchComms, changeSelectedCommFromChild } =
    useComms();
  const { user } = useAuth();
  const { emitUpdate } = useSocket();

  const { register, handleSubmit } = useForm();

  const onOpenDeleteModal = async () => {
    setShowDeleteHarthModal(true);
  };
  const onCloseDeleteModal = () => {
    setShowDeleteHarthModal(false);
  };
  const submitHarthDeleteHandler = async (newHarth) => {
    await deleteHarthByID(newHarth._id);
    let msg = {};
    msg.updateType = "harth deleted";
    msg.comm = newHarth;
    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
      onCloseDeleteModal();
      onToggleModal();
    });
  };
  const submitHarthLeaveHandler = async (newHarth) => {
    await leaveHarthByID({ harth: newHarth, user });
    let comms = await refetchComms();
    changeSelectedCommFromChild(comms[0]);
    onCloseDeleteModal();
    onToggleModal();
    let msg = {};
    msg.updateType = "user left";
    msg.user = user;
    msg.harthID = newHarth._id;
    emitUpdate(newHarth._id, msg, () => {});
  };
  const fileUploadHandler = (file) => {
    setNewFile(file);
  };
  const updateHarth = async (data) => {
    let newHarth = {
      ...selectedcomm,
      name: data.harthName,
    };
    let comms3Upload;

    if (newFile) {
      comms3Upload = await uploadFile({
        file: newFile,
        bucket: "community-profile-images",
      });
      await compressImage(
        comms3Upload.name,
        comms3Upload.name,
        "community-profile-images",
        newFile.type,
        150,
        150
      );
      newHarth.iconKey = `https://community-profile-images.s3.us-east-2.amazonaws.com/${comms3Upload.name}`;
    }

    await updateHarthData(newHarth);
    let msg = {};
    msg.updateType = "harth edited";
    msg.comm = newHarth;
    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
      onToggleModal();
    });
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
        <Modal classNames={styles.DeleteModal} onToggleModal={() => {}}>
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

      {isSuperUser ? (
        <>
          <div className={styles.imageHolder}>
            <IconUploader
              shape="square"
              id={""}
              icon={selectedcomm.iconKey}
              name={""}
              changeHandler={fileUploadHandler}
            />
          </div>
          <form onSubmit={handleSubmit(updateHarth)} className={styles.form}>
            <div className={styles.formContent}>
              <input
                {...register("harthName", { required: true })}
                // placeholder={selectedcomm?.name}
                type="text"
                className={styles.textEntry}
                defaultValue={selectedcomm?.name}
                autoComplete="off"
              />
              <button
                type="submit"
                className={styles.formSubmit}
                aria-label="submit new harth name"
              >
                Update
              </button>
            </div>
          </form>
        </>
      ) : (
        //state for non owner. should just show title and image.
        <>
          <div className={styles.justImage}>
            <img src={selectedcomm.iconKey} loading="lazy" />
          </div>
          <div className={styles.justTitle}>{selectedcomm?.name}</div>
        </>
      )}

      <div className={styles.contentHolder}>
        <Button
          tier="secondary"
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
