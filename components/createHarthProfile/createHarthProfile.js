import React, { useState } from "react";
import { uploadFile } from "../../services/helper";
import { addUserToComm, saveCommunity } from "../../requests/community";
import { useAuth } from "../../contexts/auth";
import { useComms } from "../../contexts/comms";
import IconUploader from "../IconUploader";
import TalkingHead from "../TalkingHead/TalkingHead";
import { Button, Modal } from "../Common";

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
    console.log(harth, "CreateHarthProfile");
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
        console.log(harth, "joinHarthHandler: createHarthProfile");
        let tempHarth = { ...harth };
        let id;
        let s3Upload;
        let profileIconKey;
        if (newFile) {
            s3Upload = await uploadFile({
                file: newFile,
                bucket: "community-profile-images",
            });
            profileIconKey = `https://community-profile-images.s3.us-east-2.amazonaws.com/${s3Upload.name}`;
        }
        console.log(invite, "invite");
        console.log(tempHarth, "tempHarth");

        if (!invite) {
            let commDbUpload = await saveCommunity(tempHarth);
            if (commDbUpload.ok) {
                id = commDbUpload.id;
            }
        } else if (tempHarth._id) {
            id = tempHarth._id;
        }
        console.log(id, "id");
        let results = await addUserToComm(id, {
            userId: user._id,
            iconKey: profileIconKey,
            name: profileName,
            personalInfo: {},
        });
        console.log(results, id);
        refetchComms();
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
                    />
                    <div className={styles.helpText}>{footer}</div>
                    <div className={styles.buttonBar}>
                        <Button
                            tier="primary"
                            fullWidth
                            text={submitText}
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </Modal>
    );
}
