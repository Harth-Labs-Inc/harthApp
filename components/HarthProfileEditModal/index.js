import React, { useEffect, useState } from "react";
import { compressImage } from "../../requests/s3";
import { uploadFile, uploadCustomNamedFile } from "../../services/helper";
import { updateHarthData } from "../../requests/community";
import { useComms } from "../../contexts/comms";
import { useChat } from "../../contexts/chat";
import IconUploader from "../IconUploader";
import { Button, Modal } from "../Common";
import {
  replaceHarthChatProfileIcons,
  replaceHarthChatProfileNames,
} from "../../requests/chat";
import styles from "./harthProfileEditModal.module.scss";
import { useSocket } from "../../contexts/socket";

const HarthProfileEditModal = ({ hidden, setHidden, harth, profile }) => {
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [newFile, setNewFile] = useState(null);
  const [nameCHanged, setNameCHanged] = useState(false);

  const { setComm, setCommsFromChild, comms, selectedTopic } = useComms();
  const { refreshTopicsChatIcon, refreshTopicsChatName } = useChat();
  const { emitUpdate } = useSocket();

  useEffect(() => {
    if (profile) {
      setUpdatedProfile(profile);
    }
  }, [profile]);

  if (hidden) {
    return null;
  }

  if (!updatedProfile) {
    return null;
  }

  const fileUploadHandler = (file) => {
    setNewFile(file);
  };
  const nameChangeHandler = (e) => {
    const { value } = e.target;
    setNameCHanged(true);
    setUpdatedProfile({ ...updatedProfile, ["name"]: value });
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    if (newFile || nameCHanged) {
      let newIconKey = "";
      if (newFile) {
        let { name } = await uploadCustomNamedFile({
          file: newFile,
          bucket: "community-profile-images",
          name: `${harth._id}_${updatedProfile.userId}`,
        });
        if (name) {
          await compressImage(
            name,
            name,
            "community-profile-images",
            newFile.type,
            40,
            40
          );
          newIconKey = `https://community-profile-images.s3.us-east-2.amazonaws.com/${name}`;
        }
      }

      let usersArr = [...harth.users];

      Object.assign(
        usersArr.find(
          ({ userId }) => userId.toString() == updatedProfile.userId
        ),
        {
          ...updatedProfile,
          ["iconKey"]: newIconKey ? newIconKey : updatedProfile.iconKey,
        }
      );
      harth.users = usersArr;
      let newharth = { ...harth };
      let { ok } = await updateHarthData(newharth);
      if (ok) {
        let commsArr = [...comms];
        Object.assign(
          commsArr.find(({ _id }) => _id.toString() == newharth._id),
          newharth
        );
        setCommsFromChild(commsArr);

        if (nameCHanged) {
          replaceHarthChatProfileNames(
            newharth._id,
            updatedProfile.name,
            updatedProfile.userId
          );
          refreshTopicsChatName(
            newharth._id,
            updatedProfile.userId,
            updatedProfile.name
          );
          let message = {
            harthid: newharth._id,
            userid: updatedProfile.userId,
            newName: updatedProfile.name,
          };
          message.updateType = "message profile name update";
          emitUpdate(newharth._id, message, async (err, status) => {
            if (err) {
              console.log(err);
            }
          });
        }

        if (newIconKey) {
          replaceHarthChatProfileIcons(
            newharth._id,
            newIconKey,
            updatedProfile.userId
          );
          refreshTopicsChatIcon(
            newharth._id,
            updatedProfile.userId,
            newIconKey
          );
          let message = {
            harthid: newharth._id,
            userid: updatedProfile.userId,
            newIconKey,
          };
          message.updateType = "message profile icon update";
          emitUpdate(newharth._id, message, async (err, status) => {
            if (err) {
              console.log(err);
            }
          });
        }
      }
    }
    setHidden();
  };
  const handleCancel = () => {
    setHidden();
  };

  let { iconKey, name } = updatedProfile;
  return (
    <Modal onToggleModal={setHidden} show={true}>
      <div className={styles.mainContainer}>
        <div className={styles.title}>Your profile</div>
        <IconUploader
          shape="circle"
          id={harth?._id || ""}
          icon={iconKey}
          name={name}
          changeHandler={fileUploadHandler}
        />
        <form onSubmit={submitHandler} className={styles.form}>
          <input
            placeholder={name || "Profile Name"}
            value={name}
            onChange={nameChangeHandler}
            required
            className={styles.textEntry}
            autoComplete="off"
            maxLength={20}
          />
          <div className={styles.harthTitle}>{harth.name}</div>
          <div className={styles.buttonBar}>
            <Button
              text="Cancel"
              tier="secondary"
              onClick={handleCancel}
              className={styles.cancelButton}
            />
            <Button
              type="submit"
              text="Update"
              className={styles.submitButton}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default HarthProfileEditModal;
