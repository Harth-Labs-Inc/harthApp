import React, { useEffect, useState } from "react";

import { uploadFile } from "../../services/helper";
import { updateHarthData } from "../../requests/community";
import { useComms } from "../../contexts/comms";
import IconUploader from "../IconUploader";
import { Button, Modal } from "../Common";

import styles from "./harthProfileEditModal.module.scss";

const HarthProfileEditModal = ({ hidden, setHidden, harth, profile }) => {
    const [updatedProfile, setUpdatedProfile] = useState({});
    const [newFile, setNewFile] = useState(null);

    const { setComm, setCommsFromChild, comms } = useComms();

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
        setUpdatedProfile({ ...updatedProfile, ["name"]: value });
    };
    const submitHandler = async (e) => {
        e.preventDefault();
        let newIconKey = "";
        if (newFile) {
            let { ok, name } = await uploadFile({
                file: newFile,
                bucket: "community-profile-images",
            });
            if (ok) {
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
            setComm(newharth);
            setHidden();
        }
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
                    />
                    <div className={styles.harthTitle}>[{harth.name}]</div>
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
