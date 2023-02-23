import React, { useState } from "react";
import { uploadFile, uploadCustomNamedFile } from "../../services/helper";
import { addUserToComm, saveCommunity } from "../../requests/community";
import { useAuth } from "../../contexts/auth";
import { useComms } from "../../contexts/comms";
import IconUploader from "../IconUploader";
import TalkingHead from "../TalkingHead/TalkingHead";
import { Button, Modal } from "../Common";
import { compressImage } from "../../requests/s3";
import styles from "./CreateHarthProfile.module.scss";

export default function CreateHarthProfile({
  header,
  talkingHeadMsg,
  footer,
  placeholder,
  submitText,
  submitHandler,
  harth,
  invite,
}) {
  const [newFile, setNewFile] = useState(null);
  const [profileName, setProfileName] = useState("");
  const { refetchComms } = useComms();
  const { user } = useAuth();

  const handleInputChange = (e) => {
    const { value } = e.target;
    setProfileName(value);
  };
  const joinHarthHandler = async (e) => {
    e.preventDefault();
    let tempHarth = { ...harth };
    let id;
    let s3Upload;
    let profileIconKey;
    if (newFile) {
      s3Upload = await uploadCustomNamedFile({
        file: newFile,
        bucket: "community-profile-images",
        name: `${tempHarth._id}_${user._id}`,
      });
      await compressImage(
        s3Upload.name,
        s3Upload.name,
        "community-profile-images",
        newFile.type,
        40,
        40
      );
      profileIconKey = `https://community-profile-images.s3.us-east-2.amazonaws.com/${s3Upload.name}`;
    }
    let admin = false;
    let owner = false;

    if (!invite) {
      admin = true;
      owner = true;
      let commDbUpload = await saveCommunity(tempHarth);
      if (commDbUpload.ok) {
        id = commDbUpload.id;
      }
    } else if (tempHarth._id) {
      id = tempHarth._id;
    }
    await addUserToComm(id, {
      userId: user._id,
      iconKey: profileIconKey,
      name: profileName,
      personalInfo: {},
      admin: admin,
      owner,
      muted: false,
    });
    refetchComms(tempHarth);
    submitHandler();
  };
  const fileUploadHandler = (file) => {
    setNewFile(file);
  };

  return (
    <Modal>
      <div className={styles.mainContainer}>
        <div className={styles.title}>Make a profile</div>
        <TalkingHead text={talkingHeadMsg} />
        <div className={styles.imageHolder}>
          <IconUploader
            shape="circle"
            id={""}
            icon={""}
            name={""}
            changeHandler={fileUploadHandler}
          />
        </div>

        <form onSubmit={joinHarthHandler} className={styles.form}>
          <input
            placeholder={placeholder}
            type="text"
            value={profileName}
            onInput={handleInputChange}
            required
            className={styles.textEntry}
            autocomplete="off"
          />
          <div className={styles.helpText}>{footer}</div>
          <div className={styles.buttonBar}>
            <Button tier="primary" fullWidth text={submitText} type="submit" />
          </div>
        </form>
      </div>
    </Modal>
  );
}
