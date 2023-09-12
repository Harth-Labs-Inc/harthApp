import { useState } from "react";
import { uploadCustomNamedFile } from "../../services/helper";
import { addUserToComm, saveCommunity } from "../../requests/community";
import { useAuth } from "../../contexts/auth";
import { useComms } from "../../contexts/comms";
import IconUploader from "../IconUploader";
import TalkingHead from "../TalkingHead/TalkingHead";
import { Button, Modal } from "../Common";
import { compressImage } from "../../requests/s3";
import styles from "./CreateHarthProfile.module.scss";
import { useSocket } from "contexts/socket";

export default function CreateHarthProfile({
  talkingHeadMsg,
  footer,
  placeholder,
  submitText,
  submitHandler,
  harth,
  invite,
  closeHandler,
}) {
  const [newFile, setNewFile] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const { refetchComms } = useComms();
  const { sendNewUserJoined } = useSocket();

  const { user } = useAuth();

  const handleInputChange = (e) => {
    const { value } = e.target;
    setProfileName(value);
  };
  const joinHarthHandler = async (e) => {
    if (!isJoining) {
      setIsJoining(true);
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
          150,
          150
        );
        profileIconKey = `https://community-profile-images.s3.us-east-2.amazonaws.com/${s3Upload.name}`;
      } else {
        profileIconKey = "/images/harth_placeholder.png";
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
        admin: admin,
        owner,
        muted: false,
      });

      if ("users" in tempHarth) {
        tempHarth.users.push({
          userId: user._id,
          iconKey: profileIconKey,
          name: profileName,
          admin: admin,
          owner,
          muted: false,
        });
      }
      localStorage.removeItem("inviteToken");
      sendNewUserJoined(id, {
        userId: user._id,
        iconKey: profileIconKey,
        name: profileName,
        admin: admin,
        owner,
        muted: false,
      });
      refetchComms(tempHarth, true);
      submitHandler();
      setIsJoining(false);
    }
  };
  const fileUploadHandler = (file) => {
    setNewFile(file);
  };
  const togglemodal = () => {
    if (!invite && closeHandler) {
      closeHandler();
    } else {
      () => {
        return;
      };
    }
  };

  return (
    <Modal onToggleModal={togglemodal}>
      <div className={styles.mainContainer}>
        <div className={styles.title}>Create your avatar</div>
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
            autoComplete="off"
            maxLength={20}
          />
          <div className={styles.helpText}>{footer}</div>
          <div className={styles.buttonBar}>
            <Button
              tier="primary"
              fullWidth
              text={submitText}
              type="submit"
              isLoading={isJoining}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}
